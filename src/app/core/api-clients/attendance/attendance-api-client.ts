import { AttendanceQueryFilters } from '@/app/shared/models/attendance/attendance-query-filters.model';
import { Attendance } from '@/app/shared/models/attendance/attendance.model';
import { AttendanceRequest } from '@/app/shared/models/attendance/attendance-request.model';
import { CustomHttpResponse } from '@/app/shared/models/common/custom-http-response.model';
import { environment } from '@/environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';

@Service()
export class AttendanceApiClient {
  private readonly http = inject(HttpClient);

  getAttendancesByTeamId(teamId: number, filters: AttendanceQueryFilters): Observable<Attendance[]> {
    const params = this.buildQueryParams(filters);
    return this.http.get<Attendance[]>(`${environment.baseUrlApi}/attendance/team/${teamId}`, { params });
  }

  getAttendancesByClubId(clubId: number, filters: AttendanceQueryFilters): Observable<Attendance[]> {
    const params = this.buildQueryParams(filters);
    return this.http.get<Attendance[]>(`${environment.baseUrlApi}/attendance/club/${clubId}`, { params });
  }

  getAttendancesByPlayerId(playerId: number, filters: AttendanceQueryFilters): Observable<Attendance[]> {
    const params = this.buildQueryParams(filters);
    return this.http.get<Attendance[]>(`${environment.baseUrlApi}/attendance/player/${playerId}`, { params });
  }

  createAttendances(attendances: AttendanceRequest[]): Observable<CustomHttpResponse> {
    return this.http.post<CustomHttpResponse>(`${environment.baseUrlApi}/attendance`, attendances);
  }

  createAdditionalAttendances(attendances: AttendanceRequest[]): Observable<CustomHttpResponse> {
    return this.http.post<CustomHttpResponse>(`${environment.baseUrlApi}/attendance/additional`, attendances);
  }

  updateAttendances(attendances: AttendanceRequest[]): Observable<CustomHttpResponse> {
    return this.http.put<CustomHttpResponse>(`${environment.baseUrlApi}/attendance`, attendances);
  }

  deleteOnBulkAttendances(attendanceIds: number[]): Observable<CustomHttpResponse> {
    return this.http.delete<CustomHttpResponse>(`${environment.baseUrlApi}/attendance`, { body: attendanceIds });
  }

  private buildQueryParams(filters: AttendanceQueryFilters): HttpParams {
    let params = new HttpParams();
    if (filters.selectedDate) {
      params = params.set('selectedDate', filters.selectedDate);
    } else if (filters.startDate && filters.endDate) {
      params = params.set('startDate', filters.startDate).set('endDate', filters.endDate);
    }

    if (filters.seasonId != null) {
      params = params.set('seasonId', String(filters.seasonId));
    }
    
    return params;
  }
}
