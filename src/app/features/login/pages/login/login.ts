import { ChangeDetectionStrategy, Component, ElementRef, inject, OnInit, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Button } from "@/app/shared/components/button/button";
import { Router } from '@angular/router';
import { InfoModalManager } from '@/app/core/services/info-modal-manager/info-modal-manager';
import { AuthManager } from '@/app/domain/auth/services/auth-manager';
import { UserManager } from '@/app/domain/user/services/user-manager';
import { LowerCasePipe } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [FormsModule, Button, LowerCasePipe],
  templateUrl: './login.html',
  styleUrl: './login.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(keydown)': 'checkKey($event)'
  }
})
export default class Login implements OnInit {
  protected username = signal<string>('');
  protected password = signal<string>('');
  protected showPassword = signal<boolean>(false);
  protected rememberMe = signal<boolean>(false);

  private rememberMeCheckbox = viewChild<ElementRef<HTMLInputElement>>('rememberMeCheckbox');

  private readonly authManager = inject(AuthManager);
  private readonly userManager = inject(UserManager);
  private readonly router = inject(Router);
  private readonly infoModalManager = inject(InfoModalManager);

  ngOnInit(): void {
    const token = localStorage.getItem('token') ?? sessionStorage.getItem('token');
    if (this.userManager.activeUser() || token) {
      this.router.navigate(['/']);
    }
  }

  protected async login(): Promise<void> {
    if (!this.username() || !this.password()) return;

    const login = await this.authManager.login(this.username(), this.password(), this.rememberMe());
    if (login) {
      this.router.navigate(['/']);
    } else {
      this.infoModalManager.error('Usuario o contraseña incorrectos');
    }
  }

  protected checkKey(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      if (this.rememberMeCheckbox()?.nativeElement === document.activeElement) {
        const checkboxElement = this.rememberMeCheckbox()?.nativeElement as HTMLInputElement;
        checkboxElement.checked = !checkboxElement.checked;
      } else {
        this.login();
      }
    }
  }
}
