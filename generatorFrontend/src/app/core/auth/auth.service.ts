import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, computed, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { API_CLIENT, ApiClient, LoginPayload } from '../api/api-client';
import { AuthSession, Permission, UserRole } from '../models/domain.models';
import { IdleService } from '../services/idle.service';
import { PermissionMode } from './auth.models';

const SESSION_KEY = 'generator:auth-session:v1';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject<ApiClient>(API_CLIENT);
  private readonly router = inject(Router);
  private readonly idle = inject(IdleService);
  private readonly doc = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private readonly sessionState = signal<AuthSession | null>(this.restoreSession());
  readonly session = this.sessionState.asReadonly();
  readonly isAuthenticated = computed(() => !!this.sessionState());
  readonly role = computed<UserRole | null>(() => this.sessionState()?.role ?? null);
  readonly permissions = computed<Permission[]>(() => this.sessionState()?.permissions ?? []);

  constructor() {
    effect(() => {
      const session = this.sessionState();
      if (session) {
        if (this.isBrowser) {
          localStorage.setItem(SESSION_KEY, JSON.stringify(session));
        }
        this.idle.beginMonitoring(() => this.logout());
      } else {
        if (this.isBrowser) {
          localStorage.removeItem(SESSION_KEY);
        }
        this.idle.stopMonitoring();
      }
    });
  }

  private restoreSession(): AuthSession | null {
    if (!this.isBrowser) {
      return null;
    }
    const stored = localStorage.getItem(SESSION_KEY);
    if (!stored) {
      return null;
    }
    try {
      const parsed = JSON.parse(stored) as AuthSession;
      if (parsed.exp && parsed.exp > Date.now()) {
        return parsed;
      }
      localStorage.removeItem(SESSION_KEY);
      return null;
    } catch (error) {
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
  }

  async login(payload: LoginPayload): Promise<void> {
    const { session } = await this.api.login(payload);
    this.sessionState.set(session);
  }

  async logout(redirect: string = '/auth/login'): Promise<void> {
    await this.api.logout();
    this.sessionState.set(null);
    if (redirect) {
      await this.router.navigateByUrl(redirect);
    }
  }

  hasRole(role: UserRole | UserRole[]): boolean {
    const current = this.role();
    if (!current) {
      return false;
    }
    if (Array.isArray(role)) {
      return role.includes(current);
    }
    return current === role;
  }

  hasPermission(perms: Permission[], mode: PermissionMode = 'allOf'): boolean {
    const granted = this.permissions();
    if (!perms.length) {
      return true;
    }
    if (mode === 'allOf') {
      return perms.every((perm) => granted.includes(perm));
    }
    return perms.some((perm) => granted.includes(perm));
  }

  getOwnerIdOrThrow(): string {
    const session = this.sessionState();
    if (!session?.ownerId) {
      throw new Error('Owner context missing');
    }
    return session.ownerId;
  }

  touchSession(): void {
    const current = this.sessionState();
    if (!current) {
      return;
    }
    const refreshed: AuthSession = {
      ...current,
      exp: Date.now() + this.idle.sessionDurationMs
    };
    this.sessionState.set(refreshed);
  }
}

