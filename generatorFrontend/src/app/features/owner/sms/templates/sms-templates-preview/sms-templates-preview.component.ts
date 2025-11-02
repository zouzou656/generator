import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { API_CLIENT, ApiClient } from '../../../../../core/api/api-client';
import { AuthService } from '../../../../../core/auth/auth.service';
import { SmsTemplateRecord } from '../../../../../core/models/domain.models';

@Component({
  selector: 'app-sms-templates-preview',
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './sms-templates-preview.component.html',
  styleUrl: './sms-templates-preview.component.scss'
})
export class SmsTemplatesPreviewComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject<ApiClient>(API_CLIENT);
  private readonly auth = inject(AuthService);
  private readonly snackBar = inject(MatSnackBar);

  templates: SmsTemplateRecord[] = [];
  loading = false;
  selectedTemplate: SmsTemplateRecord | null = null;

  // Sample data for placeholders
  readonly sampleData = {
    name: 'John Doe',
    amount: '$45.50',
    period: 'March 2025',
    dueDate: 'March 25, 2025',
    subscriptionNumber: 'SUB1201',
    phoneNumber: '+96170123456'
  };

  constructor() {
    this.load();
  }

  async load(): Promise<void> {
    this.loading = true;
    try {
      this.templates = await this.api.getSmsTemplates(this.auth.getOwnerIdOrThrow());
      
      // Select template from query param if provided
      const templateId = this.route.snapshot.queryParams['templateId'];
      if (templateId) {
        this.selectedTemplate = this.templates.find(t => t.id === templateId) || null;
      } else if (this.templates.length > 0) {
        this.selectedTemplate = this.templates[0];
      }
    } catch (error: any) {
      console.error('[SMS Templates Preview] Failed to load:', error);
      const errorMsg = error?.message || 'Failed to load templates. Please ensure you are logged in.';
      this.snackBar.open(errorMsg, 'Close', { duration: 5000 });
      this.templates = [];
    } finally {
      this.loading = false;
    }
  }

  selectTemplate(template: SmsTemplateRecord): void {
    this.selectedTemplate = template;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { templateId: template.id },
      queryParamsHandling: 'merge'
    });
  }

  getPreviewText(template: SmsTemplateRecord): string {
    return template.body
      .replace(/\{\{name\}\}/g, this.sampleData.name)
      .replace(/\{\{amount\}\}/g, this.sampleData.amount)
      .replace(/\{\{period\}\}/g, this.sampleData.period)
      .replace(/\{\{dueDate\}\}/g, this.sampleData.dueDate)
      .replace(/\{\{subscriptionNumber\}\}/g, this.sampleData.subscriptionNumber)
      .replace(/\{\{phoneNumber\}\}/g, this.sampleData.phoneNumber);
  }

  getSmsCount(length: number): number {
    return Math.ceil(length / 160);
  }

  hasPlaceholders(body: string): boolean {
    return /\{\{[^}]+\}\}/.test(body);
  }

  Math = Math;
}

