import { CustomHttpResponse } from '@/app/shared/models/common/custom-http-response.model';
import { IsActiveId } from '@/app/shared/models/common/is-active-id.model';
import { PlayerRequest } from '@/app/shared/models/player/player-request.model';
import { Player } from '@/app/shared/models/player/player.model';
import { environment } from '@/environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';

@Service()
export class PlayerApiClient {
  private readonly http = inject(HttpClient);

  getPlayerById(playerId: number, seasonId?: number): Observable<Player> {
    let params = new HttpParams();
    if (seasonId != null) {
      params = params.set('seasonId', String(seasonId));
    }
    return this.http.get<Player>(`${environment.baseUrlApi}/player/${playerId}`, { params });
  }

  getPlayersByTeamId(teamId: number, seasonId?: number): Observable<Player[]> {
    let params = new HttpParams();
    if (seasonId != null) {
      params = params.set('seasonId', String(seasonId));
    }
    return this.http.get<Player[]>(`${environment.baseUrlApi}/player/team/${teamId}`, { params });
  }

  getPlayersByClubId(clubId: number, seasonId?: number): Observable<Player[]> {
    let params = new HttpParams();
    if (seasonId != null) {
      params = params.set('seasonId', String(seasonId));
    }
    return this.http.get<Player[]>(`${environment.baseUrlApi}/player/club/${clubId}`, { params });
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
