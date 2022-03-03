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
import {
  BehaviorSubject,
  combineLatest,
  concatMap,
  EMPTY,
  from,
  map,
  Observable,
  switchMap,
  takeLast,
  tap,
} from 'rxjs';
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
  private isLoadingSubject = new BehaviorSubject(false);
  private readonly keys$ = this.store$.pipe(keys());
  private readonly entries$ = this.store$.pipe(entries());
  readonly isLoading$ = this.isLoadingSubject.asObservable();
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
    this.isLoadingSubject.next(true);
    this.keys$
      .pipe(
        take(1),
        switchMap(([first]) => {
          console.log('first', first);
          if (!first) {
            this.isLoadingSubject.next(false);
            return EMPTY;
          }
          return this.store$.pipe(
            deleteItem(first),
            tap(() => this.isLoadingSubject.next(false))
          );
        })
      )
      .subscribe();
  }

  deleteLast() {
    this.isLoadingSubject.next(true);
    this.keys$
      .pipe(
        take(1),
        switchMap((keys) => {
          const last = keys[keys.length - 1];
          if (!last) {
            this.isLoadingSubject.next(false);
            return EMPTY;
          }
          return this.store$.pipe(
            deleteItem(last),
            tap(() => this.isLoadingSubject.next(false))
          );
        })
      )
      .subscribe();
  }

  clearAll() {
    this.isLoadingSubject.next(true);
    this.keyValues$
      .pipe(
        take(1),
        concatMap((keyValues: { key: IDBValidKey; value: unknown }[]) =>
          from(keyValues).pipe(
            concatMap((keyValues) => this.openSnackbar(keyValues.key, keyValues.value)),
            concatMap((key) => this.store$.pipe(deleteItem(key), take(1))),
            takeLast(1)
          )
        ),
        tap(() => this.isLoadingSubject.next(false))
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
