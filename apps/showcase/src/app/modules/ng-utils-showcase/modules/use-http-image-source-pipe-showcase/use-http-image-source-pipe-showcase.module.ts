import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UseHttpImageSourcePipeModule } from '@this-dot/ng-utils';

import { UseHttpImageSourcePipeShowcaseRoutingModule } from './use-http-image-source-pipe-showcase-routing.module';
import { UseHttpImageSourcePipeShowcaseComponent } from './components/use-http-image-source-pipe-showcase/use-http-image-source-pipe-showcase.component';

@NgModule({
  declarations: [UseHttpImageSourcePipeShowcaseComponent],
  imports: [
    CommonModule,
    UseHttpImageSourcePipeModule,
    UseHttpImageSourcePipeShowcaseRoutingModule,
  ],
})
export class UseHttpImageSourcePipeShowcaseModule {}
