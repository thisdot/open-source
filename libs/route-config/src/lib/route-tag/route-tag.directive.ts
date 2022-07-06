import { Directive, Input, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { RouteDataHasService } from '../route-data-has/route-data-has.service';

/**
 * Retrieves the provided route config property and binds it into a template variable
 *
 * @example
 * <!-- Display an element only if the "show" routeTag is truthy -->
 * <p *tdRouteTag="'show'">
 *   This text is only visible, if there is a 'show' tag in the route data's `routeTags` Array
 * </p>
 *
 * @example
 * <!-- Display an element only if the "show" routeTag is truthy and display a fallback template if it is falsy -->
 * <p *tdRouteTag="'show'; else noShowTag">
 *   This text is only visible, if there is a 'show' tag in the route data's `routeTags` Array
 * </p>
 * <ng-template #noShowTag>
 *   <p>There is no 'show' tag in this route's config</p>
 * </ng-template>
 */
@Directive({ selector: '[tdRouteTag]', providers: [RouteDataHasService] })
export class RouteTagDirective<CThen, CElse, RouteTags extends string = string> implements OnInit {
  @Input()
  set tdRouteTag(tags: RouteTags | RouteTags[]) {
    this.routeDataHasService.setTags(tags);
  }

  @Input()
  set tdRouteTagElse(elseTemplate: TemplateRef<CElse>) {
    this.routeDataHasService.setElseTemplate(elseTemplate);
  }

  constructor(
    private template: TemplateRef<CThen>,
    private viewContainer: ViewContainerRef,
    private routeDataHasService: RouteDataHasService<CThen, CElse, RouteTags, 'routeTags'>
  ) {}

  ngOnInit(): void {
    this.routeDataHasService.setPropName('routeTags');
    this.routeDataHasService.init(this.template, this.viewContainer);
  }
}
