import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { BillsActions } from '../../../../state/bills/bills.actions';
import { billsFeature } from '../../../../state/bills/bills.reducer';
import { AuthService } from '../../../../core/auth/auth.service';
import { BillRecord } from '../../../../core/models/domain.models';

@Component({
  selector: 'app-bills-list',
  imports: [
    CommonModule,
    MatButtonModule, 
    MatChipsModule, 
    MatMenuModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    TranslatePipe
  ],
  providers: [CurrencyPipe, DatePipe],
  templateUrl: './bills-list.component.html',
  styleUrl: './bills-list.component.scss'
})
export class BillsListComponent {
  private readonly store = inject(Store);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly currency = inject(CurrencyPipe);
  private readonly datePipe = inject(DatePipe);

  readonly statusFilter = signal<'ALL' | 'PENDING' | 'PAID' | 'CANCELLED'>('ALL');
  readonly bills$ = this.store.select(billsFeature.selectAll);

  constructor() {
    const ownerId = this.auth.getOwnerIdOrThrow();
    this.store.dispatch(BillsActions.loadBills({ ownerId }));
  }

  formatUsd(amount: number): string {
    return this.currency.transform(amount, 'USD', 'symbol-narrow') ?? '';
  }

  formatDate(date: string): string {
    return this.datePipe.transform(date, 'MMM d, y') ?? date;
  }

  formatPeriod(year?: number, month?: number): string {
    if (!year || !month) return '';
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[month - 1]} ${year}`;
  }

  getFilteredBills(bills: BillRecord[]): BillRecord[] {
    const filter = this.statusFilter();
    if (filter === 'ALL') return bills;
    return bills.filter(b => b.status === filter);
  }

  getStatusColor(status: string): string | undefined {
    const colors: Record<string, string | undefined> = {
      'PAID': 'primary',
      'PENDING': 'accent',
      'CANCELLED': undefined
    };
    return colors[status];
  }

  getPendingCount(bills: BillRecord[]): number {
    return bills.filter(b => b.status === 'PENDING').length;
  }

  getPaidCount(bills: BillRecord[]): number {
    return bills.filter(b => b.status === 'PAID').length;
  }

  getTotalAmount(bills: BillRecord[]): number {
    return bills.reduce((sum, b) => sum + (b.totalAmount || b.amountUSD || 0), 0);
  }

  navigateToCreate(): void {
    void this.router.navigate(['/owner/bills/new']);
  }
}
