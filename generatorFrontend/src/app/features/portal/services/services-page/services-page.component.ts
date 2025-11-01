import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-services-page',
  imports: [CommonModule, RouterLink, MatIconModule, TranslatePipe],
  templateUrl: './services-page.component.html',
  styleUrl: './services-page.component.scss'
})
export class ServicesPageComponent {
  readonly cards = ['customers', 'billing', 'sms', 'payments'];

  getServiceIcon(key: string): string {
    const icons: Record<string, string> = {
      customers: '👥',
      billing: '💳',
      sms: '📱',
      payments: '💰'
    };
    return icons[key] || '✨';
  }

  getServiceFeatures(key: string): string[] {
    const features: Record<string, string[]> = {
      customers: [
        'Unified customer profiles',
        'Smart segmentation',
        'Service history tracking',
        'Quick search and filters'
      ],
      billing: [
        'Automated bill generation',
        'Metered & fixed billing modes',
        'USD/LBP conversion',
        'Bulk import from Excel'
      ],
      sms: [
        'Campaign builder',
        'Delivery tracking',
        'Template library',
        'Scheduled sending'
      ],
      payments: [
        'Online payment processing',
        'Multiple payment methods',
        'Automatic reconciliation',
        'Payment history'
      ]
    };
    return features[key] || [];
  }
}
