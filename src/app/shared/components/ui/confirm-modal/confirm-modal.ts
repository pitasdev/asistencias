import { Component, computed, inject, input, output, signal } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Modal } from '@/app/shared/components/ui/modal/modal';
import { Button, ButtonColor } from '@/app/shared/components/ui/button';
import { UiIcon, IconName } from '@/app/shared/components/ui/icon';

@Component({
  selector: 'app-confirm-modal',
  imports: [Modal, Button, UiIcon],
  templateUrl: './confirm-modal.html',})
export class ConfirmModal {
  text = input.required<string>();
  title = input<string>('');
  buttonColor = input<ButtonColor>('primary');

  selectedOption = output<boolean>();
  closedModal = output<void>();

  private readonly sanitizer = inject(DomSanitizer);

  protected closeModal = signal<boolean>(false);
  protected safeText = computed(() => this.sanitizer.bypassSecurityTrustHtml(this.text()));

  protected readonly icon = computed<IconName>(() =>
    this.buttonColor() === 'red' ? 'alert-triangle' : 'clipboard-check'
  );

  protected selectOption(confirmed: boolean): void {
    this.closeModal.set(true);
    this.selectedOption.emit(confirmed);
  }
}
