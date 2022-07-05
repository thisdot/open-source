/**
 * Checks to ensure value is an `IDBObjectStore` instance
 *
 * @param subject value to test
 * @returns boolean
 */
export function isIDBObjectStore(subject: unknown): subject is IDBObjectStore {
  return typeof subject === 'object' && subject?.constructor?.name === 'IDBObjectStore';
}

/**
 * Checks to ensure value is an `isIDBDatabase` instance
 *
 * @param subject value to test
 * @returns boolean
 */
export function isIDBDatabase(subject: unknown): subject is IDBDatabase {
  return typeof subject === 'object' && subject?.constructor?.name === 'IDBDatabase';
}

/**
 * Gets the array of arguments for the certain indexedDb operations (get, put, delete, add);
 * The 'put' operation gets two arguments, and if there is no key provided the 'add' method receives the value
 * @param key - IDBValidKey or null. `null` if it is an add operation
 * @param value - the value needs to be stored
 */
export function getCommandArguments<T>(
  key: IDBValidKey | null,
  value: T | undefined
): [T, IDBValidKey] | [IDBValidKey] | [T] {
  return key ? getCommandArgumentsBasedOnValue(key, value) : [value as T];
}

function getCommandArgumentsBasedOnValue<T>(
  key: IDBValidKey,
  value: T | undefined
): [T, IDBValidKey] | [IDBValidKey] {
  return value ? [value, key] : [key];
}
