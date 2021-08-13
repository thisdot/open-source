import { HttpClient, HttpResponse } from '@angular/common/http';
import { ChangeDetectorRef, Inject, OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { BehaviorSubject, of, Subscription } from 'rxjs';
import { catchError, filter, map, switchMap } from 'rxjs/operators';

@Pipe({
  name: 'secureImage',
  pure: false,
})
export class SecureImagePipe implements PipeTransform, OnDestroy {
  private subscription!: Subscription;
  private loadingImagePath!: string;
  private errorImagePath!: string;
  private latestValue!: string | SafeUrl;
  private transformValue = new BehaviorSubject<string>('');

  constructor(
    private httpClient: HttpClient,
    private domSanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
    @Inject('THIS_DOT_LOADING_IMAGE_PATH') private defaultLoadingImagePath: string,
    @Inject('THIS_DOT_ERROR_IMAGE_PATH') private defaultErrorImagePath: string
  ) {}

  transform(
    imagePath: string,
    loadingImagePath?: string,
    errorImagePath?: string
  ): string | SafeUrl {
    this.setLoadingAndErrorImagePaths(loadingImagePath, errorImagePath);
    if (!imagePath) {
      return this.errorImagePath;
    }
    if (!this.subscription) {
      this.setUpSubscription();
    }
    if (this.transformValue.getValue() !== imagePath) {
      this.transformValue.next(imagePath);
    }
    return this.latestValue || this.loadingImagePath;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private setUpSubscription(): void {
    this.subscription = this.transformValue
      .asObservable()
      .pipe(
        filter((v): v is string => !!v),
        switchMap((imagePath: string) =>
          this.httpClient.get(imagePath, { observe: 'response', responseType: 'blob' }).pipe(
            map((response: HttpResponse<Blob>) => URL.createObjectURL(response.body)),
            map((unsafeBlobUrl: string) => this.domSanitizer.bypassSecurityTrustUrl(unsafeBlobUrl)),
            filter((blobUrl) => blobUrl !== this.latestValue),
            catchError(() => of(this.errorImagePath))
          )
        )
      )
      .subscribe((imagePath: string | SafeUrl) => {
        this.latestValue = imagePath;
        this.cdr.markForCheck();
      });
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
