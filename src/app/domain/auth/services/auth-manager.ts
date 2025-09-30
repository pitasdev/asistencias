import { inject, Injectable, signal } from '@angular/core';
import { catchError, firstValueFrom, of } from 'rxjs';
import { UserManager } from '../../user/services/user-manager';
import { Router } from '@angular/router';
import { AuthApiClient } from '@/app/core/api-clients/auth/auth-api-client';

interface TokenPayload {
  userId: number;
  roleId: number;
  iat?: number;
  exp?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthManager {
  token = signal<string | null>(null);
  error = signal<string | null>(null);

  private readonly authApiClient = inject(AuthApiClient);
  private readonly userManager = inject(UserManager);
  private readonly router = inject(Router);

  async checkToken(): Promise<boolean> {
    const checkToken = await firstValueFrom(
      this.authApiClient.checkToken().pipe(
        catchError(() => of({ isValidToken: false }))
      )
    );

    return checkToken.isValidToken;
  }

  async login(username: string, password: string, rememberMe: boolean): Promise<boolean> {
    const token = await firstValueFrom(
      this.authApiClient.login(username, password)
        .pipe(
          catchError(() => of({ token: '' }))
        )
    );
    
    if (!token.token) return false;
    
    const userId = this.getUserIdByToken(token.token);
    if (userId === null) return false;

    this.token.set(token.token);
    await this.userManager.setActiveUser(userId);
    
    if (rememberMe) {
      localStorage.setItem('token', token.token);
    } else {
      sessionStorage.setItem('token', token.token);
    }

    return true;
  }

  logout(): void {
    this.token.set(null);
    this.userManager.setActiveUser(null);
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  getUserIdByToken(token: string): number | null {
    try {
      const tokenData = this.getTokenData(token);
      return tokenData.userId;
    } catch (error) {
      console.error('Token inválido:', error);
      return null;
    }
  }

  getRoleIdByToken(token: string): number | null {
    try {
      const tokenData = this.getTokenData(token);
      return tokenData.roleId;
    } catch (error) {
      console.error('Token inválido:', error);
      return null;
    }
  }

  private getTokenData(token: string): TokenPayload {
    const payload = token.split('.')[1];
    const payloadDecoded = atob(payload);
    const payloadParsed: TokenPayload = JSON.parse(payloadDecoded);
    return payloadParsed;
  }
}
