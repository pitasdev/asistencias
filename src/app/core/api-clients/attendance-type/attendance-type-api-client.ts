import { AttendanceType } from '@/app/shared/models/attendance-type.model';
import { environment } from '@/environments/environment';
import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';

@Service()
export class AttendanceTypeApiClient {
  private readonly http = inject(HttpClient);

  getAttendanceTypesByClubId(clubId: number): Observable<AttendanceType[]> {
    return this.http.get<AttendanceType[]>(`${environment.baseUrlApi}/attendance-type/club/${clubId}`);
  }
}
