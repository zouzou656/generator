import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { HasPermDirective } from '../../../shared/directives/has-perm.directive';
import { Permission } from '../../../core/models/domain.models';

@Component({
  selector: 'app-owner-sidebar',
  imports: [CommonModule, RouterLink, RouterLinkActive, TranslatePipe, HasPermDirective],
  templateUrl: './owner-sidebar.component.html',
  styleUrl: './owner-sidebar.component.scss'
})
export class OwnerSidebarComponent {
  readonly links: Array<{ icon: string; label: string; path: string; perms?: Permission[] }> = [
    { icon: '📊', label: 'owner.nav.dashboard', path: '/owner/dashboard' },
    { icon: '👥', label: 'owner.nav.customers', path: '/owner/customers', perms: ['CUSTOMER_WRITE'] },
    { icon: '💡', label: 'owner.nav.bills', path: '/owner/bills', perms: ['BILL_WRITE'] },
    { icon: '📝', label: 'owner.nav.smsTemplates', path: '/owner/sms/templates', perms: ['TEMPLATE_WRITE'] },
    { icon: '📩', label: 'owner.nav.sms', path: '/owner/sms/campaigns', perms: ['SMS_SEND'] },
    { icon: '⤴️', label: 'owner.nav.imports', path: '/owner/imports', perms: ['BILL_IMPORT'] },
    { icon: '📈', label: 'owner.nav.reports', path: '/owner/reports', perms: ['REPORT_VIEW'] }
  ];
}
