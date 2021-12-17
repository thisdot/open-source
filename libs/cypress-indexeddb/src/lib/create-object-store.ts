import { isIDBDatabase } from './helpers';
import { createVersionUpdateDatabaseConnection } from './upgrade-database';

function createObjectStoreInternal(
  database: IDBDatabase,
  storeName: string,
  isExistingStore: boolean
): Promise<IDBObjectStore> {
  let store: IDBObjectStore;

  if (isExistingStore) {
    store = database.transaction(storeName, 'readwrite').objectStore(storeName);
  } else {
    store = database.createObjectStore(storeName);
  }

  return new Promise<IDBObjectStore>((resolve, reject) => {
    store.transaction.oncomplete = () => {
      database.close();
      resolve(store);
    };
    store.transaction.onerror = (e) => {
      reject(e);
    };
  });
}

export function createObjectStore(
  existingDatabase: IDBDatabase,
  storeName: string
): Promise<IDBObjectStore> {
  let error: any;
  const isExistingStore = existingDatabase.objectStoreNames.contains(storeName);
  const log = Cypress.log({
    name: `create`,
    type: 'child',
    message: `IDBObjectStore - ${storeName}`,
    consoleProps: () => ({
      'store name': storeName,
      'did store exist before?': isExistingStore,
      'database name': existingDatabase.name,
      error: error || 'no',
    }),
    autoEnd: false,
  });
  if (!isIDBDatabase(existingDatabase)) {
    error = new Error(
      `You tried to use the 'getObjectStore' method without calling 'openIndexedDb' first`
    );
    log.error(error).end();
    throw error;
  }
  return createVersionUpdateDatabaseConnection(existingDatabase)
    .then((versionUpdateDatabase: IDBDatabase) =>
      createObjectStoreInternal(versionUpdateDatabase, storeName, isExistingStore)
    )
    .then((store) => {
      log.end();
      return store;
    })
    .catch((e) => {
      error = e;
      log.error(e).end();
      throw e;
    });
}
