import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FirstRouteComponent } from './components/first-route/first-route.component';
import { SecondRouteComponent } from './components/second-route/second-route.component';
import { AppRouteTags } from './route-config-params';
import { RouteConfigService } from '@this-dot/route-config';

const routes: Routes = [
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
];

@NgModule({
  declarations: [FirstRouteComponent, SecondRouteComponent],
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [RouteConfigService],
})
export class AppRoutingModule {}
