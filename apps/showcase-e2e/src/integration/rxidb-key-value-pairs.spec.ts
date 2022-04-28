describe(`@this-dot/rxidb`, () => {
  describe(`key-value pair based databases`, () => {
    beforeEach(() => {
      cy.clearIndexedDb('FORM_CACHE');
      cy.visit('/rxidb');
    });

    it(`entering data into the form saves it to the indexedDb`, () => {
      cy.get('#firstName').should('be.visible').type('Hans');
      cy.get('#lastName').should('be.visible').type('Gruber');
      cy.get('#country').should('be.visible').type('Germany');
      cy.get('#city').should('be.visible').type('Berlin');

      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.log('Waiting for the debounceTime to start a db write').wait(1100);
      cy.log(`Reload page to check persistence`).reload();

      cy.get('#firstName').should('be.visible').and('have.value', 'Hans');
      cy.get('#lastName').should('be.visible').and('have.value', 'Gruber');
      cy.get('#country').should('be.visible').and('have.value', 'Germany');
      cy.get('#city').should('be.visible').and('have.value', 'Berlin');
    });

    it(`submitting the form clears the indexedDb`, () => {
      cy.get('#firstName').should('be.visible').type('Hans');
      cy.get('#lastName').should('be.visible').type('Gruber');
      cy.get('#country').should('be.visible').type('Germany');
      cy.get('#city').should('be.visible').type('Berlin');
      cy.get('#address').type('23rd Street 12');
      cy.get(`[data-test-id="submit button"]`).should('be.visible').and('not.be.disabled').click();

      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.log('Waiting for the save event and DB write to occur').wait(1100);
      cy.log(`Reload page to check persistence`).reload();

      cy.get('#firstName').should('be.visible').and('have.value', '');
      cy.get('#lastName').should('be.visible').and('have.value', '');
      cy.get('#country').should('be.visible').and('have.value', '');
      cy.get('#city').should('be.visible').and('have.value', '');
      cy.get('#address').should('be.visible').and('have.value', '');
    });
  });
});
