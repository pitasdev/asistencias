import { UserManager } from '@/app/domain/user/services/user-manager';
import { inject } from '@angular/core';
import { CanActivateChildFn, Router } from '@angular/router';

export const checkIsAdminGuard: CanActivateChildFn = (route, state) => {
  const router = inject(Router);
  const userManager = inject(UserManager);

  if (userManager.activeUser()?.role.name !== 'admin' && userManager.activeUser()?.role.name !== 'super') {
    return router.createUrlTree(['/']);
  }

  return true;
};
