import {
  filter,
  from,
  map,
  noop,
  Observable,
  of,
  ReplaySubject,
  share,
  startWith,
  Subject,
  switchMap,
  takeUntil,
} from 'rxjs';

const DATABASE_DELETE_EVENTS = new Subject<string>();

export function deleteIndexedDb(name: string): Observable<void> {
  const deleteDbSubject = new Subject<void>();
  const request: IDBOpenDBRequest = window.indexedDB.deleteDatabase(name);

  request.onsuccess = () => {
    DATABASE_DELETE_EVENTS.next(name);
    deleteDbSubject.next();
    deleteDbSubject.complete();
  };

  return deleteDbSubject.asObservable();
}

export function connectIndexedDb(name: string, version?: number): Observable<IDBDatabase> {
  const dbSubject = new ReplaySubject<IDBDatabase>(1);
  const request: IDBOpenDBRequest = version
    ? window.indexedDB.open(name, version)
    : window.indexedDB.open(name);

  request.onerror = (e) => {
    dbSubject.error(e);
  };

  request.onsuccess = (e) => {
    request.onerror = noop;
    const db = (e.target as any).result as IDBDatabase;
    dbSubject.next(db);

    db.onclose = () => {
      dbSubject.complete();
    };
  };

  return dbSubject
    .asObservable()
    .pipe(takeUntil(DATABASE_DELETE_EVENTS.asObservable().pipe(filter((db) => db === name))));
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
        dbSubject.next(db);

        db.onclose = () => {
          dbSubject.complete();
        };
      };

      return dbSubject
        .asObservable()
        .pipe(
          takeUntil(
            DATABASE_DELETE_EVENTS.asObservable().pipe(filter((db) => db === existingDb.name))
          )
        );
    })
  );
}

export function getObjectStore(
  name: string,
  options?: IDBObjectStoreParameters
): (s$: Observable<IDBDatabase>) => Observable<IDBObjectStore> {
  return (s$) =>
    s$.pipe(
      switchMap((existingDb: IDBDatabase) => {
        const isExistingDatabase = existingDb.objectStoreNames.contains(name);
        const upgrade = isExistingDatabase ? of(existingDb) : upgradeDatabase(existingDb);
        return upgrade.pipe(
          switchMap((db: IDBDatabase) => {
            const storeSubject = new Subject<IDBObjectStore>();
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
              db.close();
              storeSubject.error(e);
            };

            return storeSubject.asObservable();
          }),
          takeUntil(
            DATABASE_DELETE_EVENTS.asObservable().pipe(filter((db) => db === existingDb.name))
          )
        );
      }),
      share({ connector: () => new ReplaySubject(1) })
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
          filter((db: IDBDatabase) => {
            if (db.objectStoreNames.contains(store.name)) {
              return true;
            }
            db.close();
            return false;
          }),
          switchMap((openDb: IDBDatabase) => {
            const request: IDBRequest = openDb
              .transaction(store.name, 'readwrite')
              .objectStore(store.name)
              .add(value, key);

            request.onerror = (e) => {
              openDb.close();
              objectStoreSubject.complete();
            };

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
          filter((db: IDBDatabase) => {
            if (db.objectStoreNames.contains(store.name)) {
              return true;
            }
            db.close();
            return false;
          }),
          switchMap((openDb: IDBDatabase) => {
            const request: IDBRequest = openDb
              .transaction(store.name, 'readwrite')
              .objectStore(store.name)
              .put(value, key);

            request.onerror = (e) => {
              openDb.close();
              objectStoreSubject.complete();
            };

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
          filter((db: IDBDatabase) => {
            if (db.objectStoreNames.contains(store.name)) {
              return true;
            }
            db.close();
            return false;
          }),
          switchMap((openDb: IDBDatabase) => {
            const request: IDBRequest = openDb
              .transaction(store.name, 'readwrite')
              .objectStore(store.name)
              .delete(key);

            request.onerror = (e) => {
              objectStoreSubject.complete();
            };

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
          takeUntil(
            DATABASE_DELETE_EVENTS.asObservable().pipe(
              filter((db) => db === store.transaction.db.name)
            )
          ),
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
          filter((db: IDBDatabase) => {
            if (db.objectStoreNames.contains(store.name)) {
              return true;
            }
            db.close();
            return false;
          }),
          switchMap((openDb: IDBDatabase) => {
            const resultSubject = new ReplaySubject<T>(1);
            const request: IDBRequest = openDb
              .transaction(store.name, 'readwrite')
              .objectStore(store.name)
              .get(key);

            request.onerror = (e) => {
              openDb.close();
              resultSubject.complete();
            };

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
          takeUntil(
            DATABASE_DELETE_EVENTS.asObservable().pipe(
              filter((db) => db === store.transaction.db.name)
            )
          ),
          filter(
            (dbChange) => dbChange.db === store.transaction.db.name && dbChange.store === store.name
          ),
          map(() => store)
        )
      ),
      switchMap((store: IDBObjectStore) =>
        connectIndexedDb(store.transaction.db.name).pipe(
          filter((db: IDBDatabase) => {
            if (db.objectStoreNames.contains(store.name)) {
              return true;
            }
            db.close();
            return false;
          }),
          switchMap((openDb: IDBDatabase) => {
            const resultSubject = new ReplaySubject<IDBValidKey[]>(1);
            const request: IDBRequest = openDb
              .transaction(store.name, 'readwrite')
              .objectStore(store.name)
              .getAllKeys();

            request.onerror = (e) => {
              openDb.close();
              resultSubject.complete();
            };

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
          takeUntil(
            DATABASE_DELETE_EVENTS.asObservable().pipe(
              filter((db) => db === store.transaction.db.name)
            )
          ),
          filter(
            (dbChange) => dbChange.db === store.transaction.db.name && dbChange.store === store.name
          ),
          map(() => store)
        )
      ),
      switchMap((store: IDBObjectStore) =>
        connectIndexedDb(store.transaction.db.name).pipe(
          filter((db: IDBDatabase) => {
            if (db.objectStoreNames.contains(store.name)) {
              return true;
            }
            db.close();
            return false;
          }),
          switchMap((openDb: IDBDatabase) => {
            const resultSubject = new ReplaySubject<T>(1);
            const request: IDBRequest<any[]> = openDb
              .transaction(store.name, 'readwrite')
              .objectStore(store.name)
              .getAll();

            request.onerror = (e) => {
              openDb.close();
              resultSubject.complete();
            };

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
