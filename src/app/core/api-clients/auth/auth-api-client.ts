import { environment } from '@/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthApiClient {
  constructor(private readonly http: HttpClient) {}

  checkToken(): Observable<{ isValidToken: boolean, error?: string }> {
    return this.http.get<{ isValidToken: boolean, error?: string }>(`${environment.baseUrlApi}/auth/check-token`);
  }

  login(username: string, password: string): Observable<{ token: string, isSuccess?: boolean, error?: string }> {
    return this.http.post<{ token: string }>(`${environment.baseUrlApi}/auth/login`, { username, password });
  }
}
