import { AttendanceType } from '@/app/shared/models/attendance-type/attendance-type.model';
import { environment } from '@/environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';

@Service()
export class AttendanceTypeApiClient {
  private readonly http = inject(HttpClient);

  getAttendanceTypesByClubId(clubId: number, seasonId?: number): Observable<AttendanceType[]> {
    let params = new HttpParams();
    if (seasonId != null) {
      params = params.set('seasonId', String(seasonId));
    }
    return this.http.get<AttendanceType[]>(`${environment.baseUrlApi}/attendance-type/club/${clubId}`, { params });
  }
}
