import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createFeature, createReducer, on } from '@ngrx/store';
import { ImportBatchRecord } from '../../core/models/domain.models';
import { ImportBatchesActions } from './import-batches.actions';

export interface ImportBatchesState extends EntityState<ImportBatchRecord> {
  loading: boolean;
  loaded: boolean;
  ownerId: string | null;
  error: unknown | null;
}

export const importBatchesAdapter = createEntityAdapter<ImportBatchRecord>({
  selectId: (batch) => batch.id
});

const initialState: ImportBatchesState = importBatchesAdapter.getInitialState({
  loading: false,
  loaded: false,
  ownerId: null,
  error: null
});

export const importBatchesFeature = createFeature({
  name: 'importBatches',
  reducer: createReducer(
    initialState,
    on(ImportBatchesActions.loadBatches, (state, { ownerId }) => ({
      ...state,
      loading: true,
      ownerId,
      error: null
    })),
    on(ImportBatchesActions.loadBatchesSuccess, (state, { batches }) =>
      importBatchesAdapter.setAll(batches, {
        ...state,
        loading: false,
        loaded: true
      })
    ),
    on(ImportBatchesActions.loadBatchesFailure, (state, { error }) => ({
      ...state,
      loading: false,
      error: error
    }))
  ),
  extraSelectors: ({ selectImportBatchesState }) => ({
    selectAll: importBatchesAdapter.getSelectors(selectImportBatchesState).selectAll
  })
});

export const {
  name: importBatchesFeatureKey,
  reducer: importBatchesReducer,
  selectAll: selectAllImportBatches,
  selectImportBatchesState
} = importBatchesFeature;





