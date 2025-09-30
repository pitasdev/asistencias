import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { inject } from '@angular/core';
import { InfoModalManager } from '@/app/core/services/info-modal-manager/info-modal-manager';
import { CustomHttpResponse } from '../../models/custom-http-response.model';

export const errorHandlingInterceptor: HttpInterceptorFn = (req, next) => {
  const infoModalManager = inject(InfoModalManager);

  return next(req).pipe(
    catchError((httpError: HttpErrorResponse) => {
      const customHttpError: CustomHttpResponse = httpError.error;
      infoModalManager.error(customHttpError.error ?? 'Error de comunicación con el servidor');
      return throwError(() => httpError);
    })
  );
};
