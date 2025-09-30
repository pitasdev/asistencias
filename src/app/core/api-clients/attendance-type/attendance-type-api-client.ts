import { AttendanceType } from '@/app/shared/models/attendance-type.model';
import { environment } from '@/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AttendanceTypeApiClient {
  constructor(private readonly http: HttpClient) {}

  getAttendanceTypesByClubId(clubId: number): Observable<AttendanceType[]> {
    return this.http.get<AttendanceType[]>(`${environment.baseUrlApi}/attendance-type/club/${clubId}`);
  }
}
