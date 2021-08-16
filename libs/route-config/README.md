<h1 align="center">Route Config ⚙️</h1>

Route Config is an Angular library that provides tools to easily set and access the properties defined in [RouterModule](https://angular.io/api/router/RouterModule) configuration. It offers some built in tools that work out of the box but also is easily extensible via `data` property of Angular's [Route](https://angular.io/api/router/Route#data) configuration object.

It supports:

✅ &nbsp;Displaying parts of component's template based on the tags defined in the Router config <br/>
✅ &nbsp;Retrieving custom properties defined in currently rendered route <br/>
✅ &nbsp;Type safety for custom properties <br/>

---

<p align="center">
  <a href="https://www.npmjs.com/package/@this-dot/route-config"><img src="https://img.shields.io/badge/%40this--dot-%2Froute--config-blueviolet" /></a>
  <a href="https://www.npmjs.com/package/@this-dot/route-config"><img src="https://img.shields.io/npm/v/@this-dot/route-config" /></a>
  <a href="https://github.com/thisdot/open-source/actions/workflows/ci.yml?query=branch%3Amain"><img src="https://github.com/thisdot/open-source/actions/workflows/ci.yml/badge.svg" /></a>
  <a href="https://github.com/thisdot/open-source/blob/main/LICENSE.md"><img src="https://img.shields.io/npm/l/@this-dot/route-config" /></a>
  <a href="https://github.com/thisdot/open-source/issues"><img src="https://img.shields.io/github/issues/thisdot/open-source" /></a>
</p>

---

## Usage

### Installation

Install the package:  
`npm install @this-dot/route-config`  
or  
`yarn install @this-dot/route-config`

### Using in your Angular app

It is very simple to add route-config to your Angular app:

Just import the `RouteConfigModule` module

```ts
import { RouteConfigModule } from '@this-dot/route-config';
```

and add it to the imports array in the Angular module

```ts
@NgModule({
  /* other module props  */
  imports: [RouteConfigModule.forRoot() /* other modules */],
})
export class AppModule {}
```

The library's elements use Angular's router `data` object to configure the behavior. See the below examples on how to use it in your application.

To use library's provided directives and/or pipes just add `RouteConfigModule` in your submodule that uses them. E.g.

```ts
@NgModule({
  /* other module props  */
  imports: [RouteConfigModule /* other modules */],
})
export class YourSubModule {}
```

### Examples

#### `*tdRouteTag` directive

To configure this directive lets create the following sample router configuration:

```ts
@NgModule({
  declarations: [FirstRouteComponent, SecondRouteComponent],
  imports: [
    RouterModule.forRoot([
      {
        path: 'first',
        component: FirstRouteComponent,
        data: {
          routeTags: ['show'],
        },
      },
      {
        path: 'second',
        component: SecondRouteComponent,
      },
    ]),
  ],
  exports: [RouterModule],
})
export class AppModule {}
```

Now we can use it in the component's template

```angular2html
<p *tdRouteTag="'show'">
  This text is only visible, if there is a 'show' tag in the route data's `routeTags` Array
</p>
```

`*tdRouteTag` provides a way do display a fallback template if a given tag is not present

```angular2html
<p *tdRouteTag="'show'; else noShowTag">
  This text is only visible, if there is a 'show' tag in the route data's `routeTags` Array
</p>
<ng-template #noShowTag>
  <p>There is no show tag in this route's config</p>
</ng-template>
```

#### `*tdRouteData` directive

This directive allows for access to the whole `data` property defined in the current [Route](https://angular.io/api/router/Route#data) from a Component's template.

We can use it as following:

```angular2html
<h1 *tdRouteData="let data">
  Current title is: {{ data.title }}
</h1>
```

It is also possible to pass a default value so that if a property is not defined in the Route we will still receive some value:

```angular2html
<h1 *tdRouteData="let data; defaultValue: { title: 'DefaultTitle', routeTags: ['defaultTag'] }">
  Current title is: {{ data.title }}
</h1>
```

If you want to access multiple properties in one component's template it is **recommended** to wrap the whole template with only one `*tdRouteData` directive. This approach follows DRY principle and is efficient as it only creates one subscription per template.

```angular2html
<ng-container *tdRouteData="let data; defaultValue: { title: 'DefaultTitle', routeTags: ['defaultTag'] }">
  <h1>
    Current title is: {{ data.title }}
  </h1>
  <p>
    Current route contains the following tags: {{ data.routeTags | json }}
  </p>
</ng-container>
```

#### RouteConfigService

In every component you can inject `RouteConfigService` to get the current route configuration properties.

```ts
export class AppComponent {
  constructor(private routeConfigService: RouteConfigService) {}
}
```

You can use `getLeafConfig` method to get the Observable with current route's property value

```ts
export class AppComponent {
  tags$ = this.routeConfigService.getLeafConfig('routeTags', ['no tags']);
}
```

Now you can treat it as any other Observable and use e.g. `async` pipe to display the current value

```angular2html
<h1>{{ tags$ | async }}</h1>
```

It is also possible to retrieve the whole `data` object by using `getWholeLeafConfig`:

```ts
export class AppComponent {
  data$ = this.routeConfigService.getWholeLeafConfig();
  dataWithDefaultValue$ = this.routeConfigService.getWholeLeafConfig({
    routeTags: ['defaultTag'],
    title: 'Default Title',
  });
}
```

And if you want to use your custom data properties you can create your custom types:

```ts
export type AppRouteConfigParams = 'title';

export type AppRouteTag = keyof typeof AppRouteTags;

export enum AppRouteTags {
  show = 'show',
}
```

and provide them when injecting `RouteConfigService`

```ts
export class AppComponent {
  title$ = this.routeConfigService.getLeafConfig('title', 'Default Title');

  constructor(private routeConfigService: RouteConfigService<AppRouteTag, AppRouteConfigParams>) {}
}
```

In this case your example router config can look like this:

```ts
@NgModule({
  declarations: [FirstRouteComponent, SecondRouteComponent],
  imports: [
    RouterModule.forRoot([
      {
        path: 'first',
        component: FirstRouteComponent,
        data: {
          routeTags: [AppRouteTags.show], // use enum to get more type safety
        },
      },
      {
        path: 'second',
        component: SecondRouteComponent,
        data: {
          title: 'Second Route Title',
        },
      },
    ]),
  ],
  exports: [RouterModule],
})
export class AppModule {}
```

#### Providing default value globally

Both `*tdRouteData` and `RouteConfigService` allow for providing a default value in case route data doesn't provide a certain property. It is also possible to provide a default value globally by providing `ROUTE_DATA_DEFAULT_VALUE` injection token when configuring the root module:

```ts
@NgModule({
  /* other module props  */
  imports: [RouteConfigModule.forRoot() /* other modules */],
  provide: [
    {
      provide: ROUTE_DATA_DEFAULT_VALUE,
      useValue: {
        title: 'Injected Default Title',
        someDefaultParam: 'Some other default param',
      },
    },
  ],
})
export class AppModule {}
```

This way we don't need to provide default value each time we use `*tdRouteData` or `RouteConfigService`. However, if a different default value is necessary it still can be provided - and it will overwrite the value injected with a token.
