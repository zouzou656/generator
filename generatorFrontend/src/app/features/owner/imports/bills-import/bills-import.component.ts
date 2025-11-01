import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { AuthService } from '../../../../core/auth/auth.service';
import { API_CLIENT, ApiClient, BillImportRow } from '../../../../core/api/api-client';
import { ImportBatchRecord } from '../../../../core/models/domain.models';
import { parseImportFile } from '../../../../shared/utils/import-parser';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-bills-import',
  imports: [
    CommonModule, 
    MatButtonModule, 
    MatIconModule,
    MatChipsModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatSnackBarModule, 
    TranslatePipe
  ],
  templateUrl: './bills-import.component.html',
  styleUrl: './bills-import.component.scss'
})
export class BillsImportComponent {
  private readonly auth = inject(AuthService);
  private readonly api = inject<ApiClient>(API_CLIENT);
  private readonly snackBar = inject(MatSnackBar);

  selectedFile: File | null = null;
  rows: BillImportRow[] = [];
  parsingError: string | null = null;
  importing = false;
  importBatches: ImportBatchRecord[] = [];

  constructor() {
    this.loadImportHistory();
  }

  async loadImportHistory(): Promise<void> {
    try {
      this.importBatches = await this.api.getImportBatches(this.auth.getOwnerIdOrThrow());
    } catch (error) {
      // Silently fail if not implemented
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
      this.rows = await parseImportFile(file);
      if (this.rows.length === 0) {
        this.parsingError = 'File appears to be empty or invalid format';
      }
    } catch (error: any) {
      this.parsingError = error.message || 'Failed to parse file';
    }
  }

  rowsWithErrors(): Array<BillImportRow & { hasError: boolean }> {
    return this.rows.map(row => ({
      ...row,
      hasError: !row.subscriptionNumber || !row.totalAmount || 
                (row.periodYear === undefined && !row.period) ||
                (row.periodMonth === undefined && !row.period)
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

  formatPeriod(row: BillImportRow): string {
    if (row.periodYear && row.periodMonth) {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${months[row.periodMonth - 1]} ${row.periodYear}`;
    }
    return row.period || '-';
  }

  clearFile(): void {
    this.selectedFile = null;
    this.rows = [];
    this.parsingError = null;
  }

  downloadTemplate(): void {
    // Create CSV template
    const headers = ['subscriptionNumber', 'periodYear', 'periodMonth', 'totalAmount', 'previousKva', 'currentKva', 'subscriptionFeeVar', 'subscriptionFeeFixed', 'nameOnBill', 'dueDate', 'notes', 'subscriptionAmps'];
    const sampleRow = ['SUB1201', '2025', '3', '45.50', '100.00', '150.00', '0.25', '20.00', 'John Doe', '2025-03-25', 'Sample note', '10'];
    
    const csv = [headers.join(','), sampleRow.join(',')].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bills-import-template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
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
      const batch = await this.api.importBills(this.auth.getOwnerIdOrThrow(), this.rows);
      this.snackBar.open(`Import started successfully. Processing ${this.rows.length} rows...`, 'Close', { duration: 4000 });
      this.clearFile();
      await this.loadImportHistory();
    } catch (error: any) {
      this.snackBar.open('Import failed. Please check your file format and try again.', 'Close', { duration: 4000 });
    } finally {
      this.importing = false;
    }
  }
}
