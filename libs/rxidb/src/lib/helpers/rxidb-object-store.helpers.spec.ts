import { tap } from 'rxjs';
import { RunHelpers, TestScheduler } from 'rxjs/testing';
import { filterIfStoreDoesNotExist } from './rxidb-object-store.helpers';

describe(`filterIfStoreDoesNotExist`, () => {
  let testScheduler: TestScheduler;

  const MOCK_DATABASE: any = {
    objectStoreNames: {
      contains: jest.fn(),
    },
    close: jest.fn(),
  };

  const MOCK_STORE: any = {
    name: 'store',
  };

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it(`allows the stream to continue if the store exists in the database`, () => {
    MOCK_DATABASE.objectStoreNames.contains.mockReturnValue(true);

    testScheduler.run((helpers: RunHelpers) => {
      const { cold, expectObservable } = helpers;

      const source$ = cold('a', { a: MOCK_DATABASE as IDBDatabase });

      const expected = 'a';

      expectObservable(source$.pipe(filterIfStoreDoesNotExist(MOCK_STORE))).toBe(expected, {
        a: MOCK_DATABASE,
      });
    });
  });

  it(`prevents the stream to continue if the store does not exists in the database and closes the database connection`, () => {
    MOCK_DATABASE.objectStoreNames.contains.mockReturnValue(false);

    testScheduler.run((helpers: RunHelpers) => {
      const { cold, expectObservable } = helpers;

      const source$ = cold('a', { a: MOCK_DATABASE as IDBDatabase });

      const expected = '-';

      expectObservable(
        source$.pipe(
          filterIfStoreDoesNotExist(MOCK_STORE),
          tap(() => {
            expect(MOCK_DATABASE.close).toHaveBeenCalledTimes(1);
          })
        )
      ).toBe(expected, { a: MOCK_DATABASE });
    });
  });
});
