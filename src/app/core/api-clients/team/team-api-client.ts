import { CustomHttpResponse } from '@/app/shared/models/common/custom-http-response.model';
import { IsActiveId } from '@/app/shared/models/common/is-active-id.model';
import { TeamRequest } from '@/app/shared/models/team/team-request.model';
import { Team } from '@/app/shared/models/team/team.model';
import { environment } from '@/environments/environment';
import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';

@Service()
export class TeamApiClient {
  private readonly http = inject(HttpClient);

  getTeamsByUserId(userId: number): Observable<Team[]> {
    return this.http.get<Team[]>(`${environment.baseUrlApi}/team/user/${userId}`);
  }
  
  getTeamsByClubId(clubId: number, season?: string): Observable<Team[]> {
    const queryParams = season ? `?season=${season}` : '';
    return this.http.get<Team[]>(`${environment.baseUrlApi}/team/club/${clubId}${queryParams}`);
  }

  createTeam(team: TeamRequest): Observable<CustomHttpResponse> {
    return this.http.post<CustomHttpResponse>(`${environment.baseUrlApi}/team`, team);
  }

  updateTeams(teams: TeamRequest[]): Observable<CustomHttpResponse> {
    return this.http.put<CustomHttpResponse>(`${environment.baseUrlApi}/team`, teams);
  }

  deleteTeam(isActiveId: IsActiveId): Observable<CustomHttpResponse> {
    return this.http.put<CustomHttpResponse>(`${environment.baseUrlApi}/team/is-active`, isActiveId);
  }
}
