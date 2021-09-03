import { HttpClient, HttpResponse } from '@angular/common/http';
import { ChangeDetectorRef, Inject, OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { BehaviorSubject, of, Subscription } from 'rxjs';
import { catchError, distinctUntilChanged, filter, map, switchMap, tap } from 'rxjs/operators';
import {
  THIS_DOT_ERROR_IMAGE_PATH,
  THIS_DOT_LOADING_IMAGE_PATH,
} from './use-http-image-source.injector';

@Pipe({
  name: 'useHttpImgSrc',
  pure: false,
})
export class UseHttpImageSourcePipe implements PipeTransform, OnDestroy {
  private subscription = new Subscription();
  private loadingImagePath!: string;
  private errorImagePath!: string;
  private latestValue!: string | SafeUrl;
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
        filter((v): v is string => !!v),
        distinctUntilChanged(),
        switchMap((imagePath: string) =>
          this.httpClient.get(imagePath, { observe: 'response', responseType: 'blob' }).pipe(
            map((response: HttpResponse<Blob>) => URL.createObjectURL(response.body)),
            map((unsafeBlobUrl: string) => this.domSanitizer.bypassSecurityTrustUrl(unsafeBlobUrl)),
            filter((blobUrl) => blobUrl !== this.latestValue),
            catchError(() => of(this.errorImagePath))
          )
        ),
        tap((imagePath: string | SafeUrl) => {
          this.latestValue = imagePath;
          this.cdr.markForCheck();
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
}
