import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { PlayerControlFilter } from "@/app/features/control-panel/components/player-control-filter/player-control-filter";
import { AttendanceManager } from '@/app/domain/attendance/services/attendance-manager';
import { AttendancePlayerControlResult } from "@/app/features/control-panel/components/attendance-player-control-result/attendance-player-control-result";
import { AttendanceQueryFilters } from '@/app/shared/models/attendance/attendance-query-filters.model';
import { Season } from '@/app/shared/models/season/season.model';
import { TeamManager } from '@/app/domain/team/services/team-manager';
import { PlayerManager } from '@/app/domain/player/services/player-manager';
import { ClubManager } from '@/app/domain/club/services/club-manager';
import { UiEmptyState } from '@/app/shared/components/ui/empty-state';
import { UiPageHeader } from '@/app/shared/components/ui/page-header';
import { Team } from '@/app/shared/models/team/team.model';
import { Player } from '@/app/shared/models/player/player.model';
import { UserManager } from '@/app/domain/user/services/user-manager';

@Component({
  selector: 'app-player-control',
  imports: [PlayerControlFilter, AttendancePlayerControlResult, UiEmptyState, UiPageHeader],
  templateUrl: './player-control.html',
  host: {
    class: 'flex flex-col gap-4'
  }
})
export default class PlayerControl implements OnInit {
  protected readonly teamManager = inject(TeamManager);
  protected readonly playerManager = inject(PlayerManager);
  protected readonly attendanceManager = inject(AttendanceManager);
  protected readonly clubManager = inject(ClubManager);
  private readonly userManager = inject(UserManager);

  protected selectedTeam = signal<Team | null>(null);
  protected selectedPlayer = signal<Player | null>(null);
  protected selectedSeason = signal<Season | null>(null);
  protected teams = computed(() => this.selectedSeason()?.currentSeason
    ? this.teamManager.userTeams()
    : this.teamManager.allHistoryTeams()
  );

  private filters = computed<AttendanceQueryFilters>(() => {
    return {
      seasonId: this.selectedSeason()?.id ?? undefined
    };
  });

  ngOnInit(): void {
    this.selectedSeason.set(this.clubManager.actualSeason());
    this.attendanceManager.setDefaultAttendances([]);
  }

  protected onTeamsChange(team: Team | null): void {
    this.selectedTeam.set(team);
    this.selectedPlayer.set(null);

    if (team) {
      this.playerManager.getPlayersByTeamIds([team.id!]);
    }
  }

  protected async onPlayerChange(player: Player | null): Promise<void> {
    this.selectedPlayer.set(player);

    if (player) {
      await this.attendanceManager.getAttendancesByPlayerId(player.id!, this.filters());
    }
  }

  protected onSeasonChange(season: Season | null): void {
    this.selectedSeason.set(season);
    this.selectedTeam.set(null);
    this.selectedPlayer.set(null);
    this.attendanceManager.setDefaultAttendances([]);

    if (season && season.currentSeason) {
      this.teamManager.getTeamsByClubId(this.userManager.activeUser()?.club.id!, season.id!);
    }
  }
}
