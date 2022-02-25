import { noop, Observable, ReplaySubject, switchMap } from 'rxjs';

type ObjectStoreMetadataOperations = keyof Pick<IDBObjectStore, 'getAllKeys' | 'getAll'>;

export function performMetadataOperation<T>(
  storeName: string,
  operation: ObjectStoreMetadataOperations
): (s$: Observable<IDBDatabase>) => Observable<T> {
  return (s$) =>
    s$.pipe(
      switchMap((openDb: IDBDatabase) => {
        const resultSubject = new ReplaySubject<T>(1);
        const request: IDBRequest = openDb
          .transaction(storeName, 'readwrite')
          .objectStore(storeName)
          [operation]();

        request.onerror = () => {
          openDb.close();
          resultSubject.complete();
        };

        request.onsuccess = () => {
          request.onerror = noop;
          openDb.close();
          resultSubject.next(request.result);
        };

        return resultSubject.asObservable();
      })
    );
}
