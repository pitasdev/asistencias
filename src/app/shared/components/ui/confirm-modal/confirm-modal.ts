import { Component, computed, input, output, signal } from '@angular/core';
import { Modal } from '@/app/shared/components/ui/modal/modal';
import { Button, ButtonColor } from '@/app/shared/components/ui/button';
import { UiIcon, IconName } from '@/app/shared/components/ui/icon';

/**
 * Modal de confirmación. El texto del cuerpo se proyecta desde el consumidor
 * mediante <ng-content>: toda interpolación {{ }} se escapa automáticamente
 * por Angular, por lo que nunca se renderiza HTML dinámico (prevención de XSS).
 */
@Component({
  selector: 'app-confirm-modal',
  imports: [Modal, Button, UiIcon],
  templateUrl: './confirm-modal.html',})
export class ConfirmModal {
  title = input<string>('');
  buttonColor = input<ButtonColor>('primary');

  selectedOption = output<boolean>();
  closedModal = output<void>();

  protected closeModal = signal<boolean>(false);

  protected readonly icon = computed<IconName>(() =>
    this.buttonColor() === 'red' ? 'alert-triangle' : 'clipboard-check'
  );

  protected selectOption(confirmed: boolean): void {
    this.closeModal.set(true);
    this.selectedOption.emit(confirmed);
  }
}
