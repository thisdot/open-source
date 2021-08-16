import { InjectionToken } from '@angular/core';
import { RouteData } from './route-config.service';

export const ROUTE_DATA_DEFAULT_VALUE = new InjectionToken<RouteData>('Route Data default value');
