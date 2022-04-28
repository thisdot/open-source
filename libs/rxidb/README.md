<h1 align="center"> RxIDB ⚙️</h1>

RxIDB is a library for storing and retrieving data from indexedDB databases, using an [RxJS](https://github.com/ReactiveX/rxjs) based API.

It supports:

✅ &nbsp;Creating new IndexedDB databases and Object Stores <br/>
✅ &nbsp;Making CRUD operations on the above-mentioned stores <br/>
✅ &nbsp;Reading data out of indexedDB <br/>

---

<p align="center">
  <a href="https://www.npmjs.com/package/@this-dot/rxidb"><img src="https://img.shields.io/badge/%40this--dot-%2Frxidb-blueviolet" /></a>
  <a href="https://www.npmjs.com/package/@this-dot/rxidb"><img src="https://img.shields.io/npm/v/@this-dot/rxidb" /></a>
  <a href="https://github.com/thisdot/open-source/actions/workflows/ci.yml?query=branch%3Amain"><img src="https://github.com/thisdot/open-source/actions/workflows/ci.yml/badge.svg" /></a>
  <a href="https://github.com/thisdot/open-source/blob/main/LICENSE.md"><img src="https://img.shields.io/npm/l/@this-dot/rxidb" /></a>
  <a href="https://github.com/thisdot/open-source/issues?q=is%3Aissue+is%3Aopen+label%3Arxidb"><img src="https://img.shields.io/github/issues/thisdot/open-source?q=is%3Aissue+is%3Aopen+label%3Arxidb" /></a>
</p>

---

## Usage

### Installation

1. Install the package:  
   `npm install @this-dot/rxidb`  
   or  
   `yarn add @this-dot/rxidb`

### Connecting to an IndexedDB database and creating an Object Store

The `connectIndexedDb` function is used to connect to an IndexedDB database. It takes a string as an argument, which is the name of the database. It returns an Observable that emits an `IDBDatabase` instance. Using the `getObjectStore` operator, you can create an Object Store. It also returns the store if it already exists.

```typescript
import { connectIndexedDb, getObjectStore } from '@this-dot/rxidb';
import { Observable } from 'rxjs';

// Connect to an IndexedDB database (create if the database does not exist)
const database$: Observable<IDBDatabase> = connectIndexedDb('example_database');
// Create an Object Store or get an existing one.
const store$: Observable<IDBObjectStore> = database$.pipe(getObjectStore('example_store'));

store$.subscribe((store) => {
  // Do something with the store
});
```

The `getObjectStore` function takes a string as an argument, which is the name of the Object Store. It returns an Observable that emits an `IDBObjectStore` instance. The second (optional) parameter allows you to configure your Object Store, for example, you can set it to `autoIncrement`.

```typescript
import { connectIndexedDb, getObjectStore } from '@this-dot/rxidb';
import { Observable } from 'rxjs';

// Connect to an IndexedDB database (create if the database does not exist)
const database$: Observable<IDBDatabase> = connectIndexedDb('example_database');
// Create an Object Store or get an existing one with autoIncrement.
const store$: Observable<IDBObjectStore> = database$.pipe(
  getObjectStore('example_store', { autoIncrement: true })
);

store$.subscribe((store) => {
  // Do something with the autoIncrement store
});
```

The second optional parameter is of type `IDBObjectStoreParameters`, where you can set the `keyPath` and `autoIncrement` properties.

```typescript
interface IDBObjectStoreParameters {
  autoIncrement?: boolean;
  keyPath?: string | string[] | null;
}
```

#### Database versioning

The `connectIndexedDb` method allows you to set your own database version, however, database versioning is handled by the library when it is needed. When a store needs to be created, the database connection must be an upgrade process. That is handled internally by the library, by always implementing the database version by `1`.

### Storing, updating and deleting data in an Object Store

#### setItem()

You can set key-value pairs in an Object Store using the `setItem` operator. This allows you to store or update existing values in the store.

```typescript
import { connectIndexedDb, getObjectStore, setItem } from '@this-dot/rxidb';
import { Observable } from 'rxjs';

// Connect to an IndexedDB database (create if the database does not exist)
const database$: Observable<IDBDatabase> = connectIndexedDb('example_database');
// Create an Object Store or get an existing one.
const store$: Observable<IDBObjectStore> = database$.pipe(getObjectStore('example_store'));

function saveToDatabase<T>(key: string, value: T): void {
  store$.pipe(setItem(key, value)).subscribe();
}

saveToDatabase('example_key', 'example_value');
saveToDatabase('example_key2', 1337);
```

#### addItem()

If you have an Object Store, that was set to `autoIncrement`, you can use the `addItem` operator to add a new value to the store.

```typescript
import { connectIndexedDb, getObjectStore, addItem } from '@this-dot/rxidb';
import { Observable } from 'rxjs';

// Connect to an IndexedDB database (create if the database does not exist)
const database$: Observable<IDBDatabase> = connectIndexedDb('example_database');
// Create an Object Store or get an existing one with autoIncrement.
const store$: Observable<IDBObjectStore> = database$.pipe(
  getObjectStore('example_store', { autoIncrement: true })
);

function saveToDatabase<T>(value: T): void {
  store$.pipe(addItem(value)).subscribe();
}

saveToDatabase('example_value');
saveToDatabase(1337);
```

Please note, that if you try to use the `addItem` operator on a non-autoIncrement Object Store, you will get an error: `"DOMException: Failed to execute 'add' on 'IDBObjectStore': The object store uses out-of-line keys and has no key generator and the key parameter was not provided."`

#### deleteItem()

You can use the `deleteItem()` operator to delete a value from the store.

```typescript
import { connectIndexedDb, getObjectStore, setItem, deleteItem } from '@this-dot/rxidb';
import { Observable } from 'rxjs';

// Connect to an IndexedDB database (create if the database does not exist)
const database$: Observable<IDBDatabase> = connectIndexedDb('example_database');
// Create an Object Store or get an existing one.
const store$: Observable<IDBObjectStore> = database$.pipe(getObjectStore('example_store'));

store$.pipe(setItem('example_key', 'example_value')).subscribe();

store$.pipe(deleteItem('example_key')).subscribe();
```

### Reading data from the database

#### read()

If you want to read a specific key's value from the database, you can use the `read()` operator.

```typescript
import { connectIndexedDb, getObjectStore, read, setItem, deleteItem } from '@this-dot/rxidb';
import { Observable } from 'rxjs';

// Connect to an IndexedDB database (create if the database does not exist)
const database$: Observable<IDBDatabase> = connectIndexedDb('example_database');
// Create an Object Store or get an existing one.
const store$: Observable<IDBObjectStore> = database$.pipe(getObjectStore('example_store'));

// set up the read stream.
const exampleKey$: Observable<string> = store$.pipe(read('example_key'));

exampleKey$.subscribe(console.log); // emits every time the value changes.

// exampleKey$ will emit 4 times;
store$
  .pipe(
    setItem('example_key', 'example_value_1'),
    setItem('example_key', 'example_value_2'),
    setItem('example_key', 'example_value_3'),
    deleteItem('example_key')
  )
  .subscribe();
```

#### keys() & values()

You can get all the keys of a database using the `keys()` operator. This will return an `Observable` of all the keys in the store. With the `values()` operator you can get all the values of the store.

```typescript
import { connectIndexedDb, getObjectStore, addItem, keys, values } from '@this-dot/rxidb';
import { Observable } from 'rxjs';

// Connect to an IndexedDB database (create if the database does not exist)
const database$: Observable<IDBDatabase> = connectIndexedDb('example_database');
// Create an Object Store or get an existing one with autoIncrement.
const store$: Observable<IDBObjectStore> = database$.pipe(
  getObjectStore('example_store', { autoIncrement: true })
);

// returns an Observable of all the keys in the store.
const keys$: Observable<IDBValidKey[]> = store$.pipe(keys());

// returns an Observable of all the values in the store.
const values$: Observable<any[]> = store$.pipe(values());

keys$.subscribe(console.log); // emits every time the keys in the database change. (add a new key, remove a key, etc)
values$.subscribe(console.log); // emits every time the values change. Either by adding a new value, or by updating or deleting an existing value.
```

#### entries()

You can retrieve an array of key-value pairs using the `entries()` operator.

```typescript
import { connectIndexedDb, getObjectStore, addItem, keys, values } from '@this-dot/rxidb';
import { Observable } from 'rxjs';

// Connect to an IndexedDB database (create if the database does not exist)
const database$: Observable<IDBDatabase> = connectIndexedDb('example_database');
// Create an Object Store or get an existing one with autoIncrement.
const store$: Observable<IDBObjectStore> = database$.pipe(
  getObjectStore('example_store', { autoIncrement: true })
);

// returns an Observable of all the key-value pairs in the store.
const entries$: Observable<{ key: IDBValidKey; value: any }[]> = store$.pipe(entries());

entries$.subscribe(console.log); // emits every time the keys or the values in the database change. (add a new key, remove a key, update a value, etc)
```

### Deleting databases

The `deleteDatabase()` operator can be used to delete a database. This will complete the existing observables subscribed to database events.

```typescript
import { connectIndexedDb, getObjectStore, read, setItem, deleteItem } from '@this-dot/rxidb';
import { Observable } from 'rxjs';

// Connect to an IndexedDB database (create if the database does not exist)
const database$: Observable<IDBDatabase> = connectIndexedDb('example_database');
// Create an Object Store or get an existing one.
const store$: Observable<IDBObjectStore> = database$.pipe(getObjectStore('example_store'));

// set up the read stream.
const exampleKey$: Observable<string> = store$.pipe(read('example_key'));

exampleKey$.subscribe(console.log); // emits every time the value changes, and emits a `null` value when the database is deleted.

// exampleKey$ will emit 4 times;
store$
  .pipe(
    setItem('example_key', 'example_value_1'),
    setItem('example_key', 'example_value_2'),
    setItem('example_key', 'example_value_3'),
    deleteItem('example_key')
  )
  .subscribe();

// deletes the database
deleteDatabase('example_database').subscribe();
```

It throws an error if the database does not exist.

Please keep in mind, that if you would like to use the observables after you delete the database, you need to reinitalise them again.
