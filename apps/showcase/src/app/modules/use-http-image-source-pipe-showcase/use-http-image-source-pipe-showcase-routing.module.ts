import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UseHttpImageSourcePipeShowcaseComponent } from './components/use-http-image-source-pipe-showcase/use-http-image-source-pipe-showcase.component';

const routes: Routes = [
  {
    path: '',
    component: UseHttpImageSourcePipeShowcaseComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UseHttpImageSourcePipeShowcaseRoutingModule {}
