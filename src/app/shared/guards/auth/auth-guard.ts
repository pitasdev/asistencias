import { AuthManager } from '@/app/domain/auth/services/auth-manager';
import { UserManager } from '@/app/domain/user/services/user-manager';
import { inject } from '@angular/core';
import { CanActivateChildFn, Router } from '@angular/router';

export const authGuard: CanActivateChildFn = async () => {
  const router = inject(Router);
  const authManager = inject(AuthManager);
  const userManager = inject(UserManager);

  if (userManager.activeUser()) return true;

  const restored = await authManager.restoreSession();
  if (restored) return true;

  return router.createUrlTree(['/login']);
};
