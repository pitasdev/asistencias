import { ChangeDetectionStrategy, Component, effect, ElementRef, input, output, signal, viewChild } from '@angular/core';

@Component({
  selector: 'app-modal',
  imports: [],
  templateUrl: './modal.html',
  styleUrl: './modal.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:click)': 'checkClick($event)'
  }
})
export class Modal {
  closeModal = input.required<boolean>();

  modalClosed = output<void>();

  private forceCloseModal = signal<boolean>(false);

  protected modal = viewChild<ElementRef>('modalBackground');

  constructor() {
    effect(() => {
      if (this.closeModal() || this.forceCloseModal()) {
        setTimeout(() => {
          if (this.modal()) {
            this.modal()!.nativeElement.style.opacity = '0';
          }
        }, 0);

        setTimeout(() => {
          this.modalClosed.emit();
        }, 300);
      }
    })
  }

  protected checkClick(event: MouseEvent): void {
    if (this.modal() && this.modal()?.nativeElement === event.target) {
      this.forceCloseModal.set(true);
    }
  }
}
