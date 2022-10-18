import { Inject, Injectable, Optional } from '@angular/core';
import { ActivatedRoute, ActivationEnd, ParamMap, Router } from '@angular/router';
import { combineLatest, Observable } from 'rxjs';
import { filter, map, startWith, switchMap, withLatestFrom } from 'rxjs/operators';
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
} & RouteConfigParams<RouteTags>;

export type RouteDataParam<ConfigParamsNames extends string> = keyof RouteData<ConfigParamsNames>;

export type RouteUrlSegment = Record<string, string | null>;

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
  private get injectedDefaultValue(): Partial<RouteData<ConfigParamsNames, RouteTags>> {
    return this._injectedDefaultValue || {};
  }

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    @Optional()
    @Inject(ROUTE_DATA_DEFAULT_VALUE)
    private _injectedDefaultValue?: Partial<RouteData<ConfigParamsNames, RouteTags>>
  ) {}

  /**
   * Returns an Observable which emits the url path of the activated route.
   * Works with routes with the `matcher` property set.
   * Will return null if no param name exists for the searched param name.
   *
   * @example
   * export class AppComponent {
   *   urlSegment$ = this.routeConfigService.getActivatedRouteMatcherConfig('username');
   * }
   *
   * @param mapKey - the parameter name from the matched path to be returned
   *
   * @returns Observable<RouteUrlParam | null>
   */
  getActivatedRouteMatcherConfig(mapKey?: string): Observable<RouteUrlSegment | null> {
    return this.activatedRoute.paramMap.pipe(
      map((params: ParamMap) => {
        if (!mapKey) {
          return null;
        }
        return { [mapKey]: params.get(mapKey) };
      })
    );
  }

  /**
   * Returns an Observable which emits the route config set for the activated route.
   *
   * @example
   * export class AppComponent {
   *   data$ = this.routeConfigService.getActivatedRouteConfig();
   *   dataWithDefaultValue$ = this.routeConfigService.getActivatedRouteConfig({
   *     routeTags: ['defaultTag'],
   *     title: 'Default Title',
   *   });
   *   dataWithParam$ = this.routeConfigService.getActivatedRouteConfig('username');
   * }
   *
   * @param defaultValue - the default value that should be returned, it allows overriding the injected default values.
   *
   * @returns Observable<Partial<C>>
   */
  getActivatedRouteConfig<
    C extends RouteData<ConfigParamsNames, RouteTags> = RouteData<ConfigParamsNames, RouteTags>
  >(paramName?: string, defaultValue: Partial<C> = {}): Observable<Partial<C>> {
    return this.router.events.pipe(
      filter((event) => event instanceof ActivationEnd),
      map(() => this.activatedRoute),
      startWith(this.activatedRoute),
      map(gatherRoutes),
      switchMap((routes) =>
        combineLatest(routes.map(({ data }) => data)).pipe(
          withLatestFrom(this.getActivatedRouteMatcherConfig(paramName)),
          map(([dataArr, param]) =>
            Object.assign({}, this.injectedDefaultValue, defaultValue, param, ...dataArr)
          )
        )
      )
    );
  }

  /**
   * Returns the an Observable with current route's property value
   *
   * @example
   * export class AppComponent {
   *   tags$ = this.routeConfigService.getLeafConfig('routeTags', ['no tags']);
   * }
   *
   * @param paramName - the parameter name from the route config to be returned
   * @param matchName - the path name from the route matched url segment to be returned
   * @param defaultValue - the default value that should be returned, if the value is not present
   */
  getLeafConfig(
    paramName: 'routeTags',
    matchName: string,
    defaultValue?: RouteTags[]
  ): Observable<RouteTags[]>;
  getLeafConfig<T>(
    paramName: ConfigParamsNames,
    matchName: string,
    defaultValue?: T
  ): Observable<T>;
  getLeafConfig<T = unknown>(
    paramName: RouteDataParam<ConfigParamsNames>,
    matchName: string,
    defaultValue?: T
  ): Observable<T> {
    return this.getActivatedRouteConfig(
      matchName,
      defaultValue
        ? ({
            [paramName]: defaultValue,
          } as any)
        : {}
    ).pipe(map((data: { [key: string]: any }) => data[paramName] || defaultValue));
  }
}
