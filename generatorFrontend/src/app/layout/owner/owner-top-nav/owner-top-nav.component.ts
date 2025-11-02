import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { ThemeService } from '../../../core/services/theme.service';
import { I18nService, SupportedLanguage } from '../../../core/services/i18n.service';
import { AuthService } from '../../../core/auth/auth.service';
import { HasPermDirective } from '../../../shared/directives/has-perm.directive';
import { Permission } from '../../../core/models/domain.models';

@Component({
  selector: 'app-owner-top-nav',
  imports: [CommonModule, RouterLink, RouterLinkActive, TranslatePipe, HasPermDirective],
  templateUrl: './owner-top-nav.component.html',
  styleUrl: './owner-top-nav.component.scss'
})
export class OwnerTopNavComponent {
  private readonly themeService = inject(ThemeService);
  private readonly i18n = inject(I18nService);
  private readonly auth = inject(AuthService);

  readonly theme = computed(() => this.themeService.theme());
  readonly lang = computed(() => this.i18n.currentLang());
  readonly session = computed(() => this.auth.session());

  readonly navLinks: Array<{ path: string; key: string; perms?: Permission[] }> = [
    { path: '/owner/dashboard', key: 'owner.nav.dashboard' },
    { path: '/owner/customers', key: 'owner.nav.customers', perms: ['CUSTOMER_WRITE'] },
    { path: '/owner/bills', key: 'owner.nav.bills', perms: ['BILL_WRITE'] },
    { path: '/owner/sms/templates', key: 'owner.nav.smsTemplates', perms: ['TEMPLATE_WRITE'] },
    { path: '/owner/sms/campaigns', key: 'owner.nav.sms', perms: ['SMS_SEND'] },
    { path: '/owner/imports', key: 'owner.nav.imports', perms: ['BILL_IMPORT'] },
    { path: '/owner/reports', key: 'owner.nav.reports', perms: ['REPORT_VIEW'] }
  ];

  readonly languages: SupportedLanguage[] = ['en', 'ar'];

  toggleTheme(): void {
    this.themeService.toggle();
  }

  async setLanguage(code: SupportedLanguage): Promise<void> {
    await this.i18n.setLanguage(code);
  }

  async logout(): Promise<void> {
    await this.auth.logout('/auth/login');
  }
}
