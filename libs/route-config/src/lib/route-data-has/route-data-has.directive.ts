import { Directive, Input, OnDestroy, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { BehaviorSubject, combineLatest, Subject } from 'rxjs';
import { distinctUntilChanged, filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { RouteConfigService } from '../route-config.service';

@Directive({
  selector: '[tdRouteDataHas]',
})
export class RouteDataHasDirective<CThen, CElse, RouteTags extends string = string>
  implements OnInit, OnDestroy
{
  private tags$ = new BehaviorSubject<RouteTags[]>([]);
  private propName$ = new BehaviorSubject<string>('');
  private elseTemplate$ = new BehaviorSubject<TemplateRef<CElse> | null>(null);
  private destroy$ = new Subject();

  private display$ = combineLatest([
    this.tags$,
    this.propName$.pipe(
      filter((v) => !!v),
      switchMap((propName) => this.routeConfigService.getLeafConfig<string[]>(propName, []))
    ),
  ]).pipe(
    map(([tags, routeValues]) => !!tags.find((tag: RouteTags) => routeValues.includes(tag))),
    distinctUntilChanged()
  );

  private createView$ = combineLatest([this.display$, this.elseTemplate$]).pipe(
    tap(() => this.entry.clear()),
    tap(([show, elseTemplate]) =>
      show
        ? void this.entry.createEmbeddedView(this.template)
        : void (elseTemplate && this.entry.createEmbeddedView(elseTemplate))
    )
  );

  @Input()
  set tdRouteDataHas(tags: RouteTags | RouteTags[]) {
    const tagArray = Array.isArray(tags) ? tags : [tags];
    this.tags$.next(tagArray);
  }

  @Input()
  set tdRouteDataHasPropName(propName: string) {
    this.propName$.next(propName);
  }

  @Input()
  set tdRouteDataHasElse(elseTemplate: TemplateRef<CElse>) {
    this.elseTemplate$.next(elseTemplate);
  }

  constructor(
    private routeConfigService: RouteConfigService<string, string>,
    private template: TemplateRef<CThen>,
    private entry: ViewContainerRef
  ) {}

  ngOnInit(): void {
    this.createView$.pipe(takeUntil(this.destroy$)).subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
