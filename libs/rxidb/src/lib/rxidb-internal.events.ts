import { ReplaySubject, Subject } from 'rxjs';

export type DbChangeMetadata = { db: string; store: string; key?: IDBValidKey };

/**
 * Emits an event whenever a key changes. The key change can be triggered by a creation or deletion event.
 *
 * @eventProperty { db: string; store: string; key?: IDBValidKey }
 */
export const KEY_CHANGED = new ReplaySubject<DbChangeMetadata>(1);
/**
 * Emits an event whenever a value changes. The value change can be triggered by a creation, update, deletion event.
 *
 * @eventProperty { db: string; store: string; key?: IDBValidKey }
 */
export const VALUE_CHANGED = new ReplaySubject<DbChangeMetadata>(1);

/**
 * Emits a new value whenever a database gets deleted. The emitted value is the database's name.
 */
export const DATABASE_DELETE_EVENTS = new Subject<string>();
