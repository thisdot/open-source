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
      resolve(db);
    };
  });
}

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
