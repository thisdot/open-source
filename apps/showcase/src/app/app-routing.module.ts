import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FirstRouteComponent } from './components/first-route/first-route.component';
import { SecondRouteComponent } from './components/second-route/second-route.component';

const routes: Routes = [
  {
    path: 'first',
    component: FirstRouteComponent,
    data: {
      tdRouteTags: ['show'],
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
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
