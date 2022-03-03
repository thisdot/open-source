import { Component, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  addItem,
  connectIndexedDb,
  deleteItem,
  entries,
  getObjectStore,
  keys,
} from '@this-dot/rxidb';
import { combineLatest, concatMap, EMPTY, from, map, Observable, switchMap, tap } from 'rxjs';
import { take } from 'rxjs/operators';

const DATABASE_NAME = 'AUTO_INCREMENT';

@Component({
  selector: 'this-dot-rxidb-auto-increment',
  templateUrl: './rxidb-auto-increment.component.html',
  styleUrls: ['./rxidb-auto-increment.component.scss'],
  providers: [
    {
      provide: 'STORE',
      useValue: connectIndexedDb(DATABASE_NAME).pipe(
        getObjectStore('store', { autoIncrement: true })
      ),
    },
  ],
})
export class RxidbAutoIncrementComponent {
  readonly keys$ = this.store$.pipe(keys());
  readonly entries$ = this.store$.pipe(entries());

  readonly keyValues$ = combineLatest([this.keys$, this.entries$]).pipe(
    map(([keys, values]) =>
      keys.map((key: IDBValidKey, index: number) => ({
        key,
        value: values[index],
      }))
    )
  );

  readonly inputControl = new FormControl('');

  constructor(
    private snackbar: MatSnackBar,
    @Inject('STORE') private store$: Observable<IDBObjectStore>
  ) {}

  append(evt: any) {
    evt.preventDefault();
    this.store$
      .pipe(
        addItem(this.inputControl.value),
        take(1),
        tap(() => this.inputControl.reset(''))
      )
      .subscribe();
  }

  deleteFirst() {
    this.keys$
      .pipe(
        take(1),
        switchMap(([first]) => {
          console.log('first', first);
          if (!first) {
            return EMPTY;
          }
          return this.store$.pipe(deleteItem(first));
        })
      )
      .subscribe();
  }

  deleteLast() {
    this.keys$
      .pipe(
        take(1),
        switchMap((keys) => {
          const last = keys[keys.length - 1];
          if (!last) {
            return EMPTY;
          }
          return this.store$.pipe(deleteItem(last));
        })
      )
      .subscribe();
  }

  clearAll() {
    this.keyValues$
      .pipe(
        take(1),
        concatMap((keyValues: { key: IDBValidKey; value: unknown }[]) =>
          from(keyValues).pipe(
            concatMap((keyValues) => this.openSnackbar(keyValues.key, keyValues.value)),
            concatMap((key) => this.store$.pipe(deleteItem(key), take(1)))
          )
        )
      )
      .subscribe();
  }

  private openSnackbar(key: IDBValidKey, value: unknown): Observable<IDBValidKey> {
    const snackbarRef = this.snackbar.open(`Cleared ${key} with value ${value}`, 'DISMISS', {
      duration: 1000,
    });
    return snackbarRef.afterDismissed().pipe(map(() => key));
  }
}
