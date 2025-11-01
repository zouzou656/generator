import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { usersFeature } from '../../../../state/users/users.reducer';
import { UsersActions } from '../../../../state/users/users.actions';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-users-list',
  imports: [CommonModule, MatChipsModule, TranslatePipe],
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.scss'
})
export class UsersListComponent {
  private readonly store = inject(Store);
  readonly users$ = this.store.select(usersFeature.selectAll);

  constructor() {
    this.store.dispatch(UsersActions.loadUsers());
  }
}
