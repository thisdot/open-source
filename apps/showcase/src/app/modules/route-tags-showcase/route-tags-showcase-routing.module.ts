import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppRouteTags } from '../../route-config-params';
import { FirstRouteComponent } from './components/first-route/first-route.component';
import { RouteTagsShowcaseComponent } from './components/route-tags-showcase/route-tags-showcase.component';
import { SecondRouteComponent } from './components/second-route/second-route.component';

const routes: Routes = [
  {
    path: '',
    component: RouteTagsShowcaseComponent,
    children: [
      {
        path: 'first',
        component: FirstRouteComponent,
        data: {
          routeTags: [AppRouteTags.show],
        },
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'first',
      },
      {
        path: 'second',
        component: SecondRouteComponent,
        data: {
          title: 'Second Route Title',
        },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RouteTagsShowcaseRoutingModule {}
