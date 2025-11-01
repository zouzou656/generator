import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { OwnerTopNavComponent } from '../owner-top-nav/owner-top-nav.component';
import { OwnerSidebarComponent } from '../owner-sidebar/owner-sidebar.component';

@Component({
  selector: 'app-owner-layout',
  imports: [RouterOutlet, OwnerTopNavComponent, OwnerSidebarComponent],
  templateUrl: './owner-layout.component.html',
  styleUrl: './owner-layout.component.scss'
})
export class OwnerLayoutComponent {

}
