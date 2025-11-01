import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';

export type ThemeVariant = 'dark' | 'soft-light';

const STORAGE_KEY = 'generator:theme:v1';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = typeof window !== 'undefined';
  private readonly themeState = signal<ThemeVariant>(this.detectPreferredTheme());
  readonly theme = this.themeState.asReadonly();

  constructor() {
    this.applyTheme(this.themeState());
  }

  setTheme(theme: ThemeVariant): void {
    if (theme === this.themeState()) {
      return;
    }
    this.themeState.set(theme);
    if (this.isBrowser) {
      localStorage.setItem(STORAGE_KEY, theme);
    }
    this.applyTheme(theme);
  }

  toggle(): void {
    const next = this.themeState() === 'dark' ? 'soft-light' : 'dark';
    this.setTheme(next);
  }

  private detectPreferredTheme(): ThemeVariant {
    const stored = this.isBrowser
      ? (localStorage.getItem(STORAGE_KEY) as ThemeVariant | null)
      : null;
    if (stored) {
      return stored;
    }
    const prefersDark =
      typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'soft-light';
  }

  private applyTheme(theme: ThemeVariant): void {
    const root = this.document.documentElement;
    root.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'soft-light');
  }
}

