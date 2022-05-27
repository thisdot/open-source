import { RunHelpers, TestScheduler } from 'rxjs/testing';
import { KEY_CHANGED, VALUE_CHANGED } from '../rxidb-internal.events';
import {
  filterKeyEventsForStore,
  filterValueEventsForStore,
  filterValueEventsForStoreKey,
} from './rxidb-events.helpers';

const MOCK_OBJECT_STORE = {
  name: 'store',
  transaction: {
    db: {
      name: 'database',
    },
  },
};

describe(`event helpers`, () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });
  });

  it(`'filterKeyEventsForStore' emits every time the KEY_CHANGED subject is triggered`, () => {
    testScheduler.run((helpers: RunHelpers) => {
      const { cold, expectObservable } = helpers;
      const source$ = cold('a', { a: MOCK_OBJECT_STORE as IDBObjectStore });

      const expected = 'a-a-a-a';

      /**
       * We expect the following events:
       * - 'a' - key 'a' changes in the database
       * - 'b' - key 'b' changes in the database
       * - 'c' - key 'c' changes in the database
       */
      cold('--a-b-c|').subscribe((v: string) =>
        KEY_CHANGED.next({ store: 'store', db: 'database', key: v })
      );

      expectObservable(source$.pipe(filterKeyEventsForStore())).toBe(expected, {
        a: MOCK_OBJECT_STORE as IDBObjectStore,
      });
    });
  });

  it(`'filterKeyEventsForStore' emits does not emit when the VALUE_CHANGED subject emits`, () => {
    testScheduler.run((helpers: RunHelpers) => {
      const { cold, expectObservable } = helpers;
      const source$ = cold('a', { a: MOCK_OBJECT_STORE as IDBObjectStore });

      const expected = 'a------';

      /**
       * We expect the following events:
       * - 'a' - the value of key 'a' changes in the database
       * - 'b' - the value of key 'b' changes in the database
       * - 'c' - the value of key 'c' changes in the database
       */
      cold('--a-b-c').subscribe((v: string) =>
        VALUE_CHANGED.next({ store: 'store', db: 'database', key: v })
      );

      expectObservable(source$.pipe(filterKeyEventsForStore())).toBe(expected, {
        a: MOCK_OBJECT_STORE as IDBObjectStore,
      });
    });
  });

  it(`'filterValueEventsForStore' does not emit when the KEY_CHANGED subject is triggered`, () => {
    testScheduler.run((helpers: RunHelpers) => {
      const { cold, expectObservable } = helpers;
      const source$ = cold('a', { a: MOCK_OBJECT_STORE as IDBObjectStore });

      const expected = 'a------';

      /**
       * We expect the following events:
       * - 'a' - key 'a' changes in the database
       * - 'b' - key 'b' changes in the database
       * - 'c' - key 'c' changes in the database
       */
      cold('--a-b-c|').subscribe((v: string) =>
        KEY_CHANGED.next({ store: 'store', db: 'database', key: v })
      );

      expectObservable(source$.pipe(filterValueEventsForStore())).toBe(expected, {
        a: MOCK_OBJECT_STORE as IDBObjectStore,
      });
    });
  });

  it(`'filterValueEventsForStore' emits every time when the VALUE_CHANGED subject emits`, () => {
    testScheduler.run((helpers: RunHelpers) => {
      const { cold, expectObservable } = helpers;
      const source$ = cold('a', { a: MOCK_OBJECT_STORE as IDBObjectStore });

      const expected = 'a-a-a-a';

      /**
       * We expect the following events:
       * - 'a' - the value of key 'a' changes in the database
       * - 'b' - the value of key 'b' changes in the database
       * - 'c' - the value of key 'c' changes in the database
       */
      cold('--a-b-c').subscribe((v: string) =>
        VALUE_CHANGED.next({ store: 'store', db: 'database', key: v })
      );

      expectObservable(source$.pipe(filterValueEventsForStore())).toBe(expected, {
        a: MOCK_OBJECT_STORE as IDBObjectStore,
      });
    });
  });

  it(`'filterValueEventsForStoreKey' does not emit when the KEY_CHANGED subject is triggered`, () => {
    testScheduler.run((helpers: RunHelpers) => {
      const { cold, expectObservable } = helpers;
      const source$ = cold('a', { a: MOCK_OBJECT_STORE as IDBObjectStore });

      const expected = 'a------';

      /**
       * We expect the following events:
       * - 'a' - key 'a' changes in the database
       * - 'b' - key 'b' changes in the database
       * - 'c' - key 'c' changes in the database
       */
      cold('--a-b-c|').subscribe((v: string) =>
        KEY_CHANGED.next({ store: 'store', db: 'database', key: v })
      );

      expectObservable(source$.pipe(filterValueEventsForStoreKey('b'))).toBe(expected, {
        a: MOCK_OBJECT_STORE as IDBObjectStore,
      });
    });
  });

  it(`'filterValueEventsForStoreKey' emits every time when the VALUE_CHANGED subject emits an event with the provided key`, () => {
    testScheduler.run((helpers: RunHelpers) => {
      const { cold, expectObservable } = helpers;
      const source$ = cold('a', { a: MOCK_OBJECT_STORE as IDBObjectStore });

      const expected = 'a---a--';

      /**
       * We expect the following events:
       * - 'a' - the value of key 'a' changes in the database
       * - 'b' - the value of key 'b' changes in the database
       * - 'c' - the value of key 'c' changes in the database
       */
      cold('--a-b-c').subscribe((v: string) =>
        VALUE_CHANGED.next({ store: 'store', db: 'database', key: v })
      );

      expectObservable(source$.pipe(filterValueEventsForStoreKey('b'))).toBe(expected, {
        a: MOCK_OBJECT_STORE as IDBObjectStore,
      });
    });
  });
});
