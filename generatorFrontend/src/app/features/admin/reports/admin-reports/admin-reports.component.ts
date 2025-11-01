import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { requestsFeature } from '../../../../state/requests/requests.reducer';
import { billsFeature } from '../../../../state/bills/bills.reducer';
import { RequestRecord, BillRecord } from '../../../../core/models/domain.models';
import { map } from 'rxjs/operators';
import { combineLatest } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-admin-reports',
  imports: [CommonModule, TranslatePipe, MatButtonModule],
  templateUrl: './admin-reports.component.html',
  styleUrl: './admin-reports.component.scss'
})
export class AdminReportsComponent {
  private readonly store = inject(Store);
  readonly summary$ = combineLatest([
    this.store.select(requestsFeature.selectAll),
    this.store.select(billsFeature.selectAll)
  ]).pipe(
    map(([requests, bills]) => ({
      totalRequests: requests.length,
      pendingRequests: requests.filter((req: RequestRecord) => req.status === 'PENDING').length,
      totalBills: bills.length,
      cancelledBills: bills.filter((bill: BillRecord) => bill.status === 'CANCELLED').length
    }))
  );
}
