import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { ThemeService } from '../../../core/services/theme.service';
import { I18nService, SupportedLanguage } from '../../../core/services/i18n.service';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-admin-top-nav',
  imports: [CommonModule, TranslatePipe],
  templateUrl: './admin-top-nav.component.html',
  styleUrl: './admin-top-nav.component.scss'
})
export class AdminTopNavComponent {
  private readonly themeService = inject(ThemeService);
  private readonly i18n = inject(I18nService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly theme = computed(() => this.themeService.theme());
  readonly lang = computed(() => this.i18n.currentLang());
  readonly session = computed(() => this.auth.session());

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
