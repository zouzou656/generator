import { createSelector } from '@ngrx/store';
import { importBatchesFeature } from './import-batches.reducer';
import { importBatchRowsFeature } from './import-batch-rows.reducer';

export const selectBatchRowsForActiveBatch = createSelector(
  importBatchRowsFeature.selectAll,
  importBatchRowsFeature.selectImportBatchRowsState,
  (rows, state) => (state.batchId ? rows.filter((row) => row.batchId === state.batchId) : rows)
);





