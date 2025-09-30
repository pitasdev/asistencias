import { RoleApiClient } from '@/app/core/api-clients/role/role-api-client';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, firstValueFrom, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RoleManager {
  private _roles = signal<Role[]>([]);

  roles = this._roles.asReadonly();

  private readonly roleApiClient = inject(RoleApiClient);

  async getRoles(): Promise<void> {
    const roles = await firstValueFrom(
      this.roleApiClient.getRoles()
        .pipe(
          catchError(() => of([]))
        )
    );

    this._roles.set(roles);
  }

  findRoleById(roleId: number): Role | null {
    return this._roles().find(r => r.id === roleId) ?? null;
  }

  findRoleByName(roleName: string): Role | null {
    return this._roles().find(r => r.name.toLowerCase() === roleName.toLowerCase()) ?? null;
  }
}
