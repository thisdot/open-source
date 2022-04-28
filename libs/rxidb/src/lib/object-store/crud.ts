import { endWith, filter, Observable, switchMap, takeUntil, tap } from 'rxjs';
import { connectIndexedDb } from '../database';
import {
  filterIfStoreDoesNotExist,
  filterValueEventsForStoreKey,
  performObjectStoreOperation,
} from '../helpers';
import { DATABASE_DELETE_EVENTS, KEY_CHANGED, VALUE_CHANGED } from '../rxidb-internal.events';

/**
 * Adds an item to an autoIncrement object store
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
 * // we can append multiple items in order
 * autoIncrementStore$
 *   .pipe(
 *     addItem(1),
 *     addItem(2),
 *     addItem(3)
 *   ).subscribe()
 *
 * @remarks It is only usable with an autoIncrement object store. Emits key and value change events internally.
 *
 * @throws {Error} If the store was not initiated with `autoIncrement: true`:
 * "DOMException: Failed to execute 'add' on 'IDBObjectStore': The object store uses out-of-line keys and has no key generator and the key parameter was not provided."
 * @param value - the value you want to append to the store
 * @returns Observable<IDBObjectStore>
 *
 */
export function addItem<T = unknown>(
  value: T
): (s$: Observable<IDBObjectStore>) => Observable<IDBObjectStore> {
  return (s$) =>
    s$.pipe(
      switchMap((store: IDBObjectStore) =>
        connectIndexedDb(store.transaction.db.name).pipe(
          filterIfStoreDoesNotExist(store),
          performObjectStoreOperation(store.name, 'add', null, value),
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

/**
 * Sets an item to a key in an ObjectStore
 *
 * @example
 * const database$ = connectIndexedDb('test_db');
 * const store$ = database$.pipe(getObjectStore('test_store'));
 *
 * // we set a key-value pair in the store
 * store$
 *   .pipe(
 *     setItem('key', 'item')
 *   ).subscribe()
 *
 * // we can append multiple items in order
 * store$
 *   .pipe(
 *     setItem('key1', 1),
 *     setItem('key2', 2),
 *     setItem('key3', 3)
 *   ).subscribe()
 *
 * @remarks It is only usable with a non-autoIncrement object store. Emits key and value change events internally.
 *
 * @param key - the key you want to insert to the store
 * @param value - the value you want to set to the key in the store
 * @returns Observable<IDBObjectStore>
 *
 */
export function setItem<T = unknown>(
  key: IDBValidKey,
  value: T
): (s$: Observable<IDBObjectStore>) => Observable<IDBObjectStore> {
  return (s$) =>
    s$.pipe(
      switchMap((store: IDBObjectStore) =>
        connectIndexedDb(store.transaction.db.name).pipe(
          filterIfStoreDoesNotExist(store),
          performObjectStoreOperation(store.name, 'put', key, value),
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

/**
 * Deletes an item stored at the provided key
 *
 * @example
 * const database$ = connectIndexedDb('test_db');
 * const store$ = database$.pipe(getObjectStore('test_store'));
 *
 * // we set a key-value pair in the store
 * store$
 *   .pipe(
 *     setItem('key', 'item')
 *   ).subscribe()
 *
 * // we can delete the value at the key in the store
 * store$
 *   .pipe(
 *     deleteItem('key'),
 *   ).subscribe()
 *
 * @remarks Emits key and value changed events internally. It works both with autoIncrement and non-autoIncrement stores. If the key is not present in the store, nothing happens.
 *
 * @param key - the key which you want to delete from the store
 * @returns Observable<IdbObjectStore>
 */
export function deleteItem(
  key: IDBValidKey
): (s$: Observable<IDBObjectStore>) => Observable<IDBObjectStore> {
  return (s$) =>
    s$.pipe(
      switchMap((store: IDBObjectStore) =>
        connectIndexedDb(store.transaction.db.name).pipe(
          filterIfStoreDoesNotExist(store),
          performObjectStoreOperation(store.name, 'delete', key),
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

/**
 * Turns an IDBObjectStore stream into a read stream
 *
 * Emits every time the key or the value changes or the database is deleted.
 *
 * const database$ = connectIndexedDb('test_db');
 * const store$ = database$.pipe(getObjectStore('test_store'));
 *
 * // we set a key-value pair in the store
 * store$
 *   .pipe(
 *     setItem('key', 'item')
 *   ).subscribe()
 *
 * // we can read the value at the key from the store
 * const readKey$: Observable<string> = store$
 *   .pipe(
 *     read<string>('key'),
 *   )
 *
 * readKey$.subscribe((value: string) => {
 *   // You can set the value to be displayed in the UI here.
 * })
 *
 * @remarks If the database gets deleted, it emits a `null` value last.
 *
 * @param key - The key you want to read from the store
 * @returns Observable<T | null>
 */
export function read<T = unknown>(
  key: IDBValidKey
): (s$: Observable<IDBObjectStore>) => Observable<T | null> {
  return (s$) =>
    s$.pipe(
      filterValueEventsForStoreKey(key),
      switchMap((store: IDBObjectStore) =>
        connectIndexedDb(store.transaction.db.name).pipe(
          filterIfStoreDoesNotExist(store),
          performObjectStoreOperation<T>(store.name, 'get', key),
          takeUntil(
            DATABASE_DELETE_EVENTS.asObservable().pipe(
              filter((db) => db === store.transaction.db.name)
            )
          ),
          endWith(null)
        )
      )
    );
}
