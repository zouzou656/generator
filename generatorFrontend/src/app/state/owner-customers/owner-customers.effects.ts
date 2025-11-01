import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from, of } from 'rxjs';
import { catchError, exhaustMap, map } from 'rxjs/operators';
import { OwnerCustomersActions } from './owner-customers.actions';
import { API_CLIENT, ApiClient } from '../../core/api/api-client';

@Injectable()
export class OwnerCustomersEffects {
  private readonly actions$ = inject(Actions);
  private readonly api = inject<ApiClient>(API_CLIENT);

  load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(OwnerCustomersActions.loadOwnerCustomers),
      exhaustMap((action) =>
        from(this.api.getOwnerCustomers(action.ownerId)).pipe(
          map((customers) => OwnerCustomersActions.loadOwnerCustomersSuccess({ customers })),
          catchError((error) => of(OwnerCustomersActions.loadOwnerCustomersFailure({ error })))
        )
      )
    )
  );

  upsert$ = createEffect(() =>
    this.actions$.pipe(
      ofType(OwnerCustomersActions.upsertOwnerCustomer),
      exhaustMap((action) =>
        from(this.api.upsertOwnerCustomer(action.ownerId, action.payload)).pipe(
          map((customer) => OwnerCustomersActions.upsertOwnerCustomerSuccess({ customer })),
          catchError((error) => of(OwnerCustomersActions.loadOwnerCustomersFailure({ error })))
        )
      )
    )
  );
}





