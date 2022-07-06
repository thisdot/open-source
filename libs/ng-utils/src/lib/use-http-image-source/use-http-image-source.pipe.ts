import { HttpClient, HttpResponse } from '@angular/common/http';
import { ChangeDetectorRef, Inject, OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { isTruthy } from '@this-dot/utils';
import { BehaviorSubject, of, Subscription } from 'rxjs';
import {
  catchError,
  distinctUntilChanged,
  filter,
  finalize,
  map,
  switchMap,
  tap,
} from 'rxjs/operators';
import {
  THIS_DOT_ERROR_IMAGE_PATH,
  THIS_DOT_LOADING_IMAGE_PATH,
} from './use-http-image-source.injector';

@Pipe({
  name: 'useHttpImgSrc',
  pure: false,
})

/**
 * The base class for HttpImageSourcePipe.
 *
 * @example
 * <!-- Use the `useHttpImgSrc` pipe to request the source image using the `HttpClient` -->
 * <ng-container *ngFor="let image of images$ | async"
 *  <img width="200px" [src]="image.src | useHttpImgSrc" />
 * </ng-container>
 *
 * @example
 * <!-- useHttpImgSrc pipe with custom config -->
 * <!-- You can override the default loading and error images with the following syntax: -->
 * <ng-container *ngFor="let image of images$ | async"
 *  <img width="200px" [src]="image.src | useHttpImgSrc:'/assets/loading.png':'/assets/error.png'" />
 * </ng-container>
 *
 * @remarks Returns a valid url path (blob path, loadingImagePath or errorImagePath) or null based on image fetching state
 * @remarks This returns the passed loadingImagePath when fetching the image and a valid blob url if the image is fetched successfully, or the errorImagePath if it fails
 *
 * @param imagePath - This is used to specify the `imagePath`
 * @param loadingImagePath - This is used to specify the `loadImagePath` For displaying a custom loading image while the requested image loads.
 * @param errorImagePath - This is used to specify the `errorImagePath` For displaying a custom error image if the request fails.
 */
export class UseHttpImageSourcePipe implements PipeTransform, OnDestroy {
  private subscription = new Subscription();
  private loadingImagePath!: string;
  private errorImagePath!: string;
  private latestValue?: SafeUrl;
  private latestBlobUrl?: string;
  private transformValue = new BehaviorSubject<string>('');

  constructor(
    private httpClient: HttpClient,
    private domSanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
    @Inject(THIS_DOT_LOADING_IMAGE_PATH) private defaultLoadingImagePath: string,
    @Inject(THIS_DOT_ERROR_IMAGE_PATH) private defaultErrorImagePath: string
  ) {
    this.setUpSubscription();
  }

  transform(
    imagePath: string,
    loadingImagePath?: string,
    errorImagePath?: string
  ): string | SafeUrl {
    this.setLoadingAndErrorImagePaths(loadingImagePath, errorImagePath);
    if (!imagePath) {
      return this.errorImagePath;
    }
    this.transformValue.next(imagePath);
    return this.latestValue || this.loadingImagePath;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private setUpSubscription(): void {
    const transformSubscription = this.transformValue
      .asObservable()
      .pipe(
        filter(isTruthy),
        distinctUntilChanged(),
        tap(() => (this.latestValue = undefined)),
        switchMap((imagePath: string) =>
          this.httpClient.get(imagePath, { observe: 'response', responseType: 'blob' }).pipe(
            map((response: HttpResponse<Blob>) => URL.createObjectURL(response.body as Blob)),
            tap((blobUrl) => {
              this.revokeLatestBlob();
              this.latestBlobUrl = blobUrl;
            }),
            map((unsafeBlobUrl: string) => this.domSanitizer.bypassSecurityTrustUrl(unsafeBlobUrl)),
            filter((blobUrl) => blobUrl !== this.latestValue),
            catchError(() => of(this.errorImagePath))
          )
        ),
        tap((imagePath: string | SafeUrl) => {
          this.latestValue = imagePath;
          this.cdr.markForCheck();
        }),
        finalize(() => {
          this.revokeLatestBlob();
        })
      )
      .subscribe();
    this.subscription.add(transformSubscription);
  }

  private setLoadingAndErrorImagePaths(
    loadingImagePath: string = this.defaultLoadingImagePath,
    errorImagePath: string = this.defaultErrorImagePath
  ): void {
    if (this.loadingImagePath && this.errorImagePath) {
      return;
    }
    this.loadingImagePath = loadingImagePath;
    this.errorImagePath = errorImagePath;
  }

  private revokeLatestBlob() {
    if (this.latestBlobUrl) {
      URL.revokeObjectURL(this.latestBlobUrl);
      this.latestBlobUrl = undefined;
    }
  }
}
