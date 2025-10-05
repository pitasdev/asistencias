import { ChangeDetectionStrategy, Component, input, model, output, signal } from '@angular/core';
import { Team } from '@/app/shared/models/team.model';
import { FormsModule } from '@angular/forms';
import { Player } from '@/app/shared/models/player.model';
import { ToggleContent } from "@/app/shared/components/toggle-content/toggle-content";
import { SearchFiltersTitle } from "@/app/shared/components/search-filters-title/search-filters-title";

@Component({
  selector: 'app-player-control-filter',
  imports: [FormsModule, ToggleContent, SearchFiltersTitle],
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

  protected showSelectedPlayer = signal<boolean>(false);
  protected forceUpdateToggleContentState = signal<boolean>(false);
  protected toggleContentHeight = signal<string | null>(null);

  protected onTeamsChange(event: string) {
    const oldTeam = this.selectedTeam();
    const team = this.teams().find(t => t.id === Number(event));
    if (team) {
      this.teamsChange.emit(team);
      this.showSelectedPlayer.set(true);
      
      if (!oldTeam) {
        this.forceUpdateToggleContentState.set(true);
        this.toggleContentHeight.set(null);
      }
    } else {
      this.teamsChange.emit(null);

      if (oldTeam) {
        this.forceUpdateToggleContentState.set(true);
        this.toggleContentHeight.set('144px');
      }

      setTimeout(() => {
        this.showSelectedPlayer.set(false);
      }, 300);
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
