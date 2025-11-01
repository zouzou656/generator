import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { AuthService } from '../../../../core/auth/auth.service';
import { API_CLIENT, ApiClient } from '../../../../core/api/api-client';
import { Observable } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { from } from 'rxjs';

@Component({
  selector: 'app-owner-reports',
  imports: [CommonModule, TranslatePipe, DecimalPipe],
  templateUrl: './owner-reports.component.html',
  styleUrl: './owner-reports.component.scss'
})
export class OwnerReportsComponent {
  private readonly auth = inject(AuthService);
  private readonly api = inject<ApiClient>(API_CLIENT);

  readonly summary$: Observable<{ totalBills: number; pending: number; overdue: number; revenue: number }> = from(this.api.hydrate()).pipe(
    switchMap(() => {
      const ownerId = this.auth.getOwnerIdOrThrow();
      return from(this.api.getOwnerDashboard(ownerId));
    }),
    map(data => ({
      totalBills: 0, // TODO: calculate from bills
      pending: 0,
      overdue: 0,
      revenue: 0
    }))
  );
}
