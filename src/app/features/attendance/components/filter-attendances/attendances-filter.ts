import { formatDateTimeToDate } from '@/app/shared/utils/formatDateTimeToDate';
import { dateFormatter } from '@/app/shared/utils/dateFormatter';
import { Component, computed, input, OnInit, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UiDisclosure } from "@/app/shared/components/ui/disclosure";
import { UiField } from "@/app/shared/components/ui/field";
import { UiIcon } from "@/app/shared/components/ui/icon";
import { SegmentedOption, UiSegmented } from "@/app/shared/components/ui/segmented";
import { AttendanceType } from '@/app/shared/models/attendance-type/attendance-type.model';
import { Team } from '@/app/shared/models/team/team.model';

@Component({
  selector: 'app-attendances-filter',
  imports: [FormsModule, UiDisclosure, UiField, UiIcon, UiSegmented],
  templateUrl: './attendances-filter.html',})
export class AttendancesFilter implements OnInit {
  teams = input.required<Team[]>();
  selectedTeam = input.required<Team | null>();
  date = input.required<string>();
  attendanceTypes = input.required<AttendanceType[]>();
  selectedAttendanceType = input.required<AttendanceType>();

  teamsChange = output<Team | null>();
  dateChange = output<string>();
  attendanceTypeChange = output<AttendanceType>();

  protected expanded = signal<boolean>(true);

  protected summary = computed(() => {
    const teamName = this.selectedTeam()?.name ?? 'Sin equipo';
    return `${teamName} · ${this.date() ? dateFormatter(this.date()) : 'Sin fecha'}`;
  });

  protected typeOptions = computed<SegmentedOption<number>[]>(() =>
    this.attendanceTypes()
      .filter(t => t.id !== null)
      .map(t => ({ value: t.id!, label: t.name }))
  );

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

  onAttendanceTypeIdChange(id: number) {
    const attendanceType = this.attendanceTypes().find(t => t.id === id);
    if (attendanceType) {
      this.attendanceTypeChange.emit(attendanceType);
    }
  }
}
