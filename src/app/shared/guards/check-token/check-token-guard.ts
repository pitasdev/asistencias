import { AuthManager } from '@/app/domain/auth/services/auth-manager';
import { inject } from '@angular/core';
import { CanActivateChildFn, Router } from '@angular/router';

export const checkTokenGuard: CanActivateChildFn = async (route, state) => {
  const router = inject(Router);
  const authManager = inject(AuthManager);

  const existToken = authManager.token();
  if (existToken) return true;

  const token = localStorage.getItem('token') ?? sessionStorage.getItem('token');
  if (!token) return router.createUrlTree(['/login']);
  
  authManager.token.set(token);
  const isValidToken = await authManager.checkToken();
  if (!isValidToken) {
    authManager.token.set(null);
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    return router.createUrlTree(['/login']);
  }

  return true;
};
