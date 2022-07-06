import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { InRouteTags$Pipe } from './route-tag/not-in-route-tags.pipe';
import { RouteTagDirective } from './route-tag/route-tag.directive';
import { RouteConfigService } from './route-config.service';
import { RouteDataModule } from './route-data';
import { RouteDataHasDirective } from './route-data-has/route-data-has.directive';

@NgModule({
  declarations: [RouteTagDirective, InRouteTags$Pipe, RouteDataHasDirective],
  imports: [CommonModule, RouteDataModule],
  exports: [RouteTagDirective, InRouteTags$Pipe, RouteDataModule, RouteDataHasDirective],
})
export class RouteConfigModule {
  /**
   * Registers the RouteConfigModule and sets the providers globally.
   * Make sure you call the forRoot method in your root module.
   *
   * @remarks You still need to import the module without calling the forRoot method in other modules so you can use the pipes and directives from this module.
   */
  static forRoot(): ModuleWithProviders<RouteConfigModule> {
    return {
      ngModule: RouteConfigModule,
      providers: [RouteConfigService],
    };
  }
}
