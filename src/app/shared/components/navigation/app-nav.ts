import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, RouterLink, Router } from '@angular/router';
import { filter } from 'rxjs';
import { AuthManager } from '@/app/domain/auth/services/auth-manager';
import { ClubManager } from '@/app/domain/club/services/club-manager';
import { RoleManager } from '@/app/domain/role/services/role-manager';
import { UserManager } from '@/app/domain/user/services/user-manager';
import { UiAvatar } from '@/app/shared/components/ui/avatar';
import { UiIcon, IconName } from '@/app/shared/components/ui/icon';

interface NavItem {
  path: string;
  label: string;
  icon: IconName;
  exact?: boolean;
  adminOnly?: boolean;
}

@Component({
  selector: 'app-app-nav',
  imports: [RouterLink, UiIcon, UiAvatar],
  templateUrl: './app-nav.html'
})
export class AppNav implements OnInit {
  protected readonly userManager = inject(UserManager);
  protected readonly roleManager = inject(RoleManager);
  protected readonly clubManager = inject(ClubManager);
  private readonly authManager = inject(AuthManager);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly mainItems: NavItem[] = [
    { path: '/', label: 'Asistencias', icon: 'clock', exact: true },
    { path: '/estadisticas', label: 'Estadísticas', icon: 'chart-column' }
  ];

  protected readonly accountItems: NavItem[] = [
    { path: '/panel-de-usuario', label: 'Mi perfil', icon: 'user', exact: true }
  ];

  protected readonly adminItems: NavItem[] = [
    { path: '/panel-de-control', label: 'Panel de control', icon: 'layout-dashboard' }
  ];

  protected readonly mobileItems: NavItem[] = [
    { path: '/', label: 'Asistencias', icon: 'clock', exact: true },
    { path: '/estadisticas', label: 'Estadísticas', icon: 'chart-column' },
    { path: '/panel-de-control', label: 'Panel', icon: 'layout-dashboard', adminOnly: true },
    { path: '/panel-de-usuario', label: 'Perfil', icon: 'user', exact: true }
  ];

  protected url = signal<string>('');

  ngOnInit(): void {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(event => this.url.set((event as NavigationEnd).urlAfterRedirects));
  }

  protected get isAdmin(): boolean {
    const role = this.userManager.activeUser()?.role?.name;
    return role === 'admin' || role === 'super';
  }

  protected visibleMobileItems(): NavItem[] {
    return this.mobileItems.filter(item => !item.adminOnly || this.isAdmin);
  }

  protected isActive(item: NavItem): boolean {
    return item.exact ? this.url() === item.path : this.url().startsWith(item.path);
  }

  protected logout(): void {
    this.authManager.logout();
  }
}
