import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (environment.useMockApi) {
    return next(req);
  }
  const auth = inject(AuthService);
  const session = auth.session();
  if (!session) {
    return next(req);
  }
  const authenticatedRequest = req.clone({
    setHeaders: {
      Authorization: `Bearer ${session.token}`
    }
  });
  return next(authenticatedRequest);
};





