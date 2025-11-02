import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Skip interceptor for mock API
  if (environment.useMockApi) {
    return next(req);
  }

  // Skip adding auth header for login/authentication endpoints
  const url = req.url.toLowerCase();
  if (url.includes('/auth/signin') || url.includes('/auth/login')) {
    return next(req);
  }

  // Get session token - check both the signal and localStorage as fallback
  const auth = inject(AuthService);
  const router = inject(Router);
  
  // session is a ReadonlySignal, so we need to call it as a function
  let session = auth.session();
  
  // Fallback: try to restore from localStorage if signal is null (might happen on initial load)
  if (!session || !session.token) {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('generator:auth-session:v1');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.token) {
            session = parsed;
            console.log('[AuthInterceptor] Restored session from localStorage');
          }
        }
      } catch (e) {
        console.warn('[AuthInterceptor] Failed to parse stored session:', e);
      }
    }
  }
  
  const hasToken = !!session?.token;
  const token = session?.token;
  
  console.log('[AuthInterceptor] Processing request:', req.url, { 
    hasSession: !!session, 
    hasToken,
    tokenPreview: token ? `${token.substring(0, 20)}...` : 'none',
    method: req.method
  });
  
  // Clone request with auth header if we have a token
  const authReq = hasToken && token 
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      })
    : req;

  // Handle the request and catch 401 errors
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // If we get a 401 and we have a session, it means the token is invalid/expired
      if (error.status === 401) {
        console.error('[AuthInterceptor] 401 Unauthorized for', req.url, {
          hadToken: hasToken,
          tokenPreview: token ? `${token.substring(0, 20)}...` : 'none'
        });
        
        // Clear invalid session and redirect to login
        auth.logout('/auth/login').catch(err => {
          console.error('[AuthInterceptor] Failed to logout:', err);
        });
      }
      return throwError(() => error);
    })
  );
};





