import { TeamManager } from '@/app/domain/team/services/team-manager';
import { PlayerManager } from '@/app/domain/player/services/player-manager';
import { UserManager } from '@/app/domain/user/services/user-manager';
import { RoleManager } from '@/app/domain/role/services/role-manager';
import { ClubManager } from '@/app/domain/club/services/club-manager';
import { AttendanceTypeManager } from '@/app/domain/attendance-type/services/attendance-type-manager';
import { PlayerTeamsManager } from '@/app/domain/player-teams/services/player-teams-manager';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Season } from '@/app/shared/models/season/season.model';
import { StatisticsFilter } from '@/app/features/statistics/components/statistics-filter/statistics-filter';
import { StatisticsManager } from '@/app/domain/statistics/services/statistics-manager';
import { Modal } from '@/app/shared/components/ui/modal/modal';
import { dateFormatter } from '@/app/shared/utils/dateFormatter';
import { KeyValuePipe, KeyValue } from '@angular/common';
import { UiAvatar } from '@/app/shared/components/ui/avatar';
import { UiBadge } from '@/app/shared/components/ui/badge';
import { UiEmptyState } from '@/app/shared/components/ui/empty-state';
import { UiField } from '@/app/shared/components/ui/field';
import { UiIcon } from '@/app/shared/components/ui/icon';
import { UiPageHeader } from '@/app/shared/components/ui/page-header';
import { UiProgressRing } from '@/app/shared/components/ui/progress-ring';
import { Switch as UiSwitch } from '@/app/shared/components/ui/switch';
import { Attendance } from '@/app/shared/models/attendance/attendance.model';
import { AttendanceType } from '@/app/shared/models/attendance-type/attendance-type.model';
import { Team } from '@/app/shared/models/team/team.model';
import { Player } from '@/app/shared/models/player/player.model';

@Component({
  selector: 'app-statistics',
  imports: [FormsModule, StatisticsFilter, KeyValuePipe, UiPageHeader, UiProgressRing, UiAvatar, UiBadge, UiIcon, UiEmptyState, UiField, UiSwitch, Modal],
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
  protected readonly attendanceTypeManager = inject(AttendanceTypeManager);
  protected readonly playerTeamsManager = inject(PlayerTeamsManager);
  protected readonly statisticsManager = inject(StatisticsManager);

  protected selectedTeam = signal<Team | null>(null);
  protected selectedPlayer = signal<Player | null>(null);
  protected selectedSeason = signal<Season | null>(null);
  protected selectedAdditionalAttendanceTypeId = signal<number | null>(null);
  protected showAdditionalStats = signal(false);
  protected selectedAdditionalPlayer = signal<Attendance['player'] | null>(null);
  protected showAdditionalPlayerDatesModal = signal(false);
  protected selectedAdditionalPlayerAttendances = computed(() => {
    const player = this.selectedAdditionalPlayer();
    if (!player) return [];

    return this.statisticsManager.getAdditionalPlayerAttendances(
      player.id,
      this.selectedAdditionalAttendanceTypeId()
    );
  });
  protected selectedAdditionalAttendanceType = computed(() => {
    const attendanceTypeId = this.selectedAdditionalAttendanceTypeId();
    if (attendanceTypeId === null) return null;

    return this.attendanceTypeManager.attendanceTypes()
      .find(type => type.id === attendanceTypeId) ?? null;
  });
  protected playerTeamNames = computed(() => {
    const teamNamesByPlayerId = new Map<number, string>();

    for (const playerTeams of this.playerTeamsManager.playerTeams()) {
      if (playerTeams.player.id === null) continue;

      const teamNames = playerTeams.teams
        .map(team => team.name.trim())
        .filter(name => name.length > 0)
        .join(' · ');

      if (teamNames) teamNamesByPlayerId.set(playerTeams.player.id, teamNames);
    }

    return teamNamesByPlayerId;
  });
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

  async ngOnInit(): Promise<void> {
    const season = this.clubManager.actualSeason();
    this.selectedSeason.set(season);

    const clubId = this.userManager.activeUser()?.club.id;
    if (clubId && season) {
      await this.playerTeamsManager.getPlayerTeamsByClubId(clubId, season.id ?? undefined);
    }
  }

  protected async onTeamChange(team: Team | null): Promise<void> {
    this.closeAdditionalPlayerDetails();

    if (!team || !this.selectedSeason()) {
      this.selectedTeam.set(null);
      this.selectedPlayer.set(null);
      return;
    }

    this.selectedTeam.set(team);
    this.selectedPlayer.set(null);

    if (team.id) {
      await this.statisticsManager.getTeamStats(
        team.id,
        this.selectedSeason()?.id!,
        this.selectedAdditionalAttendanceTypeId()
      );
      this.statisticsManager.setAdditionalPlayerStatsByType(this.selectedAdditionalAttendanceTypeId());
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

  protected onShowAdditionalStatsChange(show: boolean): void {
    this.showAdditionalStats.set(show);
    if (!show) this.closeAdditionalPlayerDetails();
  }

  protected openAdditionalPlayerDates(player: Attendance['player']): void {
    this.selectedAdditionalPlayer.set(player);
    this.showAdditionalPlayerDatesModal.set(true);
  }

  protected closeAdditionalPlayerDetails(): void {
    this.showAdditionalPlayerDatesModal.set(false);
    this.selectedAdditionalPlayer.set(null);
  }

  protected onAdditionalPlayerDatesModalClosed(): void {
    this.closeAdditionalPlayerDetails();
  }

  protected onAdditionalAttendanceTypeChange(attendanceTypeId: number | null): void {
    this.closeAdditionalPlayerDetails();
    this.selectedAdditionalAttendanceTypeId.set(attendanceTypeId);
    this.statisticsManager.setAdditionalPlayerStatsByType(attendanceTypeId);
  }

  protected async onSeasonChange(season: Season | null): Promise<void> {
    this.closeAdditionalPlayerDetails();
    this.selectedSeason.set(season);
    this.selectedTeam.set(null);
    this.selectedPlayer.set(null);
    this.selectedAdditionalAttendanceTypeId.set(null);
    this.showAdditionalStats.set(false);
    this.statisticsManager.clearStats();

    const clubId = this.userManager.activeUser()?.club.id;
    if (clubId && season) {
      await this.playerTeamsManager.getPlayerTeamsByClubId(clubId, season.id ?? undefined);
    }

    if (season && !season.currentSeason) {
      this.teamManager.getTeamsByClubId(this.userManager.activeUser()?.club.id!, season.id!);
    }
  }

  protected getPlayerTeamNames(playerId: number): string | null {
    return this.playerTeamNames().get(playerId) ?? null;
  }

  protected formatAttendanceDate(date: string): string {
    return dateFormatter(date);
  }

  protected trackAdditionalAttendance(attendance: Attendance): string {
    return `${attendance.date}-${attendance.attendanceType.id ?? 0}-${attendance.id ?? ''}`;
  }

  protected calculateHasAttended(attendance: Attendance[]): number {
    return attendance.filter(a => a.hasAttended).length;
  }
}
