import { UserApiClient } from '@/app/core/api-clients/user/user-api-client';
import { InfoModalManager } from '@/app/core/services/info-modal-manager/info-modal-manager';
import { CustomHttpResponse } from '@/app/shared/models/custom-http-response.model';
import { ResetPassword } from '@/app/shared/models/reset-password.model';
import { User } from '@/app/shared/models/user.model';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, firstValueFrom, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserManager {
  private _allUsers = signal<User[]>([]);
  private _activeUser = signal<User | null>(null);

  allUsers = this._allUsers.asReadonly();
  activeUser = this._activeUser.asReadonly();

  private readonly userApiClient = inject(UserApiClient);
  private readonly infoModalManager = inject(InfoModalManager);

  async setActiveUser(userId: number | null): Promise<void> {
    if (userId === null) {
      this._activeUser.set(null);
      return;
    }
    
    const activeUser = await firstValueFrom(
      this.userApiClient.getActiveUser(userId)
        .pipe(
          catchError(() => of(null))
        )
    );

    this._activeUser.set(activeUser);
  }

  async getUsersByClubId(clubId: number): Promise<void> {
    const users = await firstValueFrom(
      this.userApiClient.getUsersByClubId(clubId)
        .pipe(
          catchError(() => of([]))
        )
    );

    this._allUsers.set(users);
  }

  async checkAvailableUsername(username: string): Promise<{ isAvailable: boolean }> {
    const isAvailable = await firstValueFrom(
      this.userApiClient.checkAvailableUsername(username)
        .pipe(
          catchError(() => of({ isAvailable: false }))
        )
    );

    return isAvailable;
  }

  async createUser(user: User): Promise<void> {
    const createUser = await firstValueFrom(
      this.userApiClient.createUser(user)
        .pipe(
          catchError(() => of(null))
        )
    );

    if (createUser && createUser.isSuccess) {
      this.infoModalManager.notifySuccess(createUser.message!);
    }
  }

  async updateUser(user: User): Promise<void> {
    const updateUser = await firstValueFrom(
      this.userApiClient.updateUser(user)
        .pipe(
          catchError(() => of(null))
        )
    );

    if (updateUser && updateUser.isSuccess) {
      this.infoModalManager.notifySuccess(updateUser.message!);
    }
  }

  async checkPassword(id: number, password: string): Promise<boolean> {
    const checkPassword = await firstValueFrom(
      this.userApiClient.checkPassword(id, password)
        .pipe(
          catchError(() => of({ isValid: false }))
        )
    );

    return checkPassword.isValid;
  }

  async resetPassword(resetPassword: ResetPassword): Promise<void> {
    const changePasswordUser = await firstValueFrom(
      this.userApiClient.resetPassword(resetPassword)
        .pipe(
          catchError(() => of(null))
        )
    );

    if (changePasswordUser && changePasswordUser.isSuccess) {
      this.infoModalManager.notifySuccess(changePasswordUser.message!);
    }
  }

  async updatePassword(id: number, oldPassword: string, newPassword: string): Promise<boolean> {
    const updatePassword = await firstValueFrom(
      this.userApiClient.updatePassword(id, oldPassword, newPassword, false)
        .pipe(
          catchError(() => of(null))
        )
    );

    if (updatePassword && updatePassword.isSuccess) {
      this._activeUser.set({ 
        ...this._activeUser()!, 
        hasDefaultPassword: false 
      });
      this.infoModalManager.notifySuccess(updatePassword.message!);
      return true;
    } 

    return false;
  }

  async updateName(id: number, name: string): Promise<boolean> {
    const updateName = await firstValueFrom(
      this.userApiClient.updateName(id, name)
        .pipe(
          catchError(() => of(null))
        )
    );

    if (updateName && updateName.isSuccess) {
      this._activeUser.set({ ...this._activeUser()!, name: name });
      this.infoModalManager.notifySuccess(updateName.message!);
      return true;
    }

    return false;
  }

  async deleteUser(userId: number): Promise<void> {
    const deleteUser = await firstValueFrom(
      this.userApiClient.deleteUser(userId)
        .pipe(
          catchError(() => of(null))
        )
    );

    if (deleteUser && deleteUser.isSuccess) {
      this.infoModalManager.success(deleteUser.message!);
    }
  }
}
