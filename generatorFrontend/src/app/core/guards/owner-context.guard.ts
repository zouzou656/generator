import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateChildFn,
  Router,
  RouterStateSnapshot
} from '@angular/router';
import { AuthService } from '../auth/auth.service';

function hasOwnerMismatch(route: ActivatedRouteSnapshot, ownerId: string): boolean {
  const routeOwner = route.paramMap.get('ownerId') ?? route.queryParamMap.get('ownerId');
  if (routeOwner && routeOwner !== ownerId) {
    return true;
  }
  if (route.parent) {
    return hasOwnerMismatch(route.parent, ownerId);
  }
  return false;
}

export const ownerContextGuard: CanActivateChildFn = (
  childRoute: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    return router.parseUrl('/auth/login');
  }

  let ownerId: string;
  try {
    ownerId = auth.getOwnerIdOrThrow();
  } catch (error) {
    return router.parseUrl('/');
  }

  if (hasOwnerMismatch(childRoute, ownerId)) {
    return router.parseUrl('/owner/dashboard');
  }

  return true;
};





