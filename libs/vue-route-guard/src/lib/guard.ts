import * as Vue from 'vue';
import { Router } from 'vue-router';
import { isArrayIntersecting } from './helpers';
import {
  GuardConfig,
  GuardConfigOptions,
  GuardConfigRedirect,
  GuardConfigStore,
  GuardConfigToken,
  CookieAttributes,
} from './types';
import Storage from './storage';

const defaultOptions = {
  permissionKey: 'permission',
};

let guardStore: GuardConfigStore;

export default class Guard {
  public $store: GuardConfigStore;
  static router: Router;
  static tokenConfig: GuardConfigToken;
  static redirect: GuardConfigRedirect;
  static options: GuardConfigOptions;
  static storage: Storage;
  static packageKey: string;

  constructor(config: GuardConfig, packageKey: string) {
    if (!config.token?.name) {
      throw Error('@thisdot/vue-route-guard: Token name is not set');
    }

    Guard.router = config.router;
    Guard.tokenConfig = config.token;
    Guard.redirect = config.redirect || {};
    Guard.options = Object.assign({}, defaultOptions, config.options);
    Guard.storage = new Storage(config.token.storage);
    Guard.packageKey = packageKey;

    guardStore = Vue.reactive({
      state: {
        loading: false,
        authentication: null,
        isAuthenticated: false,
      },
    });

    this.$store = guardStore;

    Guard.initializeAuthentication();

    Guard.router.beforeEach((guard) => {
      // check if route requires authentication and authentication exists
      if (guard.meta.requiresAuth && !guardStore.state.isAuthenticated) {
        return Guard.redirect.noAuthentication || false;
      }

      // check if route requires authentication and authentication access exists
      if (guard.meta.requiresAuth && !this.hasAuthenticationAccess(guard.meta.access)) {
        return Guard.redirect.noPermission || Guard.redirect.noAuthentication || false;
      }

      return true;
    });
  }

  public install(app: Vue.App) {
    app.config.globalProperties[`$${Guard.packageKey}`] = this;

    app.provide(Guard.packageKey, this);
  }

  public token() {
    return Guard.storage.get(Guard.tokenConfig.name);
  }

  public isAuthenticated() {
    return guardStore.state.isAuthenticated;
  }

  public hasAuthenticationAccess(permission: string[] = []) {
    const permissionKey = Guard.options.permissionKey;
    if (
      guardStore.state.isAuthenticated === true &&
      (permission.length === 0 ||
        (permission.length > 0 &&
          permissionKey &&
          guardStore.state.authentication &&
          guardStore.state.authentication[permissionKey] &&
          isArrayIntersecting(
            permission,
            guardStore.state.authentication[permissionKey] as string[]
          )))
    ) {
      return true;
    }

    return false;
  }

  public async clearAuthentication() {
    Guard.clearAuthenticationState();
    Guard.clearToken();

    const redirectRoute = Guard.redirect.clearAuthentication || Guard.redirect.noAuthentication;
    if (redirectRoute) {
      Guard.router.push(redirectRoute);
    }
    return true;
  }

  public async refreshAuthentication() {
    await Guard.initializeAuthentication();
    return true;
  }

  public async setToken({ token, attributes }: { token: string; attributes?: CookieAttributes }) {
    const tokenAttributes = Object.assign({}, Guard.tokenConfig.attributes, attributes);
    Guard.storage.set(Guard.tokenConfig.name, token, tokenAttributes);
    await Guard.initializeAuthentication();
    return true;
  }

  static isTokenAvailable() {
    return !!Guard.storage.get(Guard.tokenConfig.name);
  }

  static clearToken() {
    Guard.storage.remove(Guard.tokenConfig.name);
  }

  static setAuthenticationState(authentication: { [key: string]: unknown }) {
    guardStore.state.loading = false;
    guardStore.state.authentication = authentication;
    guardStore.state.isAuthenticated = true;
  }

  static clearAuthenticationState() {
    guardStore.state.loading = false;
    guardStore.state.authentication = null;
    guardStore.state.isAuthenticated = false;
  }

  static async initializeAuthentication() {
    // check if token exists then set authentication
    if (Guard.isTokenAvailable() && typeof Guard.options.fetchAuthentication === 'function') {
      guardStore.state.loading = true;
      const auntenticationData = await Guard.options.fetchAuthentication();
      Guard.setAuthenticationState(auntenticationData);
    }
    return true;
  }
}
