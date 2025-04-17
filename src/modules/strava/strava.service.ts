import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Activity } from '../../common/entities/activity.entity';
import { Repository } from 'typeorm';
import { User } from '../../common/entities/user.entity';
import { Client, Token } from 'strava-oauth2';
import { StravaWebhookEvent } from '../../common/interfaces/strava-event.interface';
import {
  StravaAspectType,
  StravaObjectType,
} from '../../common/enums/strava.enum';

@Injectable()
export class StravaService {
  private readonly logger = new Logger(StravaService.name);

  private client = new Client({
    client_id: process.env.STRAVA_CLIENT_ID,
    client_secret: process.env.STRAVA_CLIENT_SECRET,
    redirect_uri: process.env.STRAVA_REDIRECT_URI,
    scopes: ['read', 'activity:read_all'],
  });

  constructor(
    @InjectRepository(Activity)
    private readonly activityRepo: Repository<Activity>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  getAuthUrl(): string {
    return this.client.getAuthorizationUri();
  }

  async exchangeCodeForToken(code: string): Promise<Token> {
    const token = await this.client.getTokenFromObject({ code });

    await this.userRepo.save({
      id: token.athlete.id,
      accessToken: token.access_token,
      refreshToken: token.refresh_token,
      expiresAt: token.expires_at,
    });

    return token;
  }

  async handleWebhookEvent(event: StravaWebhookEvent): Promise<void> {
    const { object_type, aspect_type, object_id, owner_id } = event;
    const apiUrl = process.env.STRAVA_API_BASE_URL;
    if (
      object_type !== StravaObjectType.ACTIVITY ||
      aspect_type !== StravaAspectType.CREATE
    )
      return;

    try {
      const user = await this.userRepo.findOneBy({ id: owner_id });
      if (!user) return;

      const res = await axios.get(`${apiUrl}/activities/${object_id}`, {
        headers: { Authorization: `Bearer ${user.accessToken}` },
      });

      const activity = res.data;

      await this.activityRepo.save({
        id: activity.id,
        userId: user.id,
        name: activity.name,
        type: activity.type,
        startTime: new Date(activity.start_date),
        totalTime: activity.elapsed_time,
      });
    } catch (error) {
      this.logger.error('Error storing activity', error);
    }
  }
}
