import { Component } from '@angular/core';
import { RouteConfigService } from '@this-dot/route-config';
import { AppRouteConfigParams } from './route-config-params';

@Component({
  selector: 'this-dot-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [RouteConfigService],
})
export class AppComponent {
  title$ = this.routeConfigService.getLeafConfig('title', 'Default Title');

  constructor(private routeConfigService: RouteConfigService<AppRouteConfigParams>) {}
}
