import { EMPTY, filter, from, noop, Observable, ReplaySubject, switchMap, takeUntil } from 'rxjs';
import { DATABASE_DELETE_EVENTS } from '../rxidb-internal.events';

/**
 * Creates an IDBDatabase by upgrading the database version.
 * This allows us to create ObjectStores on this database instance.
 *
 * @remarks This should only be used internally, that is why it is not exported in the index.ts file
 *
 * @throws Error when the database that is supposed to be upgraded does not exist.
 *
 * @param existingDb - An existing IDBDatabase instance
 * @returns An Observable that emits a version update IDBDatabase instance
 */
export function upgradeDatabase(existingDb: IDBDatabase): Observable<IDBDatabase> {
  if (typeof document === 'undefined') {
    console.warn(
      'RxIDB: upgradeDatabase() is only supported in the browser. The RxIDB methods will not be available in the server.'
    );
    return EMPTY;
  }
  const dbSubject = new ReplaySubject<IDBDatabase>(1);

  return from(window.indexedDB.databases()).pipe(
    switchMap((dbInfo: IDBDatabaseInfo[]) => {
      existingDb.close();
      const currentDb = dbInfo.find((i) => i.name === existingDb.name);
      if (!currentDb) {
        throw new Error('You cannot make a version upgrade on a non-existent database');
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
