import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from, of } from 'rxjs';
import { catchError, exhaustMap, map } from 'rxjs/operators';
import { ImportBatchesActions } from './import-batches.actions';
import { API_CLIENT, ApiClient } from '../../core/api/api-client';

@Injectable()
export class ImportBatchesEffects {
  private readonly actions$ = inject(Actions);
  private readonly api = inject<ApiClient>(API_CLIENT);

  loadBatches$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ImportBatchesActions.loadBatches),
      exhaustMap((action) =>
        from(this.api.getImportBatches(action.ownerId)).pipe(
          map((batches) => ImportBatchesActions.loadBatchesSuccess({ batches })),
          catchError((error) => of(ImportBatchesActions.loadBatchesFailure({ error })))
        )
      )
    )
  );

  loadRows$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ImportBatchesActions.loadBatchRows),
      exhaustMap((action) =>
        from(this.api.getImportBatchRows(action.batchId)).pipe(
          map((rows) => ImportBatchesActions.loadBatchRowsSuccess({ rows })),
          catchError((error) => of(ImportBatchesActions.loadBatchRowsFailure({ error })))
        )
      )
    )
  );
}





