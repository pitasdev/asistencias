import { Component, effect, inject, input, output, signal } from '@angular/core';
import { Switch } from '@/app/shared/components/switch/switch';
import { FormsModule } from '@angular/forms';
import { Reason } from '@/app/shared/models/reason.model';
import { ReasonManager } from '@/app/domain/reason/services/reason-manager';
import { Attendance } from '@/app/shared/models/attendance.model';

@Component({
  selector: 'app-save-attendance-result',
  imports: [Switch, FormsModule],
  templateUrl: './save-attendance-result.html',
  styleUrl: './save-attendance-result.css'
})
export class SaveAttendanceResult {
  readonly attendance = input.required<Attendance>();
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
        
        if (this.reasons().find(r => r.id === this.attendance().reason?.id)?.requiresDescription) {
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
        reason: null,
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
    const reason = this.reasons().find(r => r.id === Number(event));
    if (!reason) return;
    
    if (reason?.requiresDescription) {
      this.showReasonDescription.set(true);

      setTimeout(() => {
        this.attendanceChange.emit({
          ...this.attendance(),
          reason: { id: reason.id!, name: reason.name },
        });
      }, 0);
    } else {
      this.attendanceChange.emit({
          ...this.attendance(),
          reason: { id: reason.id!, name: reason.name }
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
