import { StravaAspectType, StravaObjectType } from '../enums/strava.enum';

export interface StravaWebhookEvent {
  aspect_type: StravaAspectType;
  object_type: StravaObjectType;
  event_time: number;
  object_id: number;
  owner_id: number;
  subscription_id: number;
  updates?: {
    title?: string;
    type?: string;
    private?: 'true' | 'false';
    authorized?: 'false';
  };
}
