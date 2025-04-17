import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { StravaService } from './strava.service';
import { Response } from 'express';

@Controller('strava')
export class StravaController {
  constructor(private readonly stravaService: StravaService) {}

  @Get('auth')
  redirectToStrava(@Res() res: Response) {
    const url = this.stravaService.getAuthUrl();
    return res.redirect(url);
  }

  @Get('oauth/callback')
  async handleCallback(@Query('code') code: string) {
    const token = await this.stravaService.exchangeCodeForToken(code);
    return { message: 'Authorized', athlete: token.athlete };
  }

  @Get('webhook')
  validateWebhook(@Query() query: any) {
    const { 'hub.challenge': challenge, 'hub.verify_token': token } = query;
    if (token !== process.env.STRAVA_VERIFY_TOKEN) {
      throw new ForbiddenException('Invalid verify token');
    }
    return { 'hub.challenge': challenge };
  }

  @Post('webhook')
  async handleWebhook(@Body() body: any) {
    return this.stravaService.handleWebhookEvent(body);
  }
}
