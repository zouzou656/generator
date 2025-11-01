import { Injectable, Optional, inject, signal } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';

@Injectable({ providedIn: 'root' })
export class PwaService {
  private readonly updates = inject(SwUpdate, { optional: true }) as SwUpdate | null;
  private readonly isBrowser = typeof window !== 'undefined';

  private readonly offlineState = signal<boolean>(this.isBrowser ? !navigator.onLine : false);
  private readonly updateState = signal(false);
  readonly offline = this.offlineState.asReadonly();
  readonly updateAvailable = this.updateState.asReadonly();

  constructor() {
    if (this.updates) {
      this.updates.versionUpdates.subscribe((event) => {
        if (event.type === 'VERSION_READY') {
          this.updateState.set(true);
        }
      });
    }

    if (this.isBrowser) {
      window.addEventListener('online', () => this.offlineState.set(false));
      window.addEventListener('offline', () => this.offlineState.set(true));
    }
  }

  async activateUpdate(): Promise<void> {
    if (!this.updates) {
      return;
    }
    await this.updates.activateUpdate();
    document.location.reload();
  }

  async checkForUpdates(): Promise<void> {
    await this.updates?.checkForUpdate();
  }
}





