import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SecureImagePipe } from './secure-image.pipe';

@NgModule({
  imports: [CommonModule],
  declarations: [SecureImagePipe],
  exports: [SecureImagePipe],
})
export class SecureImagePipeModule {
  static forRoot(
    config: { loadingImagePath?: string; errorImagePath?: string } = {}
  ): ModuleWithProviders<SecureImagePipeModule> {
    return {
      ngModule: SecureImagePipeModule,
      providers: [
        {
          provide: 'THIS_DOT_LOADING_IMAGE_PATH',
          useValue: config.loadingImagePath || null,
        },
        {
          provide: 'THIS_DOT_ERROR_IMAGE_PATH',
          useValue: config.errorImagePath || null,
        },
      ],
    };
  }
}
