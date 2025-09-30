import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { SearchFilters } from "@/app/shared/components/search-filters/search-filters";
import { Team } from '@/app/shared/models/team.model';
import { FormsModule } from '@angular/forms';
import { Player } from '@/app/shared/models/player.model';

@Component({
  selector: 'app-player-control-filter',
  imports: [SearchFilters, FormsModule],
  templateUrl: './player-control-filter.html',
  styleUrl: './player-control-filter.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlayerControlFilter {
  teams = input.required<Team[]>();
  selectedTeam = input.required<Team | null>();
  players = input.required<Player[]>();
  selectedPlayer = input.required<Player | null>();

  teamsChange = output<Team | null>();
  playerChange = output<Player | null>();

  protected onTeamsChange(event: string) {
    const team = this.teams().find(t => t.id === Number(event));
    if (team) {
      this.teamsChange.emit(team);
    } else {
      this.teamsChange.emit(null);
    }
  }

  protected onPlayersChange(event: string) {
    const player = this.players().find(p => p.id === Number(event));
    if (player) {
      this.playerChange.emit(player);
    } else {
      this.playerChange.emit(null);
    }
  }
}
