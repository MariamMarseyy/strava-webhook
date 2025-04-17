import { Test, TestingModule } from '@nestjs/testing';
import { StravaController } from './strava.controller';
import { StravaService } from './strava.service';
import { ForbiddenException } from '@nestjs/common';
import { Response } from 'express';

describe('StravaController', () => {
  let controller: StravaController;
  let stravaService: StravaService;

  const mockStravaService = {
    getAuthUrl: jest.fn().mockReturnValue('https://strava.com/oauth'),
    exchangeCodeForToken: jest.fn().mockResolvedValue({ athlete: { id: 1 } }),
    handleWebhookEvent: jest.fn().mockResolvedValue(undefined),
  };

  const mockResponse = () => {
    const res = {} as Response;
    res.redirect = jest.fn().mockReturnValue(res);
    return res;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StravaController],
      providers: [
        {
          provide: StravaService,
          useValue: mockStravaService,
        },
      ],
    }).compile();

    controller = module.get<StravaController>(StravaController);
    stravaService = module.get<StravaService>(StravaService);
  });

  it('should redirect to Strava auth URL', () => {
    const res = mockResponse();
    controller.redirectToStrava(res);
    expect(res.redirect).toHaveBeenCalledWith('https://strava.com/oauth');
  });

  it('should handle oauth callback and return athlete', async () => {
    const result = await controller.handleCallback('test_code');
    expect(stravaService.exchangeCodeForToken).toHaveBeenCalledWith(
      'test_code',
    );
    expect(result).toEqual({ message: 'Authorized', athlete: { id: 1 } });
  });

  it('should validate webhook and return challenge', () => {
    process.env.STRAVA_VERIFY_TOKEN = 'STRAVA';
    const result = controller.validateWebhook({
      'hub.challenge': 'abc123',
      'hub.verify_token': 'STRAVA',
    });
    expect(result).toEqual({ 'hub.challenge': 'abc123' });
  });

  it('should throw ForbiddenException for invalid webhook token', () => {
    process.env.STRAVA_VERIFY_TOKEN = 'STRAVA';
    expect(() =>
      controller.validateWebhook({
        'hub.challenge': 'abc123',
        'hub.verify_token': 'WRONG',
      }),
    ).toThrow(ForbiddenException);
  });

  it('should call webhook handler on POST /webhook', async () => {
    const body = { foo: 'bar' };
    await controller.handleWebhook(body);
    expect(stravaService.handleWebhookEvent).toHaveBeenCalledWith(body);
  });
});
