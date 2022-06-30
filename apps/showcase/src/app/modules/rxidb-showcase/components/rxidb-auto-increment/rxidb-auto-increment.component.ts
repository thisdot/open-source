import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  addItem,
  connectIndexedDb,
  deleteIndexedDb,
  deleteItem,
  entries,
  getObjectStore,
  keys,
} from '@this-dot/rxidb';
import {
  BehaviorSubject,
  concatMap,
  EMPTY,
  from,
  map,
  Observable,
  Subject,
  switchMap,
  takeLast,
  tap,
} from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';

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
export class RxidbAutoIncrementComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private isLoadingSubject = new BehaviorSubject(false);
  private readonly keys$ = this.store$.pipe(keys());
  readonly isLoading$ = this.isLoadingSubject.asObservable();
  readonly keyValues$ = this.store$.pipe(entries());

  readonly inputControl = new FormControl('', { nonNullable: true });

  constructor(
    private snackbar: MatSnackBar,
    @Inject('STORE') private store$: Observable<IDBObjectStore>
  ) {}

  ngOnInit() {
    this.isLoading$
      .pipe(
        tap((isLoading: boolean) => {
          if (isLoading) {
            this.inputControl.disable();
          } else {
            this.inputControl.enable();
          }
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();

    this.store$
      .pipe(
        takeUntil(this.destroy$),
        tap({
          complete: () => {
            this.inputControl.disable();
          },
        })
      )
      .subscribe();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  append(evt: SubmitEvent) {
    evt.preventDefault();
    this.store$
      .pipe(
        addItem(this.inputControl.value),
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

  deleteDatabase(): void {
    deleteIndexedDb(DATABASE_NAME).subscribe();
  }

  private openSnackbar(key: IDBValidKey, value: unknown): Observable<IDBValidKey> {
    const snackbarRef = this.snackbar.open(`Cleared ${key} with value ${value}`, 'DISMISS', {
      duration: 1000,
    });
    return snackbarRef.afterDismissed().pipe(map(() => key));
  }
}
