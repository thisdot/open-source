import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouteTagDirective } from './route-tag.directive';
import { InRouteTags$Pipe } from './not-in-route-tags.pipe';

@NgModule({
  declarations: [RouteTagDirective, InRouteTags$Pipe],
  imports: [CommonModule],
  exports: [RouteTagDirective, InRouteTags$Pipe],
})
export class RouteTagModule {}
