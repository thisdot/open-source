import { setDatabaseInternal } from './alias-setup';

/**
 * Create a version update database connection
 *
 * @remarks The `createVersionUpdateDatabaseConnection` calls Cypress.log and opens a connection to the provided `openDatabase`.
 *
 * @param openDatabase `IDBDatabase` instance
 *
 * @returns IDBDatabase
 */
export function createVersionUpdateDatabaseConnection(
  openDatabase: IDBDatabase
): Promise<IDBDatabase> {
  let error: Event | undefined;
  let databaseVersion: number;
  const databaseName = openDatabase.name;
  const log = Cypress.log({
    name: `upgrade`,
    type: 'parent',
    message: `IDBDatabase - ${databaseName}`,
    consoleProps: () => ({
      'old database version': openDatabase.version,
      'new database version': databaseVersion,
      'database name': databaseName,
      error: error || 'no',
    }),
    autoEnd: false,
  });
  return new Promise<IDBDatabase>((resolve, reject) => {
    openDatabase.close();
    const request: IDBOpenDBRequest = window.indexedDB.open(databaseName, openDatabase.version + 1);
    request.onerror = (e: Event) => {
      error = e;
      log.error(e as unknown as Error).end();
      reject(e);
    };
    request.onupgradeneeded = (e: Event) => {
      request.onerror = () => void 0;
      const db = (e.target as any).result as IDBDatabase;
      db.onversionchange = (e) => {
        console.warn('onversionchange', e);
      };
      databaseVersion = db.version;
      setDatabaseInternal(databaseName, db);
      log.end();
      resolve(db);
    };
  });
}
