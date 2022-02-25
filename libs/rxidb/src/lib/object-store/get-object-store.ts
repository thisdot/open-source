import { upgradeDatabase } from '../database';
import { filter, Observable, of, ReplaySubject, share, Subject, switchMap, takeUntil } from 'rxjs';
import { DATABASE_DELETE_EVENTS } from '../rxidb-internal.events';

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
