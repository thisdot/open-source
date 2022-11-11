/* eslint-disable @typescript-eslint/ban-ts-comment */
import { getDatabase, getStore, overrideAs } from './alias-setup';
import { createObjectStore } from './create-object-store';
import { deleteDatabase } from './delete-database';
import { addItem, createItem, deleteItem, readItem, updateItem } from './object-store-CRUD';
import { entries, keys } from './object-store-metadata';
import { openIndexedDb } from './open-database';

function setupIDBHelpers(): void {
  Cypress.Commands.overwrite('as', overrideAs);
  // @ts-ignore
  Cypress.Commands.add(`clearIndexedDb`, deleteDatabase);
  // @ts-ignore
  Cypress.Commands.add(`openIndexedDb`, openIndexedDb);
  // @ts-ignore
  Cypress.Commands.add(`getIndexedDb`, getDatabase);
  // @ts-ignore
  Cypress.Commands.add(`createObjectStore`, { prevSubject: true }, createObjectStore);
  // @ts-ignore
  Cypress.Commands.add(`getStore`, getStore);
  // @ts-ignore
  Cypress.Commands.add(`createItem`, { prevSubject: true }, createItem);
  // @ts-ignore
  Cypress.Commands.add(`updateItem`, { prevSubject: true }, updateItem);
  // @ts-ignore
  Cypress.Commands.add(`deleteItem`, { prevSubject: true }, deleteItem);
  // @ts-ignore
  Cypress.Commands.add(`readItem`, { prevSubject: true }, readItem);
  // @ts-ignore
  Cypress.Commands.add(`addItem`, { prevSubject: true }, addItem);
  // @ts-ignore
  Cypress.Commands.add(`keys`, { prevSubject: true }, keys);
  // @ts-ignore
  Cypress.Commands.add(`entries`, { prevSubject: true }, entries);
}

setupIDBHelpers();
