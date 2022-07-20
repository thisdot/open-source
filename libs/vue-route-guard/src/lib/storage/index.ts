import { isStorageAvailable } from '../helpers';
import { StorageType } from '../types';

export default class GuardStorage {
  private storage: Storage;

  constructor(storageType: StorageType = StorageType.sessionStorage) {
    if (!this.checkStorage(storageType)) {
      throw Error(`@thisdot/vue-route-guard: ${storageType} is not supported`);
    }

    const storageList = {
      [StorageType.sessionStorage]: window.sessionStorage,
      [StorageType.localStorage]: window.localStorage,
    };

    this.storage = storageList[storageType];
  }

  public set(key: string, value: string): void {
    this.storage.setItem(key, value);
  }

  public get(key: string): string | null {
    return this.storage.getItem(key);
  }

  public remove(key: string): void {
    this.storage.removeItem(key);
  }

  private checkStorage(name: StorageType): boolean {
    if (!Object.values(StorageType)?.includes(name)) {
      throw new Error('@thisdot/vue-route-guard: Storage is not supported');
    }

    return isStorageAvailable(name);
  }
}
