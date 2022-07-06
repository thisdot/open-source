import { Pipe, PipeTransform } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RouteConfigService } from '../route-config.service';

/**
 * Pipes an array of route tags and returns an Observable<boolean> that emits a boolean.
 *
 * The boolean is true if any of the values in the provided array is in the configured route tags of the activated route.
 *
 * @example
 * <!-- Use it chained with the async pipe -->
 * <ng-container *ngIf="routesWhereTheElementIsDisplayed | inRouteTags$ | async">
 *   The contents of this ng-container
 * </ng-container>
 */
@Pipe({
  name: 'inRouteTags$',
})
export class InRouteTags$Pipe<RouteTag extends string = string> implements PipeTransform {
  routeTags$ = this.routeTagService.getLeafConfig('routeTags', []);

  constructor(private routeTagService: RouteConfigService<RouteTag>) {}

  transform(tags: RouteTag[]): Observable<boolean> {
    return this.routeTags$.pipe(
      map((routeTags) => !!tags.find((tag: RouteTag) => routeTags.includes(tag)))
    );
  }
}
