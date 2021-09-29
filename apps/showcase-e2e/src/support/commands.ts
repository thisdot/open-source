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
    getObjectStore(storeName: string): Promise<IDBObjectStore>;
  }
}
//
// -- This is a parent command --
Cypress.Commands.add('clearIndexedDb', (databaseName: string) => {
  return cy.window().then(async (window: Cypress.AUTWindow) => {
    const promise = new Promise<void>((resolve, reject) => {
      const deleteDb = window.indexedDB.deleteDatabase(databaseName);
      deleteDb.onsuccess = () => resolve();
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

const DB_VERSIONS = new Map<string, number>();

Cypress.Commands.add('openIndexedDb', (databaseName: string) => {
  return cy.window().then(async (window: Cypress.AUTWindow) => {
    // TODO: configurable versions
    const request = window.indexedDB.open(databaseName, DB_VERSIONS.get(databaseName) || 2);
    return new Promise<IDBDatabase>((resolve, reject) => {
      request.onerror = reject;
      request.onupgradeneeded = (event: any) => {
        DB_VERSIONS.set(databaseName, event.target?.result.newVersion + 1);
        resolve(event.target?.result);
      };
    });
  });
});

Cypress.Commands.add(
  `getObjectStore`,
  { prevSubject: true },
  (database: IDBDatabase, storeName: string) => {
    return new Promise((resolve, reject) => {
      try {
        let store;
        if (database.objectStoreNames.contains(storeName)) {
          store = database.transaction(storeName, 'readwrite').objectStore(storeName);
        } else {
          store = database.createObjectStore(storeName);
        }
        resolve(store);
      } catch (e) {
        reject(e);
      }
    });
  }
);
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
