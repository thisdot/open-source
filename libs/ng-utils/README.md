<h1 align="center">Ng Utils ⚙️</h1>

`@this-dot/ng-utils` is a collection of Angular utils which we would like to continuously extend and improve.

--

<p align="center">
  <a href="https://www.npmjs.com/package/@this-dot/ng-utils"><img src="https://img.shields.io/badge/%40this--dot-%2Fng--utils-blueviolet" /></a>
  <a href="https://www.npmjs.com/package/@this-dot/ng-utils"><img src="https://img.shields.io/npm/v/@this-dot/ng-utils" /></a>
  <a href="https://github.com/thisdot/open-source/actions/workflows/ci.yml?query=branch%3Amain"><img src="https://github.com/thisdot/open-source/actions/workflows/ci.yml/badge.svg" /></a>
  <a href="https://github.com/thisdot/open-source/blob/main/LICENSE.md"><img src="https://img.shields.io/npm/l/@this-dot/ng-utils" /></a>
  <a href="https://github.com/thisdot/open-source/issues?q=is%3Aissue+is%3Aopen+label%3Ang-utils"><img src="https://img.shields.io/github/issues/thisdot/open-source?q=is%3Aissue+is%3Aopen+label%3Ang-utils" /></a>
</p>

---

## Usage

### Installation

Install the package:  
`npm install @this-dot/ng-utils`  
or  
`yarn add @this-dot/ng-utils`

## useHttpImgSrc pipe

A pipe for redirecting an `<img>` tag's `src` attribute request to use Angular's `HttpClient`.

It supports:

✅ &nbsp;Fetching images using the `HttpClient`, so the requests will hit all the `HttpInterceptor` implementations that are needed <br/>
✅ &nbsp;Displaying a custom loading image while the requested image loads <br/>
✅ &nbsp;Displaying a custom error image if the request fails <br/>

### Using in your Angular app

Import the `UseHttpImageSourcePipeModule` from the package

```typescript
import { UseHttpImageSourcePipeModule } from '@this-dot/ng-utils';
```

then add it to the imports array in the Angular module with the configurations:

```typescript
@NgModule({
  /* other module props  */
  imports: [
    UseHttpImageSourcePipeModule.forRoot({
      loadingImagePath: '/assets/images/your-custom-loading-image.png',
      errorImagePath: 'assets/images/your-custom-error-image.png',
    }),
    /* other modules */
  ],
})
export class AppModule {}
```

You can omit the configuration, by default the `loadingImagePath` and the `errorImagePath` both default to `null`.

To use the module's provide pipe, just add `UseHttpImageSourcePipeModule` in your submodule that uses them. E.g.

```ts
@NgModule({
  /* other module props  */
  imports: [UseHttpImageSourcePipeModule /* other modules */],
})
export class YourSubModule {}
```

### Examples

#### useHttpImgSrc pipe with default config

Use the `useHttpImgSrc` pipe to request the source image using the `HttpClient`

```html
<ng-container *ngFor="let image of images$ | async"
  <img width="200px" [src]="image.src | useHttpImgSrc" />
</ng-container>

```

#### useHttpImgSrc pipe with custom config

You can override the default loading and error images with the following syntax:

```html
<ng-container *ngFor="let image of images$ | async"
  <img width="200px" [src]="image.src | useHttpImgSrc:'/assets/loading.png':'/assets/error.png'" />
</ng-container>

```
