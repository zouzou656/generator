import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AdminTopNavComponent } from '../admin-top-nav/admin-top-nav.component';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar.component';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, AdminTopNavComponent, AdminSidebarComponent],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss'
})
export class AdminLayoutComponent {

}
