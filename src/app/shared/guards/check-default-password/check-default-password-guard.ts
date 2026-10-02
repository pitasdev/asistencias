import { UserManager } from "@/app/domain/user/services/user-manager";
import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";

export const checkDefaultPasswordGuard: CanActivateFn = () => {
  const userManager = inject(UserManager);
  const router = inject(Router);

  if (userManager.activeUser()?.hasDefaultPassword) {
    return router.createUrlTree(['/panel-de-usuario'], {
      queryParams: { requiredPasswordChange: true }
    });
  }

  return true;
};
