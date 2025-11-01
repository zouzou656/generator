import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createFeature, createReducer, on } from '@ngrx/store';
import { SmsMessageRecord } from '../../core/models/domain.models';
import { SmsCampaignActions } from './sms-campaigns.actions';

export interface SmsMessagesState extends EntityState<SmsMessageRecord> {
  loading: boolean;
  loaded: boolean;
  campaignId: string | null;
  error: unknown | null;
}

export const smsMessagesAdapter = createEntityAdapter<SmsMessageRecord>({
  selectId: (message) => message.id
});

const initialState: SmsMessagesState = smsMessagesAdapter.getInitialState({
  loading: false,
  loaded: false,
  campaignId: null,
  error: null
});

export const smsMessagesFeature = createFeature({
  name: 'smsMessages',
  reducer: createReducer(
    initialState,
    on(SmsCampaignActions.loadCampaignMessages, (state, { campaignId }) => ({
      ...state,
      loading: true,
      campaignId,
      error: null
    })),
    on(SmsCampaignActions.loadCampaignMessagesSuccess, (state, { messages }) =>
      smsMessagesAdapter.setAll(messages, {
        ...state,
        loading: false,
        loaded: true
      })
    ),
    on(SmsCampaignActions.loadCampaignMessagesFailure, (state, { error }) => ({
      ...state,
      loading: false,
      error: error
    }))
  ),
  extraSelectors: ({ selectSmsMessagesState }) => ({
    selectAll: smsMessagesAdapter.getSelectors(selectSmsMessagesState).selectAll
  })
});

export const {
  name: smsMessagesFeatureKey,
  reducer: smsMessagesReducer,
  selectAll: selectAllSmsMessages,
  selectSmsMessagesState
} = smsMessagesFeature;





