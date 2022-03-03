import { noop, Observable, ReplaySubject, switchMap } from 'rxjs';

type ObjectStoreOperation = keyof Pick<
  IDBObjectStore,
  'getAllKeys' | 'getAll' | 'get' | 'delete' | 'put' | 'add'
>;

const IS_OBJECT_STORE_RETURN_OPERATION = new Set(['put', 'delete', 'add']);

export function performObjectStoreOperation<T = IDBObjectStore>(
  storeName: string,
  operation: ObjectStoreOperation,
  key?: string | null,
  value?: unknown
): (s$: Observable<IDBDatabase>) => Observable<T> {
  return (s$) =>
    s$.pipe(
      switchMap((openDb: IDBDatabase) => {
        const resultSubject = new ReplaySubject<T>(1);
        const store: IDBObjectStore = openDb
          .transaction(storeName, 'readwrite')
          .objectStore(storeName);
        let request: IDBRequest;
        if (operation === 'get' || operation === 'delete') {
          request = store[operation](key as string);
        } else if (operation === 'put') {
          request = store[operation](value, key as string);
        } else if (operation === 'add') {
          request = store[operation](value);
        } else {
          request = store[operation]();
        }

        request.onerror = () => {
          openDb.close();
          resultSubject.complete();
        };

        request.onsuccess = () => {
          request.onerror = noop;
          openDb.close();
          if (IS_OBJECT_STORE_RETURN_OPERATION.has(operation)) {
            resultSubject.next(store as unknown as T);
          } else {
            resultSubject.next(request.result as T);
          }
        };

        return resultSubject.asObservable();
      })
    );
}
