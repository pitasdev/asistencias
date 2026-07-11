import { TeamManager } from '@/app/domain/team/services/team-manager';
import { PlayerManager } from '@/app/domain/player/services/player-manager';
import { UserManager } from '@/app/domain/user/services/user-manager';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Team } from '@/app/shared/models/team.model';
import { Player } from '@/app/shared/models/player.model';
import { StatisticsFilter } from '@/app/features/statistics/components/statistics-filter/statistics-filter';
import { StatisticsManager } from '@/app/domain/statistics/services/statistics-manager';
import { KeyValuePipe, KeyValue } from '@angular/common';
import { Attendance } from '@/app/shared/models/attendance.model';
import { AttendanceType } from '@/app/shared/models/attendance-type.model';

@Component({
  selector: 'app-statistics',
  imports: [FormsModule, StatisticsFilter, KeyValuePipe],
  templateUrl: './statistics.html',
  styleUrl: './statistics.css'
})
export default class Statistics implements OnInit {
  protected readonly teamManager = inject(TeamManager);
  protected readonly playerManager = inject(PlayerManager);
  protected readonly userManager = inject(UserManager);
  protected readonly statisticsManager = inject(StatisticsManager);

  protected selectedTeam = signal<Team | null>(null);
  protected selectedPlayer = signal<Player | null>(null);

  ngOnInit(): void {
    const userId = this.userManager.activeUser()?.id;
    if (userId) {
      this.teamManager.getTeamsByUserId(userId);
    }
  }

  async onTeamChange(team: Team | null): Promise<void> {
    if (!team) {
      this.selectedTeam.set(null);
      this.selectedPlayer.set(null);
      return;
    }

    this.selectedTeam.set(team);
    this.selectedPlayer.set(null);

    if (team.id) {
      await this.statisticsManager.getTeamStats(team.id);
    }

    await this.playerManager.getPlayersByTeamIds([team.id!]);
  }

  async onPlayerChange(player: Player | null): Promise<void> {
    if (!player) {
      this.selectedPlayer.set(null);
      return;
    }

    this.selectedPlayer.set(player);

    if (player.id) {
      await this.statisticsManager.getPlayerStats(player.id);
    }
  }

  protected getProgressColor(percentage: number | undefined): string {
    if (percentage === undefined) return '#3b82f6';
    if (percentage >= 80) return '#10b981';
    if (percentage >= 50) return '#f59e0b';
    return '#ef4444';
  }

  protected calculateHasAttended(attendance: Attendance[]): number {
    return attendance.filter(a => a.hasAttended).length;
  }

  protected sortByAttendanceTypeId = (a: KeyValue<AttendanceType, number>, b: KeyValue<AttendanceType, number>): number => {
    return (a.key.id ?? 0) - (b.key.id ?? 0);
  };
}
