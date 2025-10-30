import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { AttendancesControlFilter } from "@/app/features/control-panel/components/attendances-control-filter/attendances-control-filter";
import { Team } from '@/app/shared/models/team.model';
import { formatDateTimeToDate } from '@/app/shared/utils/formatDateTimeToDate';
import { AttendanceManager } from '@/app/domain/attendance/services/attendance-manager';
import { AttendanceControlResult } from "../../components/attendance-control-result/attendance-control-result";
import { AttendanceQueryFilters } from '@/app/shared/models/attendance-query-filters.model';
import { TeamManager } from '@/app/domain/team/services/team-manager';
import { PlayerManager } from '@/app/domain/player/services/player-manager';
import { AttendanceTypeManager } from '@/app/domain/attendance-type/services/attendance-type-manager';
import { ReasonManager } from '@/app/domain/reason/services/reason-manager';
import { UserManager } from '@/app/domain/user/services/user-manager';
import { SummaryOfDay } from "../../components/summary-of-day/summary-of-day";

@Component({
  selector: 'app-attendances-control',
  imports: [AttendancesControlFilter, AttendanceControlResult, SummaryOfDay],
  templateUrl: './attendances-control.html',
  styleUrl: './attendances-control.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class AttendancesControl implements OnInit {
  protected selectedTeam = signal<Team | null>(null);
  protected selectedDate = signal<string>('');
  protected selectedStartDate = signal<string>('');
  protected selectedEndDate = signal<string>('');

  private filters = computed<AttendanceQueryFilters>(() => {
    const filters: AttendanceQueryFilters = {
      selectedDate: this.selectedDate() ? this.selectedDate() : undefined,
      startDate: this.selectedStartDate() ? this.selectedStartDate() : undefined,
      endDate: this.selectedEndDate() ? this.selectedEndDate() : undefined
    };
    return filters;
  });

  protected readonly attendanceManager = inject(AttendanceManager);
  protected readonly teamManager = inject(TeamManager);
  protected readonly playerManager = inject(PlayerManager);
  protected readonly attendanceTypeManager = inject(AttendanceTypeManager);
  protected readonly reasonManager = inject(ReasonManager);
  private readonly userManager = inject(UserManager);

  async ngOnInit(): Promise<void> {
    this.selectedDate.set(formatDateTimeToDate(new Date()));
    await this.attendanceManager.getAttendancesByClubId(this.userManager.activeUser()?.clubId!, this.filters());
  }

  protected async teamsChange(team: Team | null): Promise<void> {
    this.selectedTeam.set(team);

    if (team) {
      await this.attendanceManager.getAttendancesByTeamIds([team?.id!], this.filters());
    } else {
      await this.attendanceManager.getAttendancesByClubId(this.userManager.activeUser()?.clubId!, this.filters());
    }
  }

  protected async dateChange(date: string): Promise<void> {
    this.selectedDate.set(date);

    if (this.selectedDate()){
      if (this.selectedTeam()) {
        await this.attendanceManager.getAttendancesByTeamIds([this.selectedTeam()?.id!], this.filters());
      } else {
        await this.attendanceManager.getAttendancesByClubId(this.userManager.activeUser()?.clubId!, this.filters());
      }
    }
  }

  protected async startDateChange(date: string): Promise<void> {
    this.selectedStartDate.set(date);

    if (this.selectedStartDate() && this.selectedEndDate() && this.selectedTeam()) {
      await this.attendanceManager.getAttendancesByTeamIds([this.selectedTeam()?.id!], this.filters());
    }
  }

  protected async endDateChange(date: string): Promise<void> {
    this.selectedEndDate.set(date);

    if (this.selectedStartDate() && this.selectedEndDate() && this.selectedTeam()) {
      await this.attendanceManager.getAttendancesByTeamIds([this.selectedTeam()?.id!], this.filters());
    }
  }
}
