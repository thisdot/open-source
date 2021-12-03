const STORES = new Map<string, IDBObjectStore>();

function deleteDatabase(databaseName: string): Promise<void> {
  let error: any;
  const log = Cypress.log({
    name: `delete`,
    type: 'parent',
    message: `IDBDatabase - ${databaseName}`,
    consoleProps: () => ({
      'database name': databaseName,
      error: error || 'no',
    }),
    autoEnd: false,
  });
  return new Promise<void>((resolve, reject) => {
    const deleteDb: IDBOpenDBRequest = window.indexedDB.deleteDatabase(databaseName);
    deleteDb.onsuccess = () => {
      log.end();
      resolve();
    };
    deleteDb.onerror = (e) => {
      error = e;
      log.end();
      reject();
    };
    deleteDb.onblocked = (e) => {
      error = e;
      log.end();
      reject();
    };
    deleteDb.onupgradeneeded = (e) => {
      error = e;
      log.end();
      reject();
    };
  });
}

function createDatabaseConnection(
  databaseName: string,
  versionConfiguredByUser?: number
): Promise<IDBDatabase> {
  const request: IDBOpenDBRequest =
    versionConfiguredByUser != null
      ? window.indexedDB.open(databaseName, versionConfiguredByUser)
      : window.indexedDB.open(databaseName);
  return new Promise<IDBDatabase>((resolve, reject) => {
    request.onerror = (e: Event) => {
      reject(e);
    };
    request.onsuccess = (e: Event) => {
      const db = (e.target as any).result as IDBDatabase;
      resolve(db);
    };
  });
}

function createVersionUpdateDatabaseConnection(openDatabase: IDBDatabase): Promise<IDBDatabase> {
  let newVersion: number;
  let error: any;
  let databaseVersion: number;
  const databaseName = openDatabase.name;
  const log = Cypress.log({
    name: `upgrade`,
    type: 'parent',
    message: `IDBDatabase - ${databaseName}`,
    consoleProps: () => ({
      'old database version': openDatabase.version,
      'new database version': databaseVersion,
      'database name': databaseName,
      error: error || 'no',
    }),
    autoEnd: false,
  });
  openDatabase.close();
  try {
    const request: IDBOpenDBRequest = window.indexedDB.open(databaseName, openDatabase.version + 1);
    return new Promise<IDBDatabase>((resolve, reject) => {
      request.onerror = (e: Event) => {
        error = e;
        log.end();
        reject(e);
      };
      request.onupgradeneeded = (e: Event) => {
        const db = (e.target as any).result as IDBDatabase;
        newVersion = db.version;
        log.end();
        resolve(db);
      };
    });
  } catch (e) {
    error = e;
    log.end();
    return Promise.reject(e);
  }
}

function createObjectStore(database: IDBDatabase, storeName: string): Promise<IDBObjectStore> {
  let store: IDBObjectStore;
  let error: any;
  const isExistingStore = database.objectStoreNames.contains(storeName);
  const log = Cypress.log({
    name: `create`,
    type: 'child',
    message: `IDBObjectStore - ${storeName}`,
    consoleProps: () => ({
      'store name': storeName,
      'did store exist before?': isExistingStore,
      'new database version': database.version,
      'database name': database.name,
      error: error || 'no',
    }),
    autoEnd: false,
  });

  if (isExistingStore) {
    store = database.transaction(storeName, 'readwrite').objectStore(storeName);
  } else {
    store = database.createObjectStore(storeName);
  }

  return new Promise<IDBObjectStore>((resolve, reject) => {
    store.transaction.oncomplete = () => {
      database.close();
      log.end();
      resolve(store);
    };
    store.transaction.onerror = (e) => {
      error = e;
      log.end();
      reject(e);
    };
  });
}

export function setupIDBHelpers(): void {
  Cypress.Commands.add('clearIndexedDb', deleteDatabase);
  Cypress.Commands.add('openIndexedDb', (databaseName: string, version?: number) => {
    let error: any;
    let databaseVersion: number;
    const log = Cypress.log({
      name: `open`,
      type: 'parent',
      message: `IDBDatabase - ${databaseName}`,
      consoleProps: () => ({
        'database version': databaseVersion,
        'database name': databaseName,
      }),
      autoEnd: false,
    });
    return createDatabaseConnection(databaseName, version)
      .then((db) => {
        databaseVersion = db.version;
        log.end();
        return db;
      })
      .catch((e) => {
        error = e;
        log.end();
        throw e;
      });
  });

  Cypress.Commands.add(
    `createObjectStore`,
    { prevSubject: true },
    (existingDatabase: IDBDatabase, storeName: string) => {
      if (existingDatabase?.constructor?.name !== 'IDBDatabase') {
        throw new Error(
          `You tried to use the 'getObjectStore' method without calling 'openIndexedDb' first`
        );
      }
      return createVersionUpdateDatabaseConnection(existingDatabase).then(
        (versionUpdateDatabase: IDBDatabase) => createObjectStore(versionUpdateDatabase, storeName)
      );
    }
  );

  Cypress.Commands.overwrite('as', (originalAs, subject: any | IDBObjectStore, alias) => {
    if (subject?.constructor?.name === 'IDBObjectStore') {
      STORES.set(alias, subject);
      return subject;
    } else {
      return originalAs(alias);
    }
  });

  Cypress.Commands.add('getStore', (alias: string) => {
    let error: any;
    const log = Cypress.log({
      autoEnd: false,
      type: 'parent',
      name: 'get',
      message: alias,
      consoleProps: () => ({
        error: error || 'no',
      }),
    });

    const withoutAtSign = alias.substr(1);
    if (STORES.has(withoutAtSign)) {
      log.end();
      return Promise.resolve(STORES.get(withoutAtSign));
    } else {
      error = `could not find store with alias ${alias}`;
      log.end();
      throw new Error(`could not find store with alias ${alias}`);
    }
  });

  Cypress.Commands.add(
    `storeItem`,
    { prevSubject: true },
    (store: IDBObjectStore, key: string, value: unknown) => {
      let error: any;
      const log = Cypress.log({
        autoEnd: false,
        type: 'child',
        name: 'store',
        message: `IDBObjectStore key: ${key}`,
        consoleProps: () => ({
          key: key,
          value: value,
          error: error || 'no',
        }),
      });
      if (store?.constructor?.name !== 'IDBObjectStore') {
        error = new Error(
          `You tried to use the 'storeItem' method without calling 'getObjectStore' first`
        );
        log.end();
        throw error;
      }

      try {
        return createDatabaseConnection(store.transaction.db.name).then((openDb) => {
          const request = openDb
            .transaction(store.name, 'readwrite')
            .objectStore(store.name)
            .put(value, key);
          return new Promise((resolve, reject) => {
            request.onerror = (e) => {
              error = e;
              log.end();
              reject(e);
            };
            request.onsuccess = () => {
              openDb.close();

              log.end();
              resolve(store);
            };
          });
        });
      } catch (e) {
        error = e;
        log.end();
        return Promise.reject(e);
      }
    }
  );

  Cypress.Commands.add(
    `deleteItem`,
    { prevSubject: true },
    (store: IDBObjectStore, key: string) => {
      let error: any;
      const log = Cypress.log({
        autoEnd: false,
        type: 'child',
        name: 'delete',
        message: `IDBObjectStore key: ${key}`,
        consoleProps: () => ({
          key: key,
          error: error || 'no',
        }),
      });
      if (store?.constructor?.name !== 'IDBObjectStore') {
        error = new Error(
          `You tried to use the 'deleteItem' method without calling 'getObjectStore' first`
        );
        log.end();
        throw error;
      }
      try {
        return createDatabaseConnection(store.transaction.db.name).then((openDb) => {
          const request = openDb
            .transaction(store.name, 'readwrite')
            .objectStore(store.name)
            .delete(key);
          return new Promise((resolve, reject) => {
            request.onerror = (e) => {
              error = e;
              log.end();
              reject(e);
            };
            request.onsuccess = () => {
              openDb.close();
              log.end();
              resolve(store);
            };
          });
        });
      } catch (e) {
        error = e;
        log.end();
        return Promise.reject(e);
      }
    }
  );

  Cypress.Commands.add(
    `readItem`,
    { prevSubject: true },
    <T>(store: IDBObjectStore, key: IDBValidKey | IDBKeyRange): Promise<T> => {
      let error: any;
      let value: T;
      const log = Cypress.log({
        autoEnd: false,
        type: 'child',
        name: `read`,
        message: `IDBObjectStore key: ${key}`,
        consoleProps: () => ({
          key: key,
          value: value,
          error: error || 'no',
        }),
      });
      if (store?.constructor?.name !== 'IDBObjectStore') {
        error = new Error(
          `You tried to use the 'storeItem' method without calling 'getObjectStore' first`
        );
        log.end();
        throw error;
      }
      try {
        return createDatabaseConnection(store.transaction.db.name).then((openDb) => {
          const request = openDb
            .transaction(store.name, 'readwrite')
            .objectStore(store.name)
            .get(key);
          return new Promise((resolve, reject) => {
            request.onerror = (e) => {
              error = e;
              log.end();
              reject(e);
            };
            request.onsuccess = () => {
              openDb.close();
              value = request.result;
              log.end();
              resolve(value);
            };
          });
        });
      } catch (e) {
        error = e;
        log.end();
        return Promise.reject(e);
      }
    }
  );
}
