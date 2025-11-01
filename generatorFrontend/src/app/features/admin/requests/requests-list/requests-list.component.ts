import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { Store } from '@ngrx/store';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { requestsFeature } from '../../../../state/requests/requests.reducer';
import { RequestsActions } from '../../../../state/requests/requests.actions';
import { RequestRecord } from '../../../../core/models/domain.models';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-requests-list',
  imports: [
    CommonModule,
    FormsModule,
    TranslatePipe,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatButtonModule
  ],
  templateUrl: './requests-list.component.html',
  styleUrl: './requests-list.component.scss'
})
export class RequestsListComponent {
  private readonly store = inject(Store);
  
  readonly requests = toSignal(this.store.select(requestsFeature.selectAll), { initialValue: [] });
  readonly loading$ = this.store.select(requestsFeature.selectRequestsState).pipe(
    map((state) => state.loading)
  );
  
  readonly searchTerm = signal('');
  
  readonly filteredRequests = computed(() => {
    const requests = this.requests();
    const term = this.searchTerm().toLowerCase();
    if (!term) return requests;
    return requests.filter((req: RequestRecord) =>
      req.applicantName?.toLowerCase().includes(term) ||
      req.applicantEmail?.toLowerCase().includes(term) ||
      req.generatorName?.toLowerCase().includes(term)
    );
  });

  constructor() {
    this.store.dispatch(RequestsActions.loadRequests());
  }

  approve(request: RequestRecord) {
    this.store.dispatch(RequestsActions.updateRequest({
      id: request.id,
      status: 'APPROVED'
    }));
  }

  reject(request: RequestRecord) {
    this.store.dispatch(RequestsActions.updateRequest({
      id: request.id,
      status: 'REJECTED'
    }));
  }
}
