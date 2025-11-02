import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../../core/auth/auth.service';
import { API_CLIENT, ApiClient, CustomerImportRow } from '../../../../core/api/api-client';
import { ImportBatchRecord } from '../../../../core/models/domain.models';
import { parseCustomerImportFile } from '../../../../shared/utils/import-parser';
import { CustomerManualEntryDialogComponent } from './customer-manual-entry-dialog/customer-manual-entry-dialog.component';

@Component({
  selector: 'app-customers-import',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './customers-import.component.html',
  styleUrl: './customers-import.component.scss'
})
export class CustomersImportComponent {
  private readonly auth = inject(AuthService);
  private readonly api = inject<ApiClient>(API_CLIENT);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);
  private readonly fb = inject(FormBuilder);

  selectedFile: File | null = null;
  rows: CustomerImportRow[] = [];
  parsingError: string | null = null;
  importing = false;
  importBatches: ImportBatchRecord[] = [];

  constructor() {
    this.loadImportHistory();
  }

  async loadImportHistory(): Promise<void> {
    try {
      const allBatches = await this.api.getImportBatches(this.auth.getOwnerIdOrThrow());
      this.importBatches = allBatches.filter(b => b.importType === 'CUSTOMER');
    } catch (error: any) {
      console.error('[Customers Import] Failed to load history:', error);
      this.importBatches = [];
    }
  }

  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.processFile(files[0]);
    }
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) {
      return;
    }
    await this.processFile(input.files[0]);
  }

  async processFile(file: File): Promise<void> {
    this.selectedFile = file;
    this.rows = [];
    this.parsingError = null;

    try {
      this.rows = await parseCustomerImportFile(file);
      if (this.rows.length === 0) {
        this.parsingError = 'File appears to be empty or invalid format';
      }
    } catch (error: any) {
      this.parsingError = error.message || 'Failed to parse file';
    }
  }

  rowsWithErrors(): Array<CustomerImportRow & { hasError: boolean }> {
    return this.rows.map(row => ({
      ...row,
      hasError: !row.phoneNumber || !row.subscriptionNumber
    }));
  }

  hasAnyErrors(): boolean {
    return this.rowsWithErrors().some(r => r.hasError);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  clearFile(): void {
    this.selectedFile = null;
    this.rows = [];
    this.parsingError = null;
  }

  downloadTemplate(): void {
    const headers = ['phoneNumber', 'firstName', 'lastName', 'subscriptionNumber', 'zone', 'address', 'subscriptionAmps', 'billingMode', 'defaultNameOnBill', 'isActive'];
    const sampleRow = ['+96170123456', 'John', 'Doe', 'SUB1201', 'Zone A', 'Beirut', '10', 'FIXED', 'John Doe', 'true'];
    
    const csv = [headers.join(','), sampleRow.join(',')].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'customers-import-template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  openManualEntryDialog(single: boolean = true): void {
    const dialogRef = this.dialog.open(CustomerManualEntryDialogComponent, {
      width: '800px',
      maxWidth: '95vw',
      data: { single }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.customers && result.customers.length > 0) {
        this.rows = [...this.rows, ...result.customers];
        this.selectedFile = null; // Clear file since we're using manual entry
      }
    });
  }

  getUploadAreaClass(): string {
    if (!this.selectedFile) return 'border-primary bg-primary bg-opacity-5';
    if (this.selectedFile && !this.parsingError) return 'border-success bg-success bg-opacity-5';
    return '';
  }

  getBatchStatusColor(status: string): string | undefined {
    const colors: Record<string, string | undefined> = {
      'COMPLETED': 'primary',
      'PROCESSING': 'accent',
      'FAILED': 'warn',
      'PENDING': undefined
    };
    return colors[status];
  }

  async submit(): Promise<void> {
    if (!this.rows.length) {
      return;
    }
    this.importing = true;
    try {
      const batch = await this.api.importCustomers(this.auth.getOwnerIdOrThrow(), this.rows);
      this.snackBar.open(`Import started successfully. Processing ${this.rows.length} customers...`, 'Close', { duration: 4000 });
      this.clearFile();
      await this.loadImportHistory();
    } catch (error: any) {
      console.error('[Customers Import] Failed to import:', error);
      const errorMsg = error?.message || 'Import failed. Please check your data format and try again.';
      this.snackBar.open(errorMsg, 'Close', { duration: 5000 });
    } finally {
      this.importing = false;
    }
  }
}

