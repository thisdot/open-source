import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CypressHelpersShowcaseComponent } from './components/cypress-helpers-showcase/cypress-helpers-showcase.component';

const routes: Routes = [
  {
    path: '',
    component: CypressHelpersShowcaseComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CypressHelpersShowcaseRoutingModule {}
