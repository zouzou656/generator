import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { provideEffects } from '@ngrx/effects';
import { provideState, provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { isDevMode } from '@angular/core';
import { requestsFeature, requestsFeatureKey, requestsReducer } from './requests/requests.reducer';
import { usersFeature, usersFeatureKey, usersReducer } from './users/users.reducer';
import { ownerCustomersFeature, ownerCustomersFeatureKey, ownerCustomersReducer } from './owner-customers/owner-customers.reducer';
import { billsFeature, billsFeatureKey, billsReducer } from './bills/bills.reducer';
import { importBatchesFeature, importBatchesFeatureKey, importBatchesReducer } from './import-batches/import-batches.reducer';
import { importBatchRowsFeature, importBatchRowsFeatureKey, importBatchRowsReducer } from './import-batches/import-batch-rows.reducer';
import { smsCampaignsFeature, smsCampaignsFeatureKey, smsCampaignsReducer } from './sms/sms-campaigns.reducer';
import { smsMessagesFeature, smsMessagesFeatureKey, smsMessagesReducer } from './sms/sms-messages.reducer';
import { RequestsEffects } from './requests/requests.effects';
import { UsersEffects } from './users/users.effects';
import { OwnerCustomersEffects } from './owner-customers/owner-customers.effects';
import { BillsEffects } from './bills/bills.effects';
import { ImportBatchesEffects } from './import-batches/import-batches.effects';
import { SmsEffects } from './sms/sms.effects';

export function provideAppStore(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideStore(),
    provideEffects(RequestsEffects, UsersEffects, OwnerCustomersEffects, BillsEffects, ImportBatchesEffects, SmsEffects),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() }),
    provideState(requestsFeatureKey, requestsReducer),
    provideState(usersFeatureKey, usersReducer),
    provideState(ownerCustomersFeatureKey, ownerCustomersReducer),
    provideState(billsFeatureKey, billsReducer),
    provideState(importBatchesFeatureKey, importBatchesReducer),
    provideState(importBatchRowsFeatureKey, importBatchRowsReducer),
    provideState(smsCampaignsFeatureKey, smsCampaignsReducer),
    provideState(smsMessagesFeatureKey, smsMessagesReducer)
  ]);
}

