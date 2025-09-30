import { CustomHttpResponse } from '@/app/shared/models/custom-http-response.model';
import { ResetPassword } from '@/app/shared/models/reset-password.model';
import { User } from '@/app/shared/models/user.model';
import { environment } from '@/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserApiClient {
  constructor(private readonly http: HttpClient) {}

  getActiveUser(userId: number): Observable<User> {
    return this.http.get<User>(`${environment.baseUrlApi}/user/${userId}`);
  }

  getUsersByClubId(clubId: number): Observable<User[]> {
    return this.http.get<User[]>(`${environment.baseUrlApi}/user/club/${clubId}`);
  }

  checkAvailableUsername(username: string): Observable<{ isAvailable: boolean, error?: string }> {
    return this.http.get<{ isAvailable: boolean }>(`${environment.baseUrlApi}/user/check/${username}`);
  }

  createUser(user: User): Observable<CustomHttpResponse> {
    return this.http.post<CustomHttpResponse>(`${environment.baseUrlApi}/user`, user);
  }

  updateUser(user: User): Observable<CustomHttpResponse> {
    return this.http.put<CustomHttpResponse>(`${environment.baseUrlApi}/user`, user);
  }

  checkPassword(id: number, password: string): Observable<{ isValid: boolean, error?: string }> {
    return this.http.post<{ isValid: boolean }>(`${environment.baseUrlApi}/user/check-password`, { id, password });
  }

  resetPassword(resetPassword: ResetPassword): Observable<CustomHttpResponse> {
    return this.http.put<CustomHttpResponse>(`${environment.baseUrlApi}/user/reset-password`, resetPassword);
  }

  updatePassword(id: number, oldPassword: string, newPassword: string, hasDefaultPassword: boolean): Observable<CustomHttpResponse> {
    return this.http.put<CustomHttpResponse>(`${environment.baseUrlApi}/user/password`, { id, oldPassword, newPassword, hasDefaultPassword });
  }

  updateName(id: number, name: string): Observable<CustomHttpResponse> {
    return this.http.put<CustomHttpResponse>(`${environment.baseUrlApi}/user/name`, { id, name });
  }

  deleteUser(userId: number): Observable<CustomHttpResponse> {
    return this.http.delete<CustomHttpResponse>(`${environment.baseUrlApi}/user/${userId}`);
  }
}
