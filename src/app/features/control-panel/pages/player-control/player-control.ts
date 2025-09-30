import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
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
export default class PlayerControl implements OnInit {
  protected selectedTeam = signal<Team | null>(null);
  protected selectedPlayer = signal<Player | null>(null);

  private filters: AttendanceQueryFilters = {};

  protected readonly teamManager = inject(TeamManager);
  protected readonly playerManager = inject(PlayerManager);
  protected readonly attendanceManager = inject(AttendanceManager);

  ngOnInit(): void {
    const date = new Date().toISOString().split('T')[0];
    const year = date.split('-')[0];
    
    const month = date.split('-')[1];

    if (Number(month) > 7) {
      this.filters.startDate = `${year}-08-01`;
      this.filters.endDate = `${Number(year) + 1}-07-31`;
    } else {
      this.filters.startDate = `${Number(year) - 1}-08-01`;
      this.filters.endDate = `${year}-07-31`;
    }
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
      await this.attendanceManager.getAttendancesByPlayerId(player.id!, this.filters);
    }
  }
}
