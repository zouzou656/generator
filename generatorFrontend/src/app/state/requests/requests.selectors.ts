import { createSelector } from '@ngrx/store';
import { requestsFeature } from './requests.reducer';

export const selectRequestsLoading = createSelector(
  requestsFeature.selectRequestsState,
  (state) => state.loading
);

export const selectPendingRequests = createSelector(
  requestsFeature.selectAll,
  (requests) => requests.filter((req) => req.status === 'PENDING')
);





