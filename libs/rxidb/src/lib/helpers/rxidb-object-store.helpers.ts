import { filter, Observable } from 'rxjs';

export const filterIfStoreDoesNotExist = (store: IDBObjectStore) => (s$: Observable<IDBDatabase>) =>
  s$.pipe(
    filter((db: IDBDatabase) => {
      if (db.objectStoreNames.contains(store.name)) {
        return true;
      }
      db.close();
      return false;
    })
  );
