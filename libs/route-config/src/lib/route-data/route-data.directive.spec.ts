import { EmbeddedViewRef, TemplateRef, ViewContainerRef } from '@angular/core';
import { of, Subject } from 'rxjs';
import { RouteConfigService, RouteData } from '../route-config.service';
import { RouteDataDirective, RouteDataDirectiveContext } from './route-data.directive';

describe('RouteDataDirective', () => {
  const getActivatedRouteConfig = jest.fn().mockReturnValue(of({}));
  const routeConfigService = {
    getActivatedRouteConfig,
  } as unknown as RouteConfigService;
  let view: EmbeddedViewRef<unknown> | null = {} as unknown as EmbeddedViewRef<unknown>;
  const markForCheck = jest.fn();

  const createEmbeddedView = jest.fn(
    (template: TemplateRef<unknown>, context: { $implicit: Record<string, unknown> }) => {
      view = {
        template,
        context,
        markForCheck,
      } as unknown as EmbeddedViewRef<unknown>;
      return view;
    }
  );
  const viewContainerRef = {
    createEmbeddedView,
  } as unknown as ViewContainerRef;

  const templateRef = {} as unknown as TemplateRef<RouteDataDirectiveContext<RouteData>>;

  let directive: RouteDataDirective<RouteData<string>>;

  beforeEach(() => {
    view = null;

    getActivatedRouteConfig.mockReset();
    markForCheck.mockReset();
    createEmbeddedView.mockClear();

    directive = new RouteDataDirective(routeConfigService, templateRef, viewContainerRef);
  });

  afterEach(() => {
    directive.ngOnDestroy();
  });

  it('should initialize the view', () => {
    const routeConfig = new Subject<Partial<RouteData>>();
    getActivatedRouteConfig.mockReturnValue(routeConfig.asObservable());

    expect(createEmbeddedView).toHaveBeenCalledTimes(0);

    directive.ngOnInit();

    expect(createEmbeddedView).toHaveBeenCalledTimes(1);
    expect(createEmbeddedView).toHaveBeenCalledWith(templateRef, {
      $implicit: {},
    });
    expect(view?.context).toEqual({
      $implicit: {},
    });
    expect(markForCheck).toHaveBeenCalledTimes(0);
  });

  it('should initialize the view with default value', () => {
    const routeConfig = new Subject<Partial<RouteData<'defaultValue'>>>();
    getActivatedRouteConfig.mockReturnValue(routeConfig.asObservable());

    directive.tdRouteDataDefaultValue = {
      routeTags: [],
      defaultValue: 1,
    };

    expect(createEmbeddedView).toHaveBeenCalledTimes(0);

    directive.ngOnInit();

    expect(createEmbeddedView).toHaveBeenCalledTimes(1);
    expect(createEmbeddedView).toHaveBeenCalledWith(templateRef, {
      $implicit: {
        routeTags: [],
        defaultValue: 1,
      },
    });

    expect(view?.context).toEqual({
      $implicit: {
        routeTags: [],
        defaultValue: 1,
      },
    });
    expect(markForCheck).toHaveBeenCalledTimes(0);
  });

  it('should update the view when route service emits data', () => {
    const routeConfigSubject = new Subject<Partial<RouteData>>();
    getActivatedRouteConfig.mockReturnValue(routeConfigSubject.asObservable());

    directive.ngOnInit();

    const routeTags = ['tag1'];
    const routeConfig = {
      routeTags,
    };
    routeConfigSubject.next(routeConfig);

    expect(view?.context).toEqual({
      $implicit: {
        routeTags,
      },
    });
    expect(markForCheck).toHaveBeenCalledTimes(1);
  });

  it('should not update the view when route service emits the same data', () => {
    const routeConfigSubject = new Subject<Partial<RouteData>>();
    getActivatedRouteConfig.mockReturnValue(routeConfigSubject.asObservable());

    directive.ngOnInit();

    const routeTags = ['tag1'];
    const routeConfig = {
      routeTags,
    };
    routeConfigSubject.next(routeConfig);

    expect(view?.context).toEqual({
      $implicit: {
        routeTags,
      },
    });
    expect(markForCheck).toHaveBeenCalledTimes(1);

    routeConfigSubject.next(routeConfig);

    expect(view?.context).toEqual({
      $implicit: {
        routeTags,
      },
    });
    expect(markForCheck).toHaveBeenCalledTimes(1);
  });

  it('should update the view when each time route service emits the data', () => {
    const routeConfigSubject = new Subject<Partial<RouteData>>();
    getActivatedRouteConfig.mockReturnValue(routeConfigSubject.asObservable());

    directive.ngOnInit();

    routeConfigSubject.next({
      routeTags: ['tag1'],
    });

    expect(view?.context).toEqual({
      $implicit: {
        routeTags: ['tag1'],
      },
    });
    expect(markForCheck).toHaveBeenCalledTimes(1);

    routeConfigSubject.next({
      routeTags: ['tag2'],
    });

    expect(view?.context).toEqual({
      $implicit: {
        routeTags: ['tag2'],
      },
    });
    expect(markForCheck).toHaveBeenCalledTimes(2);
  });

  it('should call then route service with default config value', () => {
    const routeConfigSubject = new Subject<Partial<RouteData>>();
    getActivatedRouteConfig.mockReturnValue(routeConfigSubject.asObservable());

    directive.tdRouteDataDefaultValue = {
      routeTags: [],
      defaultValue: 1,
    };

    directive.ngOnInit();

    expect(view?.context).toEqual({
      $implicit: {
        routeTags: [],
        defaultValue: 1,
      },
    });

    expect(getActivatedRouteConfig).toHaveBeenCalledTimes(1);
    expect(getActivatedRouteConfig).toHaveBeenCalledWith({
      routeTags: [],
      defaultValue: 1,
    });

    directive.tdRouteDataDefaultValue = {
      routeTags: [],
      defaultValue: 2,
    };

    expect(getActivatedRouteConfig).toHaveBeenCalledTimes(2);
    expect(getActivatedRouteConfig).toHaveBeenLastCalledWith({
      routeTags: [],
      defaultValue: 2,
    });
  });
});
