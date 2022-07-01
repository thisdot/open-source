import { isIDBDatabase } from './helpers';
import { createVersionUpdateDatabaseConnection } from './upgrade-database';

function createObjectStoreInternal(
  database: IDBDatabase,
  storeName: string,
  options: IDBObjectStoreParameters | null,
  isExistingStore: boolean
): Promise<IDBObjectStore> {
  let store: IDBObjectStore;

  if (isExistingStore) {
    store = database.transaction(storeName, 'readwrite').objectStore(storeName);
  } else {
    store = options
      ? database.createObjectStore(storeName, options)
      : database.createObjectStore(storeName);
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

/**
 * creates an object store.
 * In order to create an object store, first, you need to initiate a database connection by calling the `cy.openIndexedDb('databaseName')` command and use the `as` chainer to store it with an alias.
 *
 * @example
 * You can chain off the `createObjectStore('storeName')` method from methods that yield an `IDBDatabase` instance (`openIndexedDb` or `getIndexedDb`). You can use the `as` chainer to save the store using an alias.
 * cy.getIndexedDb('@database').createObjectStore('example_store').as('exampleStore');
 *
 * You can also pass an optional options parameter to configure your object store. For example, you can create an object store with `autoIncrement` with the following command:
 * cy.getIndexedDb('@database')
 *  .createObjectStore('example_autoincrement_store', { autoIncrement: true })
 *  .as('exampleAutoincrementStore')
 *
 * @remarks You can retrieve the saved object store using the `cy.getStore('@exampleStore')`
 *
 * @param existingDatabase - `IDBDatabase` instance
 * @param storeName - Store name
 * @param options - `IDBObjectStoreParameters` interface
 * @returns Promise<IDBObjectStore>
 */
export function createObjectStore(
  existingDatabase: IDBDatabase,
  storeName: string,
  options?: IDBObjectStoreParameters
): Promise<IDBObjectStore> {
  let error: any;
  const isExistingStore = existingDatabase.objectStoreNames.contains(storeName);
  const log = Cypress.log({
    name: `create`,
    type: 'child',
    message: `IDBObjectStore - ${storeName}`,
    consoleProps: () => ({
      'store name': storeName,
      'store creation options': options || 'default',
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

  const objectStoreDb = isExistingStore
    ? Promise.resolve(existingDatabase)
    : createVersionUpdateDatabaseConnection(existingDatabase);
  return objectStoreDb
    .then((versionUpdateDatabase: IDBDatabase) =>
      createObjectStoreInternal(versionUpdateDatabase, storeName, options || null, isExistingStore)
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
