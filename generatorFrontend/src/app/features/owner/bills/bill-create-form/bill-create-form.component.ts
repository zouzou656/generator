import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { AuthService } from '../../../../core/auth/auth.service';
import { OwnerCustomersActions } from '../../../../state/owner-customers/owner-customers.actions';
import { selectOwnerCustomersForOwner } from '../../../../state/owner-customers/owner-customers.selectors';
import { BillsActions } from '../../../../state/bills/bills.actions';
import { DirtyComponent } from '../../../../core/guards/dirty-state.guard';
import { map, startWith } from 'rxjs/operators';
import { OwnerCustomer } from '../../../../core/models/domain.models';

@Component({
  selector: 'app-bill-create-form',
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    MatFormFieldModule, 
    MatSelectModule, 
    MatInputModule, 
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    RouterLink, 
    TranslatePipe
  ],
  templateUrl: './bill-create-form.component.html',
  styleUrl: './bill-create-form.component.scss'
})
export class BillCreateFormComponent implements DirtyComponent {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly customers$ = this.store.select(selectOwnerCustomersForOwner);
  submitting = false;

  readonly months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];

  readonly today = new Date().toISOString().split('T')[0];

  readonly form = this.fb.group({
    ownerCustomerId: ['', Validators.required],
    billDate: [this.today, Validators.required],
    periodYear: [new Date().getFullYear(), Validators.required],
    periodMonth: [new Date().getMonth() + 1, Validators.required],
    previousKva: [null as number | null],
    currentKva: [null as number | null],
    subscriptionFeeVar: [null as number | null],
    subscriptionFeeFixed: [null as number | null],
    totalAmount: [null as number | null, Validators.required],
    amountUSD: [null as number | null],
    amountLBP: [null as number | null],
    nameOnBill: [''],
    dueDate: [''],
    subscriptionAmps: [null as number | null],
    notes: ['']
  });

  selectedCustomer: OwnerCustomer | null = null;

  getSelectedCustomer(): OwnerCustomer | null {
    return this.selectedCustomer;
  }

  readonly totals$ = this.form.valueChanges.pipe(
    startWith(this.form.value),
    map((value) => {
      const totalAmount = Number(value.totalAmount) || 0;
      const amountUSD = Number(value.amountUSD) || totalAmount;
      const amountLBP = Number(value.amountLBP) || Math.round(totalAmount * 89500);
      return {
        totalAmount,
        amountUSD,
        amountLBP
      };
    })
  );

  constructor() {
    const ownerId = this.auth.getOwnerIdOrThrow();
    this.store.dispatch(OwnerCustomersActions.loadOwnerCustomers({ ownerId }));
    
    // Watch form changes to update selected customer
    this.form.controls.ownerCustomerId.valueChanges.subscribe(customerId => {
      this.customers$.subscribe(customers => {
        if (customerId) {
          this.selectedCustomer = customers.find((c: OwnerCustomer) => c.id === customerId) || null;
        } else {
          this.selectedCustomer = null;
        }
      });
    });
  }

  getKvaDifference(): number | null {
    const previous = this.form.value.previousKva;
    const current = this.form.value.currentKva;
    if (previous === null || current === null) return null;
    return Number(current) - Number(previous);
  }

  cancel(): void {
    this.router.navigate(['/owner/bills']);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting = true;
    const ownerId = this.auth.getOwnerIdOrThrow();
    const raw = this.form.getRawValue();
    
    this.store.dispatch(
      BillsActions.createBill({
        ownerId,
        payload: {
          ownerCustomerId: raw.ownerCustomerId!,
          billDate: raw.billDate!,
          periodYear: raw.periodYear!,
          periodMonth: raw.periodMonth!,
          previousKva: raw.previousKva ? Number(raw.previousKva) : undefined,
          currentKva: raw.currentKva ? Number(raw.currentKva) : undefined,
          subscriptionFeeVar: raw.subscriptionFeeVar ? Number(raw.subscriptionFeeVar) : undefined,
          subscriptionFeeFixed: raw.subscriptionFeeFixed ? Number(raw.subscriptionFeeFixed) : undefined,
          totalAmount: Number(raw.totalAmount!),
          amountUSD: raw.amountUSD ? Number(raw.amountUSD) : undefined,
          amountLBP: raw.amountLBP ? Number(raw.amountLBP) : undefined,
          nameOnBill: raw.nameOnBill || undefined,
          dueDate: raw.dueDate || undefined,
          subscriptionAmps: raw.subscriptionAmps ? Number(raw.subscriptionAmps) : undefined,
          notes: raw.notes || undefined
        }
      })
    );
    this.form.markAsPristine();
    setTimeout(() => {
      this.router.navigate(['/owner/bills']);
    }, 500);
  }

  hasDirtyState(): boolean {
    return this.form.dirty;
  }
}
