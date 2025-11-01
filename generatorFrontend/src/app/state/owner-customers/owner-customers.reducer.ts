import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createFeature, createReducer, on } from '@ngrx/store';
import { OwnerCustomer } from '../../core/models/domain.models';
import { OwnerCustomersActions } from './owner-customers.actions';

export interface OwnerCustomersState extends EntityState<OwnerCustomer> {
  loading: boolean;
  loaded: boolean;
  error: unknown | null;
  ownerId: string | null;
}

export const ownerCustomersAdapter = createEntityAdapter<OwnerCustomer>({
  selectId: (customer) => customer.id
});

const initialState: OwnerCustomersState = ownerCustomersAdapter.getInitialState({
  loading: false,
  loaded: false,
  error: null,
  ownerId: null
});

export const ownerCustomersFeature = createFeature({
  name: 'ownerCustomers',
  reducer: createReducer(
    initialState,
    on(OwnerCustomersActions.loadOwnerCustomers, (state, { ownerId }) => ({
      ...state,
      loading: true,
      ownerId,
      error: null
    })),
    on(OwnerCustomersActions.loadOwnerCustomersSuccess, (state, { customers }) =>
      ownerCustomersAdapter.setAll(customers, {
        ...state,
        loading: false,
        loaded: true
      })
    ),
    on(OwnerCustomersActions.loadOwnerCustomersFailure, (state, { error }) => ({
      ...state,
      loading: false,
      error: error
    })),
    on(OwnerCustomersActions.upsertOwnerCustomer, (state) => ({
      ...state,
      loading: true
    })),
    on(OwnerCustomersActions.upsertOwnerCustomerSuccess, (state, { customer }) =>
      ownerCustomersAdapter.upsertOne(customer, state)
    )
  ),
  extraSelectors: ({ selectOwnerCustomersState }) => ({
    selectAll: ownerCustomersAdapter.getSelectors(selectOwnerCustomersState).selectAll
  })
});

export const {
  name: ownerCustomersFeatureKey,
  reducer: ownerCustomersReducer,
  selectAll: selectAllOwnerCustomers,
  selectOwnerCustomersState
} = ownerCustomersFeature;

