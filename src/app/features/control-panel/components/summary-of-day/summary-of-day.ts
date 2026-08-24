import { computed, inject, output } from '@angular/core';
import { Component, Signal } from '@angular/core';
import { AttendanceManager } from '@/app/domain/attendance/services/attendance-manager';
import { TeamManager } from '@/app/domain/team/services/team-manager';
import { UiIcon } from '@/app/shared/components/ui/icon';
import { Attendance } from '@/app/shared/models/attendance/attendance.model';
import { Team } from '@/app/shared/models/team/team.model';

interface AttendanceSummary {
  team: Team;
  attendanceTrue: number;
  attendanceFalse: number;
}

@Component({
  selector: 'app-summary-of-day',
  imports: [UiIcon],
  templateUrl: './summary-of-day.html',})
export class SummaryOfDay {
  clickTeam = output<Team>();

  protected readonly attendanceManager = inject(AttendanceManager);
  protected readonly teamManager = inject(TeamManager);

  protected attendancesSummary: Signal<AttendanceSummary[]> = computed(() => {
    return this.summarizeTeams(this.attendanceManager.attendances());
  });

  private summarizeTeams(attendances: Attendance[]): AttendanceSummary[] {
    const attendancesSummary: AttendanceSummary[] = [];

    attendances.forEach(a => {
      const attendanceSummaryTeam = attendancesSummary.find(s => s.team.id === a.team.id);

      if (attendanceSummaryTeam) {
        attendanceSummaryTeam.attendanceTrue += a.hasAttended ? 1 : 0;
        attendanceSummaryTeam.attendanceFalse += a.hasAttended ? 0 : 1;
      } else {
        const team = this.teamManager.findTeamById(a.team.id);
        if (!team) return;

        attendancesSummary.push({
          team,
          attendanceTrue: a.hasAttended ? 1 : 0,
          attendanceFalse: a.hasAttended ? 0 : 1
        });
      }
    });

    return attendancesSummary;
  }
}
