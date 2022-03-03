import { Observable, switchMap, tap } from 'rxjs';
import { connectIndexedDb } from '../database';
import { filterValueEventsForStoreKey } from '../helpers/rxidb-events.helpers';
import { filterIfStoreDoesNotExist } from '../helpers/rxidb-object-store.helpers';
import { performObjectStoreOperation } from '../helpers/rxidb-operations.helpers';
import { KEY_CHANGED, VALUE_CHANGED } from '../rxidb-internal.events';

export function addItem<T = unknown>(
  value: T
): (s$: Observable<IDBObjectStore>) => Observable<IDBObjectStore> {
  return (s$) =>
    s$.pipe(
      switchMap((store: IDBObjectStore) =>
        connectIndexedDb(store.transaction.db.name).pipe(
          filterIfStoreDoesNotExist(store),
          performObjectStoreOperation<IDBObjectStore>(store.name, 'add', null, value),
          tap((store: IDBObjectStore) => {
            const metadata = {
              db: store.transaction.db.name,
              store: store.name,
            };
            KEY_CHANGED.next(metadata);
            VALUE_CHANGED.next(metadata);
          })
        )
      )
    );
}

export function setItem<T = unknown>(
  key: string,
  value: T | unknown
): (s$: Observable<IDBObjectStore>) => Observable<IDBObjectStore> {
  return (s$) =>
    s$.pipe(
      switchMap((store: IDBObjectStore) =>
        connectIndexedDb(store.transaction.db.name).pipe(
          filterIfStoreDoesNotExist(store),
          performObjectStoreOperation<IDBObjectStore>(store.name, 'put', key, value),
          tap((store: IDBObjectStore) => {
            const metadata = {
              db: store.transaction.db.name,
              store: store.name,
              key,
            };
            VALUE_CHANGED.next(metadata);
          })
        )
      )
    );
}

export function deleteItem(
  key: IDBValidKey
): (s$: Observable<IDBObjectStore>) => Observable<IDBObjectStore> {
  return (s$) =>
    s$.pipe(
      switchMap((store: IDBObjectStore) =>
        connectIndexedDb(store.transaction.db.name).pipe(
          filterIfStoreDoesNotExist(store),
          performObjectStoreOperation<IDBObjectStore>(store.name, 'delete', key),
          tap((store: IDBObjectStore) => {
            const metadata = {
              db: store.transaction.db.name,
              store: store.name,
              key,
            };
            KEY_CHANGED.next(metadata);
            VALUE_CHANGED.next(metadata);
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
          performObjectStoreOperation<T>(store.name, 'get', key)
        )
      )
    );
}
