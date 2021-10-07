import { Injectable, OnDestroy, TemplateRef, ViewContainerRef } from '@angular/core';
import { isTruthy } from '@this-dot/utils';
import { BehaviorSubject, combineLatest, Subject } from 'rxjs';
import { distinctUntilChanged, filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { RouteConfigService } from '../route-config.service';

@Injectable()
export class RouteDataHasService<
  CThen,
  CElse,
  RouteTags extends string = string,
  RoutePropNames extends string = string
> implements OnDestroy
{
  private template!: TemplateRef<CThen>;
  private viewContainer!: ViewContainerRef;
  private tags$ = new BehaviorSubject<RouteTags[]>([]);
  private propName$ = new BehaviorSubject<RoutePropNames | undefined>(undefined);
  private elseTemplate$ = new BehaviorSubject<TemplateRef<CElse> | null>(null);
  private destroy$ = new Subject();

  private display$ = combineLatest([
    this.tags$,
    this.propName$.pipe(
      filter(isTruthy),
      switchMap((propName) => this.routeConfigService.getLeafConfig<string[]>(propName, []))
    ),
  ]).pipe(
    map(([tags, routeValues]) => !!tags.find((tag: RouteTags) => routeValues.includes(tag))),
    distinctUntilChanged()
  );

  private readonly createView$ = combineLatest([this.display$, this.elseTemplate$]).pipe(
    tap(() => this.viewContainer.clear()),
    tap(([show, elseTemplate]) =>
      show
        ? void this.viewContainer.createEmbeddedView(this.template)
        : void (elseTemplate && this.viewContainer.createEmbeddedView(elseTemplate))
    )
  );

  setTags(tags: RouteTags | RouteTags[]) {
    const tagArray = Array.isArray(tags) ? tags : [tags];
    this.tags$.next(tagArray);
  }

  setPropName(propName: RoutePropNames) {
    this.propName$.next(propName);
  }

  setElseTemplate(elseTemplate: TemplateRef<CElse>) {
    this.elseTemplate$.next(elseTemplate);
  }

  constructor(private routeConfigService: RouteConfigService<string, string>) {}

  init(template: TemplateRef<CThen>, viewContainer: ViewContainerRef) {
    this.template = template;
    this.viewContainer = viewContainer;
    this.createView$.pipe(takeUntil(this.destroy$)).subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
