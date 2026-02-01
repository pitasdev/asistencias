import { UserTeamsApiClient } from '@/app/core/api-clients/user-teams/user-teams-api-client';
import { InfoModalManager } from '@/app/core/services/info-modal-manager/info-modal-manager';
import { UserTeams } from '@/app/shared/models/user-teams.model';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, firstValueFrom, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserTeamsManager {
  private _userTeams = signal<UserTeams[]>([]);
  private _activeUserUserTeams = signal<UserTeams | null>(null);

  userTeams = this._userTeams.asReadonly();
  activeUserUserTeams = this._activeUserUserTeams.asReadonly();

  private readonly userTeamsApiClient = inject(UserTeamsApiClient);
  private readonly infoModalManager = inject(InfoModalManager);

  async getUserTeamsByClubId(clubId: number): Promise<void> {
    const userTeams = await firstValueFrom(
      this.userTeamsApiClient.getUserTeamsByClubId(clubId)
        .pipe(
          catchError(() => of([]))
      )
    );

    this._userTeams.set(userTeams);
  }

  async getUserTeamsByUserId(userId: number): Promise<void> {
    const userTeams = await firstValueFrom(
      this.userTeamsApiClient.getUserTeamsByUserId(userId)
        .pipe(
          catchError(() => of(null))
        )
    );

    this._activeUserUserTeams.set(userTeams);
  }

  async updateUserTeams(userTeams: UserTeams): Promise<void> {
    const response = await firstValueFrom(
      this.userTeamsApiClient.updateUserTeams(userTeams)
        .pipe(
          catchError((error) => of(error))
        )
    );

    if (response && response.isSuccess) {
      this.infoModalManager.notifySuccess(response.message!);
    }
  }

  findUserTeamsByUserId(userId: number): UserTeams | null {
    return this._userTeams().find(ut => ut.user.id === userId) ?? null;
  }

  replaceUserTeams(userTeams: UserTeams): void {
    const updateUserTeams = this._userTeams().map(ut => ut.user.id === userTeams.user.id ? userTeams : ut);
    this._userTeams.set(updateUserTeams);
  }

  deleteUserTeams(userId: number): void {
    const updateUser = this._userTeams().filter(ut => ut.user.id !== userId);
    this._userTeams.set(updateUser);
    this.infoModalManager.success('Usuario eliminado correctamente');
  }
}
