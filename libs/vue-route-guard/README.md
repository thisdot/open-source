<h1 align="center">Vue Route Guard 🛡️</h1>

Vue Route Guard is an Vue library that wraps around the vue-router and extends it to provide helpful methods to handle page guards via token authorization and permissions.

It supports:

✅ &nbsp;Adding guards to pages<br/>
✅ &nbsp;Ability to choose between different storage options for storing token<br/>
✅ &nbsp;Storing and Retrieving authentication data (user details and token)<br/>
✅ &nbsp;Exposes method for checking matching page permission within components and pages<br/>

---

## Installation

Install the package:  
`npm install @this-dot/vue-route-guard`  
or  
`yarn add @this-dot/vue-route-guard`

## Usage

To get started, we will need to register Vue Route Guard.

### Register using Vue.use

It is very simple to add route guard to your Vue app:

Just import the `setupGuard` module

```ts
import { setupGuard } from '@this-dot/vue-route-guard';
```

Install the plugin

```ts
vue.use(setupGuard(guardConfig));
```

### Router Meta

We extended the default router meta to accept the following fields:

| Field        | Description                                           | Required | Type     |
| ------------ | ----------------------------------------------------- | -------- | -------- |
| requiresAuth | Describes if the page requires authentication         | true     | boolean  |
| access       | Describes the access permissions needed for the route | false    | string[] |

### Guard Config

setupGuard requires to pass an object with the following fields:

| Field                        | Description                                                                                                       | Required | Type             |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------- | -------- | ---------------- |
| router                       | The router instance used in your vue app                                                                          | true     | Router           |
| token.name                   | The name used to store and retrieve the token                                                                     | true     | string           |
| token.storage                | Storage type (This defaults to session storage)                                                                   | false    | StorageType      |
| redirect.noAuthentication    | page to redirect to if no token found or fetchAuthentication fails                                                | false    | RouteLocationRaw |
| redirect.noPermission        | page to redirect to if permission is not in route meta access (redirects to noAuthentication if it is not passed) | false    | RouteLocationRaw |
| redirect.clearAuthentication | page to redirect to after clearing authentication (redirects to noAuthentication if it is not passed)             | false    | RouteLocationRaw |
| options.fetchAuthentication  | This is expects function that returns an object with the authentication information                               | true     | Promise<{}>      |
| options.permissionKey        | Describes the field that holds the authentication permission in `fetchAuthentication` (default permission)        | false    | string           |

#### Example

Create a sample router and guard configuration:

```ts
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
      meta: {
        requiresAuth: true,
        access: ['admin'],
      },
    },
    {
      path: '/no-permission',
      name: 'no-permission',
      component: () => import('../views/NoPermissionView.vue'),
      meta: {
        requiresAuth: false,
      },
    },
  ],
});
const guardConfig = {
  router: router,
  token: {
    name: 'XSRF-TOKEN',
  },
  redirect: {
    noAuthentication: '/login',
    clearAuthentication: '/login',
    noPermission: '/no-permission',
  },
  options: {
    fetchAuthentication: () => {
      return new Promise(function (resolve, reject) {
        return resolve({
          firstName: 'firstName',
          lastName: 'lastName',
          login: true,
          permission: ['user'],
        });
      });
    },
  },
};
vue.use(setupGuard(guardConfig));
```

Create a guard config using token.
`expires`: it can be a valid date string or a number to represent the days
`path`: page path for cookie

```ts
const guardConfig = {
  router: router,
  token: {
    name: 'XSRF-TOKEN',
    storage: StorageType.cookieStorage,
    attributes: {
      path: '/',
      expires: 2, // cookie to expire in 2 days
    },
  },
  redirect: {
    noAuthentication: '/login',
    clearAuthentication: '/login',
    noPermission: '/no-permission',
  },
  options: {
    fetchAuthentication: () => {
      return new Promise(function (resolve, reject) {
        return resolve({
          firstName: 'firstName',
          lastName: 'lastName',
          login: true,
          permission: ['user'],
        });
      });
    },
  },
};
```

### Access Authentication State

```html
<template>
  <div>{{ auth.$store.state.authentication }}</div>
</template>
<script setup lang="ts">
  import { useGuard } from '@this-dot/vue-route-guard';

  const auth = useGuard();
</script>
```

### Clear Authentication

```html
<script setup lang="ts">
  import { useGuard } from '@this-dot/vue-route-guard';

  const auth = useGuard();

  const logout = () => {
    auth.clearAuthentication().then(() => {
      console.log('cleared authentication');
    });
  };
</script>
```

### Refresh Authentication

This calls fetch authentication and updates the state with the new authentication details

```html
<template>
  <div>
    <span>{{ auth.$store.state.authentication }}</span>
    <button @click="updateAuthentiationInformation">Update</button>
  </div>
</template>
<script setup lang="ts">
  import { useGuard } from '@this-dot/vue-route-guard';

  const auth = useGuard();

  const updateAuthentiationInformation = () => {
    auth.refreshAuthentication();
  };
</script>
```

### Check if user has access

`hasAuthenticationAccess` can be accessed from useGuard and called to check if user has access to specific permission

```html
<template>
  <header>
    <div class="wrapper">
      <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink v-if="auth.hasAuthenticationAccess(['admin'])" to="/about">About</RouterLink>
      </nav>
    </div>
  </header>

  <RouterView />
</template>

<script setup lang="ts">
  import { useGuard } from '@ds-library/ui';

  const auth = useGuard();
</script>
```
