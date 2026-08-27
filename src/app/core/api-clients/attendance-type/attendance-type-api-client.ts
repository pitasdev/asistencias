import { AttendanceType } from '@/app/shared/models/attendance-type/attendance-type.model';
import { environment } from '@/environments/environment';
import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';

@Service()
export class AttendanceTypeApiClient {
  private readonly http = inject(HttpClient);

  getAttendanceTypesByClubId(clubId: number, seasonId?: number): Observable<AttendanceType[]> {
    const queryParams = seasonId != null ? `?seasonId=${seasonId}` : '';
    return this.http.get<AttendanceType[]>(`${environment.baseUrlApi}/attendance-type/club/${clubId}${queryParams}`);
  }
}
