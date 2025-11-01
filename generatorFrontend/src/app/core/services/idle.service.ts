import { DOCUMENT } from '@angular/common';
import { Injectable, OnDestroy, effect, inject, signal } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class IdleService implements OnDestroy {
  private readonly doc = inject(DOCUMENT);
  private listeners: Array<() => void> = [];
  private warningTimer: ReturnType<typeof setTimeout> | null = null;
  private logoutTimer: ReturnType<typeof setTimeout> | null = null;
  private onTimeout: (() => void) | null = null;

  readonly warningMinutes = environment.idle.warningMinutes ?? 25;
  readonly logoutMinutes = environment.idle.logoutMinutes ?? 30;
  readonly sessionDurationMs = this.logoutMinutes * 60 * 1000;

  private readonly warningState = signal(false);
  readonly warning = this.warningState.asReadonly();

  beginMonitoring(onTimeout: () => void): void {
    this.onTimeout = onTimeout;
    this.teardownTimers();
    this.registerListeners();
    this.scheduleTimers();
  }

  stopMonitoring(): void {
    this.teardownTimers();
    this.removeListeners();
    this.warningState.set(false);
    this.onTimeout = null;
  }

  ping(): void {
    this.scheduleTimers();
  }

  ngOnDestroy(): void {
    this.stopMonitoring();
  }

  private scheduleTimers(): void {
    this.teardownTimers();
    this.warningState.set(false);
    this.warningTimer = setTimeout(() => {
      this.warningState.set(true);
    }, this.warningMinutes * 60 * 1000);

    this.logoutTimer = setTimeout(() => {
      this.warningState.set(false);
      this.onTimeout?.();
    }, this.logoutMinutes * 60 * 1000);
  }

  private teardownTimers(): void {
    if (this.warningTimer) {
      clearTimeout(this.warningTimer);
      this.warningTimer = null;
    }
    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer);
      this.logoutTimer = null;
    }
  }

  private registerListeners(): void {
    this.removeListeners();
    const reset = () => this.scheduleTimers();
    const events = ['mousemove', 'keydown', 'click', 'touchstart'] as const;
    events.forEach((eventName) => {
      const handler = () => this.scheduleTimers();
      this.doc.addEventListener(eventName, handler, { passive: true });
      this.listeners.push(() => this.doc.removeEventListener(eventName, handler));
    });
  }

  private removeListeners(): void {
    this.listeners.forEach((unsubscribe) => unsubscribe());
    this.listeners = [];
  }
}

