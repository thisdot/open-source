import { connectIndexedDb } from '../database';
import { noop, Observable, ReplaySubject, switchMap } from 'rxjs';
import { filterValueEventsForStoreKey } from '../helpers/rxidb-events.helpers';
import { filterIfStoreDoesNotExist } from '../helpers/rxidb-object-store.helpers';
import { KEY_CHANGED, VALUE_CHANGED } from '../rxidb-internal.events';

export function createItem<T = unknown>(
  key: string,
  value: T
): (s$: Observable<IDBObjectStore>) => Observable<IDBObjectStore> {
  const objectStoreSubject = new ReplaySubject<IDBObjectStore>(1);
  return (s$) =>
    s$.pipe(
      switchMap((store: IDBObjectStore) =>
        connectIndexedDb(store.transaction.db.name).pipe(
          filterIfStoreDoesNotExist(store),
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
          filterIfStoreDoesNotExist(store),
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
          filterIfStoreDoesNotExist(store),
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
      filterValueEventsForStoreKey(key),
      switchMap((store: IDBObjectStore) =>
        connectIndexedDb(store.transaction.db.name).pipe(
          filterIfStoreDoesNotExist(store),
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
