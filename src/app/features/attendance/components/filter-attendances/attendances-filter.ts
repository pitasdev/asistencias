import { AttendanceType } from '@/app/shared/models/attendance-type.model';
import { Team } from '@/app/shared/models/team.model';
import { formatDateTimeToDate } from '@/app/shared/utils/formatDateTimeToDate';
import { ChangeDetectionStrategy, Component, input, OnInit, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToggleContent } from "@/app/shared/components/toggle-content/toggle-content";
import { SearchFiltersTitle } from "@/app/shared/components/search-filters-title/search-filters-title";

@Component({
  selector: 'app-attendances-filter',
  imports: [FormsModule, ToggleContent, SearchFiltersTitle],
  templateUrl: './attendances-filter.html',
  styleUrl: './attendances-filter.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AttendancesFilter implements OnInit {
  teams = input.required<Team[]>();
  selectedTeam = input.required<Team | null>();
  date = input.required<string>();
  attendanceTypes = input.required<AttendanceType[]>();
  selectedAttendanceType = input.required<AttendanceType>();

  teamsChange = output<Team | null>();
  dateChange = output<string>();
  attendanceTypeChange = output<AttendanceType>();
  
  ngOnInit(): void {
    this.dateChange.emit(formatDateTimeToDate(new Date()));
  }

  onTeamsChange(event: string) {
    const team = this.teams().find(t => t.id === Number(event));
    if (team) {
      this.teamsChange.emit(team);
    } else {
      this.teamsChange.emit(null);
    }
  }

  onDateChange(event: string) {
    this.dateChange.emit(event);
  }

  onAttendanceTypeChange(event: string) {
    const attendanceType = this.attendanceTypes().find(t => t.id === Number(event));
    if (attendanceType) {
      this.attendanceTypeChange.emit(attendanceType);
    }
  }
}
