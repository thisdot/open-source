import { Directive, Input, OnInit, TemplateRef } from '@angular/core';
import { RouteDataHasService } from './route-data-has.service';

@Directive({
  selector: '[tdRouteDataHas]',
  providers: [RouteDataHasService],
})
export class RouteDataHasDirective<CThen, CElse, RouteTags extends string = string>
  implements OnInit
{
  @Input()
  set tdRouteDataHas(tags: RouteTags | RouteTags[]) {
    this.routeDataHasService.setTags(tags);
  }

  @Input()
  set tdRouteDataHasPropName(propName: string) {
    this.routeDataHasService.setPropName(propName);
  }

  @Input()
  set tdRouteDataHasElse(elseTemplate: TemplateRef<CElse>) {
    this.routeDataHasService.setElseTemplate(elseTemplate);
  }

  constructor(private routeDataHasService: RouteDataHasService<CThen, CElse, RouteTags>) {}

  ngOnInit(): void {
    this.routeDataHasService.init();
  }
}
