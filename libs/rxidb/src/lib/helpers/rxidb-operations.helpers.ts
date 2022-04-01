import { noop, Observable, ReplaySubject, switchMap } from 'rxjs';

type NoKeyValueOperationReturnsValues = keyof Pick<IDBObjectStore, 'getAll'>;
type NoKeyValueOperationReturnsKeys = keyof Pick<IDBObjectStore, 'getAllKeys'>;

type OnlyKeyOperationReturnsValue = keyof Pick<IDBObjectStore, 'get'>;
type OnlyKeyOperationReturnsStore = keyof Pick<IDBObjectStore, 'delete'>;

type OnlyValueOperations = keyof Pick<IDBObjectStore, 'add'>;
type KeyValueOperations = keyof Pick<IDBObjectStore, 'put'>;

type Operations =
  | NoKeyValueOperationReturnsValues
  | NoKeyValueOperationReturnsKeys
  | OnlyKeyOperationReturnsValue
  | OnlyKeyOperationReturnsStore
  | OnlyValueOperations
  | KeyValueOperations;

const IS_OBJECT_STORE_RETURN_OPERATION = new Set(['put', 'delete', 'add']);

export function performObjectStoreOperation<T>(
  storeName: string,
  operation: NoKeyValueOperationReturnsValues
): (s$: Observable<IDBDatabase>) => Observable<T>;
export function performObjectStoreOperation(
  storeName: string,
  operation: NoKeyValueOperationReturnsKeys
): (s$: Observable<IDBDatabase>) => Observable<IDBValidKey[]>;
export function performObjectStoreOperation<T>(
  storeName: string,
  operation: OnlyKeyOperationReturnsValue,
  key: IDBValidKey
): (s$: Observable<IDBDatabase>) => Observable<T>;
export function performObjectStoreOperation(
  storeName: string,
  operation: OnlyKeyOperationReturnsStore,
  key: IDBValidKey
): (s$: Observable<IDBDatabase>) => Observable<IDBObjectStore>;
export function performObjectStoreOperation(
  storeName: string,
  operation: OnlyValueOperations,
  key: null,
  value: unknown
): (s$: Observable<IDBDatabase>) => Observable<IDBObjectStore>;
export function performObjectStoreOperation(
  storeName: string,
  operation: KeyValueOperations,
  key: IDBValidKey,
  value: unknown
): (s$: Observable<IDBDatabase>) => Observable<IDBObjectStore>;
export function performObjectStoreOperation<T>(
  storeName: string,
  operation: Operations,
  key?: IDBValidKey | null,
  value?: unknown
): (s$: Observable<IDBDatabase>) => Observable<T | IDBObjectStore> {
  return (s$) =>
    s$.pipe(
      switchMap((openDb: IDBDatabase) => {
        const resultSubject = new ReplaySubject<T | IDBObjectStore>(1);
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
            resultSubject.next(store);
          } else {
            resultSubject.next(request.result as T);
          }
        };

        return resultSubject.asObservable();
      })
    );
}
