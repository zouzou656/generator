import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { Permission, UserRole } from '../models/domain.models';
import { PermissionMode } from '../auth/auth.models';

export const permissionGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    return router.parseUrl('/auth/login');
  }

  const requiredPermissions = (route.data?.['perms'] as Permission[]) ?? [];
  const mode = (route.data?.['permMode'] as PermissionMode) ?? 'allOf';

  if (!requiredPermissions.length) {
    return true;
  }

  const hasAccess = auth.hasPermission(requiredPermissions, mode);
  return hasAccess ? true : router.parseUrl('/');
};





