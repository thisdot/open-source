import { Pipe, PipeTransform } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RouteConfigService } from '../route-config.service';

@Pipe({
  name: 'inRouteTags$',
})
export class InRouteTags$Pipe implements PipeTransform {
  routeTags$ = this.routeTagService.getLeafConfig('tdRouteTags', []);

  constructor(private routeTagService: RouteConfigService) {}

  transform(tags: string[]): Observable<boolean> {
    return this.routeTags$.pipe(map((routeTags) => !!tags.find((tag) => routeTags.includes(tag))));
  }
}
