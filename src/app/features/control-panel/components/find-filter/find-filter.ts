import { Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Button } from "@/app/shared/components/ui/button";
import { UiIcon } from '@/app/shared/components/ui/icon';

@Component({
  selector: 'app-find-filter',
  imports: [FormsModule, Button, UiIcon],
  templateUrl: './find-filter.html',})
export class FindFilter {
  searchPlaceholder = input.required<string>();
  buttonText = input.required<string>();

  searchTextChange = output<string>();
  buttonClick = output<void>();

  protected searchText = signal<string>('');
}
