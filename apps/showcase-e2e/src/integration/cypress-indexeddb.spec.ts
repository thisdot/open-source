describe(`@this-dot/cypress-indexeddb`, () => {
  describe(`key-value pair based databases`, () => {
    beforeEach(() => {
      cy.clearIndexedDb('FORM_CACHE');
      cy.openIndexedDb('FORM_CACHE').as('formCacheDB');
      cy.getIndexedDb('@formCacheDB').createObjectStore('user_form_store').as('objectStore');
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
        .keys()
        .should('have.length', 0);
      cy.reload();

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

  describe(`auto-increment database`, () => {
    beforeEach(() => {
      cy.clearIndexedDb('AUTO_INCREMENT');
      cy.openIndexedDb('AUTO_INCREMENT').as('autoIncrementDb');
      cy.getIndexedDb('@autoIncrementDb')
        .createObjectStore('store', { autoIncrement: true })
        .as('test_add_item');

      cy.getStore('@test_add_item').addItem('test').addItem('test2').addItem(`1337`);

      cy.getStore('@test_add_item').keys().should('have.length', 3).and('deep.equal', [1, 2, 3]);

      cy.getStore('@test_add_item')
        .entries()
        .should('have.length', 3)
        .and('deep.equal', ['test', 'test2', `1337`]);

      cy.visit('/cypress-helpers/auto-increment');
    });

    it(`can retrieve pre-existing keys and values`, () => {
      cy.get(`[data-test-id="row_1"]`).should('be.visible').should('contain', 'test');
      cy.get(`[data-test-id="row_2"]`).should('be.visible').should('contain', 'test2');
      cy.get(`[data-test-id="row_3"]`).should('be.visible').should('contain', '1337');
    });

    it(`can add new values`, () => {
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

      cy.getStore('@test_add_item')
        .entries()
        .should('have.length', 7)
        .and('deep.equal', [
          'test',
          'test2',
          `1337`,
          'something',
          'anything',
          'whatever',
          'seriously',
        ]);

      cy.get(`[data-test-id="row_4"]`).should('be.visible').should('contain', 'something');
      cy.get(`[data-test-id="row_5"]`).should('be.visible').should('contain', 'anything');
      cy.get(`[data-test-id="row_6"]`).should('be.visible').should('contain', 'whatever');

      cy.get(`[data-test-id="row_7"]`).should('be.visible').should('contain', 'seriously');
    });

    it(`can delete items by keys`, () => {
      cy.get(`[data-test-id="delete-first-button"]`).should('be.visible').click();
      cy.get(`[data-test-id="delete-last-button"]`).should('be.visible').click();

      cy.getStore('@test_add_item').entries().should('have.length', 1).and('deep.equal', ['test2']);

      cy.get(`[data-test-id="row_1"]`).should('not.exist');
      cy.get(`[data-test-id="row_2"]`).should('be.visible').should('contain', 'test2');
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

      cy.getStore('@test_add_item').entries().should('have.length', 0);

      cy.get(`[data-test-id="row_1"]`).should('not.exist');
      cy.get(`[data-test-id="row_2"]`).should('not.exist');
      cy.get(`[data-test-id="row_3"]`).should('not.exist');
    });
  });
});
