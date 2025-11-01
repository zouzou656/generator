import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { smsCampaignsFeature } from '../../../../../state/sms/sms-campaigns.reducer';
import { smsMessagesFeature } from '../../../../../state/sms/sms-messages.reducer';
import { SmsCampaignActions } from '../../../../../state/sms/sms-campaigns.actions';
import { SmsCampaignRecord, SmsMessageRecord } from '../../../../../core/models/domain.models';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-sms-campaign-detail',
  imports: [CommonModule, RouterLink, MatButtonModule, MatChipsModule, MatIconModule],
  templateUrl: './sms-campaign-detail.component.html',
  styleUrl: './sms-campaign-detail.component.scss'
})
export class SmsCampaignDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly store = inject(Store);
  private readonly campaignId = this.route.snapshot.paramMap.get('id') ?? '';

  readonly campaign$ = this.store.select(smsCampaignsFeature.selectAll).pipe(
    map((campaigns) => campaigns.find((c: SmsCampaignRecord) => c.id === this.campaignId) ?? null)
  );

  readonly messages$ = this.store.select(smsMessagesFeature.selectAll).pipe(
    map((messages) => messages.filter((m: SmsMessageRecord) => (m.campaignId || m.smsCampaignId) === this.campaignId))
  );

  constructor() {
    if (this.campaignId) {
      this.store.dispatch(SmsCampaignActions.loadCampaignMessages({ campaignId: this.campaignId }));
    }
  }

  formatPeriod(year?: number, month?: number): string {
    if (!year || !month) return '';
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'];
    return `${months[month - 1]} ${year}`;
  }

  getStatusColor(status: string): string | undefined {
    const colors: Record<string, string | undefined> = {
      'SENT': 'primary',
      'SCHEDULED': 'accent',
      'DRAFT': undefined
    };
    return colors[status];
  }

  getMessageStatusColor(status: string): string | undefined {
    const colors: Record<string, string | undefined> = {
      'DELIVERED': 'primary',
      'SENT': 'accent',
      'PENDING': undefined,
      'FAILED': 'warn'
    };
    return colors[status];
  }

  getDeliveredCount(messages: SmsMessageRecord[]): number {
    return messages.filter(m => m.status === 'DELIVERED').length;
  }

  getPendingCount(messages: SmsMessageRecord[]): number {
    return messages.filter(m => m.status === 'PENDING' || m.status === 'SENT').length;
  }

  getFailedCount(messages: SmsMessageRecord[]): number {
    return messages.filter(m => m.status === 'FAILED').length;
  }

  refreshMessages(): void {
    if (this.campaignId) {
      this.store.dispatch(SmsCampaignActions.loadCampaignMessages({ campaignId: this.campaignId }));
    }
  }
}
