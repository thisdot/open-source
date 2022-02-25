import { noop, Observable, ReplaySubject, switchMap } from 'rxjs';
import { connectIndexedDb } from '../database';
import {
  filterKeyEventsForStore,
  filterValueEventsForStore,
} from '../helpers/rxidb-events.helpers';
import { filterIfStoreDoesNotExist } from '../helpers/rxidb-object-store.helpers';
import { performMetadataOperation } from '../helpers/rxidb-operations.helpers';

export function keys(): (s$: Observable<IDBObjectStore>) => Observable<IDBValidKey[]> {
  return (s$) =>
    s$.pipe(
      filterKeyEventsForStore(),
      switchMap((store: IDBObjectStore) =>
        connectIndexedDb(store.transaction.db.name).pipe(
          filterIfStoreDoesNotExist(store),
          performMetadataOperation<IDBValidKey[]>(store.name, 'getAllKeys')
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
          performMetadataOperation<T>(store.name, 'getAll')
        )
      )
    );
}
