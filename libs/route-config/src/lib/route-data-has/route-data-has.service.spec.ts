import { EmbeddedViewRef, TemplateRef, ViewContainerRef } from '@angular/core';
import { EMPTY, of, ReplaySubject } from 'rxjs';
import { RouteConfigService, RouteData } from '../route-config.service';
import { RouteDataDirectiveContext } from '../route-data/route-data.directive';
import { RouteDataHasService } from './route-data-has.service';

describe('RouteDataHasServiceService', () => {
  const getLeafConfig = jest.fn().mockReturnValue(of({}));
  const routeConfigService = {
    getLeafConfig,
  } as unknown as RouteConfigService;
  let view: EmbeddedViewRef<unknown> | null = {} as unknown as EmbeddedViewRef<unknown>;

  const createEmbeddedView = jest.fn((template: TemplateRef<unknown>) => {
    view = {
      template,
    } as unknown as EmbeddedViewRef<unknown>;
    return view;
  });
  const clear = jest.fn();
  const viewContainerRef = {
    createEmbeddedView,
    clear,
  } as unknown as ViewContainerRef;

  const templateRef = { id: 'templateRef' } as unknown as TemplateRef<
    RouteDataDirectiveContext<RouteData>
  >;
  const elseTemplateRef = { id: 'elseTemplateRef' } as unknown as TemplateRef<
    RouteDataDirectiveContext<RouteData>
  >;

  let service: RouteDataHasService<unknown, unknown>;

  beforeEach(() => {
    view = null;

    getLeafConfig.mockReset();
    clear.mockReset();
    createEmbeddedView.mockClear();

    service = new RouteDataHasService(routeConfigService);

    service.setPropName('testProp');
    service.setTags('testTag');
    service.setElseTemplate(elseTemplateRef);
  });

  afterEach(() => {
    service.ngOnDestroy();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should clear the view after init', () => {
    const routeConfig = new ReplaySubject<string[]>();
    getLeafConfig.mockReturnValue(routeConfig.asObservable());

    expect(createEmbeddedView).toHaveBeenCalledTimes(0);

    routeConfig.next([]);

    service.init(templateRef, viewContainerRef);

    expect(clear).toHaveBeenCalledTimes(1);
  });

  it('should create the else view after init', () => {
    const routeConfig = new ReplaySubject<string[]>();
    getLeafConfig.mockReturnValue(routeConfig.asObservable());

    expect(createEmbeddedView).toHaveBeenCalledTimes(0);

    routeConfig.next([]);

    service.init(templateRef, viewContainerRef);

    expect(createEmbeddedView).toHaveBeenCalledTimes(1);
    expect(createEmbeddedView).toHaveBeenCalledWith(elseTemplateRef);
  });

  it('should create the view after init', () => {
    const routeConfig = new ReplaySubject<string[]>();
    getLeafConfig.mockReturnValue(routeConfig.asObservable());

    expect(createEmbeddedView).toHaveBeenCalledTimes(0);

    routeConfig.next(['testTag']);

    service.init(templateRef, viewContainerRef);

    expect(clear).toHaveBeenCalledTimes(1);
    expect(createEmbeddedView).toHaveBeenCalledTimes(1);
    expect(createEmbeddedView).toHaveBeenCalledWith(templateRef);
  });

  it('should create the else view after route config changes', () => {
    const routeConfig = new ReplaySubject<string[]>();
    getLeafConfig.mockReturnValue(routeConfig.asObservable());

    expect(createEmbeddedView).toHaveBeenCalledTimes(0);

    routeConfig.next(['testTag']);

    service.init(templateRef, viewContainerRef);

    expect(clear).toHaveBeenCalledTimes(1);
    expect(createEmbeddedView).toHaveBeenCalledTimes(1);
    expect(createEmbeddedView).toHaveBeenCalledWith(templateRef);

    routeConfig.next(['notTestTag']);

    expect(clear).toHaveBeenCalledTimes(2);
    expect(createEmbeddedView).toHaveBeenCalledTimes(2);
    expect(createEmbeddedView).toHaveBeenLastCalledWith(elseTemplateRef);
  });

  it('should create the view after route config changes', () => {
    const routeConfig = new ReplaySubject<string[]>();
    getLeafConfig.mockReturnValue(routeConfig.asObservable());

    expect(createEmbeddedView).toHaveBeenCalledTimes(0);

    routeConfig.next([]);

    service.init(templateRef, viewContainerRef);

    expect(clear).toHaveBeenCalledTimes(1);
    expect(createEmbeddedView).toHaveBeenCalledTimes(1);
    expect(createEmbeddedView).toHaveBeenCalledWith(elseTemplateRef);

    routeConfig.next(['testTag']);

    expect(clear).toHaveBeenCalledTimes(2);
    expect(createEmbeddedView).toHaveBeenCalledTimes(2);
    expect(createEmbeddedView).toHaveBeenLastCalledWith(templateRef);
  });

  type PartialRecord<K extends string, T> = Record<string, unknown> & Record<K, T>;

  it('should create the else view after prop name changes', () => {
    const routeConfig: PartialRecord<
      'testProp' | 'anotherTestProp',
      ReplaySubject<Array<string>>
    > = {
      testProp: new ReplaySubject<string[]>(),
      anotherTestProp: new ReplaySubject<string[]>(),
    };
    getLeafConfig.mockImplementation((propName: string) => routeConfig[propName] || EMPTY);

    expect(createEmbeddedView).toHaveBeenCalledTimes(0);

    routeConfig.testProp.next(['testTag']);
    routeConfig.anotherTestProp.next(['notTestTag']);

    service.init(templateRef, viewContainerRef);

    expect(clear).toHaveBeenCalledTimes(1);
    expect(createEmbeddedView).toHaveBeenCalledTimes(1);
    expect(createEmbeddedView).toHaveBeenCalledWith(templateRef);

    service.setPropName('anotherTestProp');

    expect(clear).toHaveBeenCalledTimes(2);
    expect(createEmbeddedView).toHaveBeenCalledTimes(2);
    expect(createEmbeddedView).toHaveBeenLastCalledWith(elseTemplateRef);
  });

  it('should re-create embedded view when else template ref changes', () => {
    const routeConfig = new ReplaySubject<string[]>();
    getLeafConfig.mockReturnValue(routeConfig.asObservable());

    expect(createEmbeddedView).toHaveBeenCalledTimes(0);

    routeConfig.next(['notTestTag']);

    service.init(templateRef, viewContainerRef);

    expect(clear).toHaveBeenCalledTimes(1);
    expect(createEmbeddedView).toHaveBeenCalledTimes(1);
    expect(createEmbeddedView).toHaveBeenCalledWith(elseTemplateRef);

    const changedElseTemplateRef = { id: 'changedElseTemplateRef' } as unknown as TemplateRef<
      RouteDataDirectiveContext<RouteData>
    >;
    service.setElseTemplate(changedElseTemplateRef);

    expect(clear).toHaveBeenCalledTimes(2);
    expect(createEmbeddedView).toHaveBeenCalledTimes(2);
    expect(createEmbeddedView).toHaveBeenLastCalledWith(changedElseTemplateRef);
  });
});
