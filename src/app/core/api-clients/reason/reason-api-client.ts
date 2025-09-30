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
}
