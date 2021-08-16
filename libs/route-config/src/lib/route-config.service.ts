import { Inject, Injectable, Optional } from '@angular/core';
import { ActivatedRoute, ActivationEnd, Router } from '@angular/router';
import { combineLatest, Observable } from 'rxjs';
import { filter, map, startWith, switchMap } from 'rxjs/operators';
import { ROUTE_DATA_DEFAULT_VALUE } from './route-data-default-value-token';

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

const gatherRoutes = (activatedRoute: ActivatedRoute): ActivatedRoute[] => {
  const routes: ActivatedRoute[] = activatedRoute.pathFromRoot;

  let route = activatedRoute.firstChild;
  while (route) {
    routes.push(route);
    route = route.firstChild;
  }

  return routes;
};

@Injectable()
export class RouteConfigService<
  RouteTags extends string = string,
  ConfigParamsNames extends string = never
> {
  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    @Optional()
    @Inject(ROUTE_DATA_DEFAULT_VALUE)
    private _injectedDefaultValue?: Partial<RouteData<ConfigParamsNames, RouteTags>>
  ) {}

  getWholeLeafConfig<
    C extends RouteData<ConfigParamsNames, RouteTags> = RouteData<ConfigParamsNames, RouteTags>
  >(defaultValue: Partial<C>): Observable<Partial<C>> {
    return this.router.events.pipe(
      filter((event) => event instanceof ActivationEnd),
      map(() => this.activatedRoute),
      startWith(this.activatedRoute),
      map(gatherRoutes),
      switchMap((routes) =>
        combineLatest(routes.map(({ data }) => data)).pipe(
          map((dataArr) => Object.assign({}, defaultValue, ...dataArr))
        )
      )
    );
  }

  getLeafConfig(paramName: 'routeTags', defaultValue: RouteTags[]): Observable<RouteTags[]>;
  getLeafConfig<T>(paramName: ConfigParamsNames, defaultValue: T): Observable<T>;
  getLeafConfig<T = unknown>(
    paramName: RouteDataParam<ConfigParamsNames>,
    defaultValue: T
  ): Observable<T> {
    return this.getWholeLeafConfig({
      [paramName]: defaultValue,
    } as any).pipe(map((data: { [key: string]: any }) => data[paramName] || defaultValue));
  }
}
