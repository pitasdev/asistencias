import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { PlayerControlFilter } from "@/app/features/control-panel/components/player-control-filter/player-control-filter";
import { Team } from '@/app/shared/models/team.model';
import { Player } from '@/app/shared/models/player.model';
import { AttendanceManager } from '@/app/domain/attendance/services/attendance-manager';
import { AttendancePlayerControlResult } from "@/app/features/control-panel/components/attendance-player-control-result/attendance-player-control-result";
import { AttendanceQueryFilters } from '@/app/shared/models/attendance-query-filters.model';
import { Season } from '@/app/shared/models/season.model';
import { TeamManager } from '@/app/domain/team/services/team-manager';
import { PlayerManager } from '@/app/domain/player/services/player-manager';
import { ClubManager } from '@/app/domain/club/services/club-manager';

@Component({
  selector: 'app-player-control',
  imports: [PlayerControlFilter, AttendancePlayerControlResult],
  templateUrl: './player-control.html',
  styleUrl: './player-control.css'
})
export default class PlayerControl implements OnInit {
  protected readonly teamManager = inject(TeamManager);
  protected readonly playerManager = inject(PlayerManager);
  protected readonly attendanceManager = inject(AttendanceManager);
  protected readonly clubManager = inject(ClubManager);

  protected selectedTeam = signal<Team | null>(null);
  protected selectedPlayer = signal<Player | null>(null);
  protected selectedSeason = signal<Season | null>(null);

  private filters = computed<AttendanceQueryFilters>(() => {
    return {
      season: this.selectedSeason()?.name
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
  }
}
