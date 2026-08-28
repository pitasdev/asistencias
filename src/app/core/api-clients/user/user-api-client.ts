import { CustomHttpResponse } from '@/app/shared/models/common/custom-http-response.model';
import { ResetPassword } from '@/app/shared/models/password/reset-password.model';
import { UserRequest } from '@/app/shared/models/user/user-request.model';
import { User } from '@/app/shared/models/user/user.model';
import { environment } from '@/environments/environment';
import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';

@Service()
export class UserApiClient {
  private readonly http = inject(HttpClient);

  getActiveUser(userId: number): Observable<User> {
    return this.http.get<User>(`${environment.baseUrlApi}/user/${userId}`);
  }

  getUsersByClubId(clubId: number): Observable<User[]> {
    return this.http.get<User[]>(`${environment.baseUrlApi}/user/club/${clubId}`);
  }

  checkAvailableUsername(username: string): Observable<{ isAvailable: boolean, error?: string }> {
    return this.http.get<{ isAvailable: boolean }>(`${environment.baseUrlApi}/user/check/${encodeURIComponent(username)}`);
  }

  createUser(user: UserRequest): Observable<CustomHttpResponse> {
    return this.http.post<CustomHttpResponse>(`${environment.baseUrlApi}/user`, user);
  }

  updateUser(user: UserRequest): Observable<CustomHttpResponse> {
    return this.http.put<CustomHttpResponse>(`${environment.baseUrlApi}/user`, user);
  }

  checkPassword(id: number, password: string): Observable<{ isValid: boolean, error?: string }> {
    return this.http.post<{ isValid: boolean }>(`${environment.baseUrlApi}/user/check-password`, { id, password });
  }

  resetPassword(resetPassword: ResetPassword): Observable<CustomHttpResponse> {
    return this.http.put<CustomHttpResponse>(`${environment.baseUrlApi}/user/reset-password`, resetPassword);
  }

  updatePassword(id: number, oldPassword: string, newPassword: string): Observable<CustomHttpResponse> {
    return this.http.put<CustomHttpResponse>(`${environment.baseUrlApi}/user/password`, { id, oldPassword, newPassword });
  }

  updateName(id: number, name: string): Observable<CustomHttpResponse> {
    return this.http.put<CustomHttpResponse>(`${environment.baseUrlApi}/user/name`, { id, name });
  }

  deleteUser(userId: number): Observable<CustomHttpResponse> {
    return this.http.delete<CustomHttpResponse>(`${environment.baseUrlApi}/user/${userId}`);
  }
}
