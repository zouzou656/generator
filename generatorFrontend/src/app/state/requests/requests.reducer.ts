import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createFeature, createReducer, on } from '@ngrx/store';
import { RequestRecord } from '../../core/models/domain.models';
import { RequestsActions } from './requests.actions';

export interface RequestsState extends EntityState<RequestRecord> {
  loading: boolean;
  loaded: boolean;
  error: unknown | null;
}

export const requestsAdapter = createEntityAdapter<RequestRecord>({
  selectId: (request) => request.id
});

const initialState: RequestsState = requestsAdapter.getInitialState({
  loading: false,
  loaded: false,
  error: null
});

export const requestsFeature = createFeature({
  name: 'requests',
  reducer: createReducer(
    initialState,
    on(RequestsActions.loadRequests, (state) => ({
      ...state,
      loading: true,
      error: undefined
    })),
    on(RequestsActions.loadRequestsSuccess, (state, { requests }) =>
      requestsAdapter.setAll(requests, {
        ...state,
        loading: false,
        loaded: true
      })
    ),
    on(RequestsActions.loadRequestsFailure, (state, { error }) => ({
      ...state,
      loading: false,
      error
    })),
    on(RequestsActions.updateRequest, (state) => ({
      ...state,
      loading: true
    })),
    on(RequestsActions.updateRequestSuccess, (state, { request }) =>
      requestsAdapter.upsertOne(request, {
        ...state,
        loading: false
      })
    )
  ),
  extraSelectors: ({ selectRequestsState }) => ({
    selectAll: requestsAdapter.getSelectors(selectRequestsState).selectAll
  })
});

export const {
  name: requestsFeatureKey,
  reducer: requestsReducer,
  selectRequestsState,
  selectAll: selectAllRequests
} = requestsFeature;

