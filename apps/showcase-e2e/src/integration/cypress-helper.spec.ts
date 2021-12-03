describe(`Cypress helpers`, () => {
  beforeEach(() => {
    cy.clearIndexedDb('CYPRESS_IDB_HELPER');
    cy.openIndexedDb('CYPRESS_IDB_HELPER', 5).createObjectStore('keyvaluepairs').as('store');
    cy.visit('/cypress-helpers');
  });

  it(`displays "null" if the indexedDb is not set up`, () => {
    cy.get(`[data-test-id="readKeyControl"]`).should('be.visible').type('testKey');
    cy.get(`[data-test-id="database value"]`).should('be.visible').and('contain', 'null');
  });

  it(`displays "{ rickrolled: "never gonna give you up" } when indexedDb is populated at the "testKey" property`, () => {
    cy.getStore('@store')
      .storeItem('testKey', { rickrolled: 'never gonna give you up' })
      .storeItem('rick', { rickrolled: 'never gonna let you down' });

    cy.get(`[data-test-id="readKeyControl"]`).should('be.visible').clear().type('testKey');
    cy.get(`[data-test-id="database value"]`)
      .should('be.visible')
      .and('contain', '{\n' + '  "rickrolled": "never gonna give you up"\n' + '}');

    cy.get(`[data-test-id="readKeyControl"]`).should('be.visible').clear().type('rick');
    cy.get(`[data-test-id="database value"]`)
      .should('be.visible')
      .and('contain', '{\n' + '  "rickrolled": "never gonna let you down"\n' + '}');

    cy.getStore('@store')
      .storeItem('rick', { rickrolled: 'never gonna run around and desert you' })
      .deleteItem('testKey')
      .readItem<any>('rick')
      .should('have.property', 'rickrolled', 'never gonna run around and desert you');

    cy.get(`[data-test-id="readKeyControl"]`).should('be.visible').clear().type('testKey');
    cy.get(`[data-test-id="database value"]`).should('be.visible').and('contain', 'null');
  });
});
