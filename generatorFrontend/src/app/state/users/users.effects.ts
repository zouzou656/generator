import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from, of } from 'rxjs';
import { catchError, exhaustMap, map } from 'rxjs/operators';
import { UsersActions } from './users.actions';
import { API_CLIENT, ApiClient } from '../../core/api/api-client';

@Injectable()
export class UsersEffects {
  private readonly actions$ = inject(Actions);
  private readonly api = inject<ApiClient>(API_CLIENT);

  load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UsersActions.loadUsers),
      exhaustMap(() => {
        console.log('[UsersEffects] loadUsers action dispatched');
        return from(this.api.getUsers()).pipe(
          map((users) => {
            console.log('[UsersEffects] getUsers returned:', users);
            console.log('[UsersEffects] Dispatching loadUsersSuccess with', users?.length, 'users');
            return UsersActions.loadUsersSuccess({ users });
          }),
          catchError((error) => {
            console.error('[UsersEffects] getUsers failed:', error);
            return of(UsersActions.loadUsersFailure({ error }));
          })
        );
      })
    )
  );
}





