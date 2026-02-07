import { AttendanceTypeManager } from '@/app/domain/attendance-type/services/attendance-type-manager';
import { ReasonManager } from '@/app/domain/reason/services/reason-manager';
import { TeamManager } from '@/app/domain/team/services/team-manager';
import { Attendance } from '@/app/shared/models/attendance.model';
import { DatePipe, NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';

@Component({
  selector: 'app-attendance-player-control-result',
  imports: [NgClass, DatePipe],
  templateUrl: './attendance-player-control-result.html',
  styleUrl: './attendance-player-control-result.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AttendancePlayerControlResult {
  attendance = input.required<Attendance>();

  protected readonly teamManager = inject(TeamManager);
  protected readonly attendanceTypeManager = inject(AttendanceTypeManager);
  protected readonly reasonManager = inject(ReasonManager);
}
