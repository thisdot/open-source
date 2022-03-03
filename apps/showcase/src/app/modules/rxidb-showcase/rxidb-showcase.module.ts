import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RxidbRoutingModule } from './rxidb-routing.module';
import { RxidbKeyValuePairShowcaseComponent } from './components/rxidb-key-value-pair-showcase/rxidb-key-value-pair-showcase.component';
import { RxidbAutoIncrementComponent } from './components/rxidb-auto-increment/rxidb-auto-increment.component';

@NgModule({
  declarations: [RxidbKeyValuePairShowcaseComponent, RxidbAutoIncrementComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RxidbRoutingModule,
    MatInputModule,
    MatSnackBarModule,
    MatButtonModule,
  ],
  providers: [{ provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'outline' } }],
})
export class RxidbShowcaseModule {}
