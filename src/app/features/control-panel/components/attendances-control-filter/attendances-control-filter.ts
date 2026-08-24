import { Component, computed, input, model, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UiDisclosure } from '@/app/shared/components/ui/disclosure';
import { UiField } from '@/app/shared/components/ui/field';
import { UiIcon } from '@/app/shared/components/ui/icon';
import { Switch } from '@/app/shared/components/ui/switch';
import { Season } from '@/app/shared/models/season/season.model';
import { Team } from '@/app/shared/models/team/team.model';
import { dateFormatter } from '@/app/shared/utils/dateFormatter';

@Component({
  selector: 'app-attendances-control-filter',
  imports: [FormsModule, UiDisclosure, UiField, UiIcon, Switch],
  templateUrl: './attendances-control-filter.html',})
export class AttendancesControlFilter {
  seasons = input.required<Season[]>();
  selectedSeason = input.required<Season | null>();
  teams = input.required<Team[]>();
  selectedTeam = input.required<Team | null>();
  date = input.required<string>();
  startDate = input.required<string>();
  endDate = input.required<string>();

  teamsChange = output<Team | null>();
  seasonChange = output<Season | null>();
  dateChange = output<string>();
  startDateChange = output<string>();
  endDateChange = output<string>();

  showEndDate = model<boolean>(false);

  protected expanded = signal(true);

  protected summary = computed(() => {
    const parts: string[] = [];
    const season = this.selectedSeason();
    if (season && !season.currentSeason) parts.push(season.name);
    if (this.selectedTeam()) parts.push(this.selectedTeam()!.name);
    if (this.showEndDate()) {
      if (this.startDate() && this.endDate()) {
        parts.push(`${dateFormatter(this.startDate())} → ${dateFormatter(this.endDate())}`);
      } else if (this.startDate()) {
        parts.push(dateFormatter(this.startDate()));
      }
    } else {
      if (this.date()) parts.push(dateFormatter(this.date()));
    }
    return parts.length > 0 ? parts.join(' · ') : 'Sin filtros';
  });

  onSeasonChange(event: string) {
    const season = this.seasons().find(s => s.name === event);
    this.seasonChange.emit(season || null);

    if (!season) {
      this.showEndDate.set(false);
    }
  }

  onTeamsChange(event: string) {
    const team = this.teams().find(t => t.id === Number(event));
    if (team) {
      this.teamsChange.emit(team);
    } else {
      this.teamsChange.emit(null);

      if (this.showEndDate()) {
        this.startDateChange.emit('');
        this.endDateChange.emit('');
        this.dateChange.emit(new Date().toISOString().split('T')[0]);
        this.showEndDate.set(false);
      }
    }
  }

  onDateChange(event: string) {
    this.dateChange.emit(event);
  }

  onStartDateChange(event: string) {
    this.startDateChange.emit(event);

    if (new Date(event).getTime() > new Date(this.endDate()).getTime()) {
      this.endDateChange.emit(event);
    }
  }

  onEndDateChange(event: string) {
    this.endDateChange.emit(event);

    if (new Date(event).getTime() < new Date(this.startDate()).getTime()) {
      this.startDateChange.emit(event);
    }
  }

  onShowEndDateChange(checked: boolean) {
    if (this.selectedTeam() === null) return;

    this.showEndDate.set(checked);

    if (checked) {
      this.startDateChange.emit(this.date());
      this.endDateChange.emit(this.date());
      this.dateChange.emit('');
    } else {
      this.startDateChange.emit('');
      this.endDateChange.emit('');
      this.dateChange.emit(this.endDate());
    }
  }
}
