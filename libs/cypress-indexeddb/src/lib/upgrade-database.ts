export function createVersionUpdateDatabaseConnection(
  openDatabase: IDBDatabase
): Promise<IDBDatabase> {
  let newVersion: number;
  let error: any;
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
      const db = (e.target as any).result as IDBDatabase;
      newVersion = db.version;
      log.end();
      resolve(db);
    };
  });
}
