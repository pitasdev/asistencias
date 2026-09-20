import { HttpBackend, HttpClient, HttpContextToken, HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { UserManager } from '@/app/domain/user/services/user-manager';
import { User } from '@/app/shared/models/user/user.model';
import { environment } from '@/environments/environment';
import { catchError, finalize, Observable, shareReplay, switchMap, throwError } from 'rxjs';

let refresh$: Observable<User> | null = null;

function isAuthRequest(url: string): boolean {
  return (
    url.includes('/auth/login') ||
    url.includes('/auth/refresh') ||
    url.includes('/auth/logout') ||
    url.includes('/auth/me')
  );
}

function hasRetryFlag(req: HttpRequest<unknown>): boolean {
  return req.context.has(RETRY_CONTEXT_TOKEN);
}

// Context token para marcar reintentos sin mutar headers/params.
const RETRY_CONTEXT_TOKEN = new HttpContextToken<boolean>(() => false);

function markRetried<T>(req: HttpRequest<T>): HttpRequest<T> {
  return req.clone({ context: req.context.set(RETRY_CONTEXT_TOKEN, true) });
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const httpBackend = inject(HttpBackend);
  const userManager = inject(UserManager);
  const router = inject(Router);

  return next(req).pipe(
    catchError((httpError: HttpErrorResponse) => {
      if (httpError.status !== 401) {
        return throwError(() => httpError);
      }

      if (isAuthRequest(req.url) || hasRetryFlag(req)) {
        return throwError(() => httpError);
      }

      if (!refresh$) {
        const rawHttp = new HttpClient(httpBackend);
        refresh$ = rawHttp
          .post<User>(`${environment.baseUrlApi}/auth/refresh`, {}, { withCredentials: true })
          .pipe(
            shareReplay(1),
            finalize(() => {
              refresh$ = null;
            })
          );
      }

      return refresh$.pipe(
        switchMap((user) => {
          userManager.setActiveUserFromUser(user);

          return next(markRetried(req)).pipe(
            catchError((retryError: unknown) => {
              if (retryError instanceof HttpErrorResponse && retryError.status === 401) {
                userManager.setActiveUserFromUser(null);
                router.navigate(['/login']);
              }
              
              return throwError(() => retryError);
            })
          );
        }),
        catchError((refreshError: unknown) => {
          if (refreshError instanceof HttpErrorResponse && refreshError.status === 429) {
            return throwError(() => refreshError);
          }

          userManager.setActiveUserFromUser(null);
          router.navigate(['/login']);
          
          return throwError(() => refreshError);
        })
      );
    })
  );
};
