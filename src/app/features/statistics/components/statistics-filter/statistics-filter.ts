import { Season } from '@/app/shared/models/season/season.model';
import { Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToggleContent } from '@/app/shared/components/toggle-content/toggle-content';
import { SearchFiltersTitle } from '@/app/shared/components/search-filters-title/search-filters-title';
import { Team } from '@/app/shared/models/team/team.model';
import { Player } from '@/app/shared/models/player/player.model';

@Component({
  selector: 'app-statistics-filter',
  imports: [FormsModule, ToggleContent, SearchFiltersTitle],
  templateUrl: './statistics-filter.html',
  styleUrl: './statistics-filter.css'
})
export class StatisticsFilter {
  teams = input.required<Team[]>();
  selectedTeam = input.required<Team | null>();
  players = input.required<Player[]>();
  selectedPlayer = input.required<Player | null>();
  seasons = input.required<Season[]>();
  selectedSeason = input.required<Season | null>();
  showSeasonSelector = input.required<boolean>();

  teamChange = output<Team | null>();
  playerChange = output<Player | null>();
  seasonChange = output<Season | null>();

  forceUpdateHeight = signal<boolean>(false);

  onTeamChange(event: string) {
    const team = this.teams().find(t => t.id === Number(event));
    this.teamChange.emit(team || null);
    
    // Trigger height recalculation after the DOM updates with the new selector
    setTimeout(() => {
      this.forceUpdateHeight.set(true);
    }, 50);
  }

  onPlayerChange(event: string) {
    const player = this.players().find(p => p.id === Number(event));
    this.playerChange.emit(player || null);
  }

  onSeasonChange(event: string) {
    const season = this.seasons().find(s => s.name === event);
    this.seasonChange.emit(season || null);

    // Trigger height recalculation after the DOM updates with the new selector
    setTimeout(() => {
      this.forceUpdateHeight.set(true);
    }, 50);
  }
}
