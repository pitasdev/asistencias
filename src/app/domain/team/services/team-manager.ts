import { TeamApiClient } from '@/app/core/api-clients/team/team-api-client';
import { InfoModalManager } from '@/app/core/services/info-modal-manager/info-modal-manager';
import { IsActiveId } from '@/app/shared/models/common/is-active-id.model';
import { TeamRequest } from '@/app/shared/models/team/team-request.model';
import { Team } from '@/app/shared/models/team/team.model';
import { inject, Service, signal } from '@angular/core';
import { catchError, firstValueFrom, of } from 'rxjs';
import { ClubManager } from '../../club/services/club-manager';

@Service()
export class TeamManager {
  private _userTeams = signal<Team[]>([]);
  private _allTeams = signal<Team[]>([]);
  private _allHistoryTeams = signal<Team[]>([]);

  userTeams = this._userTeams.asReadonly();
  allTeams = this._allTeams.asReadonly();
  allHistoryTeams = this._allHistoryTeams.asReadonly();

  private readonly teamApiClient = inject(TeamApiClient);
  private readonly clubManager = inject(ClubManager);
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

  async getTeamsByClubId(clubId: number, seasonId?: number): Promise<void> {
    const teams = await firstValueFrom(
      this.teamApiClient.getTeamsByClubId(clubId, seasonId)
        .pipe(
          catchError(() => of([]))
      )
    );

    teams.sort((a, b) => a.order - b.order);

    if (seasonId != null && !this.clubManager.isCurrentSeason(seasonId)){
      this._allHistoryTeams.set(teams);
    } else {
      this._allTeams.set(teams);
    }
  }

  async createTeam(team: TeamRequest): Promise<void> {
    const response = await firstValueFrom(
      this.teamApiClient.createTeam(team)
        .pipe(
          catchError((error) => of(error))
        )
    );

    if (response && response.isSuccess) {
      this.infoModalManager.notifySuccess(response.message!);
      await this.getTeamsByClubId(team.clubId);
    } else if (response && response.error) {
      this.infoModalManager.error(response.error);
    }
  }

  async updateTeams(teams: TeamRequest[]): Promise<void> {
    const response = await firstValueFrom(
      this.teamApiClient.updateTeams(teams)
        .pipe(
          catchError((error) => of(error))
        )
    );

    if (response && response.isSuccess) {
      this.infoModalManager.notifySuccess(response.message!);
      if (teams.length > 0) await this.getTeamsByClubId(teams[0].clubId);
    } else if (response && response.error) {
      this.infoModalManager.error(response.error);
    }
  }

  async deactivateTeam(teamId: number): Promise<void> {
    const deactivateTeam = this._allTeams().find(t => t.id === teamId);
    if (deactivateTeam) {
      const updateTeam: TeamRequest = {
        ...deactivateTeam,
        isActive: false,
        clubId: deactivateTeam.club.id
      };

      await this.updateTeams([updateTeam]);
    } else {
      this.infoModalManager.error('El equipo no existe');
    }
  }

  async deleteTeam(isActiveId: IsActiveId, clubId: number): Promise<void> {
    const response = await firstValueFrom(
      this.teamApiClient.deleteTeam(isActiveId)
        .pipe(
          catchError((error) => of(error))
        )
    );

    if (!response || !response.isSuccess) {
      if (response && response.error) this.infoModalManager.error(response.error);
      return;
    }

    this.infoModalManager.success(response.message!);
    await this.getTeamsByClubId(clubId);
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

    const teamRequest = this.toTeamRequest(newTeams);
    await this.updateTeams(teamRequest);
  }

  toTeamRequest(team: Team[]): TeamRequest[] {
    return team.map(t => ({ ...t, clubId: t.club.id }));
  }
}
