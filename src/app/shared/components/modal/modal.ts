import { ChangeDetectionStrategy, Component, effect, ElementRef, input, output, signal, viewChild, OnInit, OnDestroy, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

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
export class Modal implements OnInit, OnDestroy {
  closeModal = input.required<boolean>();

  modalClosed = output<void>();

  private forceCloseModal = signal<boolean>(false);

  protected modal = viewChild<ElementRef>('modalBackground');

  private document = inject(DOCUMENT);

  private originalMarginRight = '';
  protected calculatedMarginRight = signal<string>('');

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

  ngOnInit(): void {
    this.originalMarginRight = this.document.body.style.marginRight;
    const scrollbarWidth = window.innerWidth - this.document.documentElement.clientWidth;
    this.calculatedMarginRight.set(`${scrollbarWidth}px`);

    this.document.body.style.marginRight = this.calculatedMarginRight();
    this.document.documentElement.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`);
    this.document.documentElement.style.overflow = 'hidden';
    this.document.documentElement.style.scrollbarGutter = 'auto';
  }

  protected checkClick(event: MouseEvent): void {
    if (this.modal() && this.modal()?.nativeElement === event.target) {
      this.forceCloseModal.set(true);
    }
  }

  ngOnDestroy(): void {
    this.document.body.style.marginRight = this.originalMarginRight;
    this.document.documentElement.style.removeProperty('--scrollbar-width');
    this.document.documentElement.style.overflow = '';
    this.document.documentElement.style.scrollbarGutter = '';
  }
}
