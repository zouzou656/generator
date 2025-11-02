import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormArray, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { BillImportRow } from '../../../../../core/api/api-client';

interface DialogData {
  single: boolean;
}

@Component({
  selector: 'app-bill-manual-entry-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './bill-manual-entry-dialog.component.html',
  styleUrl: './bill-manual-entry-dialog.component.scss'
})
export class BillManualEntryDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<BillManualEntryDialogComponent>);
  private readonly snackBar = inject(MatSnackBar);
  readonly data = inject<DialogData>(MAT_DIALOG_DATA);

  form: FormGroup;
  currentYear = new Date().getFullYear();
  months = [
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

  constructor() {
    this.form = this.fb.group({
      bills: this.fb.array([this.createBillFormGroup()])
    });

    if (!this.data.single) {
      // Start with 2 empty rows for multiple entry
      for (let i = 0; i < 1; i++) {
        this.addBill();
      }
    }
  }

  get bills(): FormArray {
    return this.form.get('bills') as FormArray;
  }

  getBillGroup(index: number): FormGroup {
    return this.bills.at(index) as FormGroup;
  }

  createBillFormGroup(): FormGroup {
    return this.fb.group({
      subscriptionNumber: ['', Validators.required],
      periodYear: [this.currentYear, Validators.required],
      periodMonth: [new Date().getMonth() + 1, Validators.required],
      totalAmount: [null, [Validators.required, Validators.min(0)]],
      previousKva: [null],
      currentKva: [null],
      subscriptionFeeVar: [null],
      subscriptionFeeFixed: [null],
      nameOnBill: [''],
      dueDate: [''],
      notes: [''],
      subscriptionAmps: [null]
    });
  }

  addBill(): void {
    this.bills.push(this.createBillFormGroup());
  }

  removeBill(index: number): void {
    if (this.bills.length > 1) {
      this.bills.removeAt(index);
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.snackBar.open('Please fill in all required fields', 'Close', { duration: 3000 });
      return;
    }

    const billRows: BillImportRow[] = this.bills.value.map((b: any) => ({
      subscriptionNumber: b.subscriptionNumber,
      periodYear: Number(b.periodYear),
      periodMonth: Number(b.periodMonth),
      totalAmount: Number(b.totalAmount),
      previousKva: b.previousKva ? Number(b.previousKva) : undefined,
      currentKva: b.currentKva ? Number(b.currentKva) : undefined,
      subscriptionFeeVar: b.subscriptionFeeVar ? Number(b.subscriptionFeeVar) : undefined,
      subscriptionFeeFixed: b.subscriptionFeeFixed ? Number(b.subscriptionFeeFixed) : undefined,
      nameOnBill: b.nameOnBill || undefined,
      dueDate: b.dueDate || undefined,
      notes: b.notes || undefined,
      subscriptionAmps: b.subscriptionAmps ? Number(b.subscriptionAmps) : undefined
    }));

    this.dialogRef.close({ bills: billRows });
  }

  cancel(): void {
    this.dialogRef.close();
  }
}

