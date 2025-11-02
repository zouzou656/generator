import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BillsImportComponent } from './bills-import/bills-import.component';
import { CustomersImportComponent } from './customers-import/customers-import.component';

@Component({
  selector: 'app-imports',
  imports: [
    CommonModule,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    BillsImportComponent,
    CustomersImportComponent
  ],
  templateUrl: './imports.component.html',
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class ImportsComponent {
}

