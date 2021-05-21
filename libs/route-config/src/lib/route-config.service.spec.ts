import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, ActivationEnd, Event, Router } from '@angular/router';
import { Provider, Type } from '@angular/core';
import { RouteConfigService, RouteData } from './route-config.service';
import { EMPTY, Observable, of, Subject } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';

const provideMock = <T>(type: Type<T>, mock: Partial<T>): Provider => ({
  provide: type,
  useValue: mock,
});

type TestRouteTypes = 'tdRouteTags' | 'tdRouteColor' | 'tdRouteProgressState';

describe('RouteConfigService', () => {
  let service: RouteConfigService;
  let events: Subject<Event>;
  let testScheduler: TestScheduler;

  let getEvents = jest.fn().mockReturnValue(EMPTY);
  let pathFromRoot = jest.fn().mockReturnValue([]);
  const firstChild = jest.fn().mockReturnValue(null);

  const withRouteData = (dataArr: Array<Partial<RouteData<TestRouteTypes>>>) => {
    pathFromRoot = jest.fn().mockReturnValue(dataArr.map((data) => ({ data: of(data) } as any)));
  };

  beforeEach(() => {
    events = new Subject<Event>();
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

  it('should return routeTags', () => {
    const routeTags = ['tag1'];
    testScheduler.run(({ cold, expectObservable }) => {
      withRouteData([
        {
          tdRouteTags: routeTags,
        },
      ]);
      getEvents = jest.fn().mockReturnValue(cold('----e', { e: new ActivationEnd({} as any) }));
      expectObservable(service.getLeafConfig('tdRouteTags', [])).toBe('t---t', { t: routeTags });
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
      getEvents = jest.fn().mockReturnValue(cold('----e', { e: new ActivationEnd({} as any) }));
      expectObservable(service.getLeafConfig('tdRouteTags', [])).toBe('t---t', { t: routeTags2 });
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
      getEvents = jest.fn().mockReturnValue(cold('----e', { e: new ActivationEnd({} as any) }));
      expectObservable(service.getLeafConfig('tdRouteTags', [])).toBe('t---t', { t: routeTags2 });
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
      getEvents = jest.fn().mockReturnValue(cold('----e', { e: new ActivationEnd({} as any) }));
      expectObservable(service.getLeafConfig('tdRouteTags', [])).toBe('t---t', { t: routeTags });
      expectObservable(service.getLeafConfig('tdRouteColor', 'primary')).toBe('t---t', {
        t: 'secondary',
      });
      expectObservable(service.getLeafConfig('tdRouteProgressState', 0)).toBe('t---t', { t: 0.5 });
    });
  });

  it('should return default config if no data is present in ActivatedRoute', () => {
    testScheduler.run(({ cold, expectObservable }) => {
      withRouteData([{}]);
      getEvents = jest.fn().mockReturnValue(cold('----e', { e: new ActivationEnd({} as any) }));
      expectObservable(service.getLeafConfig('tdRouteTags', [])).toBe('t---t', { t: [] });
      expectObservable(service.getLeafConfig('tdRouteColor', 'primary')).toBe('t---t', {
        t: 'primary',
      });
      expectObservable(service.getLeafConfig('tdRouteProgressState', 0)).toBe('t---t', { t: 0 });
    });
  });
});
