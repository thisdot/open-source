/**
 * This separate namespace file is a workaround to make the typings work.
 * see: https://github.com/nrwl/nx/issues/4078
 *
 */

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Cypress {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/no-empty-interface
  interface Chainable<Subject> {
    closeConnections(): void;
    clearIndexedDb(databaseName: string): void;
    openIndexedDb(databaseName: string, version?: number): Chainable<IDBDatabase>;
    getIndexedDb(databaseName: string): Chainable<IDBDatabase>;
    createObjectStore(storeName: string): Chainable<IDBObjectStore>;
    getStore(storeName: string): Chainable<IDBObjectStore>;
    createItem(key: string, value: unknown): Chainable<IDBObjectStore>;
    readItem<T = unknown>(key: IDBValidKey | IDBKeyRange): Chainable<T>;
    updateItem(key: string, value: unknown): Chainable<IDBObjectStore>;
    deleteItem(key: string): Chainable<IDBObjectStore>;
  }
}
