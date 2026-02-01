import { PlayerApiClient } from '@/app/core/api-clients/player/player-api-client';
import { InfoModalManager } from '@/app/core/services/info-modal-manager/info-modal-manager';
import { Player } from '@/app/shared/models/player.model';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, firstValueFrom, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PlayerManager {
  private _allPlayers = signal<Player[]>([]);
  private _players = signal<Player[]>([]);
  private _adicionalPlayers = signal<Player[]>([]);

  allPlayers = this._allPlayers.asReadonly();
  players = this._players.asReadonly();
  adicionalPlayers = this._adicionalPlayers.asReadonly();

  private readonly playerApiClient = inject(PlayerApiClient);
  private readonly infoModalManager = inject(InfoModalManager);

  async getPlayerById(playerId: number): Promise<Player | null> {
    const player = await firstValueFrom(
      this.playerApiClient.getPlayerById(playerId)
        .pipe(
          catchError(() => of(null))
        )
    );
    
    return player;
  }

  async getPlayersByTeamIds(teamIds: number[]): Promise<void> {
    const players: Player[] = [];

    for (const teamId of teamIds) {
      const playersByTeamId = await firstValueFrom(
        this.playerApiClient.getPlayersByTeamId(teamId)
          .pipe(
            catchError(() => of([]))
          )
      );

      players.push(...playersByTeamId);
    }

    this._players.set(players);
  }

  async getPlayersByClubId(clubId: number): Promise<void> {
    const players = await firstValueFrom(
      this.playerApiClient.getPlayersByClubId(clubId)
        .pipe(
          catchError(() => of([]))
        )
    );

    this._allPlayers.set(players);
  }

  async getAdicionalPlayersByTeamId(teamId: number): Promise<void> {
    const players = await firstValueFrom(
      this.playerApiClient.getPlayersByTeamId(teamId)
        .pipe(
          catchError(() => of([]))
        )
    );

    this._adicionalPlayers.set(players);
  }

  async createPlayer(player: Player): Promise<void> {
    const response = await firstValueFrom(
      this.playerApiClient.createPlayer(player)
        .pipe(
          catchError((error) => of(error))
        )
    );

    if (response && response.isSuccess) {
      this.infoModalManager.notifySuccess(response.message!);
    }
  }

  async updatePlayer(player: Player): Promise<void> {
    const response = await firstValueFrom(
      this.playerApiClient.updatePlayer(player)
        .pipe(
          catchError((error) => of(error))
        )
    );

    if (response && response.isSuccess) {
      this.infoModalManager.notifySuccess(response.message!);
    }
  }

  async deletePlayer(playerId: number): Promise<void> {
    const response = await firstValueFrom(
      this.playerApiClient.deletePlayer(playerId)
        .pipe(
          catchError((error) => of(error))
        )
    );

    if (!response || !response.isSuccess) return;

    const updatePlayers = this._players().filter(p => p.id !== playerId);
    this._allPlayers.set(updatePlayers);

    this.infoModalManager.success(response.message!);
  }

  findPlayerById(playerId: number): Player | null {
    return this._players().find(p => p.id === playerId) ?? null;
  }

  findAdicionalPlayerById(playerId: number): Player | null {
    return this._adicionalPlayers().find(p => p.id === playerId) ?? null;
  }

  addAdicionalPlayerToPlayers(player: Player): void {
    this._players.update(players => [...players, player]);
  }
}
