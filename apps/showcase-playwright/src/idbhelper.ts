import { Page } from 'playwright';

export function isIDBObjectStore(subject: unknown): subject is IDBObjectStore {
  return typeof subject === 'object' && subject?.constructor?.name === 'IDBObjectStore';
}

export function isIDBDatabase(subject: unknown): subject is IDBDatabase {
  return typeof subject === 'object' && subject?.constructor?.name === 'IDBDatabase';
}

type SetItemOperation = 'create' | 'update' | 'add';
type ReadDeleteOperation = 'read' | 'delete';
type StoreOperation = keyof Pick<IDBObjectStore, 'get' | 'put' | 'delete' | 'add'>;
type ConsolePropObject = {
  key: IDBValidKey;
  value?: unknown;
  error?: Error;
};

export class Idbhelper {
  private databaseName?: string;
  private databaseVersion?: number;
  private stores: Set<string> = new Set();
  constructor(private readonly page: Page) {}

  async init(database: string, versionConfiguredByUser?: number): Promise<void> {
    if (this.databaseName && this.databaseVersion) {
      throw new Error(
        `IDB "${this.databaseName}" with ${this.databaseVersion} has already been initialised.`
      );
    }

    const { databaseName, databaseVersion } = await this.page.evaluate(
      async ({ db, version }) => {
        if (!window.indexedDB) {
          throw new Error(
            `You must open the page first by using 'page.goto()' to be able to interact with indexedDb`
          );
        }
        const request: IDBOpenDBRequest =
          version != null ? window.indexedDB.open(db, version) : window.indexedDB.open(db);
        const newDbInstance = await new Promise<IDBDatabase>((resolve, reject) => {
          request.onerror = (e: Event) => {
            reject(e);
          };
          request.onsuccess = (e: Event) => {
            request.onerror = () => void 0;
            const newDatabase = (e.target as any).result as IDBDatabase;
            newDatabase.onversionchange = () => void 0;
            resolve(newDatabase);
          };
        });

        newDbInstance.close();

        return {
          databaseName: newDbInstance.name,
          databaseVersion: newDbInstance.version,
        };
      },
      {
        db: database,
        version: versionConfiguredByUser,
      }
    );

    this.databaseName = databaseName;
    this.databaseVersion = databaseVersion;
  }

  async createObjectStore(storeName: string, options?: IDBObjectStoreParameters): Promise<void> {
    if (!this.databaseName) {
      throw new Error(`Please call the ".init()" method before creating an object store`);
    }

    if (this.stores.has(storeName)) {
      return;
    }

    await this.page.evaluate(
      async ({ dbName, store, storeOptions }) => {
        const request = window.indexedDB.open(dbName);

        const openDbConnection: IDBDatabase = await new Promise<IDBDatabase>((resolve, reject) => {
          request.onerror = (e: Event) => {
            reject(e);
          };
          request.onsuccess = (e: Event) => {
            request.onerror = () => void 0;
            const newDatabase = (e.target as any).result as IDBDatabase;
            newDatabase.onversionchange = () => void 0;

            resolve(newDatabase);
          };
        });

        const isExisting = openDbConnection.objectStoreNames.contains(store);
        if (isExisting) {
          return;
        }

        openDbConnection.close();
        console.warn('dbversion', openDbConnection.version);
        const storeDbConnection = await new Promise<IDBDatabase>((resolve, reject) => {
          const request: IDBOpenDBRequest = window.indexedDB.open(
            openDbConnection.name,
            openDbConnection.version + 1
          );
          console.warn('newdbversion', openDbConnection.version + 1);
          request.onerror = (e: Event) => {
            reject(e);
          };
          request.onupgradeneeded = (e: Event) => {
            console.warn('onupgradeneeded');
            request.onerror = () => void 0;
            const db = (e.target as any).result as IDBDatabase;
            db.onversionchange = () => void 0;
            resolve(db);
          };
        });

        const newStore: IDBObjectStore = storeOptions
          ? storeDbConnection.createObjectStore(store, storeOptions)
          : storeDbConnection.createObjectStore(store);

        return newStore;
      },
      {
        dbName: this.databaseName!,
        store: storeName,
        storeOptions: options,
      }
    );

    this.stores.add(storeName);
  }

  createItem(store: string, key: IDBValidKey, value: unknown): Promise<void> {
    return this.setItem('add', store, key, value);
  }

  addItem(store: string, value: unknown): Promise<void> {
    return this.setItem('add', store, null, value);
  }

  updateItem(store: string, key: IDBValidKey, value: unknown): Promise<void> {
    return this.setItem('update', store, key, value);
  }

  store(storeName: string) {
    if (!this.stores.has(storeName)) {
      throw new Error(
        `IDBObjectStore with the name of ${storeName} has not been created. Please call createObjectStore first`
      );
    }
    return {
      createItem: (key: IDBValidKey, value: unknown) => this.createItem(storeName, key, value),
    };
  }

  private async setItem(
    operation: SetItemOperation,
    storeName: string,
    key: IDBValidKey | null,
    value: unknown
  ): Promise<void> {
    await this.page.evaluate(
      async ({ dbName, store, storeKey, storeValue }) => {
        const request = window.indexedDB.open(dbName);

        const openDbConnection: IDBDatabase = await new Promise<IDBDatabase>((resolve, reject) => {
          request.onerror = (e: Event) => {
            reject(e);
          };
          request.onsuccess = (e: Event) => {
            request.onerror = () => void 0;
            const newDatabase = (e.target as any).result as IDBDatabase;
            newDatabase.onversionchange = () => void 0;

            resolve(newDatabase);
          };
        });

        await new Promise((resolve, reject) => {
          const request = openDbConnection
            .transaction(store, 'readwrite')
            .objectStore(store)
            .add(storeValue, storeKey!);
          request.onerror = (e: any) => {
            openDbConnection.close();
            reject(e);
          };
          request.onsuccess = () => {
            request.onerror = () => void 0;
            openDbConnection.close();
            resolve(void 0);
          };
        });
      },
      {
        dbName: this.databaseName!,
        store: storeName,
        storeKey: key,
        storeValue: value,
      }
    );
  }
}
