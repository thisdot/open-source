import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouteDataDirective } from './route-data.directive';

@NgModule({
  declarations: [RouteDataDirective],
  imports: [CommonModule],
  exports: [RouteDataDirective],
})
export class RouteDataModule {}
