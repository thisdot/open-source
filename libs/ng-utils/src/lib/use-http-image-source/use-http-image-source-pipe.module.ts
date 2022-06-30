import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import {
  THIS_DOT_ERROR_IMAGE_PATH,
  THIS_DOT_LOADING_IMAGE_PATH,
} from './use-http-image-source.injector';
import { UseHttpImageSourcePipe } from './use-http-image-source.pipe';

@NgModule({
  imports: [CommonModule],
  declarations: [UseHttpImageSourcePipe],
  exports: [UseHttpImageSourcePipe],
})

/**
 * The base class for HttpImageSourcePipeModule.
 * A pipe for redirecting an `<img>` tag's `src` attribute request to use Angular's `HttpClient`
 *
 * @remarks
 * For details, see README.md.
 *
 * @static
 */
export class UseHttpImageSourcePipeModule {
  /**
   * Creates an Observable<IDBDatabase> stream.
   *
   * @example
   * // Import `UseHttpImageSourcePipeModule` from the package
   * import { UseHttpImageSourcePipeModule } from '@this-dot/ng-utils';
   *
   * // subscribing to the observable will create the database
   * *@NgModule({
   *    imports: [
   *      UseHttpImageSourcePipeModule.forRoot({
   *        loadingImagePath: './your-custom-loading-image.png',
   *        errorImagePath: './your-custom-error-image.png',
   *      })
   *    ]
   * })
   *
   * @remarks You can omit the configuration, by default the `loadingImagePath` and the `errorImagePath` both default to `null`.
   *
   * @param config - This is used to specify the `loadImagePath` (For displaying a custom loading image while the requested image loads) and the `errorImagePath` (For displaying a custom error image if the request fails)
   * @returns ModuleWithProviders<UseHttpImageSourcePipeModule>.
   */
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
