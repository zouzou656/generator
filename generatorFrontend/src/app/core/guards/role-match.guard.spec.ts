import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { roleMatchGuard } from './role-match.guard';
import { AuthService } from '../auth/auth.service';

describe('roleMatchGuard', () => {
  const authMock = {
    isAuthenticated: jest.fn(),
    hasRole: jest.fn()
  } as unknown as AuthService;
  let routerMock: Router;

  beforeEach(() => {
    routerMock = { parseUrl: jest.fn().mockReturnValue('/auth/login') } as unknown as Router;
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authMock },
        { provide: Router, useValue: routerMock }
      ]
    });
    jest.clearAllMocks();
  });

  it('redirects to login when not authenticated', () => {
    (authMock.isAuthenticated as jest.Mock).mockReturnValue(false);
    const result = TestBed.runInInjectionContext(() =>
      roleMatchGuard({ data: { roles: ['ADMIN'] } } as any, [] as any)
    );
    expect(result).toBe('/auth/login');
  });

  it('allows matching roles', () => {
    (authMock.isAuthenticated as jest.Mock).mockReturnValue(true);
    (authMock.hasRole as jest.Mock).mockReturnValue(true);
    const result = TestBed.runInInjectionContext(() =>
      roleMatchGuard({ data: { roles: ['ADMIN'] } } as any, [] as any)
    );
    expect(result).toBe(true);
  });

  it('redirects when role mismatch', () => {
    (authMock.isAuthenticated as jest.Mock).mockReturnValue(true);
    (authMock.hasRole as jest.Mock).mockReturnValue(false);
    const result = TestBed.runInInjectionContext(() =>
      roleMatchGuard({ data: { roles: ['ADMIN'] } } as any, [] as any)
    );
    expect(result).toBe('/auth/login');
  });
});

