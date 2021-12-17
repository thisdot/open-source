export function isIDBObjectStore(subject: unknown): subject is IDBObjectStore {
  return typeof subject === 'object' && subject?.constructor?.name === 'IDBObjectStore';
}

export function isIDBDatabase(subject: unknown): subject is IDBDatabase {
  return typeof subject === 'object' && subject?.constructor?.name === 'IDBDatabase';
}
