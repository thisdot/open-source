import { Directive, Input, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { RouteDataHasService } from './route-data-has.service';

/**
 * If you need to use a different route data property to store the tags, you can use the `*tdRouteDataHas` directive. It works very similar to `*tdRouteTag` directive but provides a way to use different properties as a source of data.
 *
 * @example
 * <!-- You can configure the directive to use the `customDataProperty` property of the route data object, where it looks for the `customShow` property to determine if the element needs to show:
 * <p *tdRouteDataHas="'customShow'; propName: 'customDataProperty'">
 *   This text is only visible, if there is a 'show' tag in the route data's `customDataProperty` Array
 * </p>
 *
 * @example
 * <!-- `*tdRouteDataHas` also provides a way do display a fallback template if a given tag is not present -->
 * <p *tdRouteDataHas="'customShow'; propName: 'customDataProperty'; else noShowTag">
 *   This text is only visible, if there is a 'customShow' tag in the route data's `customDataProperty` Array
 * </p>
 * <ng-template #noShowTag>
 *   <p>There is no 'customShow' tag in this route's config</p>
 * </ng-template>
 */
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

  constructor(
    private template: TemplateRef<CThen>,
    private viewContainer: ViewContainerRef,
    private routeDataHasService: RouteDataHasService<CThen, CElse, RouteTags>
  ) {}

  ngOnInit(): void {
    this.routeDataHasService.init(this.template, this.viewContainer);
  }
}
