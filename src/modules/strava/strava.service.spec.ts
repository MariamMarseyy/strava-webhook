import { Test, TestingModule } from '@nestjs/testing';
import { StravaService } from './strava.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Activity } from '../../common/entities/activity.entity';
import { User } from '../../common/entities/user.entity';
import { Repository } from 'typeorm';
import { StravaWebhookEvent } from '../../common/interfaces/strava-event.interface';
import {
  StravaAspectType,
  StravaObjectType,
} from '../../common/enums/strava.enum';
import axios from 'axios';

jest.mock('axios');

const mockUser = {
  id: 123,
  accessToken: 'access_token',
  refreshToken: 'refresh_token',
  expiresAt: 9999999999,
};

const mockActivity = {
  id: 456,
  name: 'Morning Run',
  type: 'Run',
  start_date: '2024-01-01T06:00:00Z',
  elapsed_time: 3600,
};

describe('StravaService', () => {
  let service: StravaService;
  let userRepo: Repository<User>;
  let activityRepo: Repository<Activity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StravaService,
        {
          provide: getRepositoryToken(Activity),
          useValue: {
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOneBy: jest.fn().mockResolvedValue(mockUser),
          },
        },
      ],
    }).compile();

    service = module.get<StravaService>(StravaService);
    activityRepo = module.get(getRepositoryToken(Activity));
    userRepo = module.get(getRepositoryToken(User));
  });

  it('should handle valid webhook event and store activity', async () => {
    (axios.get as jest.Mock).mockResolvedValue({ data: mockActivity });

    const event: StravaWebhookEvent = {
      object_type: StravaObjectType.ACTIVITY,
      aspect_type: StravaAspectType.CREATE,
      object_id: 456,
      event_time: Date.now(),
      owner_id: 123,
      subscription_id: 1,
    };

    await service.handleWebhookEvent(event);

    expect(userRepo.findOneBy).toHaveBeenCalledWith({ id: 123 });
    expect(axios.get).toHaveBeenCalledWith(
      `${process.env.STRAVA_API_BASE_URL}/activities/456`,
      { headers: { Authorization: 'Bearer access_token' } },
    );
    expect(activityRepo.save).toHaveBeenCalledWith({
      id: 456,
      userId: 123,
      name: 'Morning Run',
      type: 'Run',
      startTime: new Date('2024-01-01T06:00:00Z'),
      totalTime: 3600,
    });
  });

  it('should skip event if type is not activity', async () => {
    const event: StravaWebhookEvent = {
      object_type: StravaObjectType.ATHLETE,
      aspect_type: StravaAspectType.CREATE,
      object_id: 456,
      event_time: Date.now(),
      owner_id: 123,
      subscription_id: 1,
    };
    await service.handleWebhookEvent(event);
    expect(axios.get).not.toHaveBeenCalled();
  });

  it('should skip event if aspect is not create', async () => {
    const event: StravaWebhookEvent = {
      object_type: StravaObjectType.ACTIVITY,
      aspect_type: StravaAspectType.UPDATE,
      object_id: 456,
      event_time: Date.now(),
      owner_id: 123,
      subscription_id: 1,
    };
    await service.handleWebhookEvent(event);
    expect(axios.get).not.toHaveBeenCalled();
  });

  it('should skip if user not found', async () => {
    jest.spyOn(userRepo, 'findOneBy').mockResolvedValueOnce(null);
    const event: StravaWebhookEvent = {
      object_type: StravaObjectType.ACTIVITY,
      aspect_type: StravaAspectType.CREATE,
      object_id: 456,
      event_time: Date.now(),
      owner_id: 123,
      subscription_id: 1,
    };
    await service.handleWebhookEvent(event);
    expect(activityRepo.save).not.toHaveBeenCalled();
  });
});
