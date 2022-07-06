export function isIDBObjectStore(subject: unknown): subject is IDBObjectStore {
  return typeof subject === 'object' && subject?.constructor?.name === 'IDBObjectStore';
}

export function isIDBDatabase(subject: unknown): subject is IDBDatabase {
  return typeof subject === 'object' && subject?.constructor?.name === 'IDBDatabase';
}

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
