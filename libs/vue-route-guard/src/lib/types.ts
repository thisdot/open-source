import { Router, RouteLocationRaw } from 'vue-router';

export interface GuardConfigRedirect {
  noAuthentication?: RouteLocationRaw;
  noPermission?: RouteLocationRaw;
  clearAuthentication?: RouteLocationRaw;
}

export interface GuardConfigToken {
  name: string;
  storage?: StorageType;
  attributes?: CookieAttributes;
}

export interface GuardConfigOptions {
  fetchAuthentication: () => Promise<{ [key: string]: unknown }>;
  permissionKey?: string;
}

export interface GuardConfig {
  router: Router;
  token: GuardConfigToken;
  redirect: GuardConfigRedirect;
  options: GuardConfigOptions;
}

export interface GuardConfigStore {
  state: GuardConfigStoreState;
}

export interface GuardConfigStoreState {
  loading: boolean;
  authentication: {
    [key: string]: unknown;
  } | null;
  isAuthenticated: boolean;
}

export interface CookieAttributes {
  expires?: number | string;
  secure?: boolean;
  path?: string;
  domain?: string;
  sameSite?: 'strict' | 'Strict' | 'lax' | 'Lax' | 'none' | 'None';
}

export enum StorageType {
  localStorage = 'localStorage',
  sessionStorage = 'sessionStorage',
  cookieStorage = 'cookieStorage',
}

declare module 'vue-router' {
  interface RouteMeta {
    access?: string[];
    requiresAuth: boolean;
  }
}
