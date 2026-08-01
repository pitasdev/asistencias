import { CustomHttpResponse } from '@/app/shared/models/custom-http-response.model';
import { IsActiveId } from '@/app/shared/models/is-active-id.model';
import { Reason } from '@/app/shared/models/reason.model';
import { environment } from '@/environments/environment';
import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';

@Service()
export class ReasonApiClient {
  private readonly http = inject(HttpClient);

  getReasonsByClubId(clubId: number): Observable<Reason[]> {
    return this.http.get<Reason[]>(`${environment.baseUrlApi}/reason/club/${clubId}`);
  }

  createReason(reason: Reason): Observable<CustomHttpResponse> {
    return this.http.post<CustomHttpResponse>(`${environment.baseUrlApi}/reason`, reason);
  }

  updateReasons(reasons: Reason[]): Observable<CustomHttpResponse> {
    return this.http.put<CustomHttpResponse>(`${environment.baseUrlApi}/reason`, reasons);
  }

  deleteReason(isActiveId: IsActiveId): Observable<CustomHttpResponse> {
    return this.http.put<CustomHttpResponse>(`${environment.baseUrlApi}/reason/is-active`, isActiveId);
  }
}
