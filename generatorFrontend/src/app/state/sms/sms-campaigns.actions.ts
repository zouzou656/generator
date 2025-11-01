import { createActionGroup, props } from '@ngrx/store';
import { SmsCampaignRecord, SmsMessageRecord } from '../../core/models/domain.models';
import { SmsCampaignUpsertPayload as ApiSmsCampaignUpsertPayload } from '../../core/api/api-client';

export const SmsCampaignActions = createActionGroup({
  source: 'SmsCampaigns',
  events: {
    'Load Campaigns': props<{ ownerId: string }>(),
    'Load Campaigns Success': props<{ campaigns: SmsCampaignRecord[] }>(),
    'Load Campaigns Failure': props<{ error: unknown }>(),
    'Upsert Campaign': props<{ ownerId: string; payload: SmsCampaignPayload }>(),
    'Upsert Campaign Success': props<{ campaign: SmsCampaignRecord }>(),
    'Send Campaign': props<{ ownerId: string; campaignId: string }>(),
    'Load Campaign Messages': props<{ campaignId: string }>(),
    'Load Campaign Messages Success': props<{ messages: SmsMessageRecord[] }>(),
    'Load Campaign Messages Failure': props<{ error: unknown }>()
  }
});

export type SmsCampaignPayload = ApiSmsCampaignUpsertPayload;

