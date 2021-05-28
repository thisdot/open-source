import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { InRouteTags$Pipe } from './route-tag/not-in-route-tags.pipe';
import { RouteTagDirective } from './route-tag/route-tag.directive';

@NgModule({
  declarations: [RouteTagDirective, InRouteTags$Pipe],
  imports: [CommonModule],
  exports: [RouteTagDirective, InRouteTags$Pipe],
})
export class RouteConfigModule {}
