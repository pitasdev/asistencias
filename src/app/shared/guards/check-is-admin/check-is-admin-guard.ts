import { RoleManager } from '@/app/domain/role/services/role-manager';
import { UserManager } from '@/app/domain/user/services/user-manager';
import { inject } from '@angular/core';
import { CanActivateChildFn, Router } from '@angular/router';

let adminRole: Role | null = null;
let superRole: Role | null = null;

export const checkIsAdminGuard: CanActivateChildFn = (route, state) => {
  const router = inject(Router);
  const userManager = inject(UserManager);
  const roleManager = inject(RoleManager);

  if (!adminRole || !superRole) {
    adminRole = roleManager.findRoleByName('admin')!;
    superRole = roleManager.findRoleByName('super')!;
  };
  
  if (!adminRole || !superRole) return router.createUrlTree(['/']);

  if (userManager.activeUser()?.roleId !== adminRole.id && userManager.activeUser()?.roleId !== superRole.id) {
    return router.createUrlTree(['/']);
  }

  return true;
};
