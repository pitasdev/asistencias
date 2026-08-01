import { Role } from '@/app/shared/models/role.model';
import { environment } from '@/environments/environment';
import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';

@Service()
export class RoleApiClient {
  private readonly http = inject(HttpClient);

  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(`${environment.baseUrlApi}/role`);
  }
}
