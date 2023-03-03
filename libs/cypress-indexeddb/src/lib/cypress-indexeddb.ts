import { getDatabase, getStore, overrideAs } from './alias-setup';
import { createObjectStore } from './create-object-store';
import { deleteDatabase } from './delete-database';
import { addItem, createItem, deleteItem, readItem, updateItem } from './object-store-CRUD';
import { entries, keys } from './object-store-metadata';
import { openIndexedDb } from './open-database';

function setupIDBHelpers(): void {
  Cypress.Commands.overwriteQuery('as', overrideAs);
  Cypress.Commands.add(`clearIndexedDb`, deleteDatabase);
  Cypress.Commands.add(`openIndexedDb`, openIndexedDb);
  Cypress.Commands.add(`getIndexedDb`, getDatabase);
  Cypress.Commands.add(`createObjectStore`, { prevSubject: true }, createObjectStore);
  Cypress.Commands.add(`getStore`, getStore);
  Cypress.Commands.add(`createItem`, { prevSubject: true }, createItem);
  Cypress.Commands.add(`updateItem`, { prevSubject: true }, updateItem);
  Cypress.Commands.add(`deleteItem`, { prevSubject: true }, deleteItem);
  Cypress.Commands.add(`readItem`, { prevSubject: true }, readItem);
  Cypress.Commands.add(`addItem`, { prevSubject: true }, addItem);
  Cypress.Commands.add(`keys`, { prevSubject: true }, keys);
  Cypress.Commands.add(`entries`, { prevSubject: true }, entries);
}

setupIDBHelpers();
