import { endWith, filter, map, Observable, switchMap, takeUntil } from 'rxjs';
import { connectIndexedDb } from '../database';
import {
  filterIfStoreDoesNotExist,
  filterKeyEventsForStore,
  filterValueEventsForStore,
  performObjectStoreOperation,
} from '../helpers';
import { DATABASE_DELETE_EVENTS } from '../rxidb-internal.events';

/**
 * Reads the keys present in the store
 *
 * @example
 * const database$ = connectIndexedDb('test_db');
 * const autoIncrementStore$ = database$.pipe(getObjectStore('test_autoincrement_store', { autoIncrement: true }));
 *
 * // we append one item to the store
 * autoIncrementStore$
 *   .pipe(
 *     addItem('item')
 *   ).subscribe()
 *
 * const storeKeys$: Observable<IDBValidKey[]> = autoIncrementStore$
 *   .pipe(
 *     keys()
 *   );
 *
 * storeKeys$.subscribe((keys: IDBValidKey[]) => {
 *     // You can display the keys in UI
 *   });
 *
 * @remarks Emits an empty array when the database gets deleted
 * @returns Observable<IDBValidKey[]>
 */
export function keys(): (s$: Observable<IDBObjectStore>) => Observable<IDBValidKey[]> {
  return (s$) =>
    s$.pipe(
      filterKeyEventsForStore(),
      switchMap((store: IDBObjectStore) =>
        connectIndexedDb(store.transaction.db.name).pipe(
          filterIfStoreDoesNotExist(store),
          performObjectStoreOperation<IDBValidKey[]>(store.name, 'getAllKeys'),
          takeUntil(
            DATABASE_DELETE_EVENTS.asObservable().pipe(
              filter((db) => db === store.transaction.db.name)
            )
          ),
          endWith(null),
          map((r) => (r === null ? [] : r))
        )
      )
    );
}

/**
 * Reads the entries from the store
 *
 * @example
 * const database$ = connectIndexedDb('test_db');
 * const autoIncrementStore$ = database$.pipe(getObjectStore('test_autoincrement_store', { autoIncrement: true }));
 *
 * // we append one item to the store
 * autoIncrementStore$
 *   .pipe(
 *     addItem('item')
 *   ).subscribe()
 *
 * const storeKeys$: Observable<string[]> = autoIncrementStore$
 *   .pipe(
 *     entries()
 *   );
 *
 * storeKeys$.subscribe((keys: string[]) => {
 *     // You can display the keys in UI
 *   });
 *
 * @remarks Emits an empty array when the database gets deleted
 * @returns Observable<T[]>
 */
export function entries<T = []>(): (s$: Observable<IDBObjectStore>) => Observable<T> {
  return (s$) =>
    s$.pipe(
      filterValueEventsForStore(),
      switchMap((store: IDBObjectStore) =>
        connectIndexedDb(store.transaction.db.name).pipe(
          filterIfStoreDoesNotExist(store),
          performObjectStoreOperation<T>(store.name, 'getAll'),
          takeUntil(
            DATABASE_DELETE_EVENTS.asObservable().pipe(
              filter((db) => db === store.transaction.db.name)
            )
          ),
          endWith(null),
          map((r) => (r === null ? ([] as unknown as T) : r))
        )
      )
    );
}
