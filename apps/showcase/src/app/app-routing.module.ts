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
    path: 'ng-utils',
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./modules/ng-utils-showcase/ng-utils-showcase.module').then(
            (m) => m.NgUtilsShowcaseModule
          ),
      },
    ],
    data: {
      title: 'Ng-utils',
    },
  },
  {
    path: 'cypress-helpers',
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./modules/rxidb-showcase/rxidb-showcase.module').then(
            (m) => m.RxidbShowcaseModule
          ),
      },
    ],
    data: {
      title: 'Cypress Helpers',
    },
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
