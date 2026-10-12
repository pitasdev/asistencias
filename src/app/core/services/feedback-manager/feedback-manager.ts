import { Service, signal } from '@angular/core';

export type FeedbackTone = 'success' | 'error' | 'warning' | 'info';

/** Fragmento de mensaje con énfasis opcional. */
export interface FeedbackSegment {
  text: string;
  bold?: boolean;
}

/**
 * Un mensaje es texto plano o una secuencia de segmentos. Se renderiza siempre
 * por interpolación de Angular (nunca innerHTML), por lo que sigue sin permitirse HTML.
 */
export type FeedbackMessage = string | FeedbackSegment[];

export interface FeedbackDialog {
  tone: FeedbackTone;
  message: FeedbackMessage;
}

export interface FeedbackToast {
  id: number;
  tone: FeedbackTone;
  message: string;
  durationMs: number;
  leaving: boolean;
}

/**
 * Estado central de avisos de la interfaz.
 * - Diálogos modales (bloqueantes, en cola) para mensajes que exigen confirmación.
 * - Toasts no bloqueantes con auto-cierre para confirmaciones rápidas.
 */
@Service()
export class FeedbackManager {
  private readonly _dialog = signal<FeedbackDialog | null>(null);
  private readonly _toasts = signal<FeedbackToast[]>([]);

  readonly dialog = this._dialog.asReadonly();
  readonly toasts = this._toasts.asReadonly();

  private dialogQueue: FeedbackDialog[] = [];
  private toastId = 0;

  showDialog(tone: FeedbackTone, message: FeedbackMessage): void {
    this.dialogQueue.push({ tone, message });

    if (!this._dialog()) {
      this.nextDialog();
    }
  }

  closeDialog(): void {
    this._dialog.set(null);
    // Pequeño respiro entre diálogos encadenados para que la salida no solape la entrada.
    setTimeout(() => this.nextDialog(), 120);
  }

  showToast(tone: FeedbackTone, message: string, durationMs = 3400): void {
    const toast: FeedbackToast = {
      id: ++this.toastId,
      tone,
      message,
      durationMs,
      leaving: false
    };

    this._toasts.update(toasts => [...toasts.slice(-2), toast]);

    setTimeout(() => this.dismissToast(toast.id), durationMs);
  }

  dismissToast(id: number): void {
    const toast = this._toasts().find(t => t.id === id);
    if (!toast || toast.leaving) return;

    this._toasts.update(toasts =>
      toasts.map(t => t.id === id ? { ...t, leaving: true } : t)
    );

    setTimeout(() => {
      this._toasts.update(toasts => toasts.filter(t => t.id !== id));
    }, 190);
  }

  private nextDialog(): void {
    const next = this.dialogQueue.shift();
    if (next) {
      this._dialog.set(next);
    }
  }
}
