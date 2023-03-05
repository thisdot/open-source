import { isIDBDatabase, isIDBObjectStore } from './helpers';

const STORES = new Map<string, IDBObjectStore>();
/**
 * When we save a database with an alias, it saves the actual version that database was opened with.
 * This prevents the `createObjectStore` method to create more than one store on any given database.
 * That is why we set the database instance internally every time we create a database version update.
 * When we do a version update, we don't have the database alias, only the database name. These two
 * Map objects help resolve the proper database using an alias and internally a database name.
 */
const DATABASES = new Map<string, IDBDatabase>();
const DATABASE_ALIASES = new Map<string, string>();

export function setDatabaseInternal(databaseName: string, database: IDBDatabase): void {
  DATABASES.set(databaseName, database);
}

type IDBItemType = 'store' | 'database';

export function overrideAs(
  originalAs: Cypress.QueryFn<'as'>,
  alias: string,
  options?: Partial<Cypress.AsOptions>
) {
  const asArgs: [string, Partial<Cypress.AsOptions> | undefined] = [alias, options];
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const innerFn = originalAs.apply(this, asArgs);
  return (subject: unknown) => {
    if (isIDBObjectStore(subject)) {
      STORES.set(alias, subject);
      return subject;
    } else if (isIDBDatabase(subject)) {
      DATABASE_ALIASES.set(alias, subject.name);
      DATABASES.set(subject.name, subject);
      return subject;
    } else {
      return innerFn(subject);
    }
  };
}

export const getDatabase = getIDBItem('database');
export const getStore = getIDBItem('store');

function getIDBItem(type: 'store'): (alias: string) => Cypress.Chainable<IDBObjectStore>;
function getIDBItem(type: 'database'): (alias: string) => Cypress.Chainable<IDBDatabase>;
function getIDBItem(
  type: IDBItemType
): (alias: string) => Cypress.Chainable<IDBObjectStore> | Cypress.Chainable<IDBDatabase> {
  const map = type === 'store' ? STORES : DATABASE_ALIASES;
  return (alias: string) => {
    let error: Error | undefined;
    const log = Cypress.log({
      autoEnd: false,
      type: 'parent',
      name: 'get',
      message: alias,
      consoleProps: () => ({
        error: error || 'no',
      }),
    });

    const withoutAtSign = alias.substring(1);
    if (map.has(withoutAtSign)) {
      log.end();
      const result = map.get(withoutAtSign)!;
      if (typeof result === 'string') {
        return cy.wrap(DATABASES.get(result)!);
      }
      return cy.wrap(result);
    } else {
      error = new Error(`could not find ${type} with alias ${alias}`);
      log.error(error).end();
      throw error;
    }
  };
}
