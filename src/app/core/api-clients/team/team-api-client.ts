import { CustomHttpResponse } from '@/app/shared/models/custom-http-response.model';
import { Team } from '@/app/shared/models/team.model';
import { environment } from '@/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TeamApiClient {
  constructor(private readonly http: HttpClient) {}

  getTeamsByUserId(userId: number): Observable<Team[]> {
    return this.http.get<Team[]>(`${environment.baseUrlApi}/team/user/${userId}`);
  }
  
  getTeamsByClubId(clubId: number): Observable<Team[]> {
    return this.http.get<Team[]>(`${environment.baseUrlApi}/team/club/${clubId}`);
  }

  createTeam(team: Team): Observable<CustomHttpResponse> {
    return this.http.post<CustomHttpResponse>(`${environment.baseUrlApi}/team`, team);
  }

  updateTeams(teams: Team[]): Observable<CustomHttpResponse> {
    return this.http.put<CustomHttpResponse>(`${environment.baseUrlApi}/team`, teams);
  }

  deleteTeam(teamId: number): Observable<CustomHttpResponse> {
    return this.http.delete<CustomHttpResponse>(`${environment.baseUrlApi}/team/${teamId}`);
  }
}
