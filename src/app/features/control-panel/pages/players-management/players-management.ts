import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { Button } from "@/app/shared/components/button/button";
import { Modal } from "@/app/shared/components/modal/modal";
import { FormsModule } from '@angular/forms';
import { Player } from '@/app/shared/models/player.model';
import { PlayerTeams } from '@/app/shared/models/player-teams.model';
import { Team } from '@/app/shared/models/team.model';
import { ConfirmModal } from "@/app/shared/components/confirm-modal/confirm-modal";
import { PlayerManager } from '@/app/domain/player/services/player-manager';
import { UserManager } from '@/app/domain/user/services/user-manager';
import { PlayerTeamsManager } from '@/app/domain/player-teams/services/player-teams-manager';
import { TeamManager } from '@/app/domain/team/services/team-manager';
import { FindFilter } from "../../components/find-filter/find-filter";

type ModalType = 'add' | 'edit';

@Component({
  selector: 'app-players-management',
  imports: [Button, Modal, FormsModule, ConfirmModal, FindFilter],
  templateUrl: './players-management.html',
  styleUrl: './players-management.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class PlayersManagement implements OnInit {
  protected playerTeams = signal<PlayerTeams[]>([]);

  protected openEditModal = signal<boolean>(false);
  protected closeEditModal = signal<boolean>(false);
  protected modalTitle = signal<string>('');
  protected modalName = signal<string>('');
  protected modalLastName = signal<string>('');
  protected modalType = signal<ModalType>('add');
  protected selectedPlayer = signal<Player | null>(null);

  protected openTeamsModal = signal<boolean>(false);
  protected closeTeamsModal = signal<boolean>(false);
  protected selectedPlayerTeams = signal<PlayerTeams | null>(null);
  private originalPlayerTeams: PlayerTeams | null = null;

  protected openDeleteModal = signal<boolean>(false);
  protected deleteModalText = signal<string>('');

  protected readonly playerManager = inject(PlayerManager);
  protected readonly userManager = inject(UserManager);
  protected readonly playerTeamsManager = inject(PlayerTeamsManager);
  protected readonly teamManager = inject(TeamManager);

  async ngOnInit(): Promise<void> {
    await this.playerTeamsManager.getPlayerTeamsByClubId(this.userManager.activeUser()?.clubId!);
    this.playerTeams.set(this.playerTeamsManager.playerTeams());
  }

  protected filterPlayers(searchText: string): void {
    this.playerTeams.set(
      this.playerTeamsManager.playerTeams()
        .filter(p => 
          p.player.name?.toLowerCase().includes(searchText?.toLowerCase()) || 
          p.player.lastName?.toLowerCase().includes(searchText?.toLowerCase())
      )
    );
  }

  protected getTeamsStringByPlayerId(playerId: number): string {
    const teams = this.playerTeamsManager.findPlayerTeamsByPlayerId(playerId)?.teams;
    const joinTeams = teams?.map(t => t.name).join(', ');
    return joinTeams ?? '';
  }

  protected showAddPlayerModal(): void {
    this.modalType.set('add');
    this.modalTitle.set('Añadir Jugador');
    this.openEditModal.set(true);
  }

  protected async addUser(): Promise<void> {
    if (!this.modalName() || !this.modalLastName()) return;

    const player: Player = {
      id: null,
      name: this.modalName().trim(),
      lastName: this.modalLastName().trim(),
      isActive: true,
      clubId: this.userManager.activeUser()?.clubId!
    };

    await this.playerManager.createPlayer(player);
    await this.playerTeamsManager.getPlayerTeamsByClubId(this.userManager.activeUser()?.clubId!);
    this.playerTeams.set(this.playerTeamsManager.playerTeams());

    this.closeEditModal.set(true);
  }

  protected showEditPlayerModal(player: Player): void {
    this.modalType.set('edit');
    this.modalTitle.set('Editar Jugador');
    this.modalName.set(player.name);
    this.modalLastName.set(player.lastName);
    this.selectedPlayer.set(player);
    this.openEditModal.set(true);
  }

  protected async editUser(): Promise<void> {
    if (!this.modalName() || !this.modalLastName()) return;

    const player: Player = {
      ...this.selectedPlayer()!,
      name: this.modalName().trim(),
      lastName: this.modalLastName().trim()
    };

    await this.playerManager.updatePlayer(player);
    await this.playerTeamsManager.getPlayerTeamsByClubId(this.userManager.activeUser()?.clubId!);

    this.closeEditModal.set(true);
  }

  protected showTeamsModal(player: Player): void {
    this.selectedPlayerTeams.set(this.playerTeamsManager.findPlayerTeamsByPlayerId(player.id!));
    this.originalPlayerTeams = JSON.parse(JSON.stringify(this.selectedPlayerTeams()));
    this.openTeamsModal.set(true);
  }

  protected isSelectedTeam(teamId: number): boolean {
    if (this.selectedPlayerTeams()?.teams.find(t => t.id === teamId)) return true;
    else return false;
  }

  protected teamSelected(team: Team): void {
    const index = this.selectedPlayerTeams()?.teams.findIndex(t => t.id === team.id)!;
    if (index === -1) {
      this.selectedPlayerTeams()?.teams.push(team);
      this.selectedPlayerTeams()?.teams.sort((a, b) => a.order - b.order);
    } else {
      this.selectedPlayerTeams()?.teams.splice(index, 1);
    }
  }

  protected async saveTeams(): Promise<void> {
    await this.playerTeamsManager.updatePlayerTeams(this.selectedPlayerTeams()!);
    this.closeTeamsModal.set(true);
  }

  protected showDeleteConfirmModal(playerId: number): void {
    this.selectedPlayer.set(this.playerTeamsManager.findPlayerTeamsByPlayerId(playerId)?.player!);
    this.deleteModalText.set(
      `Está seguro de eliminar al jugador <strong>${this.selectedPlayer()?.name} ${this.selectedPlayer()?.lastName}</strong>?`
    )
    this.openDeleteModal.set(true);
  }

  protected confirmOptionSelected(event: boolean): void {
    if (!event) return;

    this.deletePlayer(this.selectedPlayer()?.id!);
  }

  protected async deletePlayer(playerId: number): Promise<void> {
    await this.playerManager.deletePlayer(playerId);
    this.playerTeamsManager.deletePlayer(playerId);
    this.selectedPlayer.set(null);
    this.playerTeams.set(this.playerTeamsManager.playerTeams());
  }

  protected cancelTeamsModal(): void {
    this.closeTeamsModal.set(true);
    this.playerTeamsManager.replacePlayerTeams(this.originalPlayerTeams!);
  }

  protected modalClosed(): void {
    this.openEditModal.set(false);
    this.modalTitle.set('');
    this.modalName.set('');
    this.modalLastName.set('');
    this.selectedPlayer.set(null);
    this.closeEditModal.set(false);
  }

  protected teamsModalClosed(): void {
    this.openTeamsModal.set(false);
    this.selectedPlayerTeams.set(null);
    this.originalPlayerTeams = null;
    this.closeTeamsModal.set(false);
  }
}
