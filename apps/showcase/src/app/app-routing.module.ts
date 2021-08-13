import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'route-tags',
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./modules/route-tags-showcase/route-tags-showcase.module').then(
            (m) => m.RouteTagsShowcaseModule
          ),
      },
    ],
  },
  {
    path: 'secure-image',
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./modules/secure-image-pipe-showcase/secure-image-pipe-showcase.module').then(
            (m) => m.SecureImagePipeShowcaseModule
          ),
      },
    ],
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'route-tags',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
