import { Routes } from '@angular/router';
import { appDataResolver } from './shared/resolvers/app-data/app-data-resolver';
import { checkTokenGuard } from './shared/guards/check-token/check-token-guard';
import { checkIsAdminGuard } from './shared/guards/check-is-admin/check-is-admin-guard';
import { checkDefaultPasswordGuard } from './shared/guards/check-default-password/check-default-password-guard';
import { checkDefaultPasswordChildGuard } from './shared/guards/check-default-password/check-default-password-child-guard';

export const routes: Routes = [
  {
    path: '', 
    canActivateChild: [checkTokenGuard],
    resolve: { appData: appDataResolver },
    children: [
      {
        path: '',
        title: 'Asistencias',
        loadComponent: () => import('./features/attendance/pages/attendances/attendances'),
        canActivate: [checkDefaultPasswordGuard]
      },
      {
        path: 'panel-de-usuario',
        title: 'Panel de usuario',
        loadComponent: () => import('./features/user-panel/pages/user-panel/user-panel')
      },
      {
        path: 'panel-de-control',
        canActivateChild: [checkIsAdminGuard, checkDefaultPasswordChildGuard],
        children: [
          {
            path: '',
            title: 'Panel de control',
            loadComponent: () => import('./features/control-panel/pages/control-panel/control-panel')
          },
          {
            path: 'control-de-asistencias',
            title: 'Control de asistencias',
            loadComponent: () => import('./features/control-panel/pages/attendances-control/attendances-control')
          },
          {
            path: 'control-del-jugador',
            title: 'Control del jugador',
            loadComponent: () => import('./features/control-panel/pages/player-control/player-control')
          },
          {
            path: 'modificar-asistencias',
            title: 'Modificar asistencias',
            loadComponent: () => import('./features/control-panel/pages/modify-attendances/modify-attendances')
          },
          {
            path: 'gestion-de-jugadores',
            title: 'Gestión de jugadores',
            loadComponent: () => import('./features/control-panel/pages/players-management/players-management')
          },
          {
            path: 'gestion-de-equipos',
            title: 'Gestión de equipos',
            loadComponent: () => import('./features/control-panel/pages/teams-management/teams-management')
          },
          {
            path: 'gestion-de-usuarios',
            title: 'Gestión de usuarios',
            loadComponent: () => import('./features/control-panel/pages/users-management/users-management')
          }
        ]
      }
    ]
  },
  {
    path: 'login',
    title: 'Login',
    loadComponent: () => import('./features/login/pages/login/login')
  },
  {
    path: '**',
    pathMatch: 'full',
    redirectTo: ''
  }
];
