import { AttendanceRequest } from '@/app/shared/models/attendance/attendance-request.model';
import { AttendanceQueryFilters } from '@/app/shared/models/attendance/attendance-query-filters.model';
import { inject, Service, signal } from '@angular/core';
import { catchError, firstValueFrom, of } from 'rxjs';
import { InfoModalManager } from '@/app/core/services/info-modal-manager/info-modal-manager';
import { PlayerManager } from '@/app/domain/player/services/player-manager';
import { AttendanceApiClient } from '@/app/core/api-clients/attendance/attendance-api-client';
import { TeamManager } from '@/app/domain/team/services/team-manager';
import { Attendance } from '@/app/shared/models/attendance/attendance.model';
import { AttendanceType } from '@/app/shared/models/attendance-type/attendance-type.model';
import { Team } from '@/app/shared/models/team/team.model';
import { Player } from '@/app/shared/models/player/player.model';

@Service()
export class AttendanceManager {
  private _attendances = signal<Attendance[]>([]);
  private _addAdicionalAttendances: Attendance[] = [];
  private _deleteAdicionalAttendances: Attendance[] = [];

  attendances = this._attendances.asReadonly();

  private readonly attendanceApiClient = inject(AttendanceApiClient);
  private readonly playerManager = inject(PlayerManager);
  private readonly teamManager = inject(TeamManager);
  private readonly infoModalManager = inject(InfoModalManager);

  async getAttendancesByTeamIds(teamIds: number[], filters: AttendanceQueryFilters): Promise<void> {
    if (!filters.selectedDate && (!filters.startDate || !filters.endDate) && !filters.season) return;

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
      if (a.team.id !== teamId) {
        teamId = a.team.id;
        playersTeamIds.push(teamId);
      }

      if (a.isAdditional && !adicionalPlayersId.includes(a.player.id)) {
        adicionalPlayersId.push(a.player.id);
      }
    });
    
    await this.playerManager.getPlayersByTeamIds(playersTeamIds, filters.season);
    for (const playerId of adicionalPlayersId) {
      if (!this.playerManager.players().some(p => p.id === playerId)) {
        const player = await this.playerManager.getPlayerById(playerId, filters.season);
        if (player) {
          this.playerManager.addAdicionalPlayerToPlayers(player);
        }
      }
    }

    attendances.sort((a, b) => {
      const [yearA, monthA, dayA] = a.date.split('-');
      const [yearB, monthB, dayB] = b.date.split('-');
      const dateA = new Date(+yearA, +monthA - 1, +dayA).getTime();
      const dateB = new Date(+yearB, +monthB - 1, +dayB).getTime();

      if (dateA !== dateB) return dateB - dateA;
      if (a.hasAttended !== b.hasAttended) return a.hasAttended ? -1 : 1;
      return 0;
    });
    
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
      if (a.team.id !== teamId) {
        teamId = a.team.id;
        playersTeamIds.push(teamId);
      }
    });
    await this.playerManager.getPlayersByTeamIds(playersTeamIds, filters.season);

    const adicionalPlayers = attendances.filter(a => a.isAdditional);
    for (const adicionalPlayer of adicionalPlayers) {
      if (!this.playerManager.players().some(p => p.id === adicionalPlayer.player.id)) {
        const player = await this.playerManager.getPlayerById(adicionalPlayer.player.id, filters.season);
        if (player !== null) this.playerManager.addAdicionalPlayerToPlayers(player);
      }
    }

    attendances.sort((a, b) => {
      const teamA = this.teamManager.findTeamById(a.team.id);
      const teamB = this.teamManager.findTeamById(b.team.id);

      if (teamA && teamB) {
        if (teamA.order > teamB.order) return 1;
        if (teamA.order < teamB.order) return -1;
      }
      if (a.hasAttended !== b.hasAttended) return a.hasAttended ? -1 : 1;
      return 0;
    });
    
    this._attendances.set(attendances);
  }

  async getAttendancesByPlayerId(playerId: number, filters: AttendanceQueryFilters): Promise<void> {
    const attendances = await firstValueFrom(
      this.attendanceApiClient.getAttendancesByPlayerId(playerId, filters)
        .pipe(
          catchError(() => of([]))
        )
    );

    attendances.sort((a, b) => b.date.localeCompare(a.date));

    this._attendances.set(attendances);
  }

  setDefaultAttendances(attendances: Attendance[]): void {
    this._attendances.set(attendances);
  }

  updateAttendance(attendance: Attendance): void {
    const newAttendances = this._attendances().map(a => a.player.id === attendance.player.id ? attendance : a);
    this._attendances.set(newAttendances);
  }

  async saveAttendances(): Promise<void> {
    if (this._attendances().some(a => a.id !== null)) {
      let attendancesForUpdate = this._attendances();
      for (const adicionalAttendance of this._addAdicionalAttendances) {
        attendancesForUpdate = attendancesForUpdate.filter(a => a.player.id !== adicionalAttendance.player.id);
      }

      if (this._addAdicionalAttendances.length > 0) {
        const response = await firstValueFrom(
          this.attendanceApiClient.createAdicionalAttendances(this.toAttendances(this._addAdicionalAttendances))
            .pipe(
              catchError((error) => of(error))
            )
        );
        if (response && response.error) {
          this.infoModalManager.error(response.error ?? 'Error al crear asistencias adicionales');
          return;
        } else {
          this._addAdicionalAttendances = [];
        }
      }

      if (this._deleteAdicionalAttendances.length > 0) {
        const attendancesIds = this._deleteAdicionalAttendances.map(a => a.id!);
        const response = await firstValueFrom(
          this.attendanceApiClient.deleteOnBulkAttendances(attendancesIds)
            .pipe(
              catchError((error) => of(error))
            )
        );
        if (response && response.error) {
          this.infoModalManager.error(response.error);
          return;
        } else {
          this._deleteAdicionalAttendances = [];
        }
      }
      
      const updateResponse = await firstValueFrom(
        this.attendanceApiClient.updateAttendances(this.toAttendances(attendancesForUpdate))
          .pipe(
            catchError((error) => of(error))
          )
      );
      if (updateResponse && updateResponse.isSuccess) {
        this.infoModalManager.success(updateResponse.message!);
      } else {
        this.infoModalManager.error(updateResponse?.error ?? updateResponse?.message ?? 'Error al actualizar asistencias');
        return;
      }
    } else {
      const createResponse = await firstValueFrom(
        this.attendanceApiClient.createAttendances(this.toAttendances(this._attendances()))
          .pipe(
            catchError((error) => of(error))
          )
      );
      if (createResponse && createResponse.isSuccess) {
        this.infoModalManager.success(createResponse.message!);
      } else {
        this.infoModalManager.error(createResponse?.error ?? 'Error al crear asistencias');
        return;
      }
    }
    
    const teamId = this._attendances()[0]?.team.id;
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

    const response = await firstValueFrom(
      this.attendanceApiClient.deleteOnBulkAttendances(attendancesIds)
        .pipe(
          catchError((error) => of(error))
        )
    );
    if (response && response.isSuccess) {
      this.infoModalManager.success(response.message!);
      this._attendances.set([]);
    } else if (response && response.error) {
      this.infoModalManager.error(response.error);
    }
  }

  async loadDefaultAttendances(team: Team, date: string, attendanceType: AttendanceType): Promise<Attendance[]> {
    await this.playerManager.getPlayersByTeamIds([team.id!]);
    const attendances: Attendance[] = [];
    
    this.playerManager.players().forEach(player => {
      attendances.push({
        id: null,
        hasAttended: true,
        date: date,
        isAdditional: false,
        reasonDescription: null,
        attendanceType: {
          id: attendanceType.id!,
          name: attendanceType.name
        },
        reason: null,
        player: {
          id: player.id!,
          name: player.name,
          lastName: player.lastName
        },
        team: {
          id: team.id!,
          name: team.name
        },
        club: {
          id: team.club.id,
          name: team.club.name
        }
      });
    });

    return attendances;
  }

  addAdicionalPlayerToAttendances(player: Player, date: string, attendanceType: AttendanceType, team: Team): void {
    let attendance: Attendance = {
      id: null,
      hasAttended: true,
      date: date,
      isAdditional: true,
      reasonDescription: null,
      attendanceType: {
        id: attendanceType.id!,
        name: attendanceType.name
      },
      reason: null,
      player: {
        id: player.id!,
        name: player.name,
        lastName: player.lastName
      },
      team: {
        id: team.id!,
        name: team.name
      },
      club: {
        id: team.club.id,
        name: team.club.name
      }
    }

    if (this._attendances().some(a => a.id !== null)) {
      if (this._deleteAdicionalAttendances.some(a => a.player.id === attendance.player.id)) {
        const deletedAttendance = this._deleteAdicionalAttendances.find(a => a.player.id === attendance.player.id)!;
        attendance = deletedAttendance;
        this._deleteAdicionalAttendances = this._deleteAdicionalAttendances.filter(a => a.player.id !== attendance.player.id);
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
    } else if (attendance.id === null && this._addAdicionalAttendances.some(a => a.player.id === attendance.player.id)) {
      this._addAdicionalAttendances = this._addAdicionalAttendances.filter(a => a.player.id !== attendance.player.id);
    }

    const newAttendances = this._attendances().filter(a => a.player.id !== attendance.player.id);
    this._attendances.set(newAttendances);
  }

  private toAttendance(attendance: Attendance): AttendanceRequest {
    return {
      id: attendance.id,
      hasAttended: attendance.hasAttended,
      date: attendance.date,
      isAdditional: attendance.isAdditional,
      reasonDescription: attendance.reasonDescription,
      attendanceTypeId: attendance.attendanceType.id,
      reasonId: attendance.reason?.id ?? null,
      playerId: attendance.player.id,
      teamId: attendance.team.id,
      clubId: attendance.club.id
    }
  }

  private toAttendances(attendances: Attendance[]): AttendanceRequest[] {
    return attendances.map(a => this.toAttendance(a));
  }
}
