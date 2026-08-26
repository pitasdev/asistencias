import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { inject } from '@angular/core';
import { InfoModalManager } from '@/app/core/services/info-modal-manager/info-modal-manager';
import { CustomHttpResponse } from '@/app/shared/models/common/custom-http-response.model';
import { UserManager } from '@/app/domain/user/services/user-manager';
import { Router } from '@angular/router';

export const errorHandlingInterceptor: HttpInterceptorFn = (req, next) => {
  const infoModalManager = inject(InfoModalManager);
  const userManager = inject(UserManager);
  const router = inject(Router);

  return next(req).pipe(
    catchError((httpError: HttpErrorResponse) => {
      if (httpError.status === 401) {
        const isLoginRequest = req.url.includes('/auth/login');
        const isMeRequest = req.url.includes('/auth/me');

        if (isMeRequest) {
          return throwError(() => httpError);
        }

        if (isLoginRequest) {
          const customHttpError: CustomHttpResponse = httpError.error;
          if (customHttpError?.error) {
            infoModalManager.error(customHttpError.error);
          }
          return throwError(() => httpError);
        }

        userManager.setActiveUserFromUser(null);
        router.navigate(['/login']);
        return throwError(() => httpError);
      }

      const customHttpError: CustomHttpResponse = httpError.error;
      infoModalManager.error(customHttpError.error ?? 'Error inesperado');
      return throwError(() => httpError);
    })
  );
};
