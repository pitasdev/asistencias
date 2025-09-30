import { AuthManager } from '@/app/domain/auth/services/auth-manager';
import { RoleManager } from '@/app/domain/role/services/role-manager';
import { UserManager } from '@/app/domain/user/services/user-manager';
import { inject } from '@angular/core';
import { CanActivateChildFn, Router } from '@angular/router';

export const checkTokenGuard: CanActivateChildFn = async (route, state) => {
  const router = inject(Router);
  const authManager = inject(AuthManager);
  const userManager = inject(UserManager);
  const roleManager = inject(RoleManager);

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

  await userManager.setActiveUser(authManager.getUserIdByToken(authManager.token()!));
  await roleManager.getRoles();

  return true;
};
