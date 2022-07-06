<h1 align="center">Cypress IndexedDB helpers ⚙️</h1>

[Cypress](https://cypress.io) IndexedDB helpers are a set of custom cypress commands that helps you handle indexedDB related operations in your Cypress tests.

It supports:

✅ &nbsp;Creating new IndexedDB databases and Object Stores <br/>
✅ &nbsp;Making CRUD operations on the above-mentioned stores <br/>
✅ &nbsp;Read data out of indexedDB and assert the results <br/>

---

<p align="center">
  <a href="https://www.npmjs.com/package/@this-dot/cypress-indexeddb"><img src="https://img.shields.io/badge/%40this--dot-%2Fcypress--indexeddb-blueviolet" /></a>
  <a href="https://www.npmjs.com/package/@this-dot/cypress-indexeddb"><img src="https://img.shields.io/npm/v/@this-dot/cypress-indexeddb" /></a>
  <a href="https://github.com/thisdot/open-source/actions/workflows/ci.yml?query=branch%3Amain"><img src="https://github.com/thisdot/open-source/actions/workflows/ci.yml/badge.svg" /></a>
  <a href="https://github.com/thisdot/open-source/blob/main/LICENSE.md"><img src="https://img.shields.io/npm/l/@this-dot/cypress-indexeddb" /></a>
  <a href="https://github.com/thisdot/open-source/issues?q=is%3Aissue+is%3Aopen+label%3Acypress-indexeddb"><img src="https://img.shields.io/github/issues/thisdot/open-source?q=is%3Aissue+is%3Aopen+label%3Acypress-indexeddb" /></a>
</p>

---

## Usage

### Installation

1. Install the package:  
   `npm install @this-dot/cypress-indexeddb`  
   or  
   `yarn add @this-dot/cypress-indexeddb`

2. Import the plugin in your `cypress/support/commands.js` or `cypress/support/commands.ts` file:

   ```typescript
   import '@this-dot/cypress-indexeddb';
   ```

3. If you use typescript, set up typings in the same `support` folder
   1. Create a `cypress-indexeddb-namespace.ts` file
   2. Copy the following typings into the newly created file:
      ```typescript
      declare namespace Cypress {
        interface Chainable<Subject> {
          clearIndexedDb(databaseName: string): void;
          openIndexedDb(databaseName: string, version?: number): Chainable<IDBDatabase>;
          getIndexedDb(databaseName: string): Chainable<IDBDatabase>;
          createObjectStore(
            storeName: string,
            options?: IDBObjectStoreParameters
          ): Chainable<IDBObjectStore>;
          getStore(storeName: string): Chainable<IDBObjectStore>;
          createItem(key: IDBValidKey, value: unknown): Chainable<IDBObjectStore>;
          readItem<T = unknown>(key: IDBValidKey | IDBKeyRange): Chainable<T>;
          updateItem(key: IDBValidKey, value: unknown): Chainable<IDBObjectStore>;
          deleteItem(key: IDBValidKey): Chainable<IDBObjectStore>;
          addItem<T = unknown>(value: T): Chainable<IDBObjectStore>;
          keys(): Chainable<IDBValidKey[]>;
          entries<T = unknown>(): Chainable<T[]>;
        }
      }
      ```

### Using the commands in your Cypress tests

#### How to clear a database?

In order to make your tests reliable, before every test it is recommended to clear the existing database. You can do it by using the `cy.clearIndexedDb('databaseName')` command.

```typescript
beforeEach(() => {
  cy.clearIndexedDb('EXAMPLE_DATABASE');

  // ...

  cy.visit('/');
});
```

#### How to create a database connection?

In order to create an object store, first, you need to initiate a database connection by calling the `cy.openIndexedDb('databaseName')` command and use the `as` chainer to store it with an alias.

```typescript
cy.openIndexedDb('EXAMPLE_DATABASE').as('database');
```

The `openIndexedDb` command supports providing a database version number optionally

```typescript
cy.openIndexedDb('EXAMPLE_DATABASE', 12) // initiate with database version 12
  .as('database');
```

You can access the aliased database with the `getIndexedDb('@yourAlias')` command.

#### How to create an Object Store?

You can chain off the `createObjectStore('storeName')` method from methods that yield an `IDBDatabase` instance (`openIndexedDb` or `getIndexedDb`). You can use the `as` chainer to save the store using an alias.

```typescript
cy.getIndexedDb('@database').createObjectStore('example_store').as('exampleStore');
```

You can also pass an optional options parameter to configure your object store. For example, you can create an object store with `autoIncrement` with the following command:

```typescript
cy.getIndexedDb('@database')
  .createObjectStore('example_autoincrement_store', { autoIncrement: true })
  .as('exampleAutoincrementStore');
```

You can retrieve the saved object store using the `cy.getStore('@exampleStore')`;

#### How to make CRUD operations on an Object Store?

You can chain off CRUD operation methods from methods that yield an `IDBObjectStore` instance (`createObjectStore` or `getStore`).

The `createItem`, `updateItem` and the `deleteItem` methods yield the store, therefore, you can chain these methods to save multiple entries into the target Object Store.

```typescript
cy.getStore('@exampleStore')
  .createItem('example', { test: 'test' }) // creates the 'example' key and saves the second parameter as the value.
  .updateItem('example', { test: 'replace' }) // updates the 'example' key's value with the second parameter.
  .deleteItem('example') // deletes the 'example' key
  .createItem('example2', ['testValue', 'testValue2'])
  .createItem('example3', { exampleKey: 1337 });
```

The `readItem` method yields the value of the provided key, or undefined if it does not exist. You can chain assertions from this method. If you use TypeScript, you can set the type of the returned value.

```typescript
cy.getStore('@exampleStore').readItem<string[]>('example2').should('have.length', 2);

cy.getStore('@exampleStore')
  .readItem<number>('example3')
  .should('have.property', 'exampleKey', 1337);
```

#### How to handle Object Stores with autoIncrement?

When you need to manipulate or assert data stored in an Object Store, that was set up with `{ autoIncrement: true }`, you have the following commands at your disposal: `addItem`, `keys` and `entries`.

The `addItem` method stores the provided value into the Object Store at a new index

```typescript
cy.getStore('@exampleAutoincrementStore').addItem('test').addItem({ test: 'object' }).addItem(1337);
```

The `keys` method returns an `IDBValidKey[]`. You can assert the results using the `.should()` method.

```typescript
cy.getStore('@exampleAutoincrementStore')
  .keys()
  .should('have.length', 3)
  .and('deep.equal', [1, 2, 3]);
```

The `entries` method returns all the values that are stored in order. You can assert the results using the `.should()` method.

```typescript
cy.getStore('@exampleAutoincrementStore')
  .entries()
  .should('have.length', 3)
  .and('deep.equal', ['test', { test: 'object' }, 1337]);
```

---

Feel free to check our cypress tests in our [git repository](https://github.com/thisdot/open-source/tree/main/apps/showcase-e2e/src/integration) for some examples.
