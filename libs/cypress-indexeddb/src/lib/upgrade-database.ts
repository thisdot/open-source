import { setDatabaseInternal } from './alias-setup';

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
    console.warn('openDb', openDatabase);
    const request: IDBOpenDBRequest = window.indexedDB.open(databaseName, openDatabase.version + 1);
    console.warn('update db request', request);
    request.onerror = (e: Event) => {
      console.warn('error');
      error = e;
      log.error(e as unknown as Error).end();
      reject(e);
    };
    request.onupgradeneeded = (e: Event) => {
      request.onerror = () => void 0;
      const db = (e.target as any).result as IDBDatabase;
      databaseVersion = db.version;
      setDatabaseInternal(databaseName, db);
      log.end();
      resolve(db);
    };
  });
}
