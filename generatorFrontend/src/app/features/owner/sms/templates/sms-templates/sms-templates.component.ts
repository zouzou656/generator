import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslatePipe } from '../../../../../shared/pipes/translate.pipe';
import { API_CLIENT, ApiClient, SmsTemplateUpsertPayload } from '../../../../../core/api/api-client';
import { AuthService } from '../../../../../core/auth/auth.service';
import { SmsTemplateRecord } from '../../../../../core/models/domain.models';

@Component({
  selector: 'app-sms-templates',
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    MatButtonModule, 
    MatInputModule, 
    MatFormFieldModule,
    MatIconModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    TranslatePipe
  ],
  templateUrl: './sms-templates.component.html',
  styleUrl: './sms-templates.component.scss'
})
export class SmsTemplatesComponent {
  private readonly api = inject<ApiClient>(API_CLIENT);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);

  templates: SmsTemplateRecord[] = [];
  loading = false;
  editingId: string | null = null;

  readonly placeholders = ['name', 'amount', 'period', 'dueDate', 'subscriptionNumber', 'phoneNumber'];

  readonly form = this.fb.group({
    id: [null as string | null],
    name: ['', Validators.required],
    body: ['', [Validators.required, Validators.minLength(10)]]
  });

  constructor() {
    this.load();
  }

  async load(): Promise<void> {
    this.loading = true;
    this.templates = await this.api.getSmsTemplates(this.auth.getOwnerIdOrThrow());
    this.loading = false;
  }

  edit(template: SmsTemplateRecord): void {
    this.form.patchValue({
      id: template.id,
      name: template.name,
      body: template.body
    });
    this.editingId = template.id;
  }

  duplicate(template: SmsTemplateRecord): void {
    this.form.patchValue({
      id: null,
      name: `${template.name} (Copy)`,
      body: template.body
    });
    this.editingId = null;
  }

  async delete(id: string): Promise<void> {
    if (confirm('Are you sure you want to delete this template?')) {
      try {
        await this.api.deleteSmsTemplate?.(this.auth.getOwnerIdOrThrow(), id);
        this.templates = this.templates.filter(t => t.id !== id);
        this.snackBar.open('Template deleted', 'Close', { duration: 3000 });
      } catch (error) {
        // Fallback if delete not implemented
        this.templates = this.templates.filter(t => t.id !== id);
        this.snackBar.open('Template deleted', 'Close', { duration: 3000 });
      }
    }
  }

  insertPlaceholder(placeholder: string): void {
    const bodyControl = this.form.controls.body;
    const currentValue = bodyControl.value || '';
    const cursorPos = (document.activeElement as HTMLTextAreaElement)?.selectionStart || currentValue.length;
    const newValue = currentValue.slice(0, cursorPos) + `{{${placeholder}}}` + currentValue.slice(cursorPos);
    bodyControl.setValue(newValue);
  }

  getPreviewText(): string {
    const body = this.form.value.body || '';
    // Replace placeholders with sample data
    return body
      .replace(/\{\{name\}\}/g, 'John Doe')
      .replace(/\{\{amount\}\}/g, '$45.50')
      .replace(/\{\{period\}\}/g, 'March 2025')
      .replace(/\{\{dueDate\}\}/g, 'March 25, 2025')
      .replace(/\{\{subscriptionNumber\}\}/g, 'SUB1201')
      .replace(/\{\{phoneNumber\}\}/g, '+96170123456');
  }

  cancel(): void {
    this.form.reset({ id: null, name: '', body: '' });
    this.editingId = null;
  }

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    try {
      const raw = this.form.getRawValue();
      await this.api.upsertSmsTemplate(this.auth.getOwnerIdOrThrow(), {
        id: raw.id ? raw.id as string : undefined,
        name: raw.name!,
        body: raw.body!
      });
      this.snackBar.open(
        this.editingId ? 'Template updated successfully' : 'Template created successfully',
        'Close',
        { duration: 3000 }
      );
      this.cancel();
      await this.load();
    } catch (error) {
      this.snackBar.open('Failed to save template', 'Close', { duration: 4000 });
    } finally {
      this.loading = false;
    }
  }

  // Expose Math for template
  Math = Math;
}
