import { inject, Service } from '@angular/core';
import { FeedbackManager } from '@/app/core/services/feedback-manager/feedback-manager';

/**
 * Fachada de avisos usada por los managers de dominio e interceptores.
 * Mantiene la API histórica; internamente delega en FeedbackManager
 * (diálogos modales para success/error/warning/info, toasts para notify*).
 */
@Service()
export class InfoModalManager {
  private readonly feedback = inject(FeedbackManager);

  success(mensaje: string): void {
    this.feedback.showDialog('success', mensaje);
  }

  error(mensaje: string): void {
    this.feedback.showDialog('error', mensaje);
  }

  warning(mensaje: string): void {
    this.feedback.showDialog('warning', mensaje);
  }

  info(mensaje: string): void {
    this.feedback.showDialog('info', mensaje);
  }

  notifySuccess(mensaje: string): void {
    this.feedback.showToast('success', mensaje);
  }

  notifyError(mensaje: string): void {
    this.feedback.showToast('error', mensaje);
  }
}
