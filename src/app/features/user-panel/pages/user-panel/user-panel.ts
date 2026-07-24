import { Component, inject, OnInit, signal, DOCUMENT } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { form, FormField, required, minLength, validate } from '@angular/forms/signals';
import { Button } from "@/app/shared/components/button/button";
import { InfoModalManager } from '@/app/core/services/info-modal-manager/info-modal-manager';
import { UserManager } from '@/app/domain/user/services/user-manager';
import { UserTeamsManager } from '@/app/domain/user-teams/services/user-teams-manager';
import { RoleManager } from '@/app/domain/role/services/role-manager';
import { AuthManager } from '@/app/domain/auth/services/auth-manager';
import { ToggleContent } from "@/app/shared/components/toggle-content/toggle-content";
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-user-panel',
  imports: [FormsModule, Button, ToggleContent, FormField, NgClass],
  templateUrl: './user-panel.html',
  styleUrl: './user-panel.css'
})
export default class UserPanel implements OnInit {
  protected editName = signal<boolean>(false);
  protected name = signal<string>('');
  protected requiredPasswordChange = signal<boolean>(false);
  protected validActualPassword = signal<boolean>(true);

  protected passwordModel = signal({
    actualPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  protected passwordForm = form(this.passwordModel, (schemaPath) => {
    required(schemaPath.actualPassword, { message: 'Contraseña actual requerida' });

    required(schemaPath.newPassword, { message: 'Nueva contraseña requerida' });
    minLength(schemaPath.newPassword, 8, { message: 'Debe contener mínimo 8 caracteres' });

    required(schemaPath.confirmPassword, { message: 'Confirmación requerida' });
    validate(schemaPath.confirmPassword, ({ value, valueOf }) => {
      if (value() !== valueOf(schemaPath.newPassword)) {
        return { kind: 'passwordMismatch', message: 'Las contraseñas no coinciden' };
      }
      return null;
    });
  });

  protected readonly userManager = inject(UserManager);
  protected readonly userTeamsManager = inject(UserTeamsManager);
  protected readonly roleManager = inject(RoleManager);
  private readonly authManager = inject(AuthManager);
  private readonly infoModalManager = inject(InfoModalManager);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly document = inject(DOCUMENT);

  ngOnInit(): void {
    this.name.set(this.userManager.activeUser()?.name!);
    
    if (this.activatedRoute.snapshot.queryParamMap.get('requiredPasswordChange') === 'true') {
      this.requiredPasswordChange.set(true);
    }
  }

  protected getTeamsString(): string {
    const joinTeams = this.userTeamsManager.activeUserUserTeams()?.teams.map(t => t.name).join(', ');
    return joinTeams ?? '';
  }

  protected async saveNewName(): Promise<void> {
    const response = await this.userManager.updateName(this.userManager.activeUser()!.id!, this.name());
    if (response) {
      this.editName.set(false);
    }
  }

  protected modifyName(): void {
    this.editName.set(!this.editName());

    if (!this.editName()) {
      this.name.set(this.userManager.activeUser()?.name!);
    }
  }

  protected async checkActualPassword(): Promise<void> {
    const actualPassword = this.passwordForm.actualPassword().value();

    if (!actualPassword) {
      this.validActualPassword.set(true);
      return;
    }

    const isValid = await this.userManager.checkPassword(this.userManager.activeUser()!.id!, actualPassword);
    this.validActualPassword.set(isValid);
  }

  protected async changePassword(): Promise<void> {
    this.passwordForm().markAsTouched();
    if (this.passwordForm().invalid()) return;
    
    const { actualPassword, newPassword } = this.passwordModel();
    
    await this.checkActualPassword();
    if (!this.validActualPassword()) {
      this.infoModalManager.warning('Contraseña actual incorrecta');
      return;
    }
    
    if (newPassword === actualPassword) {
      this.infoModalManager.warning('La nueva contraseña debe de ser diferente a la actual');
      return;
    }

    const response = await this.userManager.updatePassword(
      this.userManager.activeUser()!.id!, 
      actualPassword, 
      newPassword
    );
    
    if (response) {
      this.passwordForm().reset({ actualPassword: '', newPassword: '', confirmPassword: '' });
      (this.document.activeElement as HTMLElement)?.blur();
    }
  }

  protected logout(): void {
    this.authManager.logout();
  }
}
