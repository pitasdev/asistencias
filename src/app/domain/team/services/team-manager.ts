import { TeamApiClient } from '@/app/core/api-clients/team/team-api-client';
import { InfoModalManager } from '@/app/core/services/info-modal-manager/info-modal-manager';
import { Team } from '@/app/shared/models/team.model';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, firstValueFrom, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TeamManager {
  private _userTeams = signal<Team[]>([]);
  private _allTeams = signal<Team[]>([]);

  userTeams = this._userTeams.asReadonly();
  allTeams = this._allTeams.asReadonly();

  private readonly teamApiClient = inject(TeamApiClient);
  private readonly infoModalManager = inject(InfoModalManager);

  async getTeamsByUserId(userId: number): Promise<void> {
    const teams = await firstValueFrom(
      this.teamApiClient.getTeamsByUserId(userId)
        .pipe(
          catchError(() => of([]))
        )
    );

    teams.sort((a, b) => a.order - b.order);
    this._userTeams.set(teams);
  }

  async getTeamsByClubId(clubId: number): Promise<void> {
    const teams = await firstValueFrom(
      this.teamApiClient.getTeamsByClubId(clubId)
        .pipe(
          catchError(() => of([]))
      )
    );

    teams.sort((a, b) => a.order - b.order);
    this._allTeams.set(teams);
  }

  async createTeam(team: Team): Promise<void> {
    const response = await firstValueFrom(
      this.teamApiClient.createTeam(team)
        .pipe(
          catchError(() => of(null))
        )
    );

    if (response && response.isSuccess) {
      this.infoModalManager.notifySuccess(response.message!);
    }
  }

  async updateTeams(teams: Team[]): Promise<void> {
    const response = await firstValueFrom(
      this.teamApiClient.updateTeams(teams)
        .pipe(
          catchError(() => of(null))
        )
    );

    if (response && response.isSuccess) {
      this.infoModalManager.notifySuccess(response.message!);
    }
  }

  async deactivateTeam(teamId: number): Promise<void> {
    const deactivateTeam = this._allTeams().find(t => t.id === teamId);
    if (deactivateTeam) {
      const updateTeam: Team = {
        ...deactivateTeam,
        isActive: false
      };

      await this.updateTeams([updateTeam]);
    } else {
      this.infoModalManager.error('El equipo no existe');
    }
  }

  async deleteTeam(teamId: number): Promise<void> {
    const response = await firstValueFrom(
      this.teamApiClient.deleteTeam(teamId)
        .pipe(
          catchError(() => of(null))
        )
    );

    if (!response || !response.isSuccess) return;

    const updateTeams = this._allTeams().filter(t => t.id !== teamId);
    for (let i = 0; i < updateTeams.length; i++) {
      if (updateTeams[i].order !== i + 1) updateTeams[i].order = i + 1;
    }
    await this.updateTeams(updateTeams);

    this._allTeams.set(updateTeams);

    this.infoModalManager.success(response.message!);
  }

  findTeamById(teamId: number): Team | null {
    let team = this._allTeams().find(t => t.id === teamId) ?? null;
    if (team === null) {
      this._allTeams().find(t => t.id === teamId) ?? null;
    }

    return team;
  }

  async updateSortOrder(teamId: number, order: number): Promise<void> {
    const newTeams = [...this._allTeams()];
    const teamModified = newTeams.find(t => t.id === teamId)!;
    const oldPosition = teamModified.order < newTeams.length ? teamModified.order - 1 : newTeams.length - 1;
    
    newTeams.splice(oldPosition, 1);
    newTeams.splice(order - 1, 0, teamModified);

    for (let i = 0; i < newTeams.length; i++) {
      if (newTeams[i].order !== i + 1) newTeams[i].order = i + 1;
    }

    await this.updateTeams(newTeams);
    
    this._allTeams.set(newTeams);
  }
}
