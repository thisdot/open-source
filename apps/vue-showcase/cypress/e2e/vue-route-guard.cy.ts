describe(`@this-dot/vue-route-guard`, () => {
  describe(`No authentication set`, () => {
    before(() => {
      cy.window().then((win) => {
        win.sessionStorage.removeItem('VUEROUTEGUARD-TOKEN');
      });
      cy.clearLocalStorage('VUEROUTEGUARD-TOKEN');
      cy.clearCookie('VUEROUTEGUARD-TOKEN');
    });

    it(`redirect to login`, () => {
      cy.visit('/route-guard');

      cy.url().should('contain', 'route-guard/login');
    });

    it(`does not redirect to home view when home navigation is clicked`, () => {
      cy.visit('/route-guard');

      cy.get('#homeRoute').should('be.visible').click();
      cy.url().should('not.eq', Cypress.config().baseUrl + '/route-guard');
    });

    it(`about navigation is not displayed`, () => {
      cy.visit('/route-guard');

      cy.get('#aboutRoute').should('not.exist');
    });
  });

  describe(`Authentication set`, () => {
    before(() => {
      cy.visit('/route-guard');

      cy.get('#loginButton').should('be.visible').click();
    });

    it(`redirects to home`, () => {
      console.log(Cypress.config().baseUrl);

      cy.url().should('eq', Cypress.config().baseUrl + '/route-guard');
    });

    it(`authentication data is set in session storage`, () => {
      cy.window().its('sessionStorage').invoke('getItem', 'VUEROUTEGUARD-TOKEN').should('exist');
    });

    it(`about navigation is visible`, () => {
      cy.get('#aboutRoute').should('be.visible');
    });

    it(`redirects to 'no-permission' page when about navigation is clicked`, () => {
      cy.get('#aboutRoute').click();

      cy.url().should('contain', '/route-guard/no-permission');
    });

    it(`redirects to login page when logout is clicked`, () => {
      cy.visit('/route-guard');

      cy.get('#logoutButton').should('be.visible').click();

      cy.url().should('contain', '/route-guard/login');
    });
  });
});
