import { CommonModule } from '@angular/common';
import { Component, Inject, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { OwnerCustomer } from '../../../../core/models/domain.models';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

export interface CustomerDialogData {
  customer?: OwnerCustomer;
}

@Component({
  selector: 'app-customer-upsert-dialog',
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, TranslatePipe],
  templateUrl: './customer-upsert-dialog.component.html',
  styleUrl: './customer-upsert-dialog.component.scss'
})
export class CustomerUpsertDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<CustomerUpsertDialogComponent>);

  readonly form = this.fb.group({
    id: [null],
    // Customer fields
    firstName: [''],
    lastName: [''],
    phoneNumber: ['', [Validators.required, Validators.minLength(8)]],
    // OwnerCustomer fields
    subscriptionNumber: ['', Validators.required],
    zone: [''],
    address: [''],
    subscriptionAmps: [null as number | null],
    billingMode: ['METERED' as 'METERED' | 'FIXED', Validators.required],
    defaultNameOnBill: [''],
    isActive: [true, Validators.required],
    // Legacy compatibility
    fullName: [''], // Computed from firstName + lastName
    status: ['ACTIVE'] // Mapped from isActive
  });

  constructor(@Inject(MAT_DIALOG_DATA) public data: CustomerDialogData) {
    if (this.data.customer) {
      this.form.patchValue(this.data.customer as any);
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.dialogRef.close(this.form.getRawValue());
  }

  cancel(): void {
    this.dialogRef.close(null);
  }
}
