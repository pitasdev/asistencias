import { AttendanceQueryFilters } from '@/app/shared/models/attendance-query-filters.model';
import { Attendance } from '@/app/shared/models/attendance.model';
import { CustomHttpResponse } from '@/app/shared/models/custom-http-response.model';
import { environment } from '@/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AttendanceApiClient {
  constructor(private readonly http: HttpClient) {}

  getAttendancesByTeamId(teamId: number, filters: AttendanceQueryFilters): Observable<Attendance[]> {
    let queryParams = '';
    if (filters.selectedDate) {
      queryParams += `?selectedDate=${filters.selectedDate}`;
    } else if (filters.startDate && filters.endDate) {
      queryParams += `?startDate=${filters.startDate}&endDate=${filters.endDate}`;
    }

    return this.http.get<Attendance[]>(`${environment.baseUrlApi}/attendance/team/${teamId}${queryParams}`);
  }

  getAttendancesByClubId(clubId: number, filters: AttendanceQueryFilters): Observable<Attendance[]> {
    let queryParams = '';
    if (filters.selectedDate) {
      queryParams += `?selectedDate=${filters.selectedDate}`;
    } else if (filters.startDate && filters.endDate) {
      queryParams += `?startDate=${filters.startDate}&endDate=${filters.endDate}`;
    }

    return this.http.get<Attendance[]>(`${environment.baseUrlApi}/attendance/club/${clubId}${queryParams}`);
  }

  getAttendancesByPlayerId(playerId: number, filters: AttendanceQueryFilters): Observable<Attendance[]> {
    let queryParams = '';
    if (filters.selectedDate) {
      queryParams += `?selectedDate=${filters.selectedDate}`;
    } else if (filters.startDate && filters.endDate) {
      queryParams += `?startDate=${filters.startDate}&endDate=${filters.endDate}`;
    }

    return this.http.get<Attendance[]>(`${environment.baseUrlApi}/attendance/player/${playerId}${queryParams}`);
  }

  createAttendances(attendances: Attendance[]): Observable<CustomHttpResponse> {
    return this.http.post<CustomHttpResponse>(`${environment.baseUrlApi}/attendance`, attendances);
  }

  createAdicionalAttendances(attendances: Attendance[]): Observable<CustomHttpResponse> {
    return this.http.post<CustomHttpResponse>(`${environment.baseUrlApi}/attendance/adicional`, attendances);
  }

  updateAttendances(attendances: Attendance []): Observable<CustomHttpResponse> {
    return this.http.put<CustomHttpResponse>(`${environment.baseUrlApi}/attendance`, attendances);
  }

  deleteOnBulkAttendances(attendanceIds: number[]): Observable<CustomHttpResponse> {
    return this.http.delete<CustomHttpResponse>(`${environment.baseUrlApi}/attendance`, { body: attendanceIds });
  }
}
