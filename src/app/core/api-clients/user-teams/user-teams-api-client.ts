import { CustomHttpResponse } from '@/app/shared/models/custom-http-response.model';
import { UserTeams } from '@/app/shared/models/user-teams.model';
import { environment } from '@/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserTeamsApiClient {
  constructor(private readonly http: HttpClient) {}

  getUserTeamsByClubId(clubId: number): Observable<UserTeams[]> {
    return this.http.get<UserTeams[]>(`${environment.baseUrlApi}/user-teams/club/${clubId}`);
  }

  getUserTeamsByUserId(userId: number): Observable<UserTeams> {
    return this.http.get<UserTeams>(`${environment.baseUrlApi}/user-teams/${userId}`); 
  }

  updateUserTeams(userTeams: UserTeams): Observable<CustomHttpResponse> {
    return this.http.put<CustomHttpResponse>(`${environment.baseUrlApi}/user-teams`, userTeams);
    }
}
