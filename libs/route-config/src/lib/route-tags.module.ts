import { NgModule } from '@angular/core';
import { RouteTagModule } from './route-tag/route-tag.module';

@NgModule({
  imports: [RouteTagModule],
  exports: [RouteTagModule],
})
export class RouteTagsModule {}
