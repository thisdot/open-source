import { filter, map, Observable, startWith, switchMap, takeUntil } from 'rxjs';
import {
  DATABASE_DELETE_EVENTS,
  DbChangeMetadata,
  KEY_CHANGED,
  VALUE_CHANGED,
} from '../rxidb-internal.events';

export const filterKeyEventsForStore = () => filterEvent(KEY_CHANGED.asObservable());
export const filterValueEventsForStore = () => filterEvent(VALUE_CHANGED.asObservable());
export const filterValueEventsForStoreKey = (key: IDBValidKey) =>
  filterEvent(VALUE_CHANGED.asObservable(), key);

const filterEvent =
  (eventSource$: Observable<DbChangeMetadata>, key?: IDBValidKey) =>
  (s$: Observable<IDBObjectStore>) =>
    s$.pipe(
      switchMap((store: IDBObjectStore) =>
        eventSource$.pipe(
          startWithDefault<DbChangeMetadata>(store, key),
          takeUntilDbDelete<DbChangeMetadata>(store),
          filterStoreKeyEvents(store, key),
          map(() => store)
        )
      )
    );

const startWithDefault =
  <T>(store: IDBObjectStore, key?: IDBValidKey) =>
  (s$: Observable<T>) =>
    s$.pipe(startWith({ db: store.transaction.db.name, store: store.name, key }));

const takeUntilDbDelete =
  <T>(store: IDBObjectStore) =>
  (s$: Observable<T>) =>
    s$.pipe(
      takeUntil(
        DATABASE_DELETE_EVENTS.asObservable().pipe(filter((db) => db === store.transaction.db.name))
      )
    );

const filterStoreKeyEvents =
  (store: IDBObjectStore, key?: IDBValidKey) => (s$: Observable<DbChangeMetadata>) =>
    s$.pipe(
      filter(
        (dbChange: DbChangeMetadata) =>
          dbChange.db === store.transaction.db.name &&
          dbChange.store === store.name &&
          (key ? dbChange.key === key : true)
      )
    );
