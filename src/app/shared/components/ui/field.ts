import { Component, input } from '@angular/core';

/**
 * Envoltorio de campo de formulario: etiqueta + control proyectado + error/ayuda.
 * El input/select se proyecta con <ng-content> para que las directivas de formularios
 * con señales ([formField]) se apliquen sobre el elemento real.
 */
@Component({
  selector: 'app-ui-field',
  template: `
    <div class="flex w-full flex-col">
      @if (label()) {
        <label [for]="fieldId()" class="field-label">
          {{ label() }}
          @if (required()) {
            <span class="text-negative" aria-hidden="true">*</span>
          }
        </label>
      }

      <ng-content />

      @if (error()) {
        <span class="field-error">{{ error() }}</span>
      } @else if (hint()) {
        <span class="field-hint">{{ hint() }}</span>
      }
    </div>
  `
})
export class UiField {
  readonly label = input<string>('');
  readonly fieldId = input<string>('');
  readonly required = input<boolean>(false);
  readonly error = input<string>('');
  readonly hint = input<string>('');
}
