import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { AttendancesFilter } from '@/app/features/attendance/components/filter-attendances/attendances-filter';
import { AttendanceManager } from '@/app/domain/attendance/services/attendance-manager';
import { AttendanceQueryFilters } from '@/app/shared/models/attendance/attendance-query-filters.model';
import { SaveAttendanceResult } from '@/app/features/attendance/components/save-attendance-result/save-attendance-result';
import { Button } from "@/app/shared/components/ui/button";
import { FormsModule } from '@angular/forms';
import { InfoModalManager } from '@/app/core/services/info-modal-manager/info-modal-manager';
import { TeamManager } from '@/app/domain/team/services/team-manager';
import { PlayerManager } from '@/app/domain/player/services/player-manager';
import { AttendanceTypeManager } from '@/app/domain/attendance-type/services/attendance-type-manager';
import { ReasonManager } from '@/app/domain/reason/services/reason-manager';
import { Modal } from '@/app/shared/components/ui/modal/modal';
import { UiEmptyState } from '@/app/shared/components/ui/empty-state';
import { UiIcon } from '@/app/shared/components/ui/icon';
import { UiPageHeader } from '@/app/shared/components/ui/page-header';
import { Attendance } from '@/app/shared/models/attendance/attendance.model';
import { AttendanceType } from '@/app/shared/models/attendance-type/attendance-type.model';
import { Team } from '@/app/shared/models/team/team.model';

@Component({
  selector: 'app-attendances',
  imports: [AttendancesFilter, SaveAttendanceResult, Button, FormsModule, Modal, UiPageHeader, UiIcon, UiEmptyState],
  templateUrl: './attendances.html',
  host: {
    class: 'flex flex-col gap-4'
  }
})
export default class Attendances implements OnInit {
  protected readonly attendanceManager = inject(AttendanceManager);
  protected readonly teamManager = inject(TeamManager);
  protected readonly playerManager = inject(PlayerManager);
  protected readonly attendanceTypeManager = inject(AttendanceTypeManager);
  protected readonly reasonManager = inject(ReasonManager);
  protected readonly infoModalManager = inject(InfoModalManager);

  protected selectedTeam = signal<Team | null>(null);
  protected selectedDate = signal<string>(new Date().toISOString().split('T')[0]);
  protected selectedAttendanceType = signal<AttendanceType>({ id: null, name: '', order: 0, isActive: true, club: { id: 0, name: '' } });

  protected disabledButton = signal<boolean>(false);
  protected addAdditionalPlayer = signal<boolean>(false);
  protected additionalTeam = signal<Team | null>(null);

  protected showAdditionalPlayersModal = signal<boolean>(false);
  protected closeModalAdditionalPlayers = signal<boolean>(false);
  protected selectedAdditionalPlayerIds = signal<number[]>([]);

  protected attendancePlayerIdsSet = computed(() => new Set(this.attendanceManager.attendances().map(a => a.player.id)));

  protected presentCount = computed(() => this.attendanceManager.attendances().filter(a => a.hasAttended).length);
  protected absentCount = computed(() => this.attendanceManager.attendances().length - this.presentCount());
  protected hasInvalidAttendances = computed(() => {
    for (const a of this.attendanceManager.attendances()) {
      if (!a.hasAttended && a.reason === null) return true;
      if (!a.hasAttended && a.reason) {
        const reason = this.reasonManager.findReasonById(a.reason.id);
        if (reason?.requiresDescription && (!a.reasonDescription || a.reasonDescription.trim() === '')) return true;
      }
    }
    return false;
  });
  protected isSaveDisabled = computed(() => this.disabledButton() || this.hasInvalidAttendances());

  ngOnInit(): void {
    this.checkSelectedDay();
  }

  protected async teamsChange(team: Team | null): Promise<void> {
    if (team === null) {
      this.selectedTeam.set(null);
      return;
    }

    this.selectedTeam.set(this.teamManager.userTeams().find(t => t.id === team.id)!);
    await this.getAttendancesByTeamId(team.id!);
    this.checkSelectedDay();
  }

  protected async dateChange(date: string): Promise<void> {
    this.selectedDate.set(date);
    
    if (this.selectedTeam() === null) return;
    
    await this.getAttendancesByTeamId(this.selectedTeam()?.id!);
    this.checkSelectedDay();
  }

  protected attendanceTypeChange(attendanceType: AttendanceType): void {
    this.selectedAttendanceType.set(attendanceType);
    this.attendanceManager.attendances().forEach(a => {
      this.attendanceManager.updateAttendance({
        ...a,
        attendanceType: { ...a.attendanceType, id: attendanceType.id! }
      });
    });
  }

  protected async getAttendancesByTeamId(teamId: number): Promise<void> {
    const filters: AttendanceQueryFilters = {
      selectedDate: this.selectedDate()
    };
    
    const team = this.teamManager.findTeamById(teamId);
    if (team === null) return;

    await this.attendanceManager.getAttendancesByTeamIds([teamId], filters);
    
    if (this.attendanceManager.attendances().length === 0) {
      const attendances = await this.attendanceManager.loadDefaultAttendances(
        team, 
        this.selectedDate(), 
        this.attendanceTypeManager.attendanceTypes()[0]
      );
      this.attendanceManager.setDefaultAttendances(attendances);
    }
  }

  protected onAttendanceChange(attendance: Attendance): void {
    this.attendanceManager.updateAttendance(attendance);
  }

  private checkValidAttendances(): boolean {
    const hasAttendedFalseAttendances = this.attendanceManager.attendances().filter(a => !a.hasAttended);
    for (const attendance of hasAttendedFalseAttendances) {
      if (attendance.reason === null) {
        const player = this.playerManager.findPlayerById(attendance.player.id);
        this.infoModalManager.warning(
          `Debe seleccionar una razón por la que no ha asistido <strong>${player?.name} ${player?.lastName}</strong>`
        );
        return false;
      }
    }

    const requiresDescriptionAttendances = hasAttendedFalseAttendances.filter(a => this.reasonManager.findReasonById(a.reason!.id)?.requiresDescription);
    for (const attendance of requiresDescriptionAttendances) {
      if (attendance.reasonDescription === null || attendance.reasonDescription === '') {
        const player = this.playerManager.findPlayerById(attendance.player.id);
        this.infoModalManager.warning(
          `Debe indicar la razón por la que no ha asistido <strong>${player?.name} ${player?.lastName}</strong>`
        );
        return false;
      }
    }

    return true;
  }

  protected async saveAttendances(): Promise<void> {
    this.disabledButton.set(true);

    if (!this.checkValidAttendances()) {
      this.disabledButton.set(false);
      return;
    };

    await this.attendanceManager.saveAttendances();
    this.addAdditionalPlayer.set(false);
    this.additionalTeam.set(null);
    this.disabledButton.set(false);
  }

  protected additionalTeamChange(event: string): void {
    const team = this.teamManager.findTeamById(Number(event));
    this.additionalTeam.set(team);
    if (team === null) {
      this.closeAdditionalModal();
      this.showAdditionalPlayersModal.set(false);
      return;
    };

    this.playerManager.getAdditionalPlayersByTeamId(team.id!);
    this.selectedAdditionalPlayerIds.set([]);
    this.showAdditionalPlayersModal.set(true);
    this.closeModalAdditionalPlayers.set(false);
  }

  protected toggleAdditionalPlayer(playerId: number): void {
    const currentIds = this.selectedAdditionalPlayerIds();
    if (currentIds.includes(playerId)) {
      this.selectedAdditionalPlayerIds.set(currentIds.filter(id => id !== playerId));
    } else {
      this.selectedAdditionalPlayerIds.set([...currentIds, playerId]);
    }
  }

  protected isSelectedAdditional(playerId: number): boolean {
    return this.selectedAdditionalPlayerIds().includes(playerId);
  }

  protected confirmAdditionalPlayers(): void {
    if (this.selectedAdditionalPlayerIds().length === 0) {
      this.closeAdditionalModal();
      return;
    }

    for (const playerId of this.selectedAdditionalPlayerIds()) {
      if (this.attendancePlayerIdsSet().has(playerId)) {
        continue;
      }
      
      const player = this.playerManager.findAdditionalPlayerById(playerId)!;
      this.attendanceManager.addAdditionalPlayerToAttendances(
        player, 
        this.selectedDate(), 
        this.selectedAttendanceType(),
        this.selectedTeam()!
      );
    }
    
    this.closeAdditionalModal();
  }

  protected cancelAdditionalPlayers(): void {
    this.closeAdditionalModal();
  }

  protected onAdditionalPlayersModalClosed(): void {
    this.showAdditionalPlayersModal.set(false);
    this.addAdditionalPlayer.set(false);
    this.additionalTeam.set(null);
    this.selectedAdditionalPlayerIds.set([]);
  }

  protected deleteAdditionalPlayer(attendance: Attendance): void {
    this.attendanceManager.deleteAdditionalPlayer(attendance);
  }

  private closeAdditionalModal(): void {
    this.closeModalAdditionalPlayers.set(true);
    this.addAdditionalPlayer.set(false);
    this.additionalTeam.set(null);
    this.selectedAdditionalPlayerIds.set([]);
  }

  private checkSelectedDay(): void {
    const attendanceId = this.attendanceManager.attendances()[0]?.id;
    if (attendanceId) {
      const attendanceType = this.attendanceTypeManager.findAttendanceTypeById(this.attendanceManager.attendances()[0].attendanceType.id);
      if (attendanceType === null) return;
      this.selectedAttendanceType.set(attendanceType);
    } else {
      const dateParts = this.selectedDate().split('-');
      const date = new Date(Number(dateParts[0]), Number(dateParts[1]) - 1, Number(dateParts[2]));
      if (date.getDay() === 6 || date.getDay() === 0) {
        this.selectedAttendanceType.set(this.attendanceTypeManager.attendanceTypes()[1]);
      } else {
        this.selectedAttendanceType.set(this.attendanceTypeManager.attendanceTypes()[0]);
      }

      this.attendanceTypeChange(this.selectedAttendanceType());
    }
  }
}
