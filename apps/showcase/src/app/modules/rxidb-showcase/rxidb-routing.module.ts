import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RxidbKeyValuePairShowcaseComponent } from './components/rxidb-key-value-pair-showcase/rxidb-key-value-pair-showcase.component';

const routes: Routes = [
  {
    path: 'key-value-pairs',
    component: RxidbKeyValuePairShowcaseComponent,
  },
  {
    path: '**',
    pathMatch: 'full',
    redirectTo: 'key-value-pairs',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RxidbRoutingModule {}
