import { Component } from '@angular/core';
import { ControlPanelOption } from '../../components/control-panel-option/control-panel-option';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-control-panel',
  imports: [ControlPanelOption, RouterLink],
  templateUrl: './control-panel.html',
  styleUrl: './control-panel.css'
})
export default class ControlPanel {
  
}
