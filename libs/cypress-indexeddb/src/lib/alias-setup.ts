import { isIDBDatabase, isIDBObjectStore } from './helpers';

const STORES = new Map<string, IDBObjectStore>();
const DATABASES = new Map<string, IDBDatabase>();

type IDBItemType = 'store' | 'database';

export function overrideAs(
  originalAs: (subject: unknown, alias: string) => any,
  subject: unknown,
  alias: string
) {
  if (isIDBObjectStore(subject)) {
    STORES.set(alias, subject);
    return subject;
  } else if (isIDBDatabase(subject)) {
    DATABASES.set(alias, subject);
    return subject;
  } else {
    return originalAs(subject, alias);
  }
}
export const getDatabase = getIDBItem('database');
export const getStore = getIDBItem('store');

function getIDBItem(type: IDBItemType): (alias: string) => Promise<IDBDatabase | IDBObjectStore> {
  const map = type === 'store' ? STORES : DATABASES;
  return (alias: string) => {
    let error: any;
    const log = Cypress.log({
      autoEnd: false,
      type: 'parent',
      name: 'get',
      message: alias,
      consoleProps: () => ({
        error: error || 'no',
      }),
    });

    const withoutAtSign = alias.substr(1);
    if (map.has(withoutAtSign)) {
      log.end();
      return Promise.resolve(map.get(withoutAtSign) as IDBDatabase | IDBObjectStore);
    } else {
      error = new Error(`could not find ${type} with alias ${alias}`);
      log.error(error).end();
      throw error;
    }
  };
}
