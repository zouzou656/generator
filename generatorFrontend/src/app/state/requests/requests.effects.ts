import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { API_CLIENT, ApiClient } from '../../core/api/api-client';
import { RequestsActions } from './requests.actions';
import { from, of } from 'rxjs';
import { catchError, exhaustMap, map } from 'rxjs/operators';

@Injectable()
export class RequestsEffects {
  private readonly actions$ = inject(Actions);
  private readonly api = inject<ApiClient>(API_CLIENT);

  load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RequestsActions.loadRequests),
      exhaustMap(() =>
        from(this.api.getRequests()).pipe(
          map((requests) => RequestsActions.loadRequestsSuccess({ requests })),
          catchError((error) => of(RequestsActions.loadRequestsFailure({ error })))
        )
      )
    )
  );

  update$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RequestsActions.updateRequest),
      exhaustMap((action) =>
        from(this.api.updateRequest(action.id, { status: action.status, notes: action.notes })).pipe(
          map((request) => RequestsActions.updateRequestSuccess({ request })),
          catchError((error) => of(RequestsActions.loadRequestsFailure({ error })))
        )
      )
    )
  );
}

