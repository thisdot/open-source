import { Injectable } from '@angular/core';
import { ActivatedRoute, ActivationEnd, Router } from '@angular/router';
import { combineLatest, Observable } from 'rxjs';
import { filter, map, startWith, switchMap } from 'rxjs/operators';

export type RouteConfigParams<RouteTags extends string = string> = {
  routeTags: RouteTags | RouteTags[];
};

export type RouteConfigParamNames = keyof RouteConfigParams;

export type RouteData<
  ConfigParamsNames extends string = never,
  RouteTags extends string = string
> = {
  [key in ConfigParamsNames]: unknown;
} &
  RouteConfigParams<RouteTags>;

export type RouteDataParam<ConfigParamsNames extends string> = keyof RouteData<ConfigParamsNames>;

@Injectable()
export class RouteConfigService<ConfigParamsNames extends string = string> {
  constructor(private activatedRoute: ActivatedRoute, private router: Router) {}

  getLeafConfig<T = unknown>(
    paramName: 'routeTags' | RouteDataParam<ConfigParamsNames>,
    defaultValue: T
  ): Observable<T> {
    return this.router.events.pipe(
      filter((event) => event instanceof ActivationEnd),
      map(() => this.activatedRoute),
      startWith(this.activatedRoute),
      switchMap((activatedRoute: ActivatedRoute) => {
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
