import { environment } from '@/environments/environment';
import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';

@Service()
export class AuthApiClient {
  private readonly http = inject(HttpClient);

  checkToken(): Observable<{ isValidToken: boolean, error?: string }> {
    return this.http.get<{ isValidToken: boolean, error?: string }>(`${environment.baseUrlApi}/auth/check-token`);
  }

  login(username: string, password: string): Observable<{ token: string, isSuccess?: boolean, error?: string }> {
    return this.http.post<{ token: string }>(`${environment.baseUrlApi}/auth/login`, { username, password });
  }
}
