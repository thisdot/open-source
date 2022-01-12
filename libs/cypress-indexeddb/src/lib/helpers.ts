export function isIDBObjectStore(subject: unknown): subject is IDBObjectStore {
  return typeof subject === 'object' && subject?.constructor?.name === 'IDBObjectStore';
}

export function isIDBDatabase(subject: unknown): subject is IDBDatabase {
  return typeof subject === 'object' && subject?.constructor?.name === 'IDBDatabase';
}

/**
 * Gets the array of arguments for the certain indexedDb operations (get, put, delete, add);
 * The 'put' operation gets two arguments, and if there is no key provided the 'add' method receives the value
 * @param key - string or null. Null if it is an add operation
 * @param value - the value needs to be stored
 */
export function getCommandArguments<T>(
  key: string | null,
  value: T | undefined
): [T, string] | [string] | [T] {
  return key ? getCommandArgumentsBasedOnValue(key, value) : [value as T];
}

function getCommandArgumentsBasedOnValue<T>(
  key: string,
  value: T | undefined
): [T, string] | [string] {
  return value ? [value, key] : [key];
}
