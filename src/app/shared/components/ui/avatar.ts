import { Component, computed, input } from '@angular/core';

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

/** Avatar con iniciales y color derivado del nombre (consistente entre sesiones). */
@Component({
  selector: 'app-ui-avatar',
  template: `
    <span
      class="inline-flex select-none items-center justify-center rounded-full font-bold tracking-tight"
      [class]="sizeClass() + ' ' + paletteClass()"
      [attr.aria-hidden]="true"
    >
      {{ initials() }}
    </span>
  `,
  host: {
    class: 'inline-flex shrink-0'
  }
})
export class UiAvatar {
  readonly name = input.required<string>();
  readonly lastName = input<string>('');
  readonly size = input<AvatarSize>('md');

  protected readonly initials = computed(() => {
    const first = this.name()?.trim().charAt(0) ?? '';
    const last = this.lastName()?.trim().charAt(0) ?? '';
    return (first + last).toUpperCase() || '·';
  });

  protected readonly sizeClass = computed(() => {
    switch (this.size()) {
      case 'sm': return 'size-8 text-xs';
      case 'md': return 'size-10 text-sm';
      case 'lg': return 'size-14 text-lg';
      case 'xl': return 'size-20 text-2xl';
    }
  });

  /** Paleta fija basada en el nombre para que cada persona tenga siempre su color. */
  protected readonly paletteClass = computed(() => {
    const palettes = [
      'bg-primary-50 text-primary-700',
      'bg-emerald-50 text-emerald-700',
      'bg-violet-50 text-violet-700',
      'bg-amber-50 text-amber-700',
      'bg-sky-50 text-sky-700',
      'bg-teal-50 text-teal-700',
    ];

    const source = (this.name() + this.lastName()).toLowerCase();
    let hash = 0;
    for (let i = 0; i < source.length; i++) {
      hash = (hash * 31 + source.charCodeAt(i)) >>> 0;
    }

    return palettes[hash % palettes.length];
  });
}
