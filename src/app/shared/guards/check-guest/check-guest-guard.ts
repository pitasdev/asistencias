import { UserManager } from '@/app/domain/user/services/user-manager';
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const checkGuestGuard: CanActivateFn = () => {
  const router = inject(Router);
  const userManager = inject(UserManager);

  if (userManager.activeUser()) {
    return router.createUrlTree(['/']);
  }

  return true;
};
