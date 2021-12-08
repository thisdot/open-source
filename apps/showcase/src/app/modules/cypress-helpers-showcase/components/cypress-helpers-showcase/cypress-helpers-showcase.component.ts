import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormGroupDirective,
  Validators,
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { merge, of, Subject, timer } from 'rxjs';
import { debounceTime, filter, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { IndexedDbHelperService } from '../../services/indexed-db-helper.service';

const DATABASE_NAME = 'FORM_CACHE';
const USER_FORM_KEY = 'user_form';

@Component({
  selector: 'this-dot-cypress-helpers-showcase',
  templateUrl: './cypress-helpers-showcase.component.html',
  styleUrls: ['./cypress-helpers-showcase.component.scss'],
})
export class CypressHelpersShowcaseComponent implements AfterViewInit, OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  readonly formGroup = new FormGroup({
    firstName: new FormControl('', Validators.required),
    lastName: new FormControl('', Validators.required),
    country: new FormControl('', Validators.required),
    city: new FormControl('', Validators.required),
    address: new FormControl('', Validators.required),
    addressOptional: new FormControl(''),
  });
  savedToIDB$ = new Subject<void>();

  constructor(
    private formBuilder: FormBuilder,
    private indexedDbHelper: IndexedDbHelperService,
    private snackbar: MatSnackBar
  ) {
    this.indexedDbHelper.initStorage(DATABASE_NAME);
  }

  ngAfterViewInit() {
    this.indexedDbHelper
      .getCachedItem<{ [key: string]: string }>(DATABASE_NAME, USER_FORM_KEY)
      .pipe(
        filter((v): v is { [key: string]: string } => v != null),
        tap((value) => this.formGroup.patchValue(value)),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  ngOnInit(): void {
    this.formGroup.valueChanges
      .pipe(
        debounceTime(1000),
        switchMap((value) => this.indexedDbHelper.cacheItem(DATABASE_NAME, USER_FORM_KEY, value)),
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
    merge(this.savedToIDB$.asObservable(), timer(1000))
      .pipe(
        take(1),
        switchMap(() => this.indexedDbHelper.invalidateCacheEntry(DATABASE_NAME, USER_FORM_KEY)),
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
