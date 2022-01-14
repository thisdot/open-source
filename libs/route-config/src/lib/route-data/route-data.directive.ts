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
