import { Provider, Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  ActivationEnd,
  Event,
  Router,
} from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { RouteConfigService, RouteData } from './route-config.service';
import { ROUTE_DATA_DEFAULT_VALUE } from './route-data-default-value-token';

const provideMock = <T>(type: Type<T>, mock: Partial<T>): Provider => ({
  provide: type,
  useValue: mock,
});

type TestRouteTypes = 'tdRouteTags' | 'tdRouteColor' | 'tdRouteProgressState';

type CreateObservable =
  | typeof TestScheduler.prototype.createHotObservable
  | typeof TestScheduler.prototype.createColdObservable;

const mockActivationEnd$ = <C extends CreateObservable>(createObservable: C) =>
  jest
    .fn()
    .mockReturnValue(
      createObservable('----e', { e: new ActivationEnd({} as ActivatedRouteSnapshot) })
    );

describe('RouteConfigService', () => {
  let service: RouteConfigService<'string', TestRouteTypes>;
  let testScheduler: TestScheduler;

  let getEvents = jest.fn<Observable<Event>, []>().mockReturnValue(EMPTY);
  let pathFromRoot = jest.fn().mockReturnValue([]);
  const firstChild = jest.fn().mockReturnValue(null);

  const withRouteData = (dataArr: Array<Partial<RouteData<TestRouteTypes>>>) => {
    pathFromRoot = jest.fn().mockReturnValue(dataArr.map((data) => ({ data: of(data) })));
  };

  describe('without ROUTE_DATA_DEFAULT_VALUE', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          RouteConfigService,
          provideMock(ActivatedRoute, {
            get pathFromRoot(): ActivatedRoute[] {
              return pathFromRoot();
            },
            get firstChild(): ActivatedRoute | null {
              return firstChild();
            },
          }),
          provideMock(Router, {
            get events(): Observable<Event> {
              return getEvents();
            },
          }),
        ],
      });
      service = TestBed.inject(RouteConfigService);
      testScheduler = new TestScheduler((actual, expected) => {
        expect(actual).toEqual(expected);
      });
    });

    describe('getLeafConfig', () => {
      it('should return routeTags', () => {
        const routeTags = ['tag1'];
        testScheduler.run(({ cold, expectObservable }) => {
          withRouteData([
            {
              tdRouteTags: routeTags,
            },
          ]);
          getEvents = mockActivationEnd$(cold);
          expectObservable(service.getLeafConfig('tdRouteTags', [])).toBe('t---t', {
            t: routeTags,
          });
        });
      });

      it('should return routeTags from last ActivatedRoute', () => {
        const routeTags = ['tag1'];
        const routeTags2 = ['tag2'];
        testScheduler.run(({ cold, expectObservable }) => {
          withRouteData([
            {
              tdRouteTags: routeTags,
            },
            {},
            {
              tdRouteTags: routeTags2,
            },
          ]);
          getEvents = mockActivationEnd$(cold);
          expectObservable(service.getLeafConfig('tdRouteTags', [])).toBe('t---t', {
            t: routeTags2,
          });
        });
      });

      it('should return routeTags from last ActivatedRoute that contains data', () => {
        const routeTags = ['tag1'];
        const routeTags2 = ['tag2'];
        testScheduler.run(({ cold, expectObservable }) => {
          withRouteData([
            {
              tdRouteTags: routeTags,
            },
            {
              tdRouteTags: routeTags2,
            },
            {},
          ]);
          getEvents = mockActivationEnd$(cold);
          expectObservable(service.getLeafConfig('tdRouteTags', [])).toBe('t---t', {
            t: routeTags2,
          });
        });
      });

      it('should return config from last ActivatedRoute that contains that config', () => {
        const routeTags = ['tag1'];
        testScheduler.run(({ cold, expectObservable }) => {
          withRouteData([
            {
              tdRouteTags: routeTags,
            },
            {
              tdRouteColor: 'secondary',
            },
            {
              tdRouteProgressState: 0.5,
            },
          ]);
          getEvents = mockActivationEnd$(cold);
          expectObservable(service.getLeafConfig('tdRouteTags', [])).toBe('t---t', {
            t: routeTags,
          });
          expectObservable(service.getLeafConfig('tdRouteColor', 'primary')).toBe('t---t', {
            t: 'secondary',
          });
          expectObservable(service.getLeafConfig('tdRouteProgressState', 0)).toBe('t---t', {
            t: 0.5,
          });
        });
      });

      it('should return default config if no data is present in ActivatedRoute', () => {
        testScheduler.run(({ cold, expectObservable }) => {
          withRouteData([{}]);
          getEvents = mockActivationEnd$(cold);
          expectObservable(service.getLeafConfig('tdRouteTags', [])).toBe('t---t', { t: [] });
          expectObservable(service.getLeafConfig('tdRouteColor', 'primary')).toBe('t---t', {
            t: 'primary',
          });
          expectObservable(service.getLeafConfig('tdRouteProgressState', 0)).toBe('t---t', {
            t: 0,
          });
        });
      });
    });

    describe('getWholeLeafConfig', () => {
      it('should return combined config from whole activated route array', () => {
        const routeTags = ['tag1'];
        testScheduler.run(({ cold, expectObservable }) => {
          withRouteData([
            {
              tdRouteTags: routeTags,
            },
            {
              tdRouteColor: 'secondary',
            },
            {
              tdRouteProgressState: 0.5,
            },
          ]);
          getEvents = mockActivationEnd$(cold);
          expectObservable(
            service.getActivatedRouteConfig({
              tdRouteTags: [],
              tdRouteColor: 'primary',
              tdRouteProgressState: 0,
            })
          ).toBe('t---t', {
            t: {
              tdRouteTags: routeTags,
              tdRouteColor: 'secondary',
              tdRouteProgressState: 0.5,
            },
          });
        });
      });

      it('should return combined config from whole activated route array with newest data', () => {
        const routeTagsRoot = ['tagRoot'];
        const routeTagsLeaf = ['tagLeaf'];
        testScheduler.run(({ cold, expectObservable }) => {
          withRouteData([
            {
              tdRouteTags: routeTagsRoot,
            },
            {
              tdRouteColor: 'secondary',
            },
            {
              tdRouteProgressState: 0.5,
              tdRouteTags: routeTagsLeaf,
            },
            {
              tdRouteColor: 'tertiary',
            },
          ]);
          getEvents = mockActivationEnd$(cold);
          expectObservable(
            service.getActivatedRouteConfig({
              tdRouteTags: [],
              tdRouteColor: 'primary',
              tdRouteProgressState: 0,
            })
          ).toBe('t---t', {
            t: {
              tdRouteTags: routeTagsLeaf,
              tdRouteColor: 'tertiary',
              tdRouteProgressState: 0.5,
            },
          });
        });
      });

      it('should return default config if no data is present in ActivatedRoute', () => {
        testScheduler.run(({ cold, expectObservable }) => {
          withRouteData([{}]);
          getEvents = mockActivationEnd$(cold);
          expectObservable(
            service.getActivatedRouteConfig({
              tdRouteTags: [],
              tdRouteColor: 'primary',
              tdRouteProgressState: 0,
            })
          ).toBe('t---t', {
            t: {
              tdRouteTags: [],
              tdRouteColor: 'primary',
              tdRouteProgressState: 0,
            },
          });
        });
      });

      it('should return default config for properties that are not provided', () => {
        testScheduler.run(({ cold, expectObservable }) => {
          withRouteData([
            {
              tdRouteColor: 'secondary',
            },
            {
              tdRouteProgressState: 0.5,
            },
          ]);
          getEvents = mockActivationEnd$(cold);
          expectObservable(
            service.getActivatedRouteConfig({
              tdRouteTags: [],
              tdRouteColor: 'primary',
              tdRouteProgressState: 0,
            })
          ).toBe('t---t', {
            t: {
              tdRouteTags: [],
              tdRouteColor: 'secondary',
              tdRouteProgressState: 0.5,
            },
          });
        });
      });
    });
  });

  describe('with ROUTE_DATA_DEFAULT_VALUE', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          RouteConfigService,
          {
            provide: ROUTE_DATA_DEFAULT_VALUE,
            useValue: {
              tdRouteColor: 'injectedPrimary',
              tdRouteTags: ['injectedDefaultTag'],
            },
          },
          provideMock(ActivatedRoute, {
            get pathFromRoot(): ActivatedRoute[] {
              return pathFromRoot();
            },
            get firstChild(): ActivatedRoute | null {
              return firstChild();
            },
          }),
          provideMock(Router, {
            get events(): Observable<Event> {
              return getEvents();
            },
          }),
        ],
      });
      service = TestBed.inject(RouteConfigService);
      testScheduler = new TestScheduler((actual, expected) => {
        expect(actual).toEqual(expected);
      });
    });

    describe('getLeafConfig', () => {
      it('should return injected default config if no data is present in ActivatedRoute', () => {
        testScheduler.run(({ cold, expectObservable }) => {
          withRouteData([{}]);
          getEvents = mockActivationEnd$(cold);
          expectObservable(service.getLeafConfig('tdRouteTags')).toBe('t---t', {
            t: ['injectedDefaultTag'],
          });
          expectObservable(service.getLeafConfig('tdRouteColor')).toBe('t---t', {
            t: 'injectedPrimary',
          });
        });
      });

      it('should return provided default config instead of injected if no data is present in ActivatedRoute', () => {
        testScheduler.run(({ cold, expectObservable }) => {
          withRouteData([{}]);
          getEvents = mockActivationEnd$(cold);
          expectObservable(service.getLeafConfig('tdRouteTags', ['defaultTag'])).toBe('t---t', {
            t: ['defaultTag'],
          });
          expectObservable(service.getLeafConfig('tdRouteColor', 'primary')).toBe('t---t', {
            t: 'primary',
          });
        });
      });
    });

    describe('getWholeLeafConfig', () => {
      it('should return config combined with injected default value', () => {
        const routeTags = ['tag1'];
        testScheduler.run(({ cold, expectObservable }) => {
          withRouteData([
            {
              routeTags,
            },
          ]);
          getEvents = mockActivationEnd$(cold);
          expectObservable(service.getActivatedRouteConfig()).toBe('t---t', {
            t: {
              routeTags: routeTags,
              tdRouteTags: ['injectedDefaultTag'],
              tdRouteColor: 'injectedPrimary',
            },
          });
        });
      });

      it('should return config combined with injected default value and provided default value', () => {
        const routeTags = ['tag1'];
        testScheduler.run(({ cold, expectObservable }) => {
          withRouteData([
            {
              routeTags,
            },
          ]);
          getEvents = mockActivationEnd$(cold);
          expectObservable(
            service.getActivatedRouteConfig({
              tdRouteColor: 'primary',
              tdRouteProgressState: 0.5,
            })
          ).toBe('t---t', {
            t: {
              routeTags: routeTags,
              tdRouteTags: ['injectedDefaultTag'],
              tdRouteColor: 'primary',
              tdRouteProgressState: 0.5,
            },
          });
        });
      });
    });
  });
});
