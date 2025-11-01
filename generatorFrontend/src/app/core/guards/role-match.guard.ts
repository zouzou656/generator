import { inject } from '@angular/core';
import { CanMatchFn, Route, Router, UrlSegment } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { UserRole } from '../models/domain.models';

export const roleMatchGuard: CanMatchFn = (
  route: Route,
  segments: UrlSegment[]
) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const requiredRoles = (route.data?.['roles'] as UserRole[]) ?? [];
  if (!requiredRoles.length) {
    return true;
  }

  if (!auth.isAuthenticated()) {
    return router.parseUrl('/auth/login');
  }

  return auth.hasRole(requiredRoles) ? true : router.parseUrl('/auth/login');
};





