import { environment } from '@/environments/environment';
import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '@/app/shared/models/user/user.model';
import { CustomHttpResponse } from '@/app/shared/models/common/custom-http-response.model';

@Service()
export class AuthApiClient {
  private readonly http = inject(HttpClient);

  getMe(): Observable<User> {
    return this.http.get<User>(`${environment.baseUrlApi}/auth/me`);
  }

  login(username: string, password: string, rememberMe: boolean): Observable<User> {
    return this.http.post<User>(`${environment.baseUrlApi}/auth/login`, { username, password, rememberMe });
  }

  logout(): Observable<CustomHttpResponse> {
    return this.http.post<CustomHttpResponse>(`${environment.baseUrlApi}/auth/logout`, {});
  }

  refresh(): Observable<User> {
    return this.http.post<User>(`${environment.baseUrlApi}/auth/refresh`, {});
  }
}
