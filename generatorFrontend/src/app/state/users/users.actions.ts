import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { UserAccount } from '../../core/models/domain.models';

export const UsersActions = createActionGroup({
  source: 'Users',
  events: {
    'Load Users': emptyProps(),
    'Load Users Success': props<{ users: UserAccount[] }>(),
    'Load Users Failure': props<{ error: unknown }>()
  }
});





