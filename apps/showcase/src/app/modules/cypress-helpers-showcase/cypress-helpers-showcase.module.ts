import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';

import { CypressHelpersShowcaseRoutingModule } from './cypress-helpers-showcase-routing.module';
import { CypressHelpersShowcaseComponent } from './components/cypress-helpers-showcase/cypress-helpers-showcase.component';

@NgModule({
  declarations: [CypressHelpersShowcaseComponent],
  imports: [CommonModule, ReactiveFormsModule, CypressHelpersShowcaseRoutingModule, MatInputModule],
})
export class CypressHelpersShowcaseModule {}
