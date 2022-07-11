/**
 * Create a database connection
 *
 * @remarks The `createDatabaseConnection` opens a connection with the provided `databaseName` and `version`.
 *
 * @param databaseName Database name
 * @param versionConfiguredByUser Database version
 *
 * @returns Promise<IDBDatabase>
 * @throws {Error} If the connections fails to open.
 */
import { noop } from 'rxjs';

export function createDatabaseConnection(
  databaseName: string,
  versionConfiguredByUser?: number
): Promise<IDBDatabase> {
  const request: IDBOpenDBRequest =
    versionConfiguredByUser != null
      ? window.indexedDB.open(databaseName, versionConfiguredByUser)
      : window.indexedDB.open(databaseName);
  return new Promise<IDBDatabase>((resolve, reject) => {
    request.onerror = (e: Event) => {
      reject(e);
    };
    request.onsuccess = (e: Event) => {
      request.onerror = () => void 0;
      const db = (e.target as any).result as IDBDatabase;
      db.onversionchange = noop;
      resolve(db);
    };
  });
}
/**
 * Open a database connection
 *
 * @remarks The `openIndexedDb` opens a connection with the provided `databaseName` and `version`.
 * @remarks the parameters is for developers who will touch this code in the future. It signals that this version number was passed down by the user and not incremented by our library.
 *
 * @param databaseName Database name
 * @param version Database version
 *
 * @returns Promise<IDBDatabase>
 * @throws {Error} If the connections fails to open.
 */
export function openIndexedDb(databaseName: string, version?: number): Promise<IDBDatabase> {
  let error: Error | undefined;
  let databaseVersion: number;
  const log = Cypress.log({
    name: `open`,
    type: 'parent',
    message: `IDBDatabase - ${databaseName}`,
    consoleProps: () => ({
      'database version': databaseVersion,
      'database name': databaseName,
      error: error || 'no',
    }),
    autoEnd: false,
  });
  return createDatabaseConnection(databaseName, version)
    .then((db) => {
      databaseVersion = db.version;
      log.end();
      return db;
    })
    .catch((e) => {
      error = e;
      log.error(e).end();
      throw e;
    });
}
