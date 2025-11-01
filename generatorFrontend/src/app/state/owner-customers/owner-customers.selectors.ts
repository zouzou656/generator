import { createSelector } from '@ngrx/store';
import { ownerCustomersFeature } from './owner-customers.reducer';

export const selectOwnerCustomersForOwner = createSelector(
  ownerCustomersFeature.selectAll,
  ownerCustomersFeature.selectOwnerCustomersState,
  (customers, state) =>
    state.ownerId ? customers.filter((customer) => customer.ownerId === state.ownerId) : customers
);





