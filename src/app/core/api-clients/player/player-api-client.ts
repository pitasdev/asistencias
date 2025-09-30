import { CustomHttpResponse } from '@/app/shared/models/custom-http-response.model';
import { Player } from '@/app/shared/models/player.model';
import { environment } from '@/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PlayerApiClient {
  constructor(private readonly http: HttpClient) {}

  getPlayerById(playerId: number): Observable<Player> {
    return this.http.get<Player>(`${environment.baseUrlApi}/player/${playerId}`);
  }

  getPlayersByTeamId(teamId: number): Observable<Player[]> {
    return this.http.get<Player[]>(`${environment.baseUrlApi}/player/team/${teamId}`);
  }

  getPlayersByClubId(clubId: number): Observable<Player[]> {
    return this.http.get<Player[]>(`${environment.baseUrlApi}/player/club/${clubId}`);
  }

  createPlayer(player: Player): Observable<CustomHttpResponse> {
    return this.http.post<CustomHttpResponse>(`${environment.baseUrlApi}/player`, player);
  }

  updatePlayer(player: Player): Observable<CustomHttpResponse> {
    return this.http.put<CustomHttpResponse>(`${environment.baseUrlApi}/player`, player);
  }

  deletePlayer(playerId: number): Observable<CustomHttpResponse> {
    return this.http.delete<CustomHttpResponse>(`${environment.baseUrlApi}/player/${playerId}`);
  }
}
