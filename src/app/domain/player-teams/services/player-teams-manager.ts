import { PlayerTeamsApiClient } from '@/app/core/api-clients/player-teams/player-teams-api-client';
import { InfoModalManager } from '@/app/core/services/info-modal-manager/info-modal-manager';
import { PlayerTeams } from '@/app/shared/models/player-teams.model';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, firstValueFrom, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PlayerTeamsManager {
  private _playerTeams = signal<PlayerTeams[]>([]);

  playerTeams = this._playerTeams.asReadonly();

  private readonly playerTeamsApiClient = inject(PlayerTeamsApiClient);
  private readonly infoModalManager = inject(InfoModalManager);

  async getPlayerTeamsByClubId(clubId: number): Promise<void> {
    const playerTeams = await firstValueFrom(
      this.playerTeamsApiClient.getPlayerTeamsByClubId(clubId)
        .pipe(
          catchError(() => of([]))
        )
    );

    this._playerTeams.set(playerTeams);
  }

  async updatePlayerTeams(playerTeams: PlayerTeams): Promise<void> {
    const response = await firstValueFrom(
      this.playerTeamsApiClient.updatePlayerTeams(playerTeams)
        .pipe(
          catchError((error) => of(error))
        )
    );

    if (response && response.isSuccess) {
      this.infoModalManager.notifySuccess(response.message!);
    }
  }

  findPlayerTeamsByPlayerId(playerId: number): PlayerTeams | null {
    return this._playerTeams().find(pt => pt.player.id === playerId) ?? null;
  }

  replacePlayerTeams(playerTeams: PlayerTeams): void {
    const updatePlayerTeams = this._playerTeams().map(pt => pt.player.id === playerTeams.player.id ? playerTeams : pt);
    this._playerTeams.set(updatePlayerTeams);
  }

  deletePlayer(playerId: number): void {
    const updatePlayer = this._playerTeams().filter(pt => pt.player.id !== playerId);
    this._playerTeams.set(updatePlayer);
  }
}
