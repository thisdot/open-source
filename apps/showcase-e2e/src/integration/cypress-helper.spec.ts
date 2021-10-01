describe(`Cypress helpers`, () => {
  beforeEach(() => {
    cy.visit('/cypress-helpers');
    cy.clearIndexedDb('CYPRESS_IDB_HELPER');
  });

  it(`displays "null" if the indexedDb is not set up`, () => {
    cy.get(`[data-test-id="readKeyControl"]`).should('be.visible').type('testKey');
    cy.get(`[data-test-id="database value"]`).should('be.visible').and('contain', 'null');
  });

  it(`displays "{ rickrolled: "never gonna give you up" } when indexedDb is populated at the "testKey" property`, () => {
    cy.openIndexedDb('CYPRESS_IDB_HELPER')
      .getObjectStore('keyvaluepairs')
      .then((store: IDBObjectStore) => {
        store.add({ rickrolled: 'never gonna give you up' }, 'testKey');
        store.add({ rickrolled: 'never gonna let you down' }, 'rick');
      });

    cy.get(`[data-test-id="readKeyControl"]`).should('be.visible').type('testKey');
    cy.get(`[data-test-id="database value"]`)
      .should('be.visible')
      .and('contain', '{\n' + '  "rickrolled": "never gonna give you up"\n' + '}');

    cy.get(`[data-test-id="readKeyControl"]`).should('be.visible').clear().type('rick');
    cy.get(`[data-test-id="database value"]`)
      .should('be.visible')
      .and('contain', '{\n' + '  "rickrolled": "never gonna let you down"\n' + '}');
  });
});
