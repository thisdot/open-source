import { Pipe, PipeTransform } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RouteConfigService } from '../route-config.service';
import { RouteTag } from './route-tag.types';

@Pipe({
  name: 'inRouteTags$',
})
export class InRouteTags$Pipe implements PipeTransform {
  // TODO: inject the leafconfig name using injection token
  constructor(private routeTagService: RouteConfigService<'cmRouteTags'>) {}

  routeTags$ = this.routeTagService.getLeafConfig('cmRouteTags', []);

  transform(tags: RouteTag[]): Observable<boolean> {
    return this.routeTags$.pipe(map((routeTags) => !!tags.find((tag) => routeTags.includes(tag))));
  }
}
