import { tap } from 'rxjs';
import { RunHelpers, TestScheduler } from 'rxjs/testing';
import { performObjectStoreOperation } from './rxidb-operations.helpers';

class MockOperationRequest<T> {
  constructor(private handlerToCall: 'onerror' | 'onsuccess', private result: T | null = null) {}

  set onerror(handler: (error: any) => void) {
    if (this.handlerToCall === 'onerror') {
      handler({});
    }
  }

  set onsuccess(handler: (result: any) => void) {
    if (this.handlerToCall === 'onsuccess') {
      handler({ result: this.result });
    }
  }
}

describe(`performObjectStoreOperation`, () => {
  let testScheduler: TestScheduler;

  const MOCK_STORE: any = {
    getAllKeys: jest.fn(),
    getAll: jest.fn(),
    get: jest.fn(),
    delete: jest.fn(),
    put: jest.fn(),
    add: jest.fn(),
  };

  const MOCK_DATABASE: any = {
    close: jest.fn(),
    transaction: (storeName: string, mode: 'readwrite') => ({
      objectStore: (storeName: string) => MOCK_STORE,
    }),
  };

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe(`'getAllKeys' operation`, () => {
    it(`returns an array of IDBValidKeys when the transaction is successful, and closes the database connection`, () => {
      MOCK_STORE.getAllKeys.mockReturnValue(
        new MockOperationRequest<IDBValidKey[]>('onsuccess', [1, 2, 3])
      );

      testScheduler.run((helpers: RunHelpers) => {
        const { cold, expectObservable } = helpers;

        const source$ = cold('a---', { a: MOCK_DATABASE as IDBDatabase });

        const expected = 'b---';

        expectObservable(
          source$.pipe(
            performObjectStoreOperation('store', 'getAllKeys'),
            tap(() => {
              expect(MOCK_DATABASE.close).toHaveBeenCalledTimes(1);
            })
          )
        ).toBe(expected, { b: [1, 2, 3] });
      });
    });

    it(`does not emit anything when transaction is erroneous and closes the database connection`, () => {
      MOCK_STORE.getAllKeys.mockReturnValue(new MockOperationRequest('onerror'));

      testScheduler.run((helpers: RunHelpers) => {
        const { cold, expectObservable } = helpers;

        const source$ = cold('a---', { a: MOCK_DATABASE as IDBDatabase });

        const expected = '----';

        expectObservable(
          source$.pipe(
            performObjectStoreOperation('store', 'getAllKeys'),
            tap(() => {
              expect(MOCK_DATABASE.close).toHaveBeenCalledTimes(1);
            })
          )
        ).toBe(expected);
      });
    });
  });

  describe(`'getAll' operation`, () => {
    it(`returns an array of IDBValidKeys when the transaction is successful, and closes the database connection`, () => {
      MOCK_STORE.getAll.mockReturnValue(
        new MockOperationRequest<string[]>('onsuccess', ['1', '2', '3'])
      );

      testScheduler.run((helpers: RunHelpers) => {
        const { cold, expectObservable } = helpers;

        const source$ = cold('a---', { a: MOCK_DATABASE as IDBDatabase });

        const expected = 'b---';

        expectObservable(
          source$.pipe(
            performObjectStoreOperation<string[]>('store', 'getAll'),
            tap(() => {
              expect(MOCK_DATABASE.close).toHaveBeenCalledTimes(1);
            })
          )
        ).toBe(expected, { b: ['1', '2', '3'] });
      });
    });

    it(`does not emit anything when transaction is erroneous and closes the database connection`, () => {
      MOCK_STORE.getAll.mockReturnValue(new MockOperationRequest('onerror'));

      testScheduler.run((helpers: RunHelpers) => {
        const { cold, expectObservable } = helpers;

        const source$ = cold('a---', { a: MOCK_DATABASE as IDBDatabase });

        const expected = '----';

        expectObservable(
          source$.pipe(
            performObjectStoreOperation<string[]>('store', 'getAll'),
            tap(() => {
              expect(MOCK_DATABASE.close).toHaveBeenCalledTimes(1);
            })
          )
        ).toBe(expected);
      });
    });
  });

  describe(`'get' operation`, () => {
    it(`returns the value of the stored key when the transaction is successful, and closes the database connection`, () => {
      MOCK_STORE.get.mockReturnValue(new MockOperationRequest<string>('onsuccess', 'test'));

      testScheduler.run((helpers: RunHelpers) => {
        const { cold, expectObservable } = helpers;

        const source$ = cold('a---', { a: MOCK_DATABASE as IDBDatabase });

        const expected = 'b---';

        expectObservable(
          source$.pipe(
            performObjectStoreOperation<string>('store', 'get', 'key'),
            tap(() => {
              expect(MOCK_DATABASE.close).toHaveBeenCalledTimes(1);
            })
          )
        ).toBe(expected, { b: 'test' });
      });
    });

    it(`does not emit anything when transaction is erroneous and closes the database connection`, () => {
      MOCK_STORE.get.mockReturnValue(new MockOperationRequest('onerror'));

      testScheduler.run((helpers: RunHelpers) => {
        const { cold, expectObservable } = helpers;

        const source$ = cold('a---', { a: MOCK_DATABASE as IDBDatabase });

        const expected = '----';

        expectObservable(
          source$.pipe(
            performObjectStoreOperation<string>('store', 'get', 'key'),
            tap(() => {
              expect(MOCK_DATABASE.close).toHaveBeenCalledTimes(1);
            })
          )
        ).toBe(expected);
      });
    });
  });

  describe(`'delete' operation`, () => {
    it(`deletes the provided key, closes the database connection and emits the IDBObjectStore`, () => {
      MOCK_STORE.delete.mockReturnValue(new MockOperationRequest('onsuccess'));

      testScheduler.run((helpers: RunHelpers) => {
        const { cold, expectObservable } = helpers;

        const source$ = cold('a---', { a: MOCK_DATABASE as IDBDatabase });

        const expected = 'b---';

        expectObservable(
          source$.pipe(
            performObjectStoreOperation('store', 'delete', 'key'),
            tap(() => {
              expect(MOCK_DATABASE.close).toHaveBeenCalledTimes(1);
            })
          )
        ).toBe(expected, { b: MOCK_STORE });
      });
    });

    it(`does not emit anything when transaction is erroneous and closes the database connection`, () => {
      MOCK_STORE.delete.mockReturnValue(new MockOperationRequest('onerror'));

      testScheduler.run((helpers: RunHelpers) => {
        const { cold, expectObservable } = helpers;

        const source$ = cold('a---', { a: MOCK_DATABASE as IDBDatabase });

        const expected = '----';

        expectObservable(
          source$.pipe(
            performObjectStoreOperation('store', 'delete', 'key'),
            tap(() => {
              expect(MOCK_DATABASE.close).toHaveBeenCalledTimes(1);
            })
          )
        ).toBe(expected);
      });
    });
  });

  describe(`'put' operation`, () => {
    it(`sets or updates the value for the provided key, closes the database connection and emits the IDBObjectStore`, () => {
      MOCK_STORE.put.mockReturnValue(new MockOperationRequest('onsuccess'));

      testScheduler.run((helpers: RunHelpers) => {
        const { cold, expectObservable } = helpers;

        const source$ = cold('a---', { a: MOCK_DATABASE as IDBDatabase });

        const expected = 'b---';

        expectObservable(
          source$.pipe(
            performObjectStoreOperation('store', 'put', 'key', 'value'),
            tap(() => {
              expect(MOCK_DATABASE.close).toHaveBeenCalledTimes(1);
            })
          )
        ).toBe(expected, { b: MOCK_STORE });
      });
    });

    it(`does not emit anything when transaction is erroneous and closes the database connection`, () => {
      MOCK_STORE.put.mockReturnValue(new MockOperationRequest('onerror'));

      testScheduler.run((helpers: RunHelpers) => {
        const { cold, expectObservable } = helpers;

        const source$ = cold('a---', { a: MOCK_DATABASE as IDBDatabase });

        const expected = '----';

        expectObservable(
          source$.pipe(
            performObjectStoreOperation('store', 'put', 'key', 'value'),
            tap(() => {
              expect(MOCK_DATABASE.close).toHaveBeenCalledTimes(1);
            })
          )
        ).toBe(expected);
      });
    });
  });

  describe(`'add' operation`, () => {
    it(`sets or updates the value for the provided key, closes the database connection and emits the IDBObjectStore`, () => {
      MOCK_STORE.add.mockReturnValue(new MockOperationRequest('onsuccess'));

      testScheduler.run((helpers: RunHelpers) => {
        const { cold, expectObservable } = helpers;

        const source$ = cold('a---', { a: MOCK_DATABASE as IDBDatabase });

        const expected = 'b---';

        expectObservable(
          source$.pipe(
            performObjectStoreOperation('store', 'add', null, 'value'),
            tap(() => {
              expect(MOCK_DATABASE.close).toHaveBeenCalledTimes(1);
            })
          )
        ).toBe(expected, { b: MOCK_STORE });
      });
    });

    it(`does not emit anything when transaction is erroneous and closes the database connection`, () => {
      MOCK_STORE.add.mockReturnValue(new MockOperationRequest('onerror'));

      testScheduler.run((helpers: RunHelpers) => {
        const { cold, expectObservable } = helpers;

        const source$ = cold('a---', { a: MOCK_DATABASE as IDBDatabase });

        const expected = '----';

        expectObservable(
          source$.pipe(
            performObjectStoreOperation('store', 'add', null, 'value'),
            tap(() => {
              expect(MOCK_DATABASE.close).toHaveBeenCalledTimes(1);
            })
          )
        ).toBe(expected);
      });
    });
  });
});
