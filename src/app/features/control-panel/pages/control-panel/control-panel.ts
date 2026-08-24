import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UiIcon } from '@/app/shared/components/ui/icon';
import { UiPageHeader } from '@/app/shared/components/ui/page-header';

@Component({
  selector: 'app-control-panel',
  imports: [RouterLink, UiIcon, UiPageHeader],
  templateUrl: './control-panel.html',
  host: {
    class: 'flex flex-col gap-4'
  }
})
export default class ControlPanel {

}
