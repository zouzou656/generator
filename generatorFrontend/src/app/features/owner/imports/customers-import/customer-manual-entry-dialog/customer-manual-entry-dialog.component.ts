import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormArray, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CustomerImportRow } from '../../../../../core/api/api-client';

interface DialogData {
  single: boolean;
}

@Component({
  selector: 'app-customer-manual-entry-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './customer-manual-entry-dialog.component.html',
  styleUrl: './customer-manual-entry-dialog.component.scss'
})
export class CustomerManualEntryDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<CustomerManualEntryDialogComponent>);
  private readonly snackBar = inject(MatSnackBar);
  readonly data = inject<DialogData>(MAT_DIALOG_DATA);

  form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      customers: this.fb.array([this.createCustomerFormGroup()])
    });

    if (!this.data.single) {
      // Start with 3 empty rows for multiple entry
      for (let i = 0; i < 2; i++) {
        this.addCustomer();
      }
    }
  }

  get customers(): FormArray {
    return this.form.get('customers') as FormArray;
  }

  getCustomerGroup(index: number): FormGroup {
    return this.customers.at(index) as FormGroup;
  }

  createCustomerFormGroup(): FormGroup {
    return this.fb.group({
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\+?[0-9]{7,15}$/)]],
      firstName: [''],
      lastName: [''],
      subscriptionNumber: ['', Validators.required],
      zone: [''],
      address: [''],
      subscriptionAmps: [null],
      billingMode: ['FIXED', Validators.required],
      defaultNameOnBill: [''],
      isActive: [true]
    });
  }

  addCustomer(): void {
    this.customers.push(this.createCustomerFormGroup());
  }

  removeCustomer(index: number): void {
    if (this.customers.length > 1) {
      this.customers.removeAt(index);
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.snackBar.open('Please fill in all required fields', 'Close', { duration: 3000 });
      return;
    }

    const customers: CustomerImportRow[] = this.customers.value.map((c: any) => ({
      phoneNumber: c.phoneNumber,
      firstName: c.firstName || undefined,
      lastName: c.lastName || undefined,
      subscriptionNumber: c.subscriptionNumber,
      zone: c.zone || undefined,
      address: c.address || undefined,
      subscriptionAmps: c.subscriptionAmps ? Number(c.subscriptionAmps) : undefined,
      billingMode: c.billingMode as 'METERED' | 'FIXED',
      defaultNameOnBill: c.defaultNameOnBill || undefined,
      isActive: c.isActive !== false
    }));

    this.dialogRef.close({ customers });
  }

  cancel(): void {
    this.dialogRef.close();
  }
}

