import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import {
  THIS_DOT_ERROR_IMAGE_PATH,
  THIS_DOT_LOADING_IMAGE_PATH,
} from './use-http-image-source.injectior';
import { UseHttpImageSourcePipe } from './use-http-image-source.pipe';

@NgModule({
  imports: [CommonModule],
  declarations: [UseHttpImageSourcePipe],
  exports: [UseHttpImageSourcePipe],
})
export class UseHttpImageSourcePipeModule {
  static forRoot(
    config: { loadingImagePath?: string; errorImagePath?: string } = {}
  ): ModuleWithProviders<UseHttpImageSourcePipeModule> {
    return {
      ngModule: UseHttpImageSourcePipeModule,
      providers: [
        {
          provide: THIS_DOT_LOADING_IMAGE_PATH,
          useValue: config.loadingImagePath || null,
        },
        {
          provide: THIS_DOT_ERROR_IMAGE_PATH,
          useValue: config.errorImagePath || null,
        },
      ],
    };
  }
}
