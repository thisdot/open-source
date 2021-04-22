import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, ActivationEnd, Event, Router } from '@angular/router';
import { Provider, Type } from '@angular/core';
import { RouteConfigService, RouteData } from '@this-dot/route-tags';
import { EMPTY, Observable, of, Subject } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';

const provideMock = <T>(type: Type<T>, mock: Partial<T>): Provider => ({
  provide: type,
  useValue: mock,
});

describe('RouteConfigService', () => {
  let service: RouteConfigService;
  let events: Subject<Event>;
  let testScheduler: TestScheduler;

  let getEvents = jest.fn().mockReturnValue(EMPTY);
  let pathFromRoot = jest.fn().mockReturnValue([]);
  const firstChild = jest.fn().mockReturnValue(null);

  const withRouteData = (dataArr: Array<Partial<RouteData>>) => {
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
          cmRouteTags: routeTags,
        },
      ]);
      getEvents = jest.fn().mockReturnValue(cold('----e', { e: new ActivationEnd({} as any) }));
      expectObservable(service.getLeafConfig('cmRouteTags', [])).toBe('t---t', { t: routeTags });
    });
  });

  it('should return routeTags from last ActivatedRoute', () => {
    const routeTags = ['tag1'];
    const routeTags2 = ['tag2'];
    testScheduler.run(({ cold, expectObservable }) => {
      withRouteData([
        {
          cmRouteTags: routeTags,
        },
        {},
        {
          cmRouteTags: routeTags2,
        },
      ]);
      getEvents = jest.fn().mockReturnValue(cold('----e', { e: new ActivationEnd({} as any) }));
      expectObservable(service.getLeafConfig('cmRouteTags', [])).toBe('t---t', { t: routeTags2 });
    });
  });

  it('should return routeTags from last ActivatedRoute that contains data', () => {
    const routeTags = ['tag1'];
    const routeTags2 = ['tag2'];
    testScheduler.run(({ cold, expectObservable }) => {
      withRouteData([
        {
          cmRouteTags: routeTags,
        },
        {
          cmRouteTags: routeTags2,
        },
        {},
      ]);
      getEvents = jest.fn().mockReturnValue(cold('----e', { e: new ActivationEnd({} as any) }));
      expectObservable(service.getLeafConfig('cmRouteTags', [])).toBe('t---t', { t: routeTags2 });
    });
  });

  it('should return config from last ActivatedRoute that contains that config', () => {
    const routeTags = ['tag1'];
    testScheduler.run(({ cold, expectObservable }) => {
      withRouteData([
        {
          cmRouteTags: routeTags,
        },
        {
          cmRouteColor: 'secondary',
        },
        {
          cmRouteProgressState: 0.5,
        },
      ]);
      getEvents = jest.fn().mockReturnValue(cold('----e', { e: new ActivationEnd({} as any) }));
      expectObservable(service.getLeafConfig('cmRouteTags', [])).toBe('t---t', { t: routeTags });
      expectObservable(service.getLeafConfig('cmRouteColor', 'primary')).toBe('t---t', {
        t: 'secondary',
      });
      expectObservable(service.getLeafConfig('cmRouteProgressState', 0)).toBe('t---t', { t: 0.5 });
    });
  });

  it('should return default config if no data is present in ActivatedRoute', () => {
    testScheduler.run(({ cold, expectObservable }) => {
      withRouteData([{}]);
      getEvents = jest.fn().mockReturnValue(cold('----e', { e: new ActivationEnd({} as any) }));
      expectObservable(service.getLeafConfig('cmRouteTags', [])).toBe('t---t', { t: [] });
      expectObservable(service.getLeafConfig('cmRouteColor', 'primary')).toBe('t---t', {
        t: 'primary',
      });
      expectObservable(service.getLeafConfig('cmRouteProgressState', 0)).toBe('t---t', { t: 0 });
    });
  });
});
