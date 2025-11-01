import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe } from '../../../../../shared/pipes/translate.pipe';
import { SmsCampaignActions } from '../../../../../state/sms/sms-campaigns.actions';
import { smsCampaignsFeature } from '../../../../../state/sms/sms-campaigns.reducer';
import { AuthService } from '../../../../../core/auth/auth.service';
import { selectOwnerCustomersForOwner } from '../../../../../state/owner-customers/owner-customers.selectors';
import { OwnerCustomersActions } from '../../../../../state/owner-customers/owner-customers.actions';
import { API_CLIENT, ApiClient, SmsTemplateRecord } from '../../../../../core/api/api-client';

@Component({
  selector: 'app-sms-campaigns',
  imports: [
    CommonModule,
    ReactiveFormsModule, 
    MatFormFieldModule, 
    MatSelectModule, 
    MatInputModule, 
    MatButtonModule, 
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TranslatePipe
  ],
  templateUrl: './sms-campaigns.component.html',
  styleUrl: './sms-campaigns.component.scss'
})
export class SmsCampaignsComponent {
  private readonly store = inject(Store);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly api = inject<ApiClient>(API_CLIENT);

  readonly campaigns$ = this.store.select(smsCampaignsFeature.selectAll);
  readonly customers$ = this.store.select(selectOwnerCustomersForOwner);
  templates: SmsTemplateRecord[] = [];
  showForm = false;
  loading = false;

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

  readonly form = this.fb.group({
    id: [null],
    title: ['', Validators.required],
    templateId: ['', Validators.required],
    scheduledAt: [''],
    targetSegments: [['ALL_CUSTOMERS'], Validators.required],
    relatedPeriodYear: [new Date().getFullYear()],
    relatedPeriodMonth: [new Date().getMonth() + 1]
  });

  constructor() {
    const ownerId = this.auth.getOwnerIdOrThrow();
    this.store.dispatch(SmsCampaignActions.loadCampaigns({ ownerId }));
    this.store.dispatch(OwnerCustomersActions.loadOwnerCustomers({ ownerId }));
    this.api.getSmsTemplates(ownerId).then((templates) => {
      this.templates = templates;
      if (!this.form.value.templateId && templates.length) {
        this.form.patchValue({ templateId: templates[0].id });
      }
    });
  }

  get selectedTemplate() {
    const templateId = this.form.value.templateId;
    return this.templates.find(t => t.id === templateId);
  }

  estimatedRecipients(): number {
    // TODO: Calculate based on targetSegments
    // For now, return mock count
    let count = 0;
    this.customers$.subscribe(customers => count = customers.length).unsubscribe();
    return count;
  }

  getPreviewMessage(): string {
    const template = this.selectedTemplate;
    if (!template) return '';
    
    return template.body
      .replace(/\{\{name\}\}/g, 'John Doe')
      .replace(/\{\{amount\}\}/g, '$45.50')
      .replace(/\{\{period\}\}/g, 'March 2025')
      .replace(/\{\{dueDate\}\}/g, 'March 25, 2025')
      .replace(/\{\{subscriptionNumber\}\}/g, 'SUB1201')
      .replace(/\{\{phoneNumber\}\}/g, '+96170123456');
  }

  formatPeriod(year?: number, month?: number): string {
    if (!year || !month) return '';
    return `${this.months[month - 1]?.label} ${year}`;
  }

  getStatusColor(status: string): string | undefined {
    const colors: Record<string, string | undefined> = {
      'SENT': 'primary',
      'SCHEDULED': 'accent',
      'DRAFT': undefined
    };
    return colors[status];
  }

  openCreateDialog(): void {
    this.form.reset({
      title: '',
      templateId: '',
      scheduledAt: '',
      targetSegments: ['ALL_CUSTOMERS'],
      relatedPeriodYear: new Date().getFullYear(),
      relatedPeriodMonth: new Date().getMonth() + 1
    });
    this.showForm = true;
  }

  cancel(): void {
    this.showForm = false;
    this.form.reset();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    const ownerId = this.auth.getOwnerIdOrThrow();
    const raw = this.form.getRawValue();
    
    // Get template body if using template
    const template = this.templates.find(t => t.id === raw.templateId);
    const messageBody = template?.body || '';
    
    this.store.dispatch(SmsCampaignActions.upsertCampaign({ 
      ownerId, 
      payload: {
        id: raw.id ? raw.id as string : undefined,
        title: raw.title!,
        messageBody,
        templateId: raw.templateId!,
        scheduledAt: raw.scheduledAt || undefined,
        targetSegments: raw.targetSegments!,
        relatedPeriodYear: raw.relatedPeriodYear || undefined,
        relatedPeriodMonth: raw.relatedPeriodMonth || undefined
      }
    }));
    this.loading = false;
    this.cancel();
  }

  send(campaignId: string): void {
    this.store.dispatch(SmsCampaignActions.sendCampaign({ ownerId: this.auth.getOwnerIdOrThrow(), campaignId }));
  }

  view(campaignId: string): void {
    this.router.navigate(['/owner/sms/campaigns', campaignId]);
  }

  // Expose Math for template
  Math = Math;
}
