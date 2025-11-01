import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { API_CLIENT, ApiClient } from '../../../../core/api/api-client';
import { CheckBillResult } from '../../../../core/models/domain.models';

@Component({
  selector: 'app-check-bill-page',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatTabsModule,
    MatChipsModule,
    MatTooltipModule,
    TranslatePipe
  ],
  providers: [CurrencyPipe, DatePipe],
  templateUrl: './check-bill-page.component.html',
  styleUrl: './check-bill-page.component.scss'
})
export class CheckBillPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject<ApiClient>(API_CLIENT);
  private readonly currency = inject(CurrencyPipe);
  private readonly datePipe = inject(DatePipe);

  readonly form = this.fb.nonNullable.group({
    phone: ['', [Validators.required, Validators.pattern(/^(\+?961)(\d{7,8})$/)]],
    subscriptionNumber: ['']
  });

  loading = false;
  submitted = false;
  errorMessage: string | null = null;
  result: CheckBillResult | null = null;

  get pendingBills() {
    return this.result?.pending ?? [];
  }

  get paidBills() {
    return this.result?.paid ?? [];
  }

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.errorMessage = null;
    this.submitted = true;
    const { phone, subscriptionNumber } = this.form.value;
    try {
      this.result = await this.api.getBillsByPhone(phone!, subscriptionNumber ?? undefined);
      if (!this.result.pending.length && !this.result.paid.length) {
        this.errorMessage = 'portal.checkBill.empty';
      }
    } catch (error) {
      this.errorMessage = 'portal.checkBill.validate.phone';
    } finally {
      this.loading = false;
    }
  }

  formatMoney(amount: number | undefined, currencyCode: 'USD' | 'LBP'): string {
    if (!amount) return '-';
    if (currencyCode === 'USD') {
      return this.currency.transform(amount, 'USD', 'symbol-narrow') ?? '';
    }
    return `${Math.round(amount).toLocaleString()} LBP`;
  }

  formatDate(value: string | undefined): string {
    if (!value) return '-';
    return this.datePipe.transform(value, 'MMM d, y') ?? value;
  }

  formatPeriod(year?: number, month?: number): string {
    if (!year || !month) return '-';
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[month - 1]} ${year}`;
  }
}
