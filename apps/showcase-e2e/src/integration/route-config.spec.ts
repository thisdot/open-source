describe(`@thisdot/route-config`, () => {
  describe('documentation section', () => {
    it(`the documentation of the library is always visible`, () => {
      cy.visit('/route-tags');
      cy.url().should('contain', 'route-tags/first');
      cy.get(`[data-test-id="documentation section"]`).should('be.visible');

      cy.visit('/route-tags/second');
      cy.url().should('contain', 'route-tags/second');
      cy.get(`[data-test-id="documentation section"]`).should('be.visible');
    });
  });

  describe('title section', () => {
    it(`Displays the default title, when the title parameter is not set in the route config object`, () => {
      cy.visit('/route-tags');
      cy.url().should('contain', 'route-tags/first');
      cy.get('h1').should('be.visible').and('contain', 'Default Title');
    });

    it(`Displays the custom title, when the title parameter is set in the route config object`, () => {
      cy.visit('/route-tags/second');
      cy.url().should('contain', 'route-tags/second');
      cy.get('h1').should('be.visible').and('contain', 'Second Route Title');
    });
  });

  describe('tdRouteTag section', () => {
    it(`Displays elements, when the appropriate route-tag (show) is set in the route config`, () => {
      cy.visit('/route-tags');
      cy.url().should('contain', 'route-tags/first');
      cy.get('[data-test-id="route tag else section"]').should('not.exist');
      cy.get('[data-test-id="route tag section"]')
        .should('be.visible')
        .and(
          'contain',
          "This text is only visible, if there is a 'routeTag.SHOW' in the route data"
        );
    });

    it(`Does not render elements, when the appropriate route-tag (show) is NOT set in the route config`, () => {
      cy.visit('/route-tags/second');
      cy.url().should('contain', 'route-tags/second');
      cy.get('[data-test-id="route tag else section"]')
        .should('be.visible')
        .and('contain', "There is no show tag in this route's config");
      cy.get('[data-test-id="route tag section"]').should('not.exist');
    });
  });

  describe('tdRouteDataHas section', () => {
    it(`Displays custom route tag section, when "show" tag is set in the custom property in route config`, () => {
      cy.visit('/route-tags/second');
      cy.url().should('contain', 'route-tags/second');
      cy.get('[data-test-id="custom route tag else section"]').should('not.exist');
      cy.get('[data-test-id="custom route tag section"]')
        .should('be.visible')
        .and(
          'contain',
          "This text is only visible, if there is a 'routeTag.SHOW' in the route data property"
        );
    });

    it(`Displays custom route tag ELSE section, when "show" tag is set in NOT the custom property in route config`, () => {
      cy.visit('/route-tags/first');
      cy.url().should('contain', 'route-tags/first');
      cy.get('[data-test-id="custom route tag else section"]')
        .should('be.visible')
        .and('contain', "There is no show tag in this route's config property");
      cy.get('[data-test-id="custom route tag section"]').should('not.exist');
    });

    it(`Displays custom route tag ELSE section, when "show" tag is NOT set in the CHANGED custom property in route config`, () => {
      cy.visit('/route-tags/second');
      cy.url().should('contain', 'route-tags/second');

      cy.get('[data-test-id="custom prop selector"]')
        .click()
        .get('mat-option')
        .contains('routeTags')
        .click();

      cy.get('[data-test-id="custom route tag else section"]')
        .should('be.visible')
        .and('contain', "There is no show tag in this route's config property");
      cy.get('[data-test-id="custom route tag section"]').should('not.exist');
    });

    it(`Displays custom route tag section, when "show" tag is set in the CHANGED custom property in route config`, () => {
      cy.visit('/route-tags/first');
      cy.url().should('contain', 'route-tags/first');

      cy.get('[data-test-id="custom prop selector"]')
        .click()
        .get('mat-option')
        .contains('routeTags')
        .click();

      cy.get('[data-test-id="custom route tag else section"]').should('not.exist');
      cy.get('[data-test-id="custom route tag section"]')
        .should('be.visible')
        .and(
          'contain',
          "This text is only visible, if there is a 'routeTag.SHOW' in the route data property"
        );
    });
  });
});
