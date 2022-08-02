describe(`@this-dot/rxidb`, () => {
  describe(`auto-increment database`, () => {
    beforeEach(() => {
      cy.clearIndexedDb('AUTO_INCREMENT');
      cy.visit('/rxidb/auto-increment');

      cy.get(`[data-test-id="add-to-queue-input"]`)
        .should('be.visible')
        .and('not.be.disabled')
        .type(`test{enter}`)
        .clear()
        .type(`test2{enter}`)
        .clear()
        .type(`1337{enter}`);
    });

    it(`can add new values and persist them`, () => {
      cy.get(`[data-test-id="row_1"]`).should('be.visible').should('contain', 'test');
      cy.get(`[data-test-id="row_2"]`).should('be.visible').should('contain', 'test2');
      cy.get(`[data-test-id="row_3"]`).should('be.visible').should('contain', '1337');

      cy.log('reload to test persistence').reload();

      cy.get(`[data-test-id="row_1"]`).should('be.visible').should('contain', 'test');
      cy.get(`[data-test-id="row_2"]`).should('be.visible').should('contain', 'test2');
      cy.get(`[data-test-id="row_3"]`).should('be.visible').should('contain', '1337');

      cy.get(`[data-test-id="add-to-queue-input"]`)
        .should('be.visible')
        .and('not.be.disabled')
        .type(`something{enter}`)
        .type(`anything{enter}`)
        .type(`whatever{enter}`)
        .type(`seriously{enter}`);

      cy.get(`[data-test-id="row_4"]`).should('be.visible').should('contain', 'something');
      cy.get(`[data-test-id="row_5"]`).should('be.visible').should('contain', 'anything');
      cy.get(`[data-test-id="row_6"]`).should('be.visible').should('contain', 'whatever');

      cy.get(`[data-test-id="row_7"]`).should('be.visible').should('contain', 'seriously');
    });

    it(`can delete items by keys`, () => {
      cy.get(`[data-test-id="delete-first-button"]`).should('be.visible').click();
      cy.get(`[data-test-id="delete-last-button"]`).should('be.visible').click();

      cy.get(`[data-test-id="row_1"]`).should('not.exist');
      cy.get(`[data-test-id="row_2"]`).should('be.visible').should('contain', 'test');
      cy.get(`[data-test-id="row_3"]`).should('not.exist');
    });

    it(`can delete all entries`, () => {
      cy.get(`[data-test-id="clear-all-button"]`).should('be.visible').click();

      cy.get(`[data-test-id="clear-all-button"]`).should('be.disabled');
      cy.get(`[data-test-id="delete-first-button"]`).should('be.disabled');
      cy.get(`[data-test-id="delete-last-button"]`).should('be.disabled');
      cy.get(`[data-test-id="add-to-queue-input"]`).should('be.disabled');

      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.log('Wait for all snackbar items to disappear').wait(5000);

      cy.get(`[data-test-id="row_1"]`).should('not.exist');
      cy.get(`[data-test-id="row_2"]`).should('not.exist');
      cy.get(`[data-test-id="row_3"]`).should('not.exist');
    });

    it(`can delete entire databases`, () => {
      cy.get(`[data-test-id="delete-database-button"]`).should('be.visible').click();

      cy.get(`[data-test-id="clear-all-button"]`).should('be.disabled');
      cy.get(`[data-test-id="delete-first-button"]`).should('be.disabled');
      cy.get(`[data-test-id="delete-last-button"]`).should('be.disabled');
      cy.get(`[data-test-id="add-to-queue-input"]`).should('be.disabled');
    });
  });
});
