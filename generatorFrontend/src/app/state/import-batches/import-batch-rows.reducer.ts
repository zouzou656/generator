import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createFeature, createReducer, on } from '@ngrx/store';
import { ImportBatchRowRecord } from '../../core/models/domain.models';
import { ImportBatchesActions } from './import-batches.actions';

export interface ImportBatchRowsState extends EntityState<ImportBatchRowRecord> {
  loading: boolean;
  loaded: boolean;
  batchId: string | null;
  error: unknown | null;
}

export const importBatchRowsAdapter = createEntityAdapter<ImportBatchRowRecord>({
  selectId: (row) => row.id
});

const initialState: ImportBatchRowsState = importBatchRowsAdapter.getInitialState({
  loading: false,
  loaded: false,
  batchId: null,
  error: null
});

export const importBatchRowsFeature = createFeature({
  name: 'importBatchRows',
  reducer: createReducer(
    initialState,
    on(ImportBatchesActions.loadBatchRows, (state, { batchId }) => ({
      ...state,
      loading: true,
      batchId,
      error: null
    })),
    on(ImportBatchesActions.loadBatchRowsSuccess, (state, { rows }) =>
      importBatchRowsAdapter.setAll(rows, {
        ...state,
        loading: false,
        loaded: true
      })
    ),
    on(ImportBatchesActions.loadBatchRowsFailure, (state, { error }) => ({
      ...state,
      loading: false,
      error: error
    }))
  ),
  extraSelectors: ({ selectImportBatchRowsState }) => ({
    selectAll: importBatchRowsAdapter.getSelectors(selectImportBatchRowsState).selectAll
  })
});

export const {
  name: importBatchRowsFeatureKey,
  reducer: importBatchRowsReducer,
  selectAll: selectAllImportBatchRows,
  selectImportBatchRowsState
} = importBatchRowsFeature;





