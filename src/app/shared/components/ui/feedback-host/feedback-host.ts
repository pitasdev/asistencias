import { Component, inject } from '@angular/core';
import { FeedbackManager, FeedbackTone } from '@/app/core/services/feedback-manager/feedback-manager';
import { UiIcon, IconName } from '../icon';

const TONE_STYLES: Record<FeedbackTone, { icon: IconName; chip: string; bar: string }> = {
  success: { icon: 'check-circle', chip: 'bg-positive-soft text-positive', bar: 'bg-positive' },
  error: { icon: 'x-circle', chip: 'bg-negative-soft text-negative', bar: 'bg-negative' },
  warning: { icon: 'alert-triangle', chip: 'bg-caution-soft text-caution', bar: 'bg-caution' },
  info: { icon: 'info', chip: 'bg-info-soft text-info', bar: 'bg-info' }
};

/**
 * Host único de feedback de la app: diálogos modales en cola + pila de toasts.
 * Se monta una sola vez en la raíz (app.html).
 */
@Component({
  selector: 'app-ui-feedback-host',
  imports: [UiIcon],
  templateUrl: './feedback-host.html'
})
export class UiFeedbackHost {
  protected readonly feedback: FeedbackManager = inject(FeedbackManager);

  protected readonly tone = (value: FeedbackTone) => TONE_STYLES[value];
}
