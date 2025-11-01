import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { OwnerCustomer } from '../../core/models/domain.models';
import { CustomerUpsertPayload as ApiCustomerUpsertPayload } from '../../core/api/api-client';

export const OwnerCustomersActions = createActionGroup({
  source: 'OwnerCustomers',
  events: {
    'Load Owner Customers': props<{ ownerId: string }>(),
    'Load Owner Customers Success': props<{ customers: OwnerCustomer[] }>(),
    'Load Owner Customers Failure': props<{ error: unknown }>(),
    'Upsert Owner Customer': props<{ ownerId: string; payload: CustomerPayload }>(),
    'Upsert Owner Customer Success': props<{ customer: OwnerCustomer }>()
  }
});

export type CustomerPayload = ApiCustomerUpsertPayload;

