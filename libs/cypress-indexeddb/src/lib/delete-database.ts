export function deleteDatabase(databaseName: string): Promise<void> {
  let error: Event | undefined;
  let warning: Event | undefined;
  const log = Cypress.log({
    name: `delete`,
    type: 'parent',
    message: `IDBDatabase - ${databaseName}`,
    consoleProps: () => ({
      'database name': databaseName,
      error: error || 'no',
      warning: warning || 'no',
    }),
    autoEnd: false,
  });
  return new Promise<void>((resolve, reject) => {
    const deleteDb: IDBOpenDBRequest = window.indexedDB.deleteDatabase(databaseName);
    const errorHandler = (e: Event) => {
      error = e;
      log.error(e as unknown as Error).end();
      reject();
    };
    const warningHandler = (e: Event) => {
      warning = e;
    };
    deleteDb.onsuccess = () => {
      log.end();
      resolve();
    };
    deleteDb.onerror = errorHandler;
    deleteDb.onblocked = warningHandler;
    deleteDb.onupgradeneeded = errorHandler;
  });
}
