import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MAT_LEGACY_FORM_FIELD_DEFAULT_OPTIONS as MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';
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
