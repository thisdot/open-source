import { getCommandArguments, isIDBObjectStore } from './helpers';
import { createDatabaseConnection } from './open-database';
import Log = Cypress.Log;

type SetItemOperation = 'create' | 'update' | 'add';
type ReadDeleteOperation = 'read' | 'delete';
type StoreOperation = keyof Pick<IDBObjectStore, 'get' | 'put' | 'delete' | 'add'>;
type ConsolePropObject = {
  key: IDBValidKey;
  value?: unknown;
  error?: Error;
};

/**
 * Read item for the provided store key
 *
 * @remarks The `readItem` method yields the value of the provided key, or undefined if it does not exist. You can chain assertions from this method. If you use TypeScript, you can set the type of the returned value
 *
 * @param store `IDBObjectStore` instance
 * @param key
 *
 * @returns  Promise<T>
 * @throws {Error} If the connections fails to open or the read operation fails.
 */
export function readItem<T>(store: IDBObjectStore, key: IDBValidKey): Promise<T> {
  const { log, consoleProps } = createCRUDLog('read', key);
  if (!isIDBObjectStore(store)) {
    const error = new Error(
      `You tried to use the 'readItem' method without calling 'getObjectStore' first`
    );
    consoleProps.error = error;
    log.error(error).end();
    throw error;
  }
  return createDatabaseConnection(store.transaction.db.name)
    .then((openDb: IDBDatabase) => makeCreateUpdateDeleteRequest<T>('get', openDb, store, key))
    .then((result: T) => {
      consoleProps.value = result;
      log.end();
      return result as T;
    })
    .catch((e) => {
      consoleProps.error = e;
      log.error(e).end();
      throw e;
    });
}

/**
 * Delete item for the provided store key
 *
 * @remarks The `deleteItem` method deletes the value of the provided key, or undefined if it does not exist. You can chain assertions from this method. If you use TypeScript, you can set the type of the returned value
 *
 * @param store `IDBObjectStore` instance
 * @param key
 *
 * @returns IDBObjectStore
 * @throws {Error} If the connections fails to open or the read operation fails.
 */
export function deleteItem(store: IDBObjectStore, key: IDBValidKey): Promise<IDBObjectStore> {
  const { log, consoleProps } = createCRUDLog('delete', key);
  if (!isIDBObjectStore(store)) {
    const error = new Error(
      `You tried to use the 'deleteItem' method without calling 'getObjectStore' first`
    );
    consoleProps.error = error;
    log.error(error).end();
    throw error;
  }
  return createDatabaseConnection(store.transaction.db.name)
    .then((openDb: IDBDatabase) =>
      makeCreateUpdateDeleteRequest<IDBObjectStore>('delete', openDb, store, key)
    )
    .then((store: IDBObjectStore) => {
      log.end();
      return store;
    })
    .catch((e) => {
      consoleProps.error = e;
      log.error(e).end();
      throw e;
    });
}

/**
 * Create item for the provided store key
 *
 * @remarks The `createItem` method creates the key and value. You can chain assertions from this method. If you use TypeScript, you can set the type of the returned value
 *
 * @param store `IDBObjectStore` instance
 * @param key item key
 * @param value item value
 *
 * @returns IDBObjectStore
 * @throws {Error} If the connections fails to open or the read operation fails.
 */
export function createItem(
  store: IDBObjectStore,
  key: IDBValidKey,
  value: unknown
): Promise<IDBObjectStore> {
  return setItem('add', store, key, value);
}

/**
 * Update item for the provided store key
 *
 * @remarks The `updateItem` method updates the value for the key provided. You can chain assertions from this method. If you use TypeScript, you can set the type of the returned value
 *
 * @param store `IDBObjectStore` instance
 * @param key item key
 * @param value item value
 *
 * @returns IDBObjectStore
 * @throws {Error} If the connections fails to open or the read operation fails.
 */
export function updateItem(
  store: IDBObjectStore,
  key: IDBValidKey,
  value: unknown
): Promise<IDBObjectStore> {
  return setItem('update', store, key, value);
}

/**
 * Add item for provided store key
 *
 * @remarks The `addItem` method adds the value provided to the store. You can chain assertions from this method. If you use TypeScript, you can set the type of the returned value
 *
 * @param store `IDBObjectStore` instance
 * @param value item value
 *
 * @returns IDBObjectStore
 * @throws {Error} If the connections fails to open or the read operation fails.
 */
export function addItem(store: IDBObjectStore, value: unknown): Promise<IDBObjectStore> {
  return setItem('add', store, null, value);
}

function setItem(
  operation: SetItemOperation,
  store: IDBObjectStore,
  key: IDBValidKey | null,
  value: unknown
): Promise<IDBObjectStore> {
  const { log, consoleProps } = createCRUDLog(operation, key);
  consoleProps.value = value;
  if (!isIDBObjectStore(store)) {
    const error = new Error(
      `You tried to use the '${operation}Item' method without calling 'getObjectStore' first`
    );
    consoleProps.error = error;
    log.error(error).end();
    throw error;
  }

  return createDatabaseConnection(store.transaction.db.name)
    .then((openDb: IDBDatabase) =>
      makeCreateUpdateDeleteRequest<IDBObjectStore, unknown>(
        key ? 'put' : 'add',
        openDb,
        store,
        key,
        value
      )
    )
    .then((store: IDBObjectStore) => {
      log.end();
      return store;
    })
    .catch((e) => {
      consoleProps.error = e;
      log.error(e).end();
      throw e;
    });
}

function makeCreateUpdateDeleteRequest<T, O = undefined>(
  operation: StoreOperation,
  db: IDBDatabase,
  store: IDBObjectStore,
  key: IDBValidKey | null,
  value?: O
): Promise<T> {
  const commandArguments = getCommandArguments(key, value);
  return new Promise((resolve, reject) => {
    const request: IDBRequest = db
      .transaction(store.name, 'readwrite')
      .objectStore(store.name)
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      [operation](...commandArguments);
    request.onerror = (e) => {
      db.close();
      reject(e);
    };
    request.onsuccess = () => {
      request.onerror = () => void 0;
      db.close();
      const result = operation === 'get' ? request.result : store;
      resolve(result);
    };
  });
}

function createCRUDLog(
  operation: SetItemOperation | ReadDeleteOperation,
  key: IDBValidKey | null
): { log: Log; consoleProps: ConsolePropObject } {
  const consoleProps: ConsolePropObject = {
    key: key || 'no key provided',
  };
  const log = Cypress.log({
    autoEnd: false,
    type: 'child',
    name: operation,
    message: `IDBObjectStore key: ${key}`,
    consoleProps: () => consoleProps,
  });
  return { log, consoleProps };
}
