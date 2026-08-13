import { CustomHttpResponse } from '@/app/shared/models/common/custom-http-response.model';
import { IsActiveId } from '@/app/shared/models/common/is-active-id.model';
import { PlayerRequest } from '@/app/shared/models/player/player-request.model';
import { Player } from '@/app/shared/models/player/player.model';
import { environment } from '@/environments/environment';
import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';

@Service()
export class PlayerApiClient {
  private readonly http = inject(HttpClient);

  getPlayerById(playerId: number): Observable<Player> {
    return this.http.get<Player>(`${environment.baseUrlApi}/player/${playerId}`);
  }

  getPlayersByTeamId(teamId: number): Observable<Player[]> {
    return this.http.get<Player[]>(`${environment.baseUrlApi}/player/team/${teamId}`);
  }

  getPlayersByClubId(clubId: number): Observable<Player[]> {
    return this.http.get<Player[]>(`${environment.baseUrlApi}/player/club/${clubId}`);
  }

  createPlayer(player: PlayerRequest): Observable<CustomHttpResponse> {
    return this.http.post<CustomHttpResponse>(`${environment.baseUrlApi}/player`, player);
  }

  updatePlayer(player: PlayerRequest): Observable<CustomHttpResponse> {
    return this.http.put<CustomHttpResponse>(`${environment.baseUrlApi}/player`, player);
  }

  deletePlayer(isActiveId: IsActiveId): Observable<CustomHttpResponse> {
    return this.http.put<CustomHttpResponse>(`${environment.baseUrlApi}/player/is-active`, isActiveId);
  }
}
