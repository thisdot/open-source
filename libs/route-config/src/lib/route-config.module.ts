import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { InRouteTags$Pipe } from './route-tag/not-in-route-tags.pipe';
import { RouteTagDirective } from './route-tag/route-tag.directive';
import { RouteConfigService } from './route-config.service';

@NgModule({
  declarations: [RouteTagDirective, InRouteTags$Pipe],
  imports: [CommonModule],
  exports: [RouteTagDirective, InRouteTags$Pipe],
})
export class RouteConfigModule {
  static forRoot(): ModuleWithProviders<RouteConfigModule> {
    return {
      ngModule: RouteConfigModule,
      providers: [RouteConfigService],
    };
  }
}
