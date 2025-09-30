import { Team } from '@/app/shared/models/team.model';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Button, ButtonColor } from "@/app/shared/components/button/button";
import { AttendanceManager } from '@/app/domain/attendance/services/attendance-manager';
import { ConfirmModal } from "@/app/shared/components/confirm-modal/confirm-modal";
import { InfoModalManager } from '@/app/core/services/info-modal-manager/info-modal-manager';
import { dateFormatter } from '@/app/shared/utils/dateFormatter';
import { TeamManager } from '@/app/domain/team/services/team-manager';

type ModalType = 'modify' | 'delete';

@Component({
  selector: 'app-modify-attendances',
  imports: [FormsModule, Button, ConfirmModal],
  templateUrl: './modify-attendances.html',
  styleUrl: './modify-attendances.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class ModifyAttendances {
  protected selectedModifyTeam = signal<Team | null>(null);
  protected actualDateModify = signal<string>('');
  protected newDateModify = signal<string>('');
  protected selectedDeleteTeam = signal<Team | null>(null);
  protected deleteDate = signal<string>('');
  protected isOpenConfirmModal = signal<boolean>(false);
  protected confirmModalText = signal<string>('');
  protected confirmModalTitle = signal<string>('');
  protected confirmModalType = signal<ModalType | null>(null);
  protected confirmModalButtonColor = signal<ButtonColor>('primary');

  protected readonly attendanceManager = inject(AttendanceManager);
  protected readonly teamManager = inject(TeamManager);
  protected readonly infoModalManager = inject(InfoModalManager);

  protected selectedModifyTeamChange(teamId: string): void {
    const team = this.teamManager.findTeamById(Number(teamId));
    if (team) {
      this.selectedModifyTeam.set(team);
    } else {
      this.selectedModifyTeam.set(null);
    }
  }

  protected selectedDeleteTeamChange(teamId: string): void {
    const team = this.teamManager.findTeamById(Number(teamId));
    if (team) {
      this.selectedDeleteTeam.set(team);
    } else {
      this.selectedDeleteTeam.set(null);
    }
  }

  protected async modifyAttendances(isConfirmed: boolean): Promise<void> {
    if (!isConfirmed) return;
    if (!this.selectedModifyTeam() || !this.actualDateModify() || !this.newDateModify()) return; 

    const existingAttendancesActualDate = await this.attendanceManager.checkExistingAttendancesByTeamId(
      this.selectedModifyTeam()?.id!, 
      { selectedDate: this.actualDateModify() }
    );
    if (existingAttendancesActualDate.length === 0) {
      this.infoModalManager.warning(
        `No existen asistencias del <strong>${this.selectedModifyTeam()?.name}</strong>
        del día <strong>${dateFormatter(this.actualDateModify())}</strong>`
        );
      return;
    }

    const existingAttendancesNewDate = await this.attendanceManager.checkExistingAttendancesByTeamId(
      this.selectedModifyTeam()?.id!, 
      { selectedDate: this.newDateModify() }
    );
    if (existingAttendancesNewDate.length > 0) {
      this.infoModalManager.warning(
        `Ya existen asistencias del <strong>${this.selectedModifyTeam()?.name}</strong>
        del día <strong>${dateFormatter(this.newDateModify())}</strong>`
      );
      return;
    }

    await this.attendanceManager.getAttendancesByTeamIds([this.selectedModifyTeam()?.id!], { selectedDate: this.actualDateModify() });
    
    this.attendanceManager.attendances().forEach(a => {
      const attendance = {
        ...a,
        date: this.newDateModify()
      };

      this.attendanceManager.updateAttendance(attendance);
    });

    await this.attendanceManager.saveAttendances();
  }

  protected async deleteAttendances(isConfirmed: boolean): Promise<void> {
    if (!isConfirmed) return;
    if (!this.selectedDeleteTeam() || !this.deleteDate()) return;
    
    await this.attendanceManager.getAttendancesByTeamIds([this.selectedDeleteTeam()?.id!], { selectedDate: this.deleteDate() });
    await this.attendanceManager.deleteOnBulkAttendances();
  }

  protected openConfirmModal(modalType: ModalType): void {
    switch (modalType) {
      case 'modify':
        if (!this.selectedModifyTeam()) {
          this.infoModalManager.warning('Debe seleccionar el equipo a modificar las asistencias');
          return;
        } else if (!this.actualDateModify()) {
          this.infoModalManager.warning('Debe seleccionar la fecha actual a modificar');
          return;
        } else if (!this.newDateModify()) {
          this.infoModalManager.warning('Debe seleccionar la nueva fecha a modificar');
          return;
        }

        this.confirmModalText.set(
          `Está seguro de modificar las asistencias del <strong>${this.selectedModifyTeam()?.name}</strong> 
          del día <strong>${dateFormatter(this.actualDateModify())}</strong> 
          al día <strong> ${dateFormatter(this.newDateModify())}</strong>?`
        );
        this.confirmModalTitle.set('Modificar Asistencias');
        this.confirmModalType.set('modify');
        this.confirmModalButtonColor.set('primary');
        break;

      case 'delete':
        if (!this.selectedDeleteTeam()) {
          this.infoModalManager.warning('Debe seleccionar el equipo a eliminar las asistencias');
          return;
        } else if (!this.deleteDate()) {
          this.infoModalManager.warning('Debe seleccionar la fecha a eliminar');
          return;
        }

        this.confirmModalText.set(
          `Está seguro de eliminar las asistencias del <strong>${this.selectedDeleteTeam()?.name}</strong> 
          del día <strong>${dateFormatter(this.deleteDate())}</strong>?`
        );
        this.confirmModalTitle.set('Eliminar Asistencias');
        this.confirmModalType.set('delete');
        this.confirmModalButtonColor.set('red');
        break;
    }

    this.isOpenConfirmModal.set(true);
  }

  protected closeConfirmModal(event: boolean): void {
    this.isOpenConfirmModal.set(false);
    
    switch (this.confirmModalType()) {
      case 'modify':
        this.modifyAttendances(event);
        break;

      case 'delete':
        this.deleteAttendances(event);
        break;
    }

    this.confirmModalType.set(null);
  }
}
