import {
  Directive,
  EmbeddedViewRef,
  Input,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { distinctUntilChanged, switchMap, takeUntil, tap } from 'rxjs/operators';
import { RouteConfigService, RouteData } from '../route-config.service';

export interface RouteDataDirectiveContext<C> {
  $implicit: C;
}

/**
 * This directive allows for access to the whole `data` property defined in the current [Route](https://angular.io/api/router/Route#data) from a Component's template.
 *
 * @example
 * <!-- We can use it as following: -->
 * <h1 *tdRouteData="let data">
 *   Current title is: {{ data.title }}
 * </h1>
 *
 * @example
 * <!-- It is also possible to pass a default value so that if a property is not defined in the Route we will still receive some value: -->
 * <h1 *tdRouteData="let data; defaultValue: { title: 'DefaultTitle', routeTags: ['defaultTag'] }">
 *   Current title is: {{ data.title }}
 * </h1>
 *
 * @example
 * <!-- If you want to access multiple properties in one component's template it is **recommended** to wrap the whole template with only one `*tdRouteData` directive. This approach follows DRY principle and is efficient as it only creates one subscription per template. -->
 * <ng-container *tdRouteData="let data; defaultValue: { title: 'DefaultTitle', routeTags: ['defaultTag'] }">
 *   <h1>
 *     Current title is: {{ data.title }}
 *   </h1>
 *   <p>
 *     Current route contains the following tags: {{ data.routeTags | json }}
 *   </p>
 * </ng-container>
 */
@Directive({
  selector: '[tdRouteData]',
})
export class RouteDataDirective<C extends RouteData> implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  private defaultValue$ = new BehaviorSubject<Partial<C>>({});
  private view!: EmbeddedViewRef<RouteDataDirectiveContext<Partial<C>>>;

  private data$ = this.defaultValue$.pipe(
    switchMap((defaultValue) => this.routeConfigService.getActivatedRouteConfig<C>(defaultValue)),
    distinctUntilChanged()
  );

  private createView$ = this.data$.pipe(
    tap((data) => {
      this.view.context = {
        $implicit: data,
      };
      this.view.markForCheck();
    })
  );

  @Input()
  set tdRouteDataDefaultValue(defaultValue: C) {
    this.defaultValue$.next(defaultValue);
  }

  constructor(
    private routeConfigService: RouteConfigService,
    private template: TemplateRef<RouteDataDirectiveContext<C>>,
    private entry: ViewContainerRef
  ) {}

  ngOnInit(): void {
    this.view = this.entry.createEmbeddedView(this.template, {
      $implicit: this.defaultValue$.value,
    });

    this.createView$.pipe(takeUntil(this.destroy$)).subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
