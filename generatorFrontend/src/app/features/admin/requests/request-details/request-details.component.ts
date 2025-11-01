import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { requestsFeature } from '../../../../state/requests/requests.reducer';
import { RequestsActions } from '../../../../state/requests/requests.actions';
import { map } from 'rxjs/operators';
import { MatChipsModule } from '@angular/material/chips';
import { RequestRecord } from '../../../../core/models/domain.models';

@Component({
  selector: 'app-request-details',
  imports: [CommonModule, RouterLink, TranslatePipe, MatChipsModule],
  templateUrl: './request-details.component.html',
  styleUrl: './request-details.component.scss'
})
export class RequestDetailsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly store = inject(Store);
  private readonly requestId = this.route.snapshot.paramMap.get('id') ?? '';

  readonly request$ = this.store.select(requestsFeature.selectAll).pipe(
    map((requests) => requests.find((request: RequestRecord) => request.id === this.requestId) ?? null)
  );

  constructor() {
    this.store.dispatch(RequestsActions.loadRequests());
  }
}
