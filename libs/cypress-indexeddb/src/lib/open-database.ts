/**
 * Create a database connection
 *
 * @remarks The `createDatabaseConnection` opens a connection with the provided `databaseName` and `versionConfiguredByUser`.
 *
 * @param databaseName Database name
 * @param versionConfiguredByUser Database version
 *
 * @returns IDBDatabase
 * @throws {Error} If the connections fails to open.
 */
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
      db.onversionchange = (e) => {
        console.warn('onversionchange', e);
      };
      resolve(db);
    };
  });
}
/**
 * Open a database connection
 *
 * @remarks The `openIndexedDb` calls Cypress.log and opens a connection with the provided `databaseName` and `version`.
 *
 * @param databaseName Database name
 * @param version Database version
 *
 * @returns IDBDatabase
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
