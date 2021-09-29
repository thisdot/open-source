import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { distinctUntilChanged, startWith, switchMap } from 'rxjs/operators';
import { IndexedDbHelperService } from '../../services/indexed-db-helper.service';

const DATABASE_NAME = 'CYPRESS_IDB_HELPER';

@Component({
  selector: 'this-dot-cypress-helpers-showcase',
  templateUrl: './cypress-helpers-showcase.component.html',
  styleUrls: ['./cypress-helpers-showcase.component.css'],
})
export class CypressHelpersShowcaseComponent implements OnInit {
  readonly readKeyControl = new FormControl('');

  readonly databaseValue$ = this.readKeyControl.valueChanges.pipe(
    distinctUntilChanged(),
    startWith(this.readKeyControl.value as string),
    switchMap((key: string) => this.indexedDbHelper.getCachedItem(DATABASE_NAME, key))
  );

  constructor(private indexedDbHelper: IndexedDbHelperService) {}

  ngOnInit(): void {
    this.indexedDbHelper.initStorage(DATABASE_NAME);
  }
}
