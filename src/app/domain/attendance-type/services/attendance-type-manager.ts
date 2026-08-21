import { AttendanceTypeApiClient } from '@/app/core/api-clients/attendance-type/attendance-type-api-client';
import { AttendanceType } from '@/app/shared/models/attendance-type/attendance-type.model';
import { inject, Service, signal } from '@angular/core';
import { catchError, firstValueFrom, of } from 'rxjs';

@Service()
export class AttendanceTypeManager {
  private _attendanceTypes = signal<AttendanceType[]>([]);

  attendanceTypes = this._attendanceTypes.asReadonly();

  private readonly attendanceTypeApiClient = inject(AttendanceTypeApiClient);

  async getAttendanceTypesByClubId(clubId: number, season?: string) {
    const attendanceTypes = await firstValueFrom(
      this.attendanceTypeApiClient.getAttendanceTypesByClubId(clubId, season)
        .pipe(
          catchError(() => of([]))
        )
    );
    
    this._attendanceTypes.set(attendanceTypes);
  }

  findAttendanceTypeById(attendanceTypeId: number): AttendanceType | null {
    return this._attendanceTypes().find(t => t.id === attendanceTypeId) ?? null;
  }
}
