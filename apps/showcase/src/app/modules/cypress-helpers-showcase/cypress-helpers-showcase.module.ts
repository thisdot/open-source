import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { CypressHelpersShowcaseRoutingModule } from './cypress-helpers-showcase-routing.module';
import { CypressHelpersShowcaseComponent } from './components/cypress-helpers-showcase/cypress-helpers-showcase.component';

@NgModule({
  declarations: [CypressHelpersShowcaseComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CypressHelpersShowcaseRoutingModule,
    MatInputModule,
    MatSnackBarModule,
    MatButtonModule,
  ],
  providers: [{ provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'outline' } }],
})
export class CypressHelpersShowcaseModule {}
