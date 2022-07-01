import Log = Cypress.Log;
import { isIDBObjectStore } from './helpers';
import { createDatabaseConnection } from './open-database';

type StoreOperation = keyof Pick<IDBObjectStore, 'getAllKeys' | 'getAll'>;
type ConsolePropObject = {
  result?: unknown;
  error?: Error;
};

/**
 * List keys in store
 *
 * @remarks The `keys` method lists the keys available in the provided store.
 *
 * @param store `IDBObjectStore` instance
 *
 * @returns IDBValidKey[]
 * @throws {Error} If the connections fails to open or the read operation fails.
 */
export function keys(store: IDBObjectStore): Promise<IDBValidKey[]> {
  const { log, consoleProps } = createMetadataLog('keys');
  if (!isIDBObjectStore(store)) {
    const error = new Error(
      `You tried to use the 'keys' method without calling 'getObjectStore' first`
    );
    consoleProps.error = error;
    log.error(error).end();
    throw error;
  }
  return createDatabaseConnection(store.transaction.db.name)
    .then((openDb: IDBDatabase) => getMetadata<IDBValidKey>(openDb, store, 'getAllKeys'))
    .then((result: IDBValidKey[]) => {
      consoleProps.result = result;
      log.end();
      return result;
    })
    .catch((e) => {
      consoleProps.error = e;
      log.error(e).end();
      throw e;
    });
}

/**
 * List all entries in store
 *
 * @remarks The `entries` method lists all the entried available in the provided store.
 *
 * @param store `IDBObjectStore` instance
 *
 * @returns T[]
 * @throws {Error} If the connections fails to open or the read operation fails.
 */
export function entries<T = unknown>(store: IDBObjectStore): Promise<T[]> {
  const { log, consoleProps } = createMetadataLog('entries');
  if (!isIDBObjectStore(store)) {
    const error = new Error(
      `You tried to use the 'entries' method without calling 'getObjectStore' first`
    );
    consoleProps.error = error;
    log.error(error).end();
    throw error;
  }
  return createDatabaseConnection(store.transaction.db.name)
    .then((openDb: IDBDatabase) => getMetadata<T>(openDb, store, 'getAll'))
    .then((result: T[]) => {
      consoleProps.result = result;
      log.end();
      return result;
    })
    .catch((e) => {
      consoleProps.error = e;
      log.error(e).end();
      throw e;
    });
}

function getMetadata<T>(
  db: IDBDatabase,
  store: IDBObjectStore,
  operation: StoreOperation
): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const request: IDBRequest = db
      .transaction(store.name, 'readwrite')
      .objectStore(store.name)
      [operation]();
    request.onerror = (e) => {
      db.close();
      reject(e);
    };
    request.onsuccess = () => {
      request.onerror = () => void 0;
      db.close();
      const result = request.result as T[];
      resolve(result);
    };
  });
}

function createMetadataLog(operation: 'keys' | 'entries'): {
  log: Log;
  consoleProps: ConsolePropObject;
} {
  const consoleProps: ConsolePropObject = {};
  const log = Cypress.log({
    autoEnd: false,
    type: 'child',
    name: operation,
    message: `IDBObjectStore ${operation}`,
    consoleProps: () => consoleProps,
  });
  return { log, consoleProps };
}
