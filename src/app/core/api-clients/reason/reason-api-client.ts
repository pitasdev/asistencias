import { CustomHttpResponse } from '@/app/shared/models/common/custom-http-response.model';
import { IsActiveId } from '@/app/shared/models/common/is-active-id.model';
import { ReasonRequest } from '@/app/shared/models/reason/reason-request.model';
import { Reason } from '@/app/shared/models/reason/reason.model';
import { environment } from '@/environments/environment';
import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';

@Service()
export class ReasonApiClient {
  private readonly http = inject(HttpClient);

  getReasonsByClubId(clubId: number, seasonId?: number): Observable<Reason[]> {
    const queryParams = seasonId != null ? `?seasonId=${seasonId}` : '';
    return this.http.get<Reason[]>(`${environment.baseUrlApi}/reason/club/${clubId}${queryParams}`);
  }

  createReason(reason: ReasonRequest): Observable<CustomHttpResponse> {
    return this.http.post<CustomHttpResponse>(`${environment.baseUrlApi}/reason`, reason);
  }

  updateReasons(reasons: ReasonRequest[]): Observable<CustomHttpResponse> {
    return this.http.put<CustomHttpResponse>(`${environment.baseUrlApi}/reason`, reasons);
  }

  deleteReason(isActiveId: IsActiveId): Observable<CustomHttpResponse> {
    return this.http.put<CustomHttpResponse>(`${environment.baseUrlApi}/reason/is-active`, isActiveId);
  }
}
