import { Attendance } from '@/app/shared/models/attendance.model';
import { AttendanceQueryFilters } from '@/app/shared/models/attendance-query-filters.model';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, firstValueFrom, of } from 'rxjs';
import { Player } from '@/app/shared/models/player.model';
import { InfoModalManager } from '@/app/core/services/info-modal-manager/info-modal-manager';
import { PlayerManager } from '@/app/domain/player/services/player-manager';
import { UserManager } from '@/app/domain/user/services/user-manager';
import { AttendanceApiClient } from '@/app/core/api-clients/attendance/attendance-api-client';

@Injectable({
  providedIn: 'root'
})
export class AttendanceManager {
  private _attendances = signal<Attendance[]>([]);
  private _addAdicionalAttendances: Attendance[] = [];
  private _deleteAdicionalAttendances: Attendance[] = [];

  attendances = this._attendances.asReadonly();

  private readonly attendanceApiClient = inject(AttendanceApiClient);
  private readonly playerManager = inject(PlayerManager);
  private readonly userManager = inject(UserManager);
  private readonly infoModalManager = inject(InfoModalManager);

  async getAttendancesByTeamIds(teamIds: number[], filters: AttendanceQueryFilters): Promise<void> {
    if (!filters.selectedDate && (!filters.startDate || !filters.endDate)) return;

    const attendances: Attendance[] = [];
    
    for (const teamId of teamIds) {
      const attendancesByTeamId = await firstValueFrom(
        this.attendanceApiClient.getAttendancesByTeamId(teamId, filters)
          .pipe(
            catchError(() => of([]))
          )
      );

      attendances.push(...attendancesByTeamId);
    }

    let teamId = 0;
    const playersTeamIds: number[] = [];
    const adicionalPlayersId: number[] = [];
    attendances.forEach(a => {
      if (a.teamId !== teamId) {
        teamId = a.teamId;
        playersTeamIds.push(teamId);
      }

      if (a.isAdicional) {
        adicionalPlayersId.push(a.playerId);
      }
    });
    
    await this.playerManager.getPlayersByTeamIds(playersTeamIds);
    for (const playerId of adicionalPlayersId) {
      const player = await this.playerManager.getPlayerById(playerId);
      if (player) {
        this.playerManager.addAdicionalPlayerToPlayers(player);
      }
    }
    
    this._attendances.set(attendances);
  }

  async checkExistingAttendancesByTeamId(teamId: number, filters: AttendanceQueryFilters): Promise<Attendance[]> {
    return await firstValueFrom(
        this.attendanceApiClient.getAttendancesByTeamId(teamId, filters)
          .pipe(
            catchError(() => of([]))
          )
      );
  }

  async getAttendancesByClubId(clubId: number, filters: AttendanceQueryFilters): Promise<void> {
    if (!filters.selectedDate) return;

    const attendances = await firstValueFrom(
      this.attendanceApiClient.getAttendancesByClubId(clubId, filters)
        .pipe(
          catchError(() => of([]))
        )
    );

    let teamId = 0;
    const playersTeamIds: number[] = [];
    attendances.forEach(a => {
      if (a.teamId !== teamId) {
        teamId = a.teamId;
        playersTeamIds.push(teamId);
      }
    });
    await this.playerManager.getPlayersByTeamIds(playersTeamIds);
    
    this._attendances.set(attendances);
  }

  async getAttendancesByPlayerId(playerId: number, filters: AttendanceQueryFilters): Promise<void> {
    const attendances = await firstValueFrom(
      this.attendanceApiClient.getAttendancesByPlayerId(playerId, filters)
        .pipe(
          catchError(() => of([]))
        )
    );

    this._attendances.set(attendances);
  }

  setDefaultAttendances(attendances: Attendance[]): void {
    this._attendances.set(attendances);
  }

  updateAttendance(attendance: Attendance): void {
    const newAttendances = this._attendances().map(a => a.playerId === attendance.playerId ? attendance : a);
    this._attendances.set(newAttendances);
  }

  async saveAttendances(): Promise<void> {
    if (this._attendances().some(a => a.id !== null)) {
      let attendancesForUpdate = this._attendances();
      for (const attendance of this._addAdicionalAttendances) {
        attendancesForUpdate = attendancesForUpdate.filter(a => a.playerId !== attendance.playerId);
      }
      const response = await firstValueFrom(this.attendanceApiClient.updateAttendances(attendancesForUpdate));
      if (response.message) {
        this.infoModalManager.success('Las asistencias se actualizaron correctamente');
      } else {
        this.infoModalManager.error('Error al actualizar las asistencias');
      }

      if (this._addAdicionalAttendances.length > 0) {
        const response = await firstValueFrom(this.attendanceApiClient.createAttendances(this._addAdicionalAttendances));
        if (response.error) {
          this.infoModalManager.error('Error al guardar las asistencias de los jugadores adicionales');
        } else {
          this._addAdicionalAttendances = [];
        }
      }

      if (this._deleteAdicionalAttendances.length > 0) {
        const attendancesIds = this._deleteAdicionalAttendances.map(a => a.id!);
        const response = await firstValueFrom(this.attendanceApiClient.deleteOnBulkAttendances(attendancesIds));
        if (response.error) {
          this.infoModalManager.error('Error al eliminar las asistencias de los jugadores adicionales');
        } else {
          this._deleteAdicionalAttendances = [];
        }
      }
    } else {
      const response = await firstValueFrom(this.attendanceApiClient.createAttendances(this._attendances()));
      if (response.message) {
        this.infoModalManager.success('Las asistencias se guardaron correctamente');
      } else {
        this.infoModalManager.error('Error al guardar las asistencias');
      }
    }

    const teamId = this._attendances()[0]?.teamId!;
    const filters: AttendanceQueryFilters = {
      selectedDate: this._attendances()[0]?.date
    }
    await this.getAttendancesByTeamIds([teamId], filters);
  }

  async deleteOnBulkAttendances(): Promise<void> {
    const attendancesIds: number[] = [];
    this._attendances().forEach(a => {
      attendancesIds.push(a.id!);
    });

    const response = await firstValueFrom(this.attendanceApiClient.deleteOnBulkAttendances(attendancesIds));
    if (response.message) {
      this.infoModalManager.success('Las asistencias se eliminaron correctamente');
    } else {
      this.infoModalManager.error('Error al eliminar las asistencias');
    }
  }

  async loadDefaultAttendances(teamId: number, date: string, attendanceTypeId: number): Promise<Attendance[]> {
    await this.playerManager.getPlayersByTeamIds([teamId]);
    const attendances: Attendance[] = [];
    
    this.playerManager.players().forEach(player => {
      attendances.push({
        id: null,
        hasAttended: true,
        date: date,
        isAdicional: false,
        reasonDescription: null,
        attendanceTypeId: attendanceTypeId,
        reasonId: null,
        playerId: player.id!,
        teamId: teamId,
        clubId: this.userManager.activeUser()?.clubId!
      });
    });

    return attendances;
  }

  addAdicionalPlayerToAttendances(player: Player, date: string, attendanceTypeId: number, teamId: number): void {
    let attendance: Attendance = {
      id: null,
      hasAttended: true,
      date: date,
      isAdicional: true,
      reasonDescription: null,
      attendanceTypeId: attendanceTypeId,
      reasonId: null,
      playerId: player.id!,
      teamId: teamId,
      clubId: this.userManager.activeUser()?.clubId!
    }

    if (this._attendances().some(a => a.id !== null)) {
      if (this._deleteAdicionalAttendances.some(a => a.playerId === attendance.playerId)) {
        const deletedAttendance = this._deleteAdicionalAttendances.find(a => a.playerId === attendance.playerId)!;
        attendance = deletedAttendance;
        this._deleteAdicionalAttendances = this._deleteAdicionalAttendances.filter(a => a.playerId !== attendance.playerId);
      } else {
        this._addAdicionalAttendances = [...this._addAdicionalAttendances, attendance];
      }
    }

    this._attendances.update(attendances => [...attendances, attendance]);
    
    this.playerManager.addAdicionalPlayerToPlayers(player);
  }

  deleteAdicionalPlayer(attendance: Attendance) {
    if (attendance.id !== null) {
      this._deleteAdicionalAttendances = [...this._deleteAdicionalAttendances, attendance];
    } else if (attendance.id === null && this._addAdicionalAttendances.some(a => a.playerId === attendance.playerId)) {
      this._addAdicionalAttendances = this._addAdicionalAttendances.filter(a => a.playerId !== attendance.playerId);
    }

    const newAttendances = this._attendances().filter(a => a.playerId !== attendance.playerId);
    this._attendances.set(newAttendances);
  }
}
