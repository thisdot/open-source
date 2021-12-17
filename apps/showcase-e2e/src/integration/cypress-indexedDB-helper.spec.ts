describe(`@this-dot/cypress-indexeddb`, () => {
  beforeEach(() => {
    cy.clearIndexedDb('FORM_CACHE');
    cy.openIndexedDb('FORM_CACHE')
      .as('formCacheDB')
      .createObjectStore('keyvaluepairs')
      .as('objectStore');
  });

  it(`entering data into the form saves it to the indexedDb`, () => {
    cy.visit('/cypress-helpers');

    cy.get('#firstName').should('be.visible').type('Hans');
    cy.get('#lastName').should('be.visible').type('Gruber');
    cy.get('#country').should('be.visible').type('Germany');
    cy.get('#city').should('be.visible').type('Berlin');

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.log('Waiting for the debounceTime to start a db write').wait(1100);

    cy.getStore('@objectStore').readItem('user_form').should('deep.equal', {
      firstName: 'Hans',
      lastName: 'Gruber',
      country: 'Germany',
      city: 'Berlin',
      address: '',
      addressOptional: '',
    });
  });

  it(`when the indexedDb is deleted manually and then the page reloaded, the form does not populate`, () => {
    cy.visit('/cypress-helpers');

    cy.get('#firstName').should('be.visible').type('Hans');
    cy.get('#lastName').should('be.visible').type('Gruber');
    cy.get('#country').should('be.visible').type('Germany');
    cy.get('#city').should('be.visible').type('Berlin');

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.log('Waiting for the debounceTime to start a db write').wait(1100);

    cy.log('user manually clears the IndexedDb')
      .getStore('@objectStore')
      .deleteItem('user_form')
      .reload();

    cy.get('#firstName').should('be.visible').and('have.value', '');
    cy.get('#lastName').should('be.visible').and('have.value', '');
    cy.get('#country').should('be.visible').and('have.value', '');
    cy.get('#city').should('be.visible').and('have.value', '');
  });

  it(`when there is relevant data in the indexedDb, the form gets populated when the page opens`, () => {
    cy.getStore('@objectStore').createItem('user_form', {
      firstName: 'John',
      lastName: 'McClane',
      country: 'USA',
      city: 'New York',
    });

    cy.visit('/cypress-helpers');

    cy.get('#firstName').should('be.visible').and('have.value', 'John');
    cy.get('#lastName').should('be.visible').and('have.value', 'McClane');
    cy.get('#country').should('be.visible').and('have.value', 'USA');
    cy.get('#city').should('be.visible').and('have.value', 'New York');
  });

  it(`submitting the form clears the indexedDb`, () => {
    cy.getStore('@objectStore').createItem('user_form', {
      firstName: 'John',
      lastName: 'McClane',
      country: 'USA',
      city: 'New York',
    });

    cy.visit('/cypress-helpers');

    cy.get('#address').type('23rd Street 12');
    cy.get(`[data-test-id="submit button"]`).should('be.visible').and('not.be.disabled').click();

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.log('Waiting for the save event and DB write to occur').wait(1100);

    cy.getStore('@objectStore').readItem('user_form').should('be.undefined');
  });
});
