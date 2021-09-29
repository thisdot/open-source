import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { RouteConfigService } from '@this-dot/route-config';
import { pluck } from 'rxjs/operators';
import { AppRouteConfigParams, AppRouteTag, AppRouteTags } from './route-config-params';

@Component({
  selector: 'this-dot-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  readonly title$ = this.routeConfigService.getLeafConfig('title', 'Default Title');
  readonly isHamburgerMenuDisplayed$ = this.breakpointObserver
    .observe([Breakpoints.Handset, Breakpoints.TabletPortrait])
    .pipe(pluck('matches'));
  readonly AppRouteTags = AppRouteTags;
  @ViewChild('sidenav')
  sidenav!: MatSidenav;

  constructor(
    private routeConfigService: RouteConfigService<AppRouteTag, AppRouteConfigParams>,
    private breakpointObserver: BreakpointObserver
  ) {}

  toggleSidenav(): void {
    this.sidenav.toggle();
  }
}
