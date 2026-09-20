import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { inject } from '@angular/core';
import { InfoModalManager } from '@/app/core/services/info-modal-manager/info-modal-manager';
import { CustomHttpResponse } from '@/app/shared/models/common/custom-http-response.model';

export const errorHandlingInterceptor: HttpInterceptorFn = (req, next) => {
  const infoModalManager = inject(InfoModalManager);

  return next(req).pipe(
    catchError((httpError: HttpErrorResponse) => {
      if (httpError.status === 401) {
        if (req.url.includes('/auth/login')) {
          const customHttpError: CustomHttpResponse = httpError.error;
          if (customHttpError?.error) {
            infoModalManager.error(customHttpError.error);
          }
        }

        return throwError(() => httpError);
      }

      const customHttpError: CustomHttpResponse = httpError.error;
      const isSilentAuthProbe =
        req.url.includes('/auth/me') ||
        req.url.includes('/auth/refresh') ||
        req.url.includes('/auth/logout');

      if (!isSilentAuthProbe) {
        infoModalManager.error(customHttpError?.error ?? 'Error inesperado');
      }

      return throwError(() => httpError);
    })
  );
};
