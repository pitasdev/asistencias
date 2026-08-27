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

  getPlayerTeamsByClubId(clubId: number, seasonId?: number): Observable<PlayerTeams[]> {
    const queryParams = seasonId != null ? `?seasonId=${seasonId}` : '';
    return this.http.get<PlayerTeams[]>(`${environment.baseUrlApi}/player-teams/club/${clubId}${queryParams}`);
  }

  updatePlayerTeams(playerTeams: PlayerTeamsRequest): Observable<CustomHttpResponse> {
    return this.http.put<CustomHttpResponse>(`${environment.baseUrlApi}/player-teams`, playerTeams);
  }
}
