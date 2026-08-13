import { CustomHttpResponse } from '@/app/shared/models/common/custom-http-response.model';
import { UserTeamsRequest } from '@/app/shared/models/user/user-teams-request.model';
import { UserTeams } from '@/app/shared/models/user/user-teams.model';
import { environment } from '@/environments/environment';
import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';

@Service()
export class UserTeamsApiClient {
  private readonly http = inject(HttpClient);

  getUserTeamsByClubId(clubId: number): Observable<UserTeams[]> {
    return this.http.get<UserTeams[]>(`${environment.baseUrlApi}/user-teams/club/${clubId}`);
  }

  getUserTeamsByUserId(userId: number): Observable<UserTeams> {
    return this.http.get<UserTeams>(`${environment.baseUrlApi}/user-teams/${userId}`); 
  }

  updateUserTeams(userTeams: UserTeamsRequest): Observable<CustomHttpResponse> {
    return this.http.put<CustomHttpResponse>(`${environment.baseUrlApi}/user-teams`, userTeams);
    }
}
