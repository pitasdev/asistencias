import { Component, computed, input, output, signal } from '@angular/core';
import { Season } from '@/app/shared/models/season/season.model';
import { FormsModule } from '@angular/forms';
import { UiDisclosure } from '@/app/shared/components/ui/disclosure';
import { UiField } from '@/app/shared/components/ui/field';
import { UiIcon } from '@/app/shared/components/ui/icon';
import { Team } from '@/app/shared/models/team/team.model';
import { Player } from '@/app/shared/models/player/player.model';

@Component({
  selector: 'app-statistics-filter',
  imports: [FormsModule, UiDisclosure, UiField, UiIcon],
  templateUrl: './statistics-filter.html',})
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

  protected expanded = signal(true);

  protected summary = computed(() => {
    const parts: string[] = [];
    const season = this.selectedSeason();
    if (season && !season.currentSeason) parts.push(season.name);
    if (this.selectedTeam()) parts.push(this.selectedTeam()!.name);
    if (this.selectedPlayer()) parts.push(`${this.selectedPlayer()!.name} ${this.selectedPlayer()!.lastName}`.trim());
    return parts.length > 0 ? parts.join(' · ') : 'Sin filtros';
  });

  onTeamChange(event: string) {
    const team = this.teams().find(t => t.id === Number(event));
    this.teamChange.emit(team || null);
  }

  onPlayerChange(event: string) {
    const player = this.players().find(p => p.id === Number(event));
    this.playerChange.emit(player || null);
  }

  onSeasonChange(event: string) {
    const season = this.seasons().find(s => String(s.id) === event);
    this.seasonChange.emit(season || null);
  }
}
