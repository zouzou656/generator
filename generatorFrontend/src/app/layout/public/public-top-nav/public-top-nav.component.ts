import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { ThemeService } from '../../../core/services/theme.service';
import { I18nService, SupportedLanguage } from '../../../core/services/i18n.service';

@Component({
  selector: 'app-public-top-nav',
  imports: [CommonModule, RouterLink, RouterLinkActive, TranslatePipe],
  templateUrl: './public-top-nav.component.html',
  styleUrl: './public-top-nav.component.scss'
})
export class PublicTopNavComponent {
  private readonly themeService = inject(ThemeService);
  private readonly i18n = inject(I18nService);

  readonly theme = computed(() => this.themeService.theme());
  readonly lang = computed(() => this.i18n.currentLang());

  readonly navLinks = [
    { path: '/', key: 'nav.home' },
    { path: '/about', key: 'nav.about' },
    { path: '/services', key: 'nav.services' },
    { path: '/contact', key: 'nav.contact' },
    { path: '/check-bill', key: 'nav.checkBill' }
  ];

  readonly languages: Array<{ code: SupportedLanguage; label: string }> = [
    { code: 'en', label: 'EN' },
    { code: 'ar', label: 'ع' }
  ];

  toggleTheme(): void {
    this.themeService.toggle();
  }

  async setLanguage(code: SupportedLanguage): Promise<void> {
    await this.i18n.setLanguage(code);
  }
}
