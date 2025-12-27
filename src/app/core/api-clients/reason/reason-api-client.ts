import { CustomHttpResponse } from '@/app/shared/models/custom-http-response.model';
import { Reason } from '@/app/shared/models/reason.model';
import { environment } from '@/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReasonApiClient {
  constructor(private readonly http: HttpClient) {}

  getReasonsByClubId(clubId: number): Observable<Reason[]> {
    return this.http.get<Reason[]>(`${environment.baseUrlApi}/reason/club/${clubId}`);
  }

  createReason(reason: Reason): Observable<CustomHttpResponse> {
    return this.http.post<CustomHttpResponse>(`${environment.baseUrlApi}/reason`, reason);
  }

  updateReasons(reasons: Reason[]): Observable<CustomHttpResponse> {
    return this.http.put<CustomHttpResponse>(`${environment.baseUrlApi}/reason`, reasons);
  }

  deleteReason(reasonId: number): Observable<CustomHttpResponse> {
    return this.http.delete<CustomHttpResponse>(`${environment.baseUrlApi}/reason/${reasonId}`);
  }
}
