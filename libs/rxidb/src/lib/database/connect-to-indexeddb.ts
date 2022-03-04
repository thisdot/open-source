import { filter, from, noop, Observable, ReplaySubject, switchMap, takeUntil } from 'rxjs';
import { DATABASE_DELETE_EVENTS } from '../rxidb-internal.events';

export function connectIndexedDb(name: string, version?: number): Observable<IDBDatabase> {
  const dbSubject = new ReplaySubject<IDBDatabase>(1);
  const request: IDBOpenDBRequest = version
    ? window.indexedDB.open(name, version)
    : window.indexedDB.open(name);

  request.onerror = (e) => {
    dbSubject.error(e);
  };

  request.onupgradeneeded = (e) => {
    console.warn('onupgradeneeded', e);
    const db = (e.target as any).result as IDBDatabase;
    db.close();
  };

  request.onsuccess = (e) => {
    request.onerror = noop;
    const db = (e.target as any).result as IDBDatabase;
    dbSubject.next(db);

    db.onclose = () => {
      dbSubject.complete();
    };
  };

  return dbSubject
    .asObservable()
    .pipe(takeUntil(DATABASE_DELETE_EVENTS.asObservable().pipe(filter((db) => db === name))));
}

export function upgradeDatabase(existingDb: IDBDatabase): Observable<IDBDatabase> {
  const dbSubject = new ReplaySubject<IDBDatabase>(1);
  existingDb.close();

  return from(window.indexedDB.databases()).pipe(
    switchMap((dbInfo: IDBDatabaseInfo[]) => {
      const currentDb = dbInfo.find((i) => i.name === existingDb.name);
      if (!currentDb) {
        throw new Error('you cannot make a version upgrade on a non-existent database');
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
