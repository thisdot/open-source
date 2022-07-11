import { connectIndexedDb } from '../database';
import { upgradeDatabase } from '../database/upgrade-database';
import { filter, Observable, of, ReplaySubject, share, Subject, switchMap, takeUntil } from 'rxjs';
import { DATABASE_DELETE_EVENTS } from '../rxidb-internal.events';

/**
 * Converts an Observable<IDBDatabase> stream to an Observable<IDBObjectStore> stream
 *
 * This operator checks for existing ObjectStore instances with the provided store name.
 * If there is no previous instance it creates the ObjectStore, otherwise creates a `readwrite`
 * transaction
 *
 * @example
 * const database$ = connectIndexedDb('test_db');
 * // creates an ObjectStore with key-value pairs
 * const keyValueStore$ = database$.pipe(getObjectStore('test_store'))
 * // creates an ObjectStore with autoIncrement
 * const autoIncrementStore$ = database$.pipe(getObjectStore('test_autoincrement_store', { autoIncrement: true }))
 *
 * // subscribing to the observable will create the database and the store
 * keyValueStore$.subscribe({
 *   next: (db: IDBObjectStore) => console.log(store.name),
 *   error: (e) => console.error(e),
 *   complete: () => console.warn('database deleted')
 * });
 *
 * autoIncrementStore$.subscribe({
 *   next: (db: IDBObjectStore) => console.log(store.name),
 *   error: (e) => console.error(e),
 *   complete: () => console.warn('database deleted')
 * })
 *
 * @remarks Completes when the source database gets deleted.
 * @param name
 * @param options - IDBObjectStoreParameters
 *
 * @returns Observable<IDBObjectStore>
 */
export function getObjectStore(
  name: string,
  options?: IDBObjectStoreParameters
): (s$: Observable<IDBDatabase>) => Observable<IDBObjectStore> {
  return (s$) =>
    s$.pipe(
      switchMap((existingDb: IDBDatabase) => {
        const isExistingObjectStore = existingDb.objectStoreNames.contains(name);
        const upgrade = isExistingObjectStore
          ? connectIndexedDb(existingDb.name)
          : upgradeDatabase(existingDb);
        return upgrade.pipe(
          switchMap((db: IDBDatabase) => {
            const storeSubject = new Subject<IDBObjectStore>();
            let store: IDBObjectStore;
            if (isExistingObjectStore) {
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
