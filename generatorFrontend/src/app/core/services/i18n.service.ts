import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal, PLATFORM_ID } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export type SupportedLanguage = 'en' | 'ar';

type TranslationMap = Record<string, unknown>;

const STORAGE_KEY = 'generator:i18n-lang';

@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly http = inject(HttpClient);
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private readonly langState = signal<SupportedLanguage>(
    (this.isBrowser ? (localStorage.getItem(STORAGE_KEY) as SupportedLanguage) : null) ?? 'en'
  );
  private readonly translationsState = signal<TranslationMap>({});
  private readonly readyState = signal(false);

  readonly currentLang = this.langState.asReadonly();
  readonly ready = this.readyState.asReadonly();

  constructor() {
    // Always try to load translations, even during SSR
    void this.loadLanguage(this.langState());
  }

  async setLanguage(lang: SupportedLanguage): Promise<void> {
    if (lang === this.langState()) {
      return;
    }
    await this.loadLanguage(lang);
    this.langState.set(lang);
    if (this.isBrowser) {
      localStorage.setItem(STORAGE_KEY, lang);
    }
  }

  t(key: string, params?: Record<string, string | number>): string {
    const segments = key.split('.');
    let node: any = this.translationsState();
    for (const segment of segments) {
      if (node && segment in node) {
        node = node[segment];
      } else {
        return key;
      }
    }
    if (typeof node === 'string') {
      return this.interpolate(node, params);
    }
    return key;
  }

  private async loadLanguage(lang: SupportedLanguage): Promise<void> {
    try {
      this.readyState.set(false);
      const data = await firstValueFrom(
        this.http.get<TranslationMap>(`assets/i18n/${lang}.json`)
      );
      this.translationsState.set(data);
      this.langState.set(lang);
      this.readyState.set(true);
      this.applyDocumentAttributes(lang);
    } catch (error) {
      // On SSR or if file not found, try loading from a synchronous import or use empty translations
      // For now, set ready state so components can render (will show keys until translations load)
      console.warn(`Failed to load translations for ${lang}:`, error);
      
      // Try to use a default empty object to prevent errors
      this.translationsState.set({});
      this.readyState.set(true);
      this.applyDocumentAttributes(lang);
      
      // In browser, retry loading after a short delay
      if (this.isBrowser) {
        setTimeout(() => {
          void this.loadLanguage(lang);
        }, 100);
      }
    }
  }

  private applyDocumentAttributes(lang: SupportedLanguage): void {
    if (!this.document?.documentElement) {
      return;
    }
    const dir = lang === 'ar' ? 'rtl' : 'ltr';
    this.document.documentElement.lang = lang;
    this.document.documentElement.dir = dir;
  }

  private interpolate(template: string, params?: Record<string, string | number>): string {
    if (!params) {
      return template;
    }
    return Object.keys(params).reduce((acc, key) => {
      const value = params[key];
      return acc.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
    }, template);
  }
}





