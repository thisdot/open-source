import { Injectable } from '@angular/core';
import * as localforage from 'localforage';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class IndexedDbHelperService {
  stores: Map<string, LocalForage> = new Map();
  constructor() {
    localforage.setDriver([localforage.INDEXEDDB]);
  }

  // Setup Ionic Storage
  initStorage(name: string): void {
    const storeInstance = localforage.createInstance({ name });
    this.stores.set(name, storeInstance);
  }

  // Store request data
  cacheItem<T>(instanceName: string, key: string, data: T): Observable<T> {
    if (!this.stores.has(instanceName)) {
      this.initStorage(instanceName);
    }
    const store: LocalForage = this.stores.get(instanceName) as LocalForage;
    return from(store.setItem<T>(key, data));
  }

  // Try to load cached data
  getCachedItem<T>(instanceName: string, key: string): Observable<T | null> {
    if (!this.stores.has(instanceName)) {
      this.initStorage(instanceName);
    }
    const store: LocalForage = this.stores.get(instanceName) as LocalForage;
    return from(store.getItem<T>(key)).pipe(map((storedValue) => storedValue || null));
  }

  // Remove all cached data & files
  dropStorage(storageName: string): Observable<boolean> {
    const storage = this.stores.get(storageName) as LocalForage;
    return from(storage.dropInstance()).pipe(map(() => this.stores.delete(storageName)));
  }

  // Example to remove one cached URL
  invalidateCacheEntry(storageName: string, key: string): Observable<void> {
    const storage = this.stores.get(storageName) as LocalForage;
    return from(storage.removeItem(key));
  }
}
