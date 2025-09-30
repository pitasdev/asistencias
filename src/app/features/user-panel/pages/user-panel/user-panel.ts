import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Button } from "@/app/shared/components/button/button";
import { InfoModalManager } from '@/app/core/services/info-modal-manager/info-modal-manager';
import { CommonModule } from '@angular/common';
import { UserManager } from '@/app/domain/user/services/user-manager';
import { UserTeamsManager } from '@/app/domain/user-teams/services/user-teams-manager';
import { RoleManager } from '@/app/domain/role/services/role-manager';
import { AuthManager } from '@/app/domain/auth/services/auth-manager';

@Component({
  selector: 'app-user-panel',
  imports: [FormsModule, Button, CommonModule],
  templateUrl: './user-panel.html',
  styleUrl: './user-panel.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class UserPanel implements OnInit {
  protected editName = signal<boolean>(false);
  protected name = signal<string>('');
  protected actualPassword = signal<string>('');
  protected newPassword = signal<string>('');
  protected confirmPassword = signal<string>('');
  protected validActualPassword = signal<boolean>(true);
  protected validNewPassword = signal<boolean>(true);
  protected validConfirmPassword = signal<boolean>(true);

  protected readonly userManager = inject(UserManager);
  protected readonly userTeamsManager = inject(UserTeamsManager);
  protected readonly roleManager = inject(RoleManager);
  private readonly authManager = inject(AuthManager);
  private readonly infoModalManager = inject(InfoModalManager);

  ngOnInit(): void {
    this.name.set(this.userManager.activeUser()?.name!);
  }

  protected getTeamsString(): string {
    const joinTeams = this.userTeamsManager.activeUserUserTeams()?.teams.map(t => t.name).join(', ');
    return joinTeams ?? '';
  }

  protected async saveNewName(): Promise<void> {
    const response = await this.userManager.updateName(this.userManager.activeUser()!.id!, this.name());
    if (response.message) {
      this.editName.set(false);
    }
  }

  protected modifyName(): void {
    this.editName.set(!this.editName());

    if (!this.editName()) {
      this.name.set(this.userManager.activeUser()?.name!);
    }
  }

  protected async checkActualPassword(): Promise<boolean> {
    if (this.actualPassword().length === 0) {
      this.validActualPassword.set(true);
      return false;
    }

    const isValid = await this.userManager.checkPassword(this.userManager.activeUser()!.id!, this.actualPassword());
    isValid ? this.validActualPassword.set(true) : this.validActualPassword.set(false);
    return isValid;
  }

  protected checkNewPasswordLength(): boolean {
    if (this.newPassword().length >= 8) this.validNewPassword.set(true);
    return this.newPassword().length >= 8 ? true : false;
  }

  protected checkNewPassword(): boolean {
    if (!this.checkNewPasswordLength()) {
      this.validNewPassword.set(false);
      return false;
    }

    this.validNewPassword.set(true);
    return true;
  }

  protected checkNewPasswordDifferentThanOld(): boolean {
    return this.newPassword() === this.actualPassword() ? false : true;
  }

  protected checkConfirmPassword(): boolean {
    if (this.newPassword() !== this.confirmPassword()) {
      this.validConfirmPassword.set(false);
      return false;
    } 

    this.validConfirmPassword.set(true);
    return true;
  }

  protected async changePassword(): Promise<void> {
    if (!this.checkActualPassword()) {
      this.infoModalManager.warning('Contraseña actual incorrecta');
      return;
    }

    if (!this.checkNewPassword()) {
      this.infoModalManager.warning('La nueva contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (!this.checkNewPasswordDifferentThanOld()) {
      this.infoModalManager.warning('La nueva contraseña debe de ser diferente a la actual');
      return;
    }

    if (!this.checkConfirmPassword()) {
      this.infoModalManager.warning('La contraseña de confirmación no coincide con la nueva contraseña');
      return;
    }

    const response = await this.userManager.updatePassword(
      this.userManager.activeUser()!.id!, 
      this.actualPassword(), 
      this.newPassword()
    );

    if (response.isSuccess) {
      this.actualPassword.set('');
      this.newPassword.set('');
      this.confirmPassword.set('');
    }
  }

  protected logout(): void {
    this.authManager.logout();
  }
}
