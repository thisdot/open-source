// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Cypress {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Chainable<Subject> {
    clearIndexedDb(databaseName: string): Chainable<Cypress.AUTWindow>;

    openIndexedDb(databaseName: string): Chainable<IDBDatabase>;
    getDatabase(databaseName: string): Chainable<IDBDatabase>;
    createObjectStore(storeName: string): Chainable<IDBObjectStore>;
    getStore(storeName: string): Chainable<IDBObjectStore>;
    storeItem(key: string, value: unknown): Chainable<IDBObjectStore>;

    deleteItem(key: string): Chainable<IDBObjectStore>;
  }
}

const DATABASES = new Map<string, IDBDatabase>();
// -- This is a parent command --
Cypress.Commands.add('clearIndexedDb', (databaseName: string) => {
  return cy.window().then(async (window: Cypress.AUTWindow) => {
    const promise = new Promise<void>((resolve, reject) => {
      const deleteDb = window.indexedDB.deleteDatabase(databaseName);
      deleteDb.onsuccess = () => {
        if (DATABASES.has(databaseName)) {
          DATABASES.delete(databaseName);
        }
        resolve();
      };
      deleteDb.onerror = (e) => reject(e);
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

Cypress.Commands.add('openIndexedDb', (databaseName: string, versionConfiguredByUser?: number) => {
  return cy.window().then(async (window: Cypress.AUTWindow) => {
    const db = DATABASES.get(databaseName);
    if (db) {
      return Promise.resolve(db);
    }
    const newVersion = versionConfiguredByUser || 2;
    const request = window.indexedDB.open(databaseName, newVersion);
    return new Promise<IDBDatabase>((resolve, reject) => {
      request.onerror = reject;
      request.onupgradeneeded = (event: any) => {
        const db = event.target?.result;
        DATABASES.set(databaseName, db);
        resolve(db);
      };
    });
  });
});

const STORES = new Map<string, IDBObjectStore>();

Cypress.Commands.add(
  `createObjectStore`,
  { prevSubject: true },
  (database: IDBDatabase, storeName: string) => {
    if (database?.constructor?.name !== 'IDBDatabase') {
      throw new Error(
        `You tried to use the 'getObjectStore' method without calling 'openIndexedDb' first`
      );
    }
    return new Promise((resolve, reject) => {
      try {
        let store: IDBObjectStore;
        if (database.objectStoreNames.contains(storeName)) {
          store = database.transaction(storeName, 'readwrite').objectStore(storeName);
        } else {
          store = database.createObjectStore(storeName);
        }
        new Promise((resolve2, reject2) => {
          store.transaction.oncomplete = resolve2;
          store.transaction.onerror = reject2;
          store.transaction.onabort = reject2;
        }).then(() => {
          resolve(store);
        });
      } catch (e) {
        reject(e);
      }
    });
  }
);

Cypress.Commands.overwrite('as', (originalAs, subject: any | IDBObjectStore, alias) => {
  if (subject?.constructor?.name === 'IDBObjectStore') {
    STORES.set(alias, subject);
    return subject;
  } else if (subject?.constructor?.name === 'IDBDatabase') {
    DATABASES.set(alias, subject);
    return subject;
  } else {
    return originalAs(alias);
  }
});

Cypress.Commands.add('getDatabase', (alias: string) => {
  const withoutAtSign = alias.substr(1);
  if (DATABASES.has(withoutAtSign)) {
    return Promise.resolve(DATABASES.get(withoutAtSign));
  } else {
    throw new Error(`could not find database with alias ${alias}`);
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
      const openStore: IDBObjectStore = store.transaction.db
        .transaction(store.name, 'readwrite')
        .objectStore(store.name);
      const request = openStore.put(value, key);
      return new Promise((resolve, reject) => {
        request.onerror = (e) => {
          reject(e);
        };
        request.onsuccess = () => {
          resolve(openStore);
        };
      });
    } catch (e) {
      return Promise.reject(e);
    }
  }
);

Cypress.Commands.add(`deleteItem`, { prevSubject: true }, (store: IDBObjectStore, key: string) => {
  if (store?.constructor?.name !== 'IDBObjectStore') {
    throw new Error(
      `You tried to use the 'deleteItem' method without calling 'getObjectStore' first`
    );
  }
  try {
    const openStore: IDBObjectStore = store.transaction.db
      .transaction(store.name, 'readwrite')
      .objectStore(store.name);
    const request = openStore.delete(key);
    return new Promise((resolve, reject) => {
      request.onerror = (e) => {
        reject(e);
      };
      request.onsuccess = () => {
        resolve(openStore);
      };
    });
  } catch (e) {
    return Promise.reject(e);
  }
});
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
