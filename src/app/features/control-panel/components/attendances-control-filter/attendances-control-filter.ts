import { Team } from '@/app/shared/models/team.model';
import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SearchFilters } from "@/app/shared/components/search-filters/search-filters";

@Component({
  selector: 'app-attendances-control-filter',
  imports: [FormsModule, SearchFilters],
  templateUrl: './attendances-control-filter.html',
  styleUrl: './attendances-control-filter.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AttendancesControlFilter {
  teams = input.required<Team[]>();
  selectedTeam = input.required<Team | null>();
  date = input.required<string>();
  startDate = input.required<string>();
  endDate = input.required<string>();

  teamsChange = output<Team | null>();
  dateChange = output<string>();
  startDateChange = output<string>();
  endDateChange = output<string>();

  protected showEndDate = signal<boolean>(false);

  onTeamsChange(event: string) {
    const team = this.teams().find(t => t.id === Number(event));
    if (team) {
      this.teamsChange.emit(team);
    } else {
      this.teamsChange.emit(null);
      this.dateChange.emit(new Date().toISOString().split('T')[0]);
      this.showEndDate.set(false);
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

  onShowEndDateChange() {
    if (this.selectedTeam() === null) return;

    this.showEndDate.set(!this.showEndDate());
    
    if (this.showEndDate()) {
      this.startDateChange.emit(this.date());
      this.endDateChange.emit(this.date());
      this.dateChange.emit('');
    } else {
      this.dateChange.emit(this.endDate());
      this.startDateChange.emit('');
      this.endDateChange.emit('');
    }
  }
}
