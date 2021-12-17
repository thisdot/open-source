export function deleteDatabase(databaseName: string): Promise<void> {
  let error: Event | undefined;
  const log = Cypress.log({
    name: `delete`,
    type: 'parent',
    message: `IDBDatabase - ${databaseName}`,
    consoleProps: () => ({
      'database name': databaseName,
      error: error || 'no',
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
    deleteDb.onsuccess = () => {
      log.end();
      resolve();
    };
    deleteDb.onerror = errorHandler;
    deleteDb.onblocked = errorHandler;
    deleteDb.onupgradeneeded = errorHandler;
  });
}
