import { createActionGroup, props } from '@ngrx/store';
import { BillRecord } from '../../core/models/domain.models';
import { BillCreatePayload as ApiBillCreatePayload } from '../../core/api/api-client';

export const BillsActions = createActionGroup({
  source: 'Bills',
  events: {
    'Load Bills': props<{ ownerId: string }>(),
    'Load Bills Success': props<{ bills: BillRecord[] }>(),
    'Load Bills Failure': props<{ error: unknown }>(),
    'Create Bill': props<{ ownerId: string; payload: BillCreatePayload }>(),
    'Create Bill Success': props<{ bill: BillRecord }>()
  }
});

export type BillCreatePayload = ApiBillCreatePayload;

