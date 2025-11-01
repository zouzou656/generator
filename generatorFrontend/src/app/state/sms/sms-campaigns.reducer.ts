import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createFeature, createReducer, on } from '@ngrx/store';
import { SmsCampaignRecord } from '../../core/models/domain.models';
import { SmsCampaignActions } from './sms-campaigns.actions';

export interface SmsCampaignsState extends EntityState<SmsCampaignRecord> {
  loading: boolean;
  loaded: boolean;
  ownerId: string | null;
  error: unknown | null;
}

export const smsCampaignsAdapter = createEntityAdapter<SmsCampaignRecord>({
  selectId: (campaign) => campaign.id
});

const initialState: SmsCampaignsState = smsCampaignsAdapter.getInitialState({
  loading: false,
  loaded: false,
  ownerId: null,
  error: null
});

export const smsCampaignsFeature = createFeature({
  name: 'smsCampaigns',
  reducer: createReducer(
    initialState,
    on(SmsCampaignActions.loadCampaigns, (state, { ownerId }) => ({
      ...state,
      loading: true,
      ownerId,
      error: null
    })),
    on(SmsCampaignActions.loadCampaignsSuccess, (state, { campaigns }) =>
      smsCampaignsAdapter.setAll(campaigns, {
        ...state,
        loading: false,
        loaded: true
      })
    ),
    on(SmsCampaignActions.loadCampaignsFailure, (state, { error }) => ({
      ...state,
      loading: false,
      error: error
    })),
    on(SmsCampaignActions.upsertCampaign, (state) => ({
      ...state,
      loading: true
    })),
    on(SmsCampaignActions.sendCampaign, (state) => ({
      ...state,
      loading: true
    })),
    on(SmsCampaignActions.upsertCampaignSuccess, (state, { campaign }) =>
      smsCampaignsAdapter.upsertOne(campaign, {
        ...state,
        loading: false
      })
    )
  ),
  extraSelectors: ({ selectSmsCampaignsState }) => ({
    selectAll: smsCampaignsAdapter.getSelectors(selectSmsCampaignsState).selectAll
  })
});

export const {
  name: smsCampaignsFeatureKey,
  reducer: smsCampaignsReducer,
  selectAll: selectAllSmsCampaigns,
  selectSmsCampaignsState
} = smsCampaignsFeature;

