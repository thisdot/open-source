import {
  Directive,
  EmbeddedViewRef,
  Input,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { distinctUntilChanged, switchMap, takeUntil, tap } from 'rxjs/operators';
import { BehaviorSubject, Subject } from 'rxjs';
import { RouteConfigService } from '../route-config.service';

export interface RouteDataDirectiveContext<C> {
  $implicit: C;
}

@Directive({
  selector: '[tdRouteData]',
})
export class RouteDataDirective<C> implements OnInit, OnDestroy {
  private destroy$ = new Subject();

  private defaultValues$ = new BehaviorSubject<C>({} as C);
  private view!: EmbeddedViewRef<RouteDataDirectiveContext<C>>;

  private data$ = this.defaultValues$.pipe(
    switchMap((defaultValue) => this.routeConfigService.getWholeLeafConfig(defaultValue)),
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
    this.defaultValues$.next(defaultValue);
  }

  constructor(
    private routeConfigService: RouteConfigService,
    private template: TemplateRef<RouteDataDirectiveContext<C>>,
    private entry: ViewContainerRef
  ) {}

  ngOnInit(): void {
    this.view = this.entry.createEmbeddedView(this.template, {
      $implicit: this.defaultValues$.value,
    });

    this.createView$.pipe(takeUntil(this.destroy$)).subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
