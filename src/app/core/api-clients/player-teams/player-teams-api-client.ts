import { CustomHttpResponse } from '@/app/shared/models/custom-http-response.model';
import { PlayerTeams } from '@/app/shared/models/player-teams.model';
import { environment } from '@/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PlayerTeamsApiClient {
  constructor(private readonly http: HttpClient) {}

  getPlayerTeamsByClubId(clubId: number): Observable<PlayerTeams[]> {
    return this.http.get<PlayerTeams[]>(`${environment.baseUrlApi}/player-teams/club/${clubId}`);
  }

  updatePlayerTeams(playerTeams: PlayerTeams): Observable<CustomHttpResponse> {
    return this.http.put<CustomHttpResponse>(`${environment.baseUrlApi}/player-teams`, playerTeams);
  }
}
