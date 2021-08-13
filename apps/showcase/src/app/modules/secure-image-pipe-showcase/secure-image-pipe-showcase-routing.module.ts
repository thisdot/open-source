import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SecureImagePipeShowcaseComponent } from './components/secure-image-pipe-showcase/secure-image-pipe-showcase.component';

const routes: Routes = [
  {
    path: '',
    component: SecureImagePipeShowcaseComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SecureImagePipeShowcaseRoutingModule {}
