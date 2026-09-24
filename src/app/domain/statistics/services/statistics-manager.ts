import { inject, Service, signal } from '@angular/core';
import { AttendanceManager } from '@/app/domain/attendance/services/attendance-manager';
import { AttendanceTypeManager } from '@/app/domain/attendance-type/services/attendance-type-manager';
import { Attendance } from '@/app/shared/models/attendance/attendance.model';
import { AttendanceType } from '@/app/shared/models/attendance-type/attendance-type.model';

export interface TeamAdditionalPlayerStatistic {
  player: Attendance['player'];
  sessionsCount: number;
}

@Service()
export class StatisticsManager {
  private readonly attendanceManager = inject(AttendanceManager);
  private readonly attendanceTypeManager = inject(AttendanceTypeManager);
  private readonly teamAttendances = signal<Attendance[]>([]);

  teamAttendanceAverage = signal<Map<AttendanceType, number>>(new Map());
  teamAdditionalPlayerStats = signal<TeamAdditionalPlayerStatistic[]>([]);
  playerAttendanceAverage = signal<Map<AttendanceType, number>>(new Map());
  playerAttendanceStats = signal<Map<AttendanceType, Attendance[]>>(new Map());

  async getTeamStats(teamId: number, seasonId: number, additionalAttendanceTypeId: number | null = null): Promise<void> {
    this.teamAttendances.set([]);
    this.teamAdditionalPlayerStats.set([]);

    await this.attendanceManager.getAttendancesByTeamIds([teamId], { seasonId });
    const attendances = this.attendanceManager.attendances();
    this.teamAttendances.set(attendances);

    const { averagesByType } = this.calculateStats(attendances);
    this.teamAttendanceAverage.set(averagesByType);
    this.teamAdditionalPlayerStats.set(this.calculateAdditionalPlayerStats(attendances, additionalAttendanceTypeId));
  }

  setAdditionalPlayerStatsByType(attendanceTypeId: number | null): void {
    this.teamAdditionalPlayerStats.set(
      this.calculateAdditionalPlayerStats(this.teamAttendances(), attendanceTypeId)
    );
  }

  getAdditionalPlayerAttendances(playerId: number, attendanceTypeId: number | null = null): Attendance[] {
    return this.teamAttendances()
      .filter(attendance =>
        attendance.player.id === playerId &&
        attendance.isAdditional &&
        attendance.hasAttended &&
        (attendanceTypeId === null || attendance.attendanceType.id === attendanceTypeId)
      )
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  async getPlayerStats(playerId: number, seasonId: number): Promise<void> {
    await this.attendanceManager.getAttendancesByPlayerId(playerId, { seasonId });
    const attendances = this.attendanceManager.attendances();
    
    const { averagesByType, attendancesByType } = this.calculateStats(attendances);
    
    this.playerAttendanceAverage.set(averagesByType);
    this.playerAttendanceStats.set(attendancesByType);
  }

  clearStats(): void {
    this.teamAttendanceAverage.set(new Map());
    this.teamAttendances.set([]);
    this.teamAdditionalPlayerStats.set([]);
    this.playerAttendanceAverage.set(new Map());
    this.playerAttendanceStats.set(new Map());
  }

  private calculateAdditionalPlayerStats(
    attendances: Attendance[],
    attendanceTypeId: number | null = null
  ): TeamAdditionalPlayerStatistic[] {
    const statisticsByPlayerId = new Map<number, TeamAdditionalPlayerStatistic>();

    for (const attendance of attendances) {
      if (!attendance.isAdditional || !attendance.hasAttended) continue;
      if (attendanceTypeId !== null && attendance.attendanceType.id !== attendanceTypeId) continue;

      const currentStatistic = statisticsByPlayerId.get(attendance.player.id);
      if (currentStatistic) {
        currentStatistic.sessionsCount++;
      } else {
        statisticsByPlayerId.set(attendance.player.id, {
          player: attendance.player,
          sessionsCount: 1
        });
      }
    }

    return [...statisticsByPlayerId.values()].sort((a, b) => {
      if (a.sessionsCount !== b.sessionsCount) return b.sessionsCount - a.sessionsCount;

      const playerAName = `${a.player.name} ${a.player.lastName}`;
      const playerBName = `${b.player.name} ${b.player.lastName}`;
      return playerAName.localeCompare(playerBName, 'es');
    });
  }

  private calculateStats(attendances: Attendance[]): { 
    averagesByType: Map<AttendanceType, number>; 
    attendancesByType: Map<AttendanceType, Attendance[]> 
  } {
    const attendancesByTypeAndDate = this.groupAttendancesByTypeIdAndDate(attendances);
    const averagesByType = new Map<AttendanceType, number>();
    const attendancesByType = new Map<AttendanceType, Attendance[]>();

    for (const [typeId, datesMap] of attendancesByTypeAndDate) {
      let totalPercentage = 0;
      let daysCount = 0;
      const allTypeAttendances: Attendance[] = [];

      for (const dayAttendances of datesMap.values()) {
        if (dayAttendances.length > 0) {
          const attendedCount = dayAttendances.filter(a => a.hasAttended).length;
          totalPercentage += (attendedCount / dayAttendances.length) * 100;
          daysCount++;
          allTypeAttendances.push(...dayAttendances);
        }
      }

      const attendanceType = this.attendanceTypeManager.findAttendanceTypeById(typeId);
      if (attendanceType) {
        averagesByType.set(attendanceType, Math.round(daysCount > 0 ? totalPercentage / daysCount : 0));
        attendancesByType.set(attendanceType, allTypeAttendances);
      }
    }

    return { averagesByType, attendancesByType };
  }

  private groupAttendancesByTypeIdAndDate(attendances: Attendance[]): Map<number, Map<string, Attendance[]>> {
    const attendancesByTypeIdAndDate = attendances.reduce((acc, attendance) => {
      const typeId = attendance.attendanceType.id;
      if (!acc.has(typeId)) {
        acc.set(typeId, new Map<string, Attendance[]>());
      }

      const typeMap = acc.get(typeId)!;
      if (!typeMap.has(attendance.date)) {
        typeMap.set(attendance.date, []);
      }

      typeMap.get(attendance.date)!.push(attendance);
      return acc;
    }, new Map<number, Map<string, Attendance[]>>());

    return attendancesByTypeIdAndDate;
  }
}
