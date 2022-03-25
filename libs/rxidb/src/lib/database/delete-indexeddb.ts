import { Observable, Subject } from 'rxjs';
import { DATABASE_DELETE_EVENTS } from '../rxidb-internal.events';

/**
 * Deletes the IDBDatabase based on the provided string.
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
 * // we delete the database
 * deleteIndexedDb('test_db').subscribe()
 * // the `database deleted` warning is displayed in the console.
 *
 * @remarks This method completes all the observables connected to the database stream that gets deleted. If you plan on deleting databases, make sure you reinitialise your database streams after a deletion.
 *
 * @param name - The database name you want to delete
 * @returns An Observable<void> stream that immediately emits and completes when the deletion occurs.
 */
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
