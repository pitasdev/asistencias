import { AuthManager } from '@/app/domain/auth/services/auth-manager';
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

export const addTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const authManager = inject(AuthManager);
  const token = authManager.token();

  if (!token) return next(req);

  const newReq = req.clone({
    headers: req.headers.append('Authorization', `Bearer ${token}`)
  });

  return next(newReq);
};
