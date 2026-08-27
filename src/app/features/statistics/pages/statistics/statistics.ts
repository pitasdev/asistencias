import { TeamManager } from '@/app/domain/team/services/team-manager';
import { PlayerManager } from '@/app/domain/player/services/player-manager';
import { UserManager } from '@/app/domain/user/services/user-manager';
import { RoleManager } from '@/app/domain/role/services/role-manager';
import { ClubManager } from '@/app/domain/club/services/club-manager';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Season } from '@/app/shared/models/season/season.model';
import { StatisticsFilter } from '@/app/features/statistics/components/statistics-filter/statistics-filter';
import { StatisticsManager } from '@/app/domain/statistics/services/statistics-manager';
import { KeyValuePipe, KeyValue } from '@angular/common';
import { UiAvatar } from '@/app/shared/components/ui/avatar';
import { UiEmptyState } from '@/app/shared/components/ui/empty-state';
import { UiIcon } from '@/app/shared/components/ui/icon';
import { UiPageHeader } from '@/app/shared/components/ui/page-header';
import { UiProgressRing } from '@/app/shared/components/ui/progress-ring';
import { Attendance } from '@/app/shared/models/attendance/attendance.model';
import { AttendanceType } from '@/app/shared/models/attendance-type/attendance-type.model';
import { Team } from '@/app/shared/models/team/team.model';
import { Player } from '@/app/shared/models/player/player.model';

@Component({
  selector: 'app-statistics',
  imports: [FormsModule, StatisticsFilter, KeyValuePipe, UiPageHeader, UiProgressRing, UiAvatar, UiIcon, UiEmptyState],
  templateUrl: './statistics.html',
  host: {
    class: 'flex flex-col gap-4'
  }
})
export default class Statistics implements OnInit {
  protected readonly teamManager = inject(TeamManager);
  protected readonly playerManager = inject(PlayerManager);
  protected readonly userManager = inject(UserManager);
  protected readonly roleManager = inject(RoleManager);
  protected readonly clubManager = inject(ClubManager);
  protected readonly statisticsManager = inject(StatisticsManager);

  protected selectedTeam = signal<Team | null>(null);
  protected selectedPlayer = signal<Player | null>(null);
  protected selectedSeason = signal<Season | null>(null);
  protected teams = computed(() => this.selectedSeason()?.currentSeason
    ? this.teamManager.userTeams()
    : this.teamManager.allHistoryTeams()
  );

  protected canManageSeason = computed(() => {
    return this.userManager.activeUser()?.role.name !== 'user' && this.clubManager.seasons().length > 1;
  });

  protected readonly sortByAttendanceTypeId = (a: KeyValue<AttendanceType, number>, b: KeyValue<AttendanceType, number>): number => {
    return (a.key.id ?? 0) - (b.key.id ?? 0);
  };

  ngOnInit(): void {
    this.selectedSeason.set(this.clubManager.actualSeason());
  }

  protected async onTeamChange(team: Team | null): Promise<void> {
    if (!team || !this.selectedSeason()) {
      this.selectedTeam.set(null);
      this.selectedPlayer.set(null);
      return;
    }

    this.selectedTeam.set(team);
    this.selectedPlayer.set(null);

    if (team.id) {
      await this.statisticsManager.getTeamStats(team.id, this.selectedSeason()?.id!);
    }

    await this.playerManager.getPlayersByTeamIds([team.id!]);
  }

  protected async onPlayerChange(player: Player | null): Promise<void> {
    if (!player || !this.selectedSeason()) {
      this.selectedPlayer.set(null);
      return;
    }

    this.selectedPlayer.set(player);

    if (player.id) {
      await this.statisticsManager.getPlayerStats(player.id, this.selectedSeason()?.id!);
    }
  }

  protected onSeasonChange(season: Season | null): void {
    this.selectedSeason.set(season);
    this.selectedTeam.set(null);
    this.selectedPlayer.set(null);
    this.statisticsManager.clearStats();

    if (season && !season.currentSeason) {
      this.teamManager.getTeamsByClubId(this.userManager.activeUser()?.club.id!, season.id!);
    }
  }

  protected calculateHasAttended(attendance: Attendance[]): number {
    return attendance.filter(a => a.hasAttended).length;
  }
}
