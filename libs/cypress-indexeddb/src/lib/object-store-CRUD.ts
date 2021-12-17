import { isIDBObjectStore } from './helpers';
import { createDatabaseConnection } from './open-database';
import Log = Cypress.Log;

type SetItemOperation = 'create' | 'update';
type ReadDeleteOperation = 'read' | 'delete';
type StoreOperation = keyof Pick<IDBObjectStore, 'get' | 'put' | 'delete'>;
type ConsolePropObject = {
  key: string;
  value?: unknown;
  error?: Error;
};

export function readItem<T>(store: IDBObjectStore, key: string): Promise<T> {
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
    .then((openDb) => makeCreateUpdateDeleteRequest<T>('get', openDb, store, key))
    .then((result) => {
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

export function deleteItem(store: IDBObjectStore, key: string): Promise<IDBObjectStore> {
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
    .then((openDb) => makeCreateUpdateDeleteRequest<IDBObjectStore>('delete', openDb, store, key))
    .then((store) => {
      log.end();
      return store;
    })
    .catch((e) => {
      consoleProps.error = e;
      log.error(e).end();
      throw e;
    });
}

export function createItem(
  store: IDBObjectStore,
  key: string,
  value: unknown
): Promise<IDBObjectStore> {
  return setItem('create', store, key, value);
}

export function updateItem(
  store: IDBObjectStore,
  key: string,
  value: unknown
): Promise<IDBObjectStore> {
  return setItem('update', store, key, value);
}

function setItem(
  operation: SetItemOperation,
  store: IDBObjectStore,
  key: string,
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
    .then((openDb) =>
      makeCreateUpdateDeleteRequest<IDBObjectStore, unknown>('put', openDb, store, key, value)
    )
    .then((store) => {
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
  key: string,
  value?: O
): Promise<T> {
  const commandArguments: [O, string] | [string] = value ? [value, key] : [key];
  return new Promise((resolve, reject) => {
    const request: IDBRequest = db
      .transaction(store.name, 'readwrite')
      .objectStore(store.name)
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      [operation](...commandArguments);
    request.onerror = (e) => {
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
  key: string
): { log: Log; consoleProps: ConsolePropObject } {
  const consoleProps: ConsolePropObject = {
    key,
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
