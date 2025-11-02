import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { usersFeature } from '../../../../state/users/users.reducer';
import { UsersActions } from '../../../../state/users/users.actions';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-users-list',
  imports: [
    CommonModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatIconModule,
    TranslatePipe
  ],
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.scss'
})
export class UsersListComponent {
  private readonly store = inject(Store);
  readonly users$ = this.store.select(usersFeature.selectAll);
  readonly loading$ = this.store.select(usersFeature.selectUsersState).pipe(
    map((state) => state.loading)
  );

  constructor() {
    console.log('[UsersList] Component initialized, dispatching loadUsers');
    this.store.dispatch(UsersActions.loadUsers());
    
    // Debug: Subscribe to see what we get
    this.users$.subscribe(users => {
      console.log('[UsersList] users$ emitted:', users);
      console.log('[UsersList] users length:', users?.length);
    });
  }
}
