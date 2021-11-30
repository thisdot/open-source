const STORES = new Map<string, IDBObjectStore>();

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
      console.log(`Error occurred during creating an indexedDb database`, JSON.stringify(e));
      reject(e);
    };
    request.onsuccess = (e: Event) => {
      const db = (e.target as any).result as IDBDatabase;
      if (!db) {
        console.log('Could not establish database connection');
        reject('Could not establish database connection');
      }
      resolve(db);
    };
  });
}

function createVersionUpdateDatabaseConnection(openDatabase: IDBDatabase): Promise<IDBDatabase> {
  const newVersion = openDatabase.version + 1;
  openDatabase.close();
  const request: IDBOpenDBRequest = window.indexedDB.open(openDatabase.name, newVersion);
  return new Promise<IDBDatabase>((resolve, reject) => {
    request.onerror = (e: Event) => {
      console.log(`Error occurred during creating an indexedDb database`, JSON.stringify(e));
      reject(e);
    };
    request.onupgradeneeded = (e: Event) => {
      const db = (e.target as any).result as IDBDatabase;
      resolve(db);
    };
    request.onsuccess = (e: Event) => {
      console.log('what?', e);
      resolve((e.target as any).result);
    };
    request.onblocked = (e) => {
      console.log('blocked', e);
      reject(e);
    };
  });
}

function createObjectStore(database: IDBDatabase, storeName: string): Promise<IDBObjectStore> {
  let store: IDBObjectStore;
  if (database.objectStoreNames.contains(storeName)) {
    store = database.transaction(storeName, 'readwrite').objectStore(storeName);
  } else {
    store = database.createObjectStore(storeName);
  }

  return new Promise<IDBObjectStore>((resolve, reject) => {
    store.transaction.oncomplete = () => {
      console.log(`Object store with name "${storeName}" was created`);
      database.close();
      resolve(store);
    };
    store.transaction.onerror = (e) => {
      console.log(`Error occurred during creating an indexedDb object store`, JSON.stringify(e));
      reject(e);
    };
  });
}

export function setupIDBHelpers(): void {
  Cypress.Commands.add('clearIndexedDb', (databaseName: string) => {
    return cy.window().then(async (window: Cypress.AUTWindow) => {
      const promise = new Promise<void>((resolve, reject) => {
        const deleteDb: IDBOpenDBRequest = window.indexedDB.deleteDatabase(databaseName);
        deleteDb.onsuccess = () => {
          resolve();
        };
        deleteDb.onerror = (e) => {
          console.log(`delete database error`, e);
          resolve();
        };
        deleteDb.onblocked = (e) => {
          console.log(`delete database blocked`, e);
          resolve();
        };
        deleteDb.onupgradeneeded = (e) => {
          console.log(`delete database upgradeNeeded`, e);
          resolve();
        };
      });
      try {
        await promise;
        cy.log(`"${databaseName}" cleared`);
      } catch (e) {
        cy.log(`error during "${databaseName}" clear operation`);
        cy.log(e);
      }
      return window;
    });
  });

  Cypress.Commands.add('openIndexedDb', (databaseName: string, versionConfiguredByUser?: number) =>
    cy.window().then(() => createDatabaseConnection(databaseName, versionConfiguredByUser))
  );

  Cypress.Commands.add(
    `createObjectStore`,
    { prevSubject: true },
    (existingDatabase: IDBDatabase, storeName: string) => {
      if (existingDatabase?.constructor?.name !== 'IDBDatabase') {
        throw new Error(
          `You tried to use the 'getObjectStore' method without calling 'openIndexedDb' first`
        );
      }
      console.log('existingDatabaseVersion', existingDatabase.version);
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
    const withoutAtSign = alias.substr(1);
    if (STORES.has(withoutAtSign)) {
      return Promise.resolve(STORES.get(withoutAtSign));
    } else {
      throw new Error(`could not find store with alias ${alias}`);
    }
  });

  Cypress.Commands.add(
    `storeItem`,
    { prevSubject: true },
    (store: IDBObjectStore, key: string, value: unknown) => {
      if (store?.constructor?.name !== 'IDBObjectStore') {
        throw new Error(
          `You tried to use the 'storeItem' method without calling 'getObjectStore' first`
        );
      }
      try {
        return createDatabaseConnection(store.transaction.db.name).then((openDb) => {
          const request = openDb
            .transaction(store.name, 'readwrite')
            .objectStore(store.name)
            .put(value, key);
          return new Promise((resolve, reject) => {
            request.onerror = (e) => {
              reject(e);
            };
            request.onsuccess = () => {
              openDb.close();
              resolve(store);
            };
          });
        });
      } catch (e) {
        return Promise.reject(e);
      }
    }
  );

  Cypress.Commands.add(
    `deleteItem`,
    { prevSubject: true },
    (store: IDBObjectStore, key: string) => {
      if (store?.constructor?.name !== 'IDBObjectStore') {
        throw new Error(
          `You tried to use the 'deleteItem' method without calling 'getObjectStore' first`
        );
      }
      try {
        return createDatabaseConnection(store.transaction.db.name).then((openDb) => {
          const request = openDb
            .transaction(store.name, 'readwrite')
            .objectStore(store.name)
            .delete(key);
          return new Promise((resolve, reject) => {
            request.onerror = (e) => {
              reject(e);
            };
            request.onsuccess = () => {
              openDb.close();
              resolve(store);
            };
          });
        });
      } catch (e) {
        return Promise.reject(e);
      }
    }
  );

  Cypress.Commands.add(
    `readItem`,
    { prevSubject: true },
    <T>(store: IDBObjectStore, key: IDBValidKey | IDBKeyRange): Promise<T> => {
      if (store?.constructor?.name !== 'IDBObjectStore') {
        throw new Error(
          `You tried to use the 'storeItem' method without calling 'getObjectStore' first`
        );
      }
      try {
        return createDatabaseConnection(store.transaction.db.name).then((openDb) => {
          const request = openDb
            .transaction(store.name, 'readwrite')
            .objectStore(store.name)
            .get(key);
          return new Promise((resolve, reject) => {
            request.onerror = (e) => {
              reject(e);
            };
            request.onsuccess = () => {
              openDb.close();
              resolve(request.result);
            };
          });
        });
      } catch (e) {
        return Promise.reject(e);
      }
    }
  );
}
