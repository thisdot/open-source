import { Observable, Subject } from 'rxjs';
import { DATABASE_DELETE_EVENTS } from '../rxidb-internal.events';

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
