import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PublicTopNavComponent } from '../public-top-nav/public-top-nav.component';
import { PublicFooterComponent } from '../public-footer/public-footer.component';

@Component({
  selector: 'app-public-layout',
  imports: [RouterOutlet, PublicTopNavComponent, PublicFooterComponent],
  templateUrl: './public-layout.component.html',
  styleUrl: './public-layout.component.scss'
})
export class PublicLayoutComponent {

}
