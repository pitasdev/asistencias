import { CustomHttpResponse } from '@/app/shared/models/common/custom-http-response.model';
import { PlayerTeamsRequest } from '@/app/shared/models/player/player-teams-request.model';
import { PlayerTeams } from '@/app/shared/models/player/player-teams.model';
import { environment } from '@/environments/environment';
import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';

@Service()
export class PlayerTeamsApiClient {
  private readonly http = inject(HttpClient);

  getPlayerTeamsByClubId(clubId: number, season?: string): Observable<PlayerTeams[]> {
    const queryParams = season ? `?season=${season}` : '';
    return this.http.get<PlayerTeams[]>(`${environment.baseUrlApi}/player-teams/club/${clubId}${queryParams}`);
  }

  updatePlayerTeams(playerTeams: PlayerTeamsRequest): Observable<CustomHttpResponse> {
    return this.http.put<CustomHttpResponse>(`${environment.baseUrlApi}/player-teams`, playerTeams);
  }
}
