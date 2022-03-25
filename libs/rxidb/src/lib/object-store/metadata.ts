import { endWith, filter, map, Observable, switchMap, takeUntil } from 'rxjs';
import { connectIndexedDb } from '../database';
import {
  filterKeyEventsForStore,
  filterValueEventsForStore,
} from '../helpers/rxidb-events.helpers';
import { filterIfStoreDoesNotExist } from '../helpers/rxidb-object-store.helpers';
import { performObjectStoreOperation } from '../helpers/rxidb-operations.helpers';
import { DATABASE_DELETE_EVENTS } from '../rxidb-internal.events';

export function keys(): (s$: Observable<IDBObjectStore>) => Observable<IDBValidKey[]> {
  return (s$) =>
    s$.pipe(
      filterKeyEventsForStore(),
      switchMap((store: IDBObjectStore) =>
        connectIndexedDb(store.transaction.db.name).pipe(
          filterIfStoreDoesNotExist(store),
          performObjectStoreOperation<IDBValidKey[]>(store.name, 'getAllKeys'),
          takeUntil(
            DATABASE_DELETE_EVENTS.asObservable().pipe(
              filter((db) => db === store.transaction.db.name)
            )
          ),
          endWith(null),
          map((r) => (r === null ? [] : r))
        )
      )
    );
}

export function entries<T = []>(): (s$: Observable<IDBObjectStore>) => Observable<T> {
  return (s$) =>
    s$.pipe(
      filterValueEventsForStore(),
      switchMap((store: IDBObjectStore) =>
        connectIndexedDb(store.transaction.db.name).pipe(
          filterIfStoreDoesNotExist(store),
          performObjectStoreOperation<T>(store.name, 'getAll'),
          takeUntil(
            DATABASE_DELETE_EVENTS.asObservable().pipe(
              filter((db) => db === store.transaction.db.name)
            )
          ),
          endWith(null),
          map((r) => (r === null ? ([] as unknown as T) : r))
        )
      )
    );
}
