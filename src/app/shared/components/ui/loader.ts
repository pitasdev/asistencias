import { Component } from '@angular/core';

@Component({
  selector: 'app-loader',
  template: `
    <div class="flex flex-col items-center justify-center gap-4 py-16" role="status" aria-label="Cargando">
      <span class="relative inline-flex size-12">
        <span class="absolute inset-0 animate-ping rounded-2xl bg-primary-600/20"></span>
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="relative size-12">
          <rect width="24" height="24" rx="7" class="fill-primary-600" />
          <path d="M6.5 12.5l3.4 3.4L17.5 8.8" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </span>
      <span class="text-sm font-medium text-slate-400">Cargando…</span>
    </div>
  `,
  host: {
    class: 'block'
  }
})
export class Loader {}
