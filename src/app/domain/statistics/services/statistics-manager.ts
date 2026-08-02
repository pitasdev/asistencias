import { inject, Service, signal } from '@angular/core';
import { AttendanceManager } from '@/app/domain/attendance/services/attendance-manager';
import { Attendance } from '@/app/shared/models/attendance.model';
import { AttendanceType } from '@/app/shared/models/attendance-type.model';
import { AttendanceTypeManager } from '@/app/domain/attendance-type/services/attendance-type-manager';

@Service()
export class StatisticsManager {
  private readonly attendanceManager = inject(AttendanceManager);
  private readonly attendanceTypeManager = inject(AttendanceTypeManager);

  teamAttendanceAverage = signal<Map<AttendanceType, number>>(new Map());
  playerAttendanceAverage = signal<Map<AttendanceType, number>>(new Map());
  playerAttendanceStats = signal<Map<AttendanceType, Attendance[]>>(new Map());

  async getTeamStats(teamId: number, seasonName: string): Promise<void> {
    await this.attendanceManager.getAttendancesByTeamIds([teamId], { season: seasonName });
    const attendances = this.attendanceManager.attendances();
    
    const { averagesByType } = this.calculateStats(attendances);
    this.teamAttendanceAverage.set(averagesByType);
  }

  async getPlayerStats(playerId: number, seasonName: string): Promise<void> {
    await this.attendanceManager.getAttendancesByPlayerId(playerId, { season: seasonName });
    const attendances = this.attendanceManager.attendances();
    
    const { averagesByType, attendancesByType } = this.calculateStats(attendances);
    
    this.playerAttendanceAverage.set(averagesByType);
    this.playerAttendanceStats.set(attendancesByType);
  }

  clearStats(): void {
    this.teamAttendanceAverage.set(new Map());
    this.playerAttendanceAverage.set(new Map());
    this.playerAttendanceStats.set(new Map());
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
      const typeId = attendance.attendanceTypeId;
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
