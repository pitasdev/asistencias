import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { AttendancesControlFilter } from "@/app/features/control-panel/components/attendances-control-filter/attendances-control-filter";
import { formatDateTimeToDate } from '@/app/shared/utils/formatDateTimeToDate';
import { AttendanceManager } from '@/app/domain/attendance/services/attendance-manager';
import { AttendanceControlResult } from "../../components/attendance-control-result/attendance-control-result";
import { AttendanceQueryFilters } from '@/app/shared/models/attendance/attendance-query-filters.model';
import { TeamManager } from '@/app/domain/team/services/team-manager';
import { PlayerManager } from '@/app/domain/player/services/player-manager';
import { AttendanceTypeManager } from '@/app/domain/attendance-type/services/attendance-type-manager';
import { ReasonManager } from '@/app/domain/reason/services/reason-manager';
import { UserManager } from '@/app/domain/user/services/user-manager';
import { SummaryOfDay } from "../../components/summary-of-day/summary-of-day";
import { UiEmptyState } from '@/app/shared/components/ui/empty-state';
import { UiPageHeader } from '@/app/shared/components/ui/page-header';
import { Team } from '@/app/shared/models/team/team.model';
import { Season } from '@/app/shared/models/season/season.model';
import { ClubManager } from '@/app/domain/club/services/club-manager';

@Component({
  selector: 'app-attendances-control',
  imports: [AttendancesControlFilter, AttendanceControlResult, SummaryOfDay, UiEmptyState, UiPageHeader],
  templateUrl: './attendances-control.html',
  host: {
    class: 'flex flex-col gap-4'
  }
})
export default class AttendancesControl implements OnInit {
  protected readonly attendanceManager = inject(AttendanceManager);
  protected readonly teamManager = inject(TeamManager);
  protected readonly playerManager = inject(PlayerManager);
  protected readonly attendanceTypeManager = inject(AttendanceTypeManager);
  protected readonly reasonManager = inject(ReasonManager);
  protected readonly clubManager = inject(ClubManager);
  private readonly userManager = inject(UserManager);

  protected selectedSeason = signal<Season | null>(null);
  protected selectedTeam = signal<Team | null>(null);
  protected selectedDate = signal<string>('');
  protected selectedStartDate = signal<string>('');
  protected selectedEndDate = signal<string>('');

  protected teams = computed(() => this.selectedSeason()?.currentSeason
    ? this.teamManager.userTeams()
    : this.teamManager.allHistoryTeams()
  );

  private filters = computed<AttendanceQueryFilters>(() => {
    const seasonId = this.selectedSeason()?.id ?? undefined;
    if (this.selectedStartDate() && this.selectedEndDate()) {
      return {
        seasonId,
        startDate: this.selectedStartDate(),
        endDate: this.selectedEndDate()
      };
    }
    return {
      seasonId,
      selectedDate: this.selectedDate() ? this.selectedDate() : undefined
    };
  });

  async ngOnInit(): Promise<void> {
    this.selectedSeason.set(this.clubManager.actualSeason());

    if (!this.selectedSeason()) return;

    this.selectedDate.set(formatDateTimeToDate(new Date()));
    await this.attendanceManager.getAttendancesByClubId(this.userManager.activeUser()?.club.id!, this.filters());
  }

  protected seasonChange(season: Season | null): void {
    this.selectedSeason.set(season);
    this.selectedTeam.set(null);
    this.selectedDate.set(formatDateTimeToDate(new Date()));
    this.selectedStartDate.set('');
    this.selectedEndDate.set('');

    if (season) {
      if (!season.currentSeason) {
        this.teamManager.getTeamsByClubId(this.userManager.activeUser()?.club.id!, season.id!);
        this.attendanceManager.getAttendancesByClubId(this.userManager.activeUser()?.club.id!, this.filters());
      }
    } else {
      this.attendanceManager.setDefaultAttendances([]);
    }
  }

  protected async teamsChange(team: Team | null): Promise<void> {
    this.selectedTeam.set(team);

    if (team) {
      await this.attendanceManager.getAttendancesByTeamIds([team?.id!], this.filters());
    } else {
      await this.attendanceManager.getAttendancesByClubId(this.userManager.activeUser()?.club.id!, this.filters());
    }
  }

  protected async dateChange(date: string): Promise<void> {
    this.selectedDate.set(date);

    if (this.selectedDate()){
      if (this.selectedTeam()) {
        await this.attendanceManager.getAttendancesByTeamIds([this.selectedTeam()?.id!], this.filters());
      } else {
        await this.attendanceManager.getAttendancesByClubId(this.userManager.activeUser()?.club.id!, this.filters());
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
