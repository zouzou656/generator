import { createSelector } from '@ngrx/store';
import { usersFeature } from './users.reducer';

export const selectUsersLoading = createSelector(
  usersFeature.selectUsersState,
  (state) => state.loading
);





