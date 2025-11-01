import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { RequestRecord } from '../../core/models/domain.models';

export const RequestsActions = createActionGroup({
  source: 'Requests',
  events: {
    'Load Requests': emptyProps(),
    'Load Requests Success': props<{ requests: RequestRecord[] }>(),
    'Load Requests Failure': props<{ error: unknown }>(),
    'Update Request': props<{ id: string; status: RequestRecord['status']; notes?: string | null }>(),
    'Update Request Success': props<{ request: RequestRecord }>()
  }
});

