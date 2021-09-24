import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'secure-image',
    children: [
      {
        path: '',
        loadChildren: () =>
          import(
            './modules/use-http-image-source-pipe-showcase/use-http-image-source-pipe-showcase.module'
          ).then((m) => m.UseHttpImageSourcePipeShowcaseModule),
      },
    ],
  },
  {
    path: '**',
    pathMatch: 'full',
    redirectTo: 'secure-image',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NgUtilsShowcaseRoutingModule {}
