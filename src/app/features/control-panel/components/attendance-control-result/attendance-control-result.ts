import { Attendance } from '@/app/shared/models/attendance/attendance.model';
import { DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-attendance-control-result',
  imports: [DatePipe],
  templateUrl: './attendance-control-result.html',
  styleUrl: './attendance-control-result.css'
})
export class AttendanceControlResult {
  readonly attendance = input.required<Attendance>();
}
