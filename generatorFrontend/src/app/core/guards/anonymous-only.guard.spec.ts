import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { anonymousOnlyGuard } from './anonymous-only.guard';
import { AuthService } from '../auth/auth.service';

describe('anonymousOnlyGuard', () => {
  let routerParseSpy: jest.Mock;
  const authMock = {
    isAuthenticated: jest.fn()
  } as unknown as AuthService;

  beforeEach(() => {
    routerParseSpy = jest.fn();
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authMock },
        { provide: Router, useValue: { parseUrl: routerParseSpy } }
      ]
    });
  });

  it('allows navigation when user is anonymous', () => {
    (authMock.isAuthenticated as jest.Mock).mockReturnValue(false);
    const result = TestBed.runInInjectionContext(() => anonymousOnlyGuard(null as any, [] as any));
    expect(result).toBe(true);
  });

  it('redirects when user is authenticated', () => {
    const redirectUrl = {} as any;
    routerParseSpy.mockReturnValue(redirectUrl);
    (authMock.isAuthenticated as jest.Mock).mockReturnValue(true);
    const result = TestBed.runInInjectionContext(() => anonymousOnlyGuard(null as any, [] as any));
    expect(result).toBe(redirectUrl);
    expect(routerParseSpy).toHaveBeenCalledWith('/');
  });
});





