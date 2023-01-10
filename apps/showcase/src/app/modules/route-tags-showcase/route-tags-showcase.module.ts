import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { RouteConfigModule } from '@this-dot/route-config';
import { FirstRouteComponent } from './components/first-route/first-route.component';
import { RouteTagsShowcaseComponent } from './components/route-tags-showcase/route-tags-showcase.component';
import { SecondRouteComponent } from './components/second-route/second-route.component';
import { RouteTagsShowcaseRoutingModule } from './route-tags-showcase-routing.module';

@NgModule({
  declarations: [FirstRouteComponent, SecondRouteComponent, RouteTagsShowcaseComponent],
  imports: [
    CommonModule,
    RouteConfigModule,
    RouteTagsShowcaseRoutingModule,
    MatButtonModule,
    MatButtonModule,
    MatSelectModule,
    FormsModule,
  ],
})
export class RouteTagsShowcaseModule {}
