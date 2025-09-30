import { InfoModalManager } from "@/app/core/services/info-modal-manager/info-modal-manager";
import { AuthManager } from "@/app/domain/auth/services/auth-manager";
import { UserManager } from "@/app/domain/user/services/user-manager";
import { inject } from "@angular/core";
import { Router, UrlTree } from "@angular/router";

export async function canAccess(): Promise<boolean | UrlTree> {
  const userManager = inject(UserManager);
  const authManager = inject(AuthManager);
  const router = inject(Router);
  const infoModalManager = inject(InfoModalManager);

  if (!userManager.activeUser()) {
    await userManager.setActiveUser(authManager.getUserIdByToken(authManager.token()!));
  }
  
  if (userManager.activeUser()?.hasDefaultPassword) {
    infoModalManager.info('Debe de cambiar la contraseña para poder continuar');
    return router.createUrlTree(['/panel-de-usuario']);
  }
  
  return true;
}
