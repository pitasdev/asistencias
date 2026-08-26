import { inject, Service } from '@angular/core';
import { catchError, firstValueFrom, of } from 'rxjs';
import { UserManager } from '../../user/services/user-manager';
import { Router } from '@angular/router';
import { AuthApiClient } from '@/app/core/api-clients/auth/auth-api-client';
import { RoleManager } from '../../role/services/role-manager';

@Service()
export class AuthManager {
  private readonly authApiClient = inject(AuthApiClient);
  private readonly userManager = inject(UserManager);
  private readonly roleManager = inject(RoleManager);
  private readonly router = inject(Router);

  async restoreSession(): Promise<boolean> {
    try {
      const user = await firstValueFrom(
        this.authApiClient.getMe().pipe(catchError(() => of(null)))
      );

      if (!user) return false;

      this.userManager.setActiveUserFromUser(user);
      await this.roleManager.getRoles();
      return true;
    } catch {
      return false;
    }
  }

  async login(username: string, password: string, rememberMe: boolean): Promise<boolean> {
    const user = await firstValueFrom(
      this.authApiClient.login(username, password, rememberMe).pipe(catchError(() => of(null)))
    );

    if (!user) return false;

    this.userManager.setActiveUserFromUser(user);
    await this.roleManager.getRoles();

    return true;
  }

  async logout(): Promise<void> {
    try {
      await firstValueFrom(
        this.authApiClient.logout().pipe(catchError(() => of(null)))
      );
    } finally {
      this.userManager.setActiveUserFromUser(null);
      this.router.navigate(['/login']);
    }
  }
}
