import { computed, inject, input, output } from '@angular/core';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Switch } from '@/app/shared/components/ui/switch';
import { UiAvatar } from '@/app/shared/components/ui/avatar';
import { UiBadge } from '@/app/shared/components/ui/badge';
import { UiField } from '@/app/shared/components/ui/field';
import { ReasonManager } from '@/app/domain/reason/services/reason-manager';
import { Attendance } from '@/app/shared/models/attendance/attendance.model';
import { Reason } from '@/app/shared/models/reason/reason.model';

@Component({
  selector: 'app-save-attendance-result',
  imports: [Switch, FormsModule, UiAvatar, UiBadge, UiField],
  templateUrl: './save-attendance-result.html',})
export class SaveAttendanceResult {
  readonly attendance = input.required<Attendance>();
  readonly reasons = input.required<Reason[]>();

  readonly attendanceChange = output<Attendance>();
  readonly deleteAdditionalPlayer = output<Attendance>();

  protected readonly reasonManager = inject(ReasonManager);

  protected readonly requiresDescription = computed(() => {
    const reasonId = this.attendance().reason?.id;
    return reasonId !== undefined && this.reasonManager.findReasonById(reasonId)?.requiresDescription === true;
  });

  protected hasAttendedChange(value: boolean): void {
    this.attendanceChange.emit(
      value
        ? { ...this.attendance(), hasAttended: value, reason: null, reasonDescription: null }
        : { ...this.attendance(), hasAttended: value }
    );
  }

  protected reasonChange(event: string): void {
    const reason = this.reasons().find(r => r.id === Number(event));
    if (!reason) return;

    this.attendanceChange.emit({
      ...this.attendance(),
      reason: { id: reason.id!, name: reason.name }
    });
  }

  protected reasonDescriptionChange(event: string): void {
    this.attendanceChange.emit({
      ...this.attendance(),
      reasonDescription: event
    });
  }
}
