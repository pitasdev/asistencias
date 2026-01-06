import { ChangeDetectionStrategy, Component, effect, inject, input, output, signal } from '@angular/core';
import { Switch } from '@/app/shared/components/switch/switch';
import { Attendance } from '@/app/shared/models/attendance.model';
import { FormsModule } from '@angular/forms';
import { Player } from '@/app/shared/models/player.model';
import { Reason } from '@/app/shared/models/reason.model';
import { ReasonManager } from '@/app/domain/reason/services/reason-manager';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-save-attendance-result',
  imports: [Switch, FormsModule, NgClass],
  templateUrl: './save-attendance-result.html',
  styleUrl: './save-attendance-result.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SaveAttendanceResult {
  readonly attendance = input.required<Attendance>();
  readonly player = input.required<Player>();
  readonly reasons = input.required<Reason[]>();

  readonly attendanceChange = output<Attendance>();
  readonly deleteAdicionalPlayer = output<Attendance>();

  protected showReasons = signal<boolean>(false);
  protected showReasonDescription = signal<boolean>(false);

  protected reasonManager = inject(ReasonManager);

  constructor() {
    effect(() => {
      if (!this.attendance().hasAttended) {
        this.showReasons.set(true);
        
        if (this.reasons().find(r => r.id === this.attendance().reasonId)?.requiresDescription) {
          this.showReasonDescription.set(true);
        }
      }
    });
  }

  protected hasAttendedChange(value: boolean) {
    if (value) {
      this.attendanceChange.emit({
        ...this.attendance(),
        hasAttended: value,
        reasonId: null,
        reasonDescription: null
      });

      setTimeout(() => {
        this.showReasonDescription.set(false);
      }, 150);

      setTimeout(() => {
        this.showReasons.set(false);
      }, 300);
    } else {
      this.showReasons.set(true);

      setTimeout(() => {
        const updateAttendance = {
          ...this.attendance(),
          hasAttended: value
        };
        this.attendanceChange.emit(updateAttendance);
      }, 0);
    }
  }

  protected reasonChange(event: string) {
    const reasonId = parseInt(event);
    if (typeof reasonId !== 'number') {
      console.error('Invalid reason id');
      return;
    }
    
    if (this.reasons().find(r => r.id === reasonId)?.requiresDescription) {
      this.showReasonDescription.set(true);

      setTimeout(() => {
        this.attendanceChange.emit({
          ...this.attendance(),
          reasonId: reasonId,
        });
      }, 0);
    } else {
      this.attendanceChange.emit({
          ...this.attendance(),
          reasonId: reasonId,
        });

      setTimeout(() => {
        this.showReasonDescription.set(false);
      }, 300);
    }
  }

  protected reasonDescriptionChange(event: string) {
    this.attendanceChange.emit({
      ...this.attendance(),
      reasonDescription: event
    });
  }
}
