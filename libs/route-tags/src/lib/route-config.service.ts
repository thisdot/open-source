import { Injectable } from '@angular/core';
import { ActivatedRoute, ActivationEnd, Router } from '@angular/router';
import { combineLatest, Observable } from 'rxjs';
import { filter, map, startWith, switchMap } from 'rxjs/operators';

export type RouteData = {
  [key in RouteConfigParam]: any;
};
export type RouteConfigParam = 'cmRouteTags' | 'cmRouteColor' | 'cmRouteProgressState';
export type NavbarColorScheme = 'primary' | 'secondary';

@Injectable()
export class RouteConfigService {
  constructor(private activatedRoute: ActivatedRoute, private router: Router) {}

  getLeafConfig(paramName: 'cmRouteTags', defaultValue: string[]): Observable<string[]>;
  getLeafConfig(
    paramName: 'cmRouteColor',
    defaultValue: NavbarColorScheme
  ): Observable<NavbarColorScheme>;
  getLeafConfig(
    paramName: 'cmRouteProgressState',
    defaultValue: number | null
  ): Observable<number | null>;
  getLeafConfig<T>(paramName: RouteConfigParam, defaultValue: T): Observable<T> {
    return this.router.events.pipe(
      filter((event) => event instanceof ActivationEnd),
      map(() => this.activatedRoute),
      startWith(this.activatedRoute),
      switchMap((activatedRoute) => {
        const routes: ActivatedRoute[] = activatedRoute.pathFromRoot;

        let route = activatedRoute.firstChild;
        while (route) {
          routes.push(route);
          route = route.firstChild;
        }

        return combineLatest(routes.map(({ data }) => data)).pipe(
          map((dataArr) => {
            const reversedArr = dataArr.reverse();
            const index = reversedArr.findIndex((data) => (data && data[paramName]) !== undefined);
            return (reversedArr[index] && reversedArr[index][paramName]) || defaultValue;
          })
        );
      })
    );
  }
}
