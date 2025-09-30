import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { PlayerControlFilter } from "@/app/features/control-panel/components/player-control-filter/player-control-filter";
import { Team } from '@/app/shared/models/team.model';
import { Player } from '@/app/shared/models/player.model';
import { AttendanceManager } from '@/app/domain/attendance/services/attendance-manager';
import { AttendancePlayerControlResult } from "@/app/features/control-panel/components/attendance-player-control-result/attendance-player-control-result";
import { AttendanceQueryFilters } from '@/app/shared/models/attendance-query-filters.model';
import { TeamManager } from '@/app/domain/team/services/team-manager';
import { PlayerManager } from '@/app/domain/player/services/player-manager';

@Component({
  selector: 'app-player-control',
  imports: [PlayerControlFilter, AttendancePlayerControlResult],
  templateUrl: './player-control.html',
  styleUrl: './player-control.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class PlayerControl {
  protected selectedTeam = signal<Team | null>(null);
  protected selectedPlayer = signal<Player | null>(null);

  protected filters = computed<AttendanceQueryFilters>(() => {
    const filters: AttendanceQueryFilters = {
      startDate: undefined,
      endDate: undefined
    };
    return filters;
  });

  protected readonly teamManager = inject(TeamManager);
  protected readonly playerManager = inject(PlayerManager);
  protected readonly attendanceManager = inject(AttendanceManager);

  protected onTeamsChange(team: Team | null) {
    this.selectedTeam.set(team);
    this.selectedPlayer.set(null);

    if (team) {
      this.playerManager.getPlayersByTeamIds([team.id!]);
    }
  }

  protected async onPlayerChange(player: Player | null) {
    this.selectedPlayer.set(player);

    if (player) {
      await this.attendanceManager.getAttendancesByPlayerId(player.id!, this.filters());
    }
  }
}
