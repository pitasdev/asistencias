import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { AttendancesFilter } from '@/app/features/attendance/components/filter-attendances/attendances-filter';
import { Attendance } from '@/app/shared/models/attendance.model';
import { AttendanceManager } from '@/app/domain/attendance/services/attendance-manager';
import { Team } from '@/app/shared/models/team.model';
import { AttendanceQueryFilters } from '@/app/shared/models/attendance-query-filters.model';
import { AttendanceType } from '@/app/shared/models/attendance-type.model';
import { SaveAttendanceResult } from '@/app/features/attendance/components/save-attendance-result/save-attendance-result';
import { Button } from "@/app/shared/components/button/button";
import { FormsModule } from '@angular/forms';
import { InfoModalManager } from '@/app/core/services/info-modal-manager/info-modal-manager';
import { TeamManager } from '@/app/domain/team/services/team-manager';
import { PlayerManager } from '@/app/domain/player/services/player-manager';
import { AttendanceTypeManager } from '@/app/domain/attendance-type/services/attendance-type-manager';
import { ReasonManager } from '@/app/domain/reason/services/reason-manager';

@Component({
  selector: 'app-attendances',
  imports: [AttendancesFilter, SaveAttendanceResult, Button, FormsModule],
  templateUrl: './attendances.html',
  styleUrl: './attendances.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex flex-col gap-4'
  }
})
export default class Attendances implements OnInit {
  protected selectedTeam = signal<Team | null>(null);
  protected selectedDate = signal<string>('');
  protected selectedAttendanceType = signal<AttendanceType>({ id: null, name: '', order: 0, isActive: true, clubId: 0 });

  protected addAdicionalPlayer = signal<boolean>(false);
  protected adicionalTeam = signal<Team | null>(null);
  
  protected readonly attendanceManager = inject(AttendanceManager);
  protected readonly teamManager = inject(TeamManager);
  protected readonly playerManager = inject(PlayerManager);
  protected readonly attendanceTypeManager = inject(AttendanceTypeManager);
  protected readonly reasonManager = inject(ReasonManager);
  protected readonly infoModalManager = inject(InfoModalManager);

  ngOnInit(): void {
    this.checkSelectedDay();
  }

  private checkSelectedDay(): void {
    const attendanceId = this.attendanceManager.attendances()[0]?.id;
    if (attendanceId) {
      const attendanceType = this.attendanceTypeManager.findAttendanceTypeById(this.attendanceManager.attendances()[0].attendanceTypeId);
      if (attendanceType === null) return;
      this.selectedAttendanceType.set(attendanceType);
    } else {
      if (new Date(this.selectedDate()).getDay() === 6 || new Date(this.selectedDate()).getDay() === 0) {
        this.selectedAttendanceType.set(this.attendanceTypeManager.attendanceTypes()[1]);
      } else {
        this.selectedAttendanceType.set(this.attendanceTypeManager.attendanceTypes()[0]);
      }

      this.attendanceTypeChange(this.selectedAttendanceType());
    }
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
        attendanceTypeId: attendanceType.id!
      });
    });
  }

  protected async getAttendancesByTeamId(teamId: number): Promise<void> {
    const filters: AttendanceQueryFilters = {
      selectedDate: this.selectedDate()
    };
    
    await this.attendanceManager.getAttendancesByTeamIds([teamId], filters);
    
    if (this.attendanceManager.attendances().length === 0) {
      const attendances = await this.attendanceManager.loadDefaultAttendances(
        teamId, 
        this.selectedDate(), 
        this.attendanceTypeManager.attendanceTypes()[0].id!
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
      if (attendance.reasonId === null) {
        const player = this.playerManager.findPlayerById(attendance.playerId!);
        this.infoModalManager.warning(
          `Debe seleccionar una razón por la que no ha asistido <strong>${player?.name} ${player?.lastName}</strong>`
        );
        return false;
      }
    }

    const requiresDescriptionAttendances = hasAttendedFalseAttendances.filter(a => this.reasonManager.findReasonById(a.reasonId!)?.requiresDescription);
    for (const attendance of requiresDescriptionAttendances) {
      if (attendance.reasonDescription === null || attendance.reasonDescription === '') {
        const player = this.playerManager.findPlayerById(attendance.playerId!);
        this.infoModalManager.warning(
          `Debe indicar la razón por la que no ha asistido <strong>${player?.name} ${player?.lastName}</strong>`
        );
        return false;
      }
    }

    return true;
  }

  protected async saveAttendances(): Promise<void> {
    if (!this.checkValidAttendances()) return;

    await this.attendanceManager.saveAttendances();
    this.addAdicionalPlayer.set(false);
    this.adicionalTeam.set(null);
  }

  protected adicionalTeamChange(event: string): void {
    const team = this.teamManager.findTeamById(Number(event));
    this.adicionalTeam.set(team);
    if (team === null) {
      this.addAdicionalPlayer.set(false);
      return;
    };

    this.playerManager.getAdicionalPlayersByTeamId(team.id!);
  }

  protected adicionalPlayerSelected(event: Event): void {
    const playerId = Number((event.target as HTMLSelectElement).value);
    if (!playerId) return;

    if (this.attendanceManager.attendances().some(a => a.playerId === playerId)) {
      this.infoModalManager.warning('Ya existe una asistencia para este jugador');
      return;
    }
    
    const player = this.playerManager.findAdicionalPlayerById(playerId)!;
    this.attendanceManager.addAdicionalPlayerToAttendances(
      player, 
      this.selectedDate(), 
      this.selectedAttendanceType().id!,
      this.selectedTeam()?.id!
    );
    
    this.addAdicionalPlayer.set(false);
    this.adicionalTeam.set(null);
  }

  protected deleteAdicionalPlayer(attendance: Attendance): void {
    this.attendanceManager.deleteAdicionalPlayer(attendance);
  }
}
