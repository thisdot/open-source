const GUARD_TOKEN_NAME = 'VUEROUTEGUARD-TOKEN';

describe(`@this-dot/vue-route-guard`, () => {
  describe(`No authentication set`, () => {
    before(() => {
      cy.window().then((win) => {
        win.sessionStorage.removeItem(GUARD_TOKEN_NAME);
      });
      cy.clearLocalStorage(GUARD_TOKEN_NAME);
      cy.clearCookie(GUARD_TOKEN_NAME);
    });

    it(`redirects to login when user visits a guarded page`, () => {
      cy.visit('/route-guard');

      cy.url().should('contain', 'route-guard/login');
    });

    it(`does not redirect when user visits unguarded page`, () => {
      cy.visit('/route-guard/no-permission');

      cy.url().should('contain', '/route-guard/no-permission');
    });

    it(`does not redirect to home view when home navigation is clicked`, () => {
      cy.visit('/route-guard');

      cy.get(`[data-test-id="home navigation button"]`).should('be.visible').click();
      cy.url().should('not.eq', Cypress.config().baseUrl + '/route-guard');
    });

    it(`about navigation is not displayed`, () => {
      cy.visit('/route-guard');

      cy.get(`[data-test-id="about navigation button"]`).should('not.exist');
    });
  });

  describe(`Authentication set`, () => {
    before(() => {
      cy.window().then((win) => {
        win.sessionStorage.setItem(GUARD_TOKEN_NAME, 'sample_token');
      });
    });

    it(`does not redirect when user visits guarded page`, () => {
      cy.visit('/route-guard');
      cy.url().should('eq', Cypress.config().baseUrl + '/route-guard');
    });

    it(`authentication data is set in session storage`, () => {
      cy.window().its('sessionStorage').invoke('getItem', GUARD_TOKEN_NAME).should('exist');
    });

    it(`about navigation is visible`, () => {
      cy.get(`[data-test-id="about navigation button"]`).should('be.visible');
    });

    it(`redirects to 'no-permission' page when about navigation is clicked`, () => {
      cy.get(`[data-test-id="about navigation button"]`).click();

      cy.url().should('contain', '/route-guard/no-permission');
    });

    it(`redirects to login page when logout is clicked`, () => {
      cy.visit('/route-guard');

      cy.get(`[data-test-id="logout button"]`).should('be.visible').click();

      cy.url().should('contain', '/route-guard/login');
    });
  });
});
