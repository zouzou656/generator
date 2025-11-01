import { createActionGroup, props } from '@ngrx/store';
import { ImportBatchRecord, ImportBatchRowRecord } from '../../core/models/domain.models';

export const ImportBatchesActions = createActionGroup({
  source: 'ImportBatches',
  events: {
    'Load Batches': props<{ ownerId: string }>(),
    'Load Batches Success': props<{ batches: ImportBatchRecord[] }>(),
    'Load Batches Failure': props<{ error: unknown }>(),
    'Load Batch Rows': props<{ batchId: string }>(),
    'Load Batch Rows Success': props<{ rows: ImportBatchRowRecord[] }>(),
    'Load Batch Rows Failure': props<{ error: unknown }>()
  }
});





