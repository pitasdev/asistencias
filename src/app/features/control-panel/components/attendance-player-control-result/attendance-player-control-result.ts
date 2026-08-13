import { Attendance } from '@/app/shared/models/attendance/attendance.model';
import { DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-attendance-player-control-result',
  imports: [DatePipe],
  templateUrl: './attendance-player-control-result.html',
  styleUrl: './attendance-player-control-result.css'
})
export class AttendancePlayerControlResult {
  attendance = input.required<Attendance>();
}
