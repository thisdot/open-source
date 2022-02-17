import { filter, from, map, noop, Observable, of, ReplaySubject, startWith, switchMap } from 'rxjs';

export function connectIndexedDb(name: string, version?: number): Observable<IDBDatabase> {
  const dbSubject = new ReplaySubject<IDBDatabase>(1);
  const request: IDBOpenDBRequest = version
    ? window.indexedDB.open(name, version)
    : window.indexedDB.open(name);

  request.onerror = (e) => {
    dbSubject.error(e);
  };

  // request.onupgradeneeded = (e: IDBVersionChangeEvent) => {
  //   const db = (e.target as any).result as IDBDatabase;
  //   db.close();
  //   dbSubject.error(`This should not have been a version update event!`);
  // };

  request.onsuccess = (e) => {
    request.onerror = noop;
    const db = (e.target as any).result as IDBDatabase;
    dbSubject.next(db);
  };

  return dbSubject.asObservable();
}

export function upgradeDatabase(existingDb: IDBDatabase): Observable<IDBDatabase> {
  const dbSubject = new ReplaySubject<IDBDatabase>(1);
  existingDb.close();

  return from(window.indexedDB.databases()).pipe(
    switchMap((dbInfo: IDBDatabaseInfo[]) => {
      const currentDb = dbInfo.find((i) => i.name === existingDb.name);
      if (!currentDb) {
        throw new Error('you cannot make a version upgrade on a non-existent database');
      }
      const request: IDBOpenDBRequest = window.indexedDB.open(
        currentDb.name!,
        currentDb.version! + 1
      );

      request.onerror = (e) => {
        dbSubject.error(e);
      };

      request.onupgradeneeded = (e: IDBVersionChangeEvent) => {
        request.onerror = noop;
        const db = (e.target as any).result as IDBDatabase;
        console.warn('this onupgradeneeded runs');
        dbSubject.next(db);
      };

      // request.onsuccess = (e) => {
      //   const db = (e.target as any).result as IDBDatabase;
      //   db.close();
      //   dbSubject.error(`This should have been a version update event!`);
      // };

      return dbSubject.asObservable();
    })
  );
}

export function getObjectStore(
  name: string,
  options?: IDBObjectStoreParameters
): (s$: Observable<IDBDatabase>) => Observable<IDBObjectStore> {
  const storeSubject = new ReplaySubject<IDBObjectStore>(1);
  return (s$) =>
    s$.pipe(
      switchMap((existingDb: IDBDatabase) => {
        const isExistingDatabase = existingDb.objectStoreNames.contains(name);
        const upgrade = isExistingDatabase ? of(existingDb) : upgradeDatabase(existingDb);
        return upgrade.pipe(
          switchMap((db: IDBDatabase) => {
            let store: IDBObjectStore;
            if (isExistingDatabase) {
              store = db.transaction(name, 'readwrite').objectStore(name);
            } else {
              store = options ? db.createObjectStore(name, options) : db.createObjectStore(name);
            }

            store.transaction.oncomplete = () => {
              db.close();
              storeSubject.next(store);
            };

            store.transaction.onerror = (e) => {
              storeSubject.error(e);
            };

            return storeSubject.asObservable();
          })
        );
      })
    );
}

type DbChangeMetadata = { db: string; store: string; key: string };

const KEY_CHANGED = new ReplaySubject<DbChangeMetadata>(1);
const VALUE_CHANGED = new ReplaySubject<DbChangeMetadata>(1);

export function createItem<T = unknown>(
  key: string,
  value: T
): (s$: Observable<IDBObjectStore>) => Observable<IDBObjectStore> {
  const objectStoreSubject = new ReplaySubject<IDBObjectStore>(1);
  return (s$) =>
    s$.pipe(
      switchMap((store: IDBObjectStore) =>
        connectIndexedDb(store.transaction.db.name).pipe(
          switchMap((openDb: IDBDatabase) => {
            const request: IDBRequest = openDb
              .transaction(store.name, 'readwrite')
              .objectStore(store.name)
              .add(value, key);

            request.onerror = (e) => objectStoreSubject.error(e);

            request.onsuccess = () => {
              request.onerror = noop;
              openDb.close();
              const metadata = {
                db: openDb.name,
                store: store.name,
                key,
              };
              KEY_CHANGED.next(metadata);
              VALUE_CHANGED.next(metadata);
              objectStoreSubject.next(store);
            };

            return objectStoreSubject.asObservable();
          })
        )
      )
    );
}

export function updateItem<T = unknown>(
  key: string,
  value: T
): (s$: Observable<IDBObjectStore>) => Observable<IDBObjectStore> {
  const objectStoreSubject = new ReplaySubject<IDBObjectStore>(1);
  return (s$) =>
    s$.pipe(
      switchMap((store: IDBObjectStore) =>
        connectIndexedDb(store.transaction.db.name).pipe(
          switchMap((openDb: IDBDatabase) => {
            const request: IDBRequest = openDb
              .transaction(store.name, 'readwrite')
              .objectStore(store.name)
              .put(value, key);

            request.onerror = (e) => objectStoreSubject.error(e);

            request.onsuccess = () => {
              request.onerror = noop;
              openDb.close();
              const metadata = {
                db: openDb.name,
                store: store.name,
                key,
              };
              VALUE_CHANGED.next(metadata);
              objectStoreSubject.next(store);
            };

            return objectStoreSubject.asObservable();
          })
        )
      )
    );
}

export function deleteItem(
  key: string
): (s$: Observable<IDBObjectStore>) => Observable<IDBObjectStore> {
  const objectStoreSubject = new ReplaySubject<IDBObjectStore>(1);
  return (s$) =>
    s$.pipe(
      switchMap((store: IDBObjectStore) =>
        connectIndexedDb(store.transaction.db.name).pipe(
          switchMap((openDb: IDBDatabase) => {
            const request: IDBRequest = openDb
              .transaction(store.name, 'readwrite')
              .objectStore(store.name)
              .delete(key);

            request.onerror = (e) => objectStoreSubject.error(e);

            request.onsuccess = () => {
              request.onerror = noop;
              openDb.close();
              const metadata = {
                db: openDb.name,
                store: store.name,
                key,
              };
              KEY_CHANGED.next(metadata);
              VALUE_CHANGED.next(metadata);
              objectStoreSubject.next(store);
            };

            return objectStoreSubject.asObservable();
          })
        )
      )
    );
}

export function read<T = unknown>(key: string): (s$: Observable<IDBObjectStore>) => Observable<T> {
  return (s$) =>
    s$.pipe(
      switchMap((store: IDBObjectStore) =>
        VALUE_CHANGED.asObservable().pipe(
          startWith({ db: store.transaction.db.name, store: store.name, key }),
          filter(
            (dbChange) =>
              dbChange.db === store.transaction.db.name &&
              dbChange.store === store.name &&
              dbChange.key === key
          ),
          map(() => store)
        )
      ),
      switchMap((store: IDBObjectStore) =>
        connectIndexedDb(store.transaction.db.name).pipe(
          switchMap((openDb: IDBDatabase) => {
            const resultSubject = new ReplaySubject<T>(1);
            const request: IDBRequest = openDb
              .transaction(store.name, 'readwrite')
              .objectStore(store.name)
              .get(key);

            request.onerror = (e) => resultSubject.error(e);

            request.onsuccess = () => {
              request.onerror = noop;
              openDb.close();
              resultSubject.next(request.result as T);
            };

            return resultSubject.asObservable();
          })
        )
      )
    );
}

export function keys(): (s$: Observable<IDBObjectStore>) => Observable<IDBValidKey[]> {
  return (s$) =>
    s$.pipe(
      switchMap((store: IDBObjectStore) =>
        KEY_CHANGED.asObservable().pipe(
          startWith({ db: store.transaction.db.name, store: store.name }),
          filter(
            (dbChange) => dbChange.db === store.transaction.db.name && dbChange.store === store.name
          ),
          map(() => store)
        )
      ),
      switchMap((store: IDBObjectStore) =>
        connectIndexedDb(store.transaction.db.name).pipe(
          switchMap((openDb: IDBDatabase) => {
            const resultSubject = new ReplaySubject<IDBValidKey[]>(1);
            const request: IDBRequest = openDb
              .transaction(store.name, 'readwrite')
              .objectStore(store.name)
              .getAllKeys();

            request.onerror = (e) => resultSubject.error(e);

            request.onsuccess = () => {
              request.onerror = noop;
              openDb.close();
              resultSubject.next(request.result);
            };

            return resultSubject.asObservable();
          })
        )
      )
    );
}

export function entries<T = []>(): (s$: Observable<IDBObjectStore>) => Observable<T> {
  return (s$) =>
    s$.pipe(
      switchMap((store: IDBObjectStore) =>
        VALUE_CHANGED.asObservable().pipe(
          startWith({ db: store.transaction.db.name, store: store.name }),
          filter(
            (dbChange) => dbChange.db === store.transaction.db.name && dbChange.store === store.name
          ),
          map(() => store)
        )
      ),
      switchMap((store: IDBObjectStore) =>
        connectIndexedDb(store.transaction.db.name).pipe(
          switchMap((openDb: IDBDatabase) => {
            const resultSubject = new ReplaySubject<T>(1);
            const request: IDBRequest<any[]> = openDb
              .transaction(store.name, 'readwrite')
              .objectStore(store.name)
              .getAll();

            request.onerror = (e) => resultSubject.error(e);

            request.onsuccess = () => {
              request.onerror = noop;
              openDb.close();
              resultSubject.next(request.result as unknown as T);
            };

            return resultSubject.asObservable();
          })
        )
      )
    );
}
