import { Component, DestroyRef, DOCUMENT, effect, ElementRef, inject, input, OnDestroy, OnInit, output, signal, viewChild } from '@angular/core';
import { UiIcon } from '@/app/shared/components/ui/icon';

/**
 * Contenedor modal responsive con animate.enter / animate.leave:
 * - Móvil: bottom sheet con separación inferior (p-4 + mb-4).
 * - Desktop (lg+): diálogo centrado.
 *
 * API: [closeModal] opcional para compatibilidad (emite cierre),
 *      (modalClosed) se emite en backdrop/× y cuando closeModal → true.
 */
@Component({
  selector: 'app-modal',
  imports: [UiIcon],
  templateUrl: './modal.html',
  host: {
    '(document:click)': 'checkClick($event)'
  }
})
export class Modal implements OnInit, OnDestroy {
  /** Compatibilidad: cuando pasa a true se solicita cierre */
  closeModal = input<boolean>(false);
  dismissable = input<boolean>(true);

  modalClosed = output<void>();

  protected modal = viewChild<ElementRef>('modalBackground');

  private document = inject(DOCUMENT);
  private destroyRef = inject(DestroyRef);

  protected visible = signal(true);

  private originalMarginRight = '';
  private originalOverflow = '';
  private originalScrollbarGutter = '';
  private closeTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.destroyRef.onDestroy(() => {
      if (this.closeTimer) clearTimeout(this.closeTimer);
    });

    effect(() => {
      if (this.closeModal() && this.visible()) {
        this.startLeave();
      }
    });
  }

  ngOnInit(): void {
    this.originalMarginRight = this.document.body.style.marginRight;
    this.originalOverflow = this.document.documentElement.style.overflow;
    this.originalScrollbarGutter = this.document.documentElement.style.scrollbarGutter;

    const scrollbarWidth = window.innerWidth - this.document.documentElement.clientWidth;
    if (scrollbarWidth > 0) {
      this.document.body.style.marginRight = `${scrollbarWidth}px`;
    }
    this.document.documentElement.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`);
    this.document.documentElement.style.overflow = 'hidden';
    // Mantener gutter estable evita el salto de ancho del modal
    this.document.documentElement.style.scrollbarGutter = 'stable';
  }

  ngOnDestroy(): void {
    this.document.body.style.marginRight = this.originalMarginRight;
    this.document.documentElement.style.removeProperty('--scrollbar-width');
    this.document.documentElement.style.overflow = this.originalOverflow;
    this.document.documentElement.style.scrollbarGutter = this.originalScrollbarGutter;
  }

  protected checkClick(event: MouseEvent): void {
    if (!this.dismissable()) return;
    if (this.modal() && this.modal()?.nativeElement === event.target) {
      this.startLeave();
    }
  }

  protected requestClose(): void {
    if (!this.dismissable()) return;
    this.startLeave();
  }

  private startLeave(): void {
    if (!this.visible()) return;
    this.visible.set(false);
    this.closeTimer = setTimeout(() => {
      this.modalClosed.emit();
      this.closeTimer = null;
    }, 300);
  }
}
