import { ReplaySubject, Subject } from 'rxjs';

export type DbChangeMetadata = { db: string; store: string; key?: IDBValidKey };

export const KEY_CHANGED = new ReplaySubject<DbChangeMetadata>(1);
export const VALUE_CHANGED = new ReplaySubject<DbChangeMetadata>(1);
export const DATABASE_DELETE_EVENTS = new Subject<string>();
