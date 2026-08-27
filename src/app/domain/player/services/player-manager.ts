import { PlayerApiClient } from '@/app/core/api-clients/player/player-api-client';
import { InfoModalManager } from '@/app/core/services/info-modal-manager/info-modal-manager';
import { IsActiveId } from '@/app/shared/models/common/is-active-id.model';
import { PlayerRequest } from '@/app/shared/models/player/player-request.model';
import { Player } from '@/app/shared/models/player/player.model';
import { inject, Service, signal } from '@angular/core';
import { catchError, firstValueFrom, of } from 'rxjs';

@Service()
export class PlayerManager {
  private _allPlayers = signal<Player[]>([]);
  private _players = signal<Player[]>([]);
  private _adicionalPlayers = signal<Player[]>([]);

  allPlayers = this._allPlayers.asReadonly();
  players = this._players.asReadonly();
  adicionalPlayers = this._adicionalPlayers.asReadonly();

  private readonly playerApiClient = inject(PlayerApiClient);
  private readonly infoModalManager = inject(InfoModalManager);

  async getPlayerById(playerId: number, seasonId?: number): Promise<Player | null> {
    const player = await firstValueFrom(
      this.playerApiClient.getPlayerById(playerId, seasonId)
        .pipe(
          catchError(() => of(null))
        )
    );
    
    return player;
  }

  async getPlayersByTeamIds(teamIds: number[], seasonId?: number): Promise<void> {
    const players: Player[] = [];

    for (const teamId of teamIds) {
      const playersByTeamId = await firstValueFrom(
        this.playerApiClient.getPlayersByTeamId(teamId, seasonId)
          .pipe(
            catchError(() => of([]))
          )
      );

      players.push(...playersByTeamId);
    }

    this._players.set(players);
  }

  async getPlayersByClubId(clubId: number, seasonId?: number): Promise<void> {
    const players = await firstValueFrom(
      this.playerApiClient.getPlayersByClubId(clubId, seasonId)
        .pipe(
          catchError(() => of([]))
        )
    );

    this._allPlayers.set(players);
  }

  async getAdicionalPlayersByTeamId(teamId: number, seasonId?: number): Promise<void> {
    const players = await firstValueFrom(
      this.playerApiClient.getPlayersByTeamId(teamId, seasonId)
        .pipe(
          catchError(() => of([]))
        )
    );

    this._adicionalPlayers.set(players);
  }

  async createPlayer(player: PlayerRequest): Promise<void> {
    const response = await firstValueFrom(
      this.playerApiClient.createPlayer(player)
        .pipe(
          catchError((error) => of(error))
        )
    );

    if (response && response.isSuccess) {
      this.infoModalManager.notifySuccess(response.message!);
    } else if (response && response.error) {
      this.infoModalManager.error(response.error);
    }
  }

  async updatePlayer(player: PlayerRequest): Promise<void> {
    const response = await firstValueFrom(
      this.playerApiClient.updatePlayer(player)
        .pipe(
          catchError((error) => of(error))
        )
    );

    if (response && response.isSuccess) {
      this.infoModalManager.notifySuccess(response.message!);
    } else if (response && response.error) {
      this.infoModalManager.error(response.error);
    }
  }

  async deletePlayer(isActiveId: IsActiveId): Promise<void> {
    const response = await firstValueFrom(
      this.playerApiClient.deletePlayer(isActiveId)
        .pipe(
          catchError((error) => of(error))
        )
    );

    if (!response || !response.isSuccess) {
      if (response && response.error) this.infoModalManager.error(response.error);
      return;
    }

    this.infoModalManager.success(response.message!);
  }

  findPlayerById(playerId: number): Player | null {
    return this._players().find(p => p.id === playerId) ?? null;
  }

  findAdicionalPlayerById(playerId: number): Player | null {
    return this._adicionalPlayers().find(p => p.id === playerId) ?? null;
  }

  addAdicionalPlayerToPlayers(player: Player): void {
    if (this._players().some(p => p.id === player.id)) return;
    this._players.update(players => [...players, player]);
  }
}
