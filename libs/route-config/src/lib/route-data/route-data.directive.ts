import {
  Directive,
  EmbeddedViewRef,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  Optional,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { distinctUntilChanged, switchMap, takeUntil, tap } from 'rxjs/operators';
import { BehaviorSubject, Subject } from 'rxjs';
import { RouteConfigService, RouteData } from '../route-config.service';
import { ROUTE_DATA_DEFAULT_VALUE } from './route-data-default-value-token';

export interface RouteDataDirectiveContext<C> {
  $implicit: C;
}

@Directive({
  selector: '[tdRouteData]',
})
export class RouteDataDirective<C extends RouteData> implements OnInit, OnDestroy {
  private destroy$ = new Subject();

  private paramDefaultValues$ = new BehaviorSubject<Partial<C> | null>(null);
  private view!: EmbeddedViewRef<RouteDataDirectiveContext<Partial<C>>>;

  private data$ = this.paramDefaultValues$.pipe(
    switchMap((paramDefaultValue) =>
      this.routeConfigService.getWholeLeafConfig<C>({
        ...this.injectedDefaultValue,
        ...paramDefaultValue,
      })
    ),
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

  private get injectedDefaultValue(): Partial<C> {
    return this._injectedDefaultValue || {};
  }

  @Input()
  set tdRouteDataDefaultValue(defaultValue: C) {
    this.paramDefaultValues$.next(defaultValue);
  }

  constructor(
    private routeConfigService: RouteConfigService,
    private template: TemplateRef<RouteDataDirectiveContext<C>>,
    private entry: ViewContainerRef,
    @Optional() @Inject(ROUTE_DATA_DEFAULT_VALUE) private _injectedDefaultValue?: C
  ) {}

  ngOnInit(): void {
    this.view = this.entry.createEmbeddedView(this.template, {
      $implicit: { ...this.injectedDefaultValue, ...this.paramDefaultValues$.value },
    });

    this.createView$.pipe(takeUntil(this.destroy$)).subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
