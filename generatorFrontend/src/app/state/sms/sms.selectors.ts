import { createSelector } from '@ngrx/store';
import { smsCampaignsFeature } from './sms-campaigns.reducer';
import { smsMessagesFeature } from './sms-messages.reducer';

export const selectActiveCampaignMessages = createSelector(
  smsMessagesFeature.selectAll,
  smsMessagesFeature.selectSmsMessagesState,
  (messages, state) =>
    state.campaignId ? messages.filter((message) => message.campaignId === state.campaignId) : messages
);





