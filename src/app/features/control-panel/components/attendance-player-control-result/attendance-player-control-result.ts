import { Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { UiBadge } from '@/app/shared/components/ui/badge';
import { UiIcon } from '@/app/shared/components/ui/icon';
import { Attendance } from '@/app/shared/models/attendance/attendance.model';

@Component({
  selector: 'app-attendance-player-control-result',
  imports: [DatePipe, UiBadge, UiIcon],
  templateUrl: './attendance-player-control-result.html',})
export class AttendancePlayerControlResult {
  readonly attendance = input.required<Attendance>();
}
