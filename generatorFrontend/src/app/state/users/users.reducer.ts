import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createFeature, createReducer, on } from '@ngrx/store';
import { UserAccount } from '../../core/models/domain.models';
import { UsersActions } from './users.actions';

export interface UsersState extends EntityState<UserAccount> {
  loading: boolean;
  loaded: boolean;
  error: unknown | null;
}

export const usersAdapter = createEntityAdapter<UserAccount>({
  selectId: (user) => user.id
});

const initialState: UsersState = usersAdapter.getInitialState({
  loading: false,
  loaded: false,
  error: null
});

export const usersFeature = createFeature({
  name: 'users',
  reducer: createReducer(
    initialState,
    on(UsersActions.loadUsers, (state) => ({
      ...state,
      loading: true,
      error: undefined
    })),
    on(UsersActions.loadUsersSuccess, (state, { users }) =>
      usersAdapter.setAll(users, {
        ...state,
        loading: false,
        loaded: true
      })
    ),
    on(UsersActions.loadUsersFailure, (state, { error }) => ({
      ...state,
      loading: false,
      error
    }))
  ),
  extraSelectors: ({ selectUsersState }) => ({
    selectAll: usersAdapter.getSelectors(selectUsersState).selectAll
  })
});

export const { name: usersFeatureKey, reducer: usersReducer, selectAll: selectAllUsers } = usersFeature;





