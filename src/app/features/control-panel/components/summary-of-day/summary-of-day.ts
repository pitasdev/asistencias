import { ChangeDetectionStrategy, Component, computed, effect, inject, output, Signal, signal } from '@angular/core';
import { ToggleContent } from "@/app/shared/components/toggle-content/toggle-content";
import { AttendanceManager } from '@/app/domain/attendance/services/attendance-manager';
import { TeamManager } from '@/app/domain/team/services/team-manager';
import { Team } from '@/app/shared/models/team.model';
import { Attendance } from '@/app/shared/models/attendance.model';

interface AttendanceSummary {
  team: Team;
  attendanceTrue: number;
  attendanceFalse: number;
}

@Component({
  selector: 'app-summary-of-day',
  imports: [ToggleContent],
  templateUrl: './summary-of-day.html',
  styleUrl: './summary-of-day.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SummaryOfDay {
  clickTeam = output<Team>();

  protected attendancesSummary: Signal<AttendanceSummary[]> = computed(() => {
    return this.summarizeTeams(this.attendanceManager.attendances());
  });
  protected forceUpdateState = signal<boolean>(false);

  protected readonly attendanceManager = inject(AttendanceManager);
  protected readonly teamManager = inject(TeamManager);

  constructor() {
    effect(() => {
      if(this.attendanceManager.attendances()){
        this.forceUpdateState.set(true);
      }
    });
  }

  private summarizeTeams(attendances: Attendance[]): AttendanceSummary[] {
    const attendancesSummary: AttendanceSummary[] = [];

    attendances.forEach(a => {
      const attendanceSummaryTeam = attendancesSummary.find(s => s.team.id === a.teamId);

      if (attendanceSummaryTeam) {
        attendanceSummaryTeam.attendanceTrue += a.hasAttended ? 1 : 0;
        attendanceSummaryTeam.attendanceFalse += a.hasAttended ? 0 : 1;
      } else {
        const team = this.teamManager.findTeamById(a.teamId);
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
