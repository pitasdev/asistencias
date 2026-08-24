import { Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { UiAvatar } from '@/app/shared/components/ui/avatar';
import { UiBadge } from '@/app/shared/components/ui/badge';
import { UiIcon } from '@/app/shared/components/ui/icon';
import { Attendance } from '@/app/shared/models/attendance/attendance.model';

@Component({
  selector: 'app-attendance-control-result',
  imports: [DatePipe, UiAvatar, UiBadge, UiIcon],
  templateUrl: './attendance-control-result.html',})
export class AttendanceControlResult {
  readonly attendance = input.required<Attendance>();
}
