import { AfterViewInit, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroupDirective, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  connectIndexedDb,
  createItem,
  deleteItem,
  getObjectStore,
  read,
  updateItem,
} from '@this-dot/rxidb';
import { isTruthy } from '@this-dot/utils';
import { merge, Observable, ReplaySubject, share, Subject, timer } from 'rxjs';
import { debounceTime, filter, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { IndexedDbHelperService } from '../../services/indexed-db-helper.service';

const DATABASE_NAME = 'FORM_CACHE';
const USER_FORM_KEY = 'user_form';

@Component({
  selector: 'this-dot-cypress-helpers-showcase',
  templateUrl: './cypress-helpers-showcase.component.html',
  styleUrls: ['./cypress-helpers-showcase.component.scss'],
  providers: [
    {
      provide: 'STORE',
      useValue: connectIndexedDb(DATABASE_NAME).pipe(getObjectStore('keyvaluepairs')),
    },
  ],
})
export class CypressHelpersShowcaseComponent implements AfterViewInit, OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  readonly formGroup = this.formBuilder.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    country: ['', Validators.required],
    city: ['', Validators.required],
    address: ['', Validators.required],
    addressOptional: [''],
  });
  savedToIDB$ = new Subject<void>();

  constructor(
    private formBuilder: FormBuilder,
    private snackbar: MatSnackBar,
    @Inject('STORE') private store$: Observable<IDBObjectStore>
  ) {}

  ngAfterViewInit() {
    this.store$
      .pipe(
        read<Record<string, string> | null>(USER_FORM_KEY),
        filter(isTruthy),
        tap((value) => this.formGroup.patchValue(value)),
        takeUntil(this.destroy$)
      )
      .subscribe();
    //   this.indexedDbHelper
    //     .getCachedItem<Record<string, string>>(DATABASE_NAME, USER_FORM_KEY)
    //     .pipe(
    //       filter(isTruthy),
    //       tap((value) => this.formGroup.patchValue(value)),
    //       takeUntil(this.destroy$)
    //     )
    //     .subscribe();
  }

  ngOnInit(): void {
    this.formGroup.valueChanges
      .pipe(
        debounceTime(1000),
        switchMap((value) => this.store$.pipe(updateItem(USER_FORM_KEY, value))),
        tap(() => this.savedToIDB$.next()),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  submit(directive: FormGroupDirective): void {
    // The following merge is for avoiding race conditions.
    merge(this.savedToIDB$.asObservable(), timer(1000))
      .pipe(
        take(1),
        switchMap(() => this.store$.pipe(deleteItem(USER_FORM_KEY))),
        // switchMap(() => this.indexedDbHelper.invalidateCacheEntry(DATABASE_NAME, USER_FORM_KEY)),
        tap(() => {
          directive.resetForm();
          this.openSnackbar();
        })
      )
      .subscribe();
  }

  private openSnackbar(): void {
    this.snackbar.open('Form successfully submitted', 'DISMISS', {
      duration: 6000,
    });
  }
}
