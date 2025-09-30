import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { Button } from "@/app/shared/components/button/button";
import { Modal } from "@/app/shared/components/modal/modal";
import { FormsModule } from '@angular/forms';
import { User } from '@/app/shared/models/user.model';
import { ResetPassword } from '@/app/shared/models/reset-password.model';
import { UserTeams } from '@/app/shared/models/user-teams.model';
import { Team } from '@/app/shared/models/team.model';
import { ConfirmModal } from "@/app/shared/components/confirm-modal/confirm-modal";
import { UserManager } from '@/app/domain/user/services/user-manager';
import { RoleManager } from '@/app/domain/role/services/role-manager';
import { UserTeamsManager } from '@/app/domain/user-teams/services/user-teams-manager';
import { TeamManager } from '@/app/domain/team/services/team-manager';
import { FindFilter } from "../../components/find-filter/find-filter";
import { InfoModalManager } from '@/app/core/services/info-modal-manager/info-modal-manager';

type ModalType = 'add' | 'edit' | 'resetPassword';

@Component({
  selector: 'app-users-management',
  imports: [Button, Modal, FormsModule, ConfirmModal, FindFilter],
  templateUrl: './users-management.html',
  styleUrl: './users-management.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class UsersManagement implements OnInit {
  protected userTeams = signal<UserTeams[]>([]);

  protected openAddModal = signal<boolean>(false);
  protected closeModal = signal<boolean>(false);
  protected modalTitle = signal<string>('');
  protected modalName = signal<string>('');
  protected modalUserName = signal<string>('');
  protected modalPassword = signal<string>('');
  protected modalPasswordConfirm = signal<string>('');
  protected modalRole = signal<number>(0);
  protected modalType = signal<ModalType>('add');
  protected selectedUser = signal<User | null>(null);

  protected openTeamsModal = signal<boolean>(false);
  protected closeTeamsModal = signal<boolean>(false);
  protected selectedUserTeams = signal<UserTeams | null>(null);
  private originalUserTeams: UserTeams | null = null;

  protected openDeleteModal = signal<boolean>(false);
  protected deleteModalText = signal<string>('');
  
  protected readonly userManager = inject(UserManager);
  protected readonly roleManager = inject(RoleManager);
  protected readonly userTeamsManager = inject(UserTeamsManager);
  protected readonly teamManager = inject(TeamManager);
  private readonly infoModalManager = inject(InfoModalManager);

  async ngOnInit(): Promise<void> {
    await this.userTeamsManager.getUserTeamsByClubId(this.userManager.activeUser()?.clubId!);
    this.userTeams.set(this.userTeamsManager.userTeams());
  }

  protected filterUsers(searchText: string): void {
    this.userTeams.set(
      this.userTeamsManager.userTeams()
        .filter(u => 
          u.user.name?.toLowerCase().includes(searchText?.toLowerCase()) ||
          u.user.username?.toLowerCase().includes(searchText?.toLowerCase())
        )
    );
  }

  protected getTeamsStringByUserId(userId: number): string {
    const teams = this.userTeamsManager.findUserTeamsByUserId(userId)?.teams;
    const joinTeams = teams?.map(t => t.name).join(', ');
    return joinTeams ?? '';
  }

  protected showEditUserModal(user: User): void {
    this.selectedUser.set(user);
    this.modalType.set('edit');
    this.modalTitle.set('Editar Usuario');
    this.modalName.set(user.name);
    this.modalUserName.set(user.username);
    this.modalRole.set(user.roleId);
    this.openAddModal.set(true);
  }

  protected showAddUserModal(): void {
    this.modalType.set('add');
    this.modalTitle.set('Añadir Usuario');
    this.modalRole.set(this.roleManager.findRoleByName('user')?.id!);
    this.openAddModal.set(true);
  }

  protected modalRoleChange(event: string): void {
    const roleId = parseInt(event);
    if (typeof roleId !== 'number') {
      console.error('Invalid role id');
      return;
    }

    this.modalRole.set(roleId);
  }

  protected checkFormatValidUsername(event: string): void {
    const validUsername = event.toLowerCase().replaceAll(' ', '');
    this.modalUserName.set(validUsername);
  }

  protected async addUser(): Promise<void> {
    if (!this.modalName() || !this.modalUserName() || !this.modalPassword() || !this.modalPasswordConfirm() || !this.modalRole()) {
      this.infoModalManager.warning('Faltan datos por rellenar');
      return;
    }

    if (this.modalPassword() !== this.modalPasswordConfirm()) {
      this.infoModalManager.warning('Las contraseñas no coinciden');
      return;
    }
    if (this.modalPassword().length < 8) {
      this.infoModalManager.warning('La contraseña debe tener al menos 8 caracteres');
      return;
    };

    const check = await this.userManager.checkAvailableUsername(this.modalUserName());
    if (!check.isAvailable) return;

    const user: User = {
      id: null,
      name: this.modalName(),
      username: this.modalUserName(),
      password: this.modalPassword(),
      hasDefaultPassword: true,
      roleId: this.modalRole(),
      clubId: this.userManager.activeUser()?.clubId!
    };

    await this.userManager.createUser(user);
    await this.userTeamsManager.getUserTeamsByClubId(this.userManager.activeUser()?.clubId!);
    this.userTeams.set(this.userTeamsManager.userTeams());

    this.closeModal.set(true);
  }

  protected async editUser(): Promise<void> {
    if (!this.modalName() || !this.modalRole()) {
      this.infoModalManager.warning('Faltan datos por rellenar');
      return;
    }
    
    const updatedUser: User = {
      ...this.selectedUser()!,
      name: this.modalName(),
      roleId: this.modalRole()
    };

    await this.userManager.updateUser(updatedUser);
    await this.userTeamsManager.getUserTeamsByClubId(this.userManager.activeUser()?.clubId!);

    this.closeModal.set(true);
  }

  protected showConfirmDeleteModal(user: User): void {
    this.selectedUser.set(user);
    this.deleteModalText.set(`¿Está seguro de que desea eliminar al usuario <strong>${user.name}</strong>?`);
    this.openDeleteModal.set(true);
  }

  protected confirmOptionSelected(event: boolean): void {
    if (!event) return;

    this.deleteUser(this.selectedUser()?.id!);
  }

  protected async deleteUser(userId: number): Promise<void> {
    await this.userManager.deleteUser(userId);
    this.userTeamsManager.deletePlayer(userId);
    this.userTeams.set(this.userTeamsManager.userTeams());
  }

  protected showResetPasswordModal(user: User): void {
    this.modalType.set('resetPassword');
    this.modalTitle.set('Restablecer contraseña');
    this.selectedUser.set(user);
    this.modalName.set(user.name);
    this.modalUserName.set(user.username);
    this.modalRole.set(user.roleId);
    this.openAddModal.set(true);
  }

  protected async restorePassword(): Promise<void> {
    if (this.modalPassword() !== this.modalPasswordConfirm()) {
      this.infoModalManager.warning('Las contraseñas no coinciden');
      return;
    }
    if (this.modalPassword().length < 8) {
      this.infoModalManager.warning('La contraseña debe tener al menos 8 caracteres');
      return;
    };

    const resetPassword: ResetPassword = {
      id: this.selectedUser()?.id!,
      newPassword: this.modalPassword(),
      hasDefaultPassword: true
    };

    await this.userManager.resetPassword(resetPassword);

    this.closeModal.set(true);
  }

  protected showTeamsModal(user: User): void {
    this.selectedUserTeams.set(this.userTeamsManager.findUserTeamsByUserId(user.id!));
    this.originalUserTeams = JSON.parse(JSON.stringify(this.selectedUserTeams()));
    this.openTeamsModal.set(true);
  }

  protected isSelectedTeam(teamId: number): boolean {
    if (this.selectedUserTeams()?.teams.find(t => t.id === teamId)) return true;
    else return false;
  }

  protected teamSelected(team: Team): void {
    const index = this.selectedUserTeams()?.teams.findIndex(t => t.id === team.id)!;
    if (index === -1) {
      this.selectedUserTeams()?.teams.push(team);
      this.selectedUserTeams()?.teams.sort((a, b) => a.order - b.order);
    } else {
      this.selectedUserTeams()?.teams.splice(index, 1);
    }
  }

  protected async saveTeams(): Promise<void> {
    await this.userTeamsManager.updateUserTeams(this.selectedUserTeams()!);
    this.closeTeamsModal.set(true);
  }

  protected cancelTeamsModal(): void {
    this.closeTeamsModal.set(true);
    this.userTeamsManager.replaceUserTeams(this.originalUserTeams!);
  }

  protected modalClosed(): void {
    this.openAddModal.set(false);
    this.selectedUser.set(null);
    this.modalTitle.set('');
    this.modalName.set('');
    this.modalUserName.set('');
    this.modalPassword.set('');
    this.modalPasswordConfirm.set('');
    this.closeModal.set(false);
  }

  protected teamsModalClosed(): void {
    this.openTeamsModal.set(false);
    this.selectedUserTeams.set(null);
    this.originalUserTeams = null;
    this.closeTeamsModal.set(false);
  }

  protected canEditUser(user: User): boolean {
    const superRoleId = this.roleManager.findRoleByName('super')?.id;
    const adminRoleId = this.roleManager.findRoleByName('admin')?.id;

    if (!superRoleId || !adminRoleId) return false;

    if (this.userManager.activeUser()?.roleId === superRoleId) return true;
    if (this.userManager.activeUser()?.roleId === adminRoleId && this.userManager.activeUser()?.id === user.id) return true;

    if (this.userManager.activeUser()?.roleId === adminRoleId) {
      if (user.roleId === adminRoleId || user.roleId === superRoleId) return false;
      else return true;
    }

    return false;
  }
}
