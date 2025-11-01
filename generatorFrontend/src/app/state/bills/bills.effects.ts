import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from, of } from 'rxjs';
import { catchError, exhaustMap, map } from 'rxjs/operators';
import { BillsActions } from './bills.actions';
import { API_CLIENT, ApiClient } from '../../core/api/api-client';

@Injectable()
export class BillsEffects {
  private readonly actions$ = inject(Actions);
  private readonly api = inject<ApiClient>(API_CLIENT);

  load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BillsActions.loadBills),
      exhaustMap((action) =>
        from(this.api.getBills(action.ownerId)).pipe(
          map((bills) => BillsActions.loadBillsSuccess({ bills })),
          catchError((error) => of(BillsActions.loadBillsFailure({ error })))
        )
      )
    )
  );

  create$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BillsActions.createBill),
      exhaustMap((action) =>
        from(this.api.createBill(action.ownerId, action.payload)).pipe(
          map((bill) => BillsActions.createBillSuccess({ bill })),
          catchError((error) => of(BillsActions.loadBillsFailure({ error })))
        )
      )
    )
  );
}





