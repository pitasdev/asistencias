import { ChangeDetectionStrategy, Component, inject, input, OnInit, output, signal } from '@angular/core';
import { Modal } from "../modal/modal";
import { Button, ButtonColor } from "../button/button";
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-confirm-modal',
  imports: [Modal, Button],
  templateUrl: './confirm-modal.html',
  styleUrl: './confirm-modal.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmModal implements OnInit {
  text = input.required<string>();
  title = input<string>();
  buttonColor = input<ButtonColor>('primary');

  selectedOption = output<boolean>();
  closedModal = output<void>();

  protected safeText = signal<SafeHtml>('');
  protected closeModal = signal<boolean>(false);
  
  private readonly sanitizer = inject(DomSanitizer);

  ngOnInit(): void {
    this.safeText.set(this.sanitizer.bypassSecurityTrustHtml(this.text()));
  }

  protected selectOption(event: boolean): void {
    this.selectedOption.emit(event);
    this.closeModal.set(true);
  }
}
