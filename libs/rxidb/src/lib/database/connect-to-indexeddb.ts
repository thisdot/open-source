import { EMPTY, filter, NEVER, noop, Observable, ReplaySubject, takeUntil } from 'rxjs';
import { DATABASE_DELETE_EVENTS } from '../rxidb-internal.events';

/**
 * Creates an Observable<IDBDatabase> stream.
 *
 * @example
 * const database$ = connectIndexedDb('test_db');
 *
 * // subscribing to the observable will create the database
 * database$.subscribe({
 *   next: (db: IDBDatabase) => console.log(db.name),
 *   error: (e) => console.error(e),
 *   complete: () => console.warn('database deleted')
 * })
 *
 * @remarks The Observable stream completes when the `deleteDatabase('databaseName')` method is called.
 *
 * @param name - The database name that you want to connect to
 * @param version - (Optional) the database version you want to start the connection with
 * @returns An Observable<IDBDatabase> stream
 */
export function connectIndexedDb(name: string, version?: number): Observable<IDBDatabase> {
  if (typeof document === 'undefined') {
    console.warn(
      'RxIDB: connectIndexedDb() is only supported in the browser. The RxIDB methods will not be available in the server.'
    );
    return EMPTY;
  }
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
    db.onversionchange = (e) => {
      const versionChangeDb = e.target as any;
      versionChangeDb.close();
    };
    db.onclose = () => {
      dbSubject.complete();
    };
  };

  return dbSubject
    .asObservable()
    .pipe(takeUntil(DATABASE_DELETE_EVENTS.asObservable().pipe(filter((db) => db === name))));
}
