import { Pipe, PipeTransform } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RouteConfigService } from '../route-config.service';

@Pipe({
  name: 'inRouteTags$',
})
export class InRouteTags$Pipe<RouteTag extends string = string> implements PipeTransform {
  routeTags$ = this.routeTagService.getLeafConfig('routeTags', []);

  constructor(private routeTagService: RouteConfigService<RouteTag>) {}

  transform(tags: RouteTag[]): Observable<boolean> {
    return this.routeTags$.pipe(
      map((routeTags) => !!tags.find((tag: RouteTag) => routeTags.includes(tag as never)))
    );
  }
}
