describe(`@thisdot/route-config`, () => {
  it(`the documentation of the library is always visible`, () => {
    cy.visit('/route-tags');
    cy.url().should('contain', 'route-tags/first');
    cy.get(`[data-test-id="documentation section"]`).should('be.visible');

    cy.visit('/route-tags/second');
    cy.url().should('contain', 'route-tags/second');
    cy.get(`[data-test-id="documentation section"]`).should('be.visible');
  });

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

  it(`Displays elements, when the appropriate route-tag (show) is set in the route config`, () => {
    cy.visit('/route-tags');
    cy.url().should('contain', 'route-tags/first');
    cy.get('[data-test-id="the route does not have show tag"]').should('not.exist');
    cy.get('[data-test-id="the route has show tag"]')
      .should('be.visible')
      .and('contain', "This text is only visible, if there is a 'routeTag.SHOW' in the route data");
  });

  it(`Displays elements, when the appropriate route-tag (show) is set in the custom property in route config`, () => {
    cy.visit('/route-tags/second');
    cy.url().should('contain', 'route-tags/second');
    cy.get('[data-test-id="the route does not have show tag - custom"]').should('not.exist');
    cy.get('[data-test-id="the route has show tag - custom"]')
      .should('be.visible')
      .and(
        'contain',
        "This text is only visible, if there is a 'routeTag.SHOW' in the route data property"
      );
  });

  it(`Displays elements, when custom property is changed and the appropriate route-tag (show) is NOT set in the CHANGED custom property in route config 2`, () => {
    cy.visit('/route-tags/second');
    cy.url().should('contain', 'route-tags/second');
    cy.get('[data-test-id="the route does not have show tag - custom"]').should('not.exist');
    cy.get('[data-test-id="the route has show tag - custom"]')
      .should('be.visible')
      .and(
        'contain',
        "This text is only visible, if there is a 'routeTag.SHOW' in the route data property"
      );

    cy.get('[data-test-id="custom prop selector"]')
      .click()
      .get('mat-option')
      .contains('routeTags')
      .click();

    cy.get('[data-test-id="the route does not have show tag - custom"]')
      .should('be.visible')
      .and('contain', "There is no show tag in this route's config property");
    cy.get('[data-test-id="the route has show tag - custom"]').should('not.exist');
  });

  it(`Does not render elements, when the appropriate route-tag (show) is NOT set in the route config`, () => {
    cy.visit('/route-tags/second');
    cy.url().should('contain', 'route-tags/second');
    cy.get('[data-test-id="the route does not have show tag"]')
      .should('be.visible')
      .and('contain', "There is no show tag in this route's config");
    cy.get('[data-test-id="the route has show tag"]').should('not.exist');
  });

  it(`Displays elements, when the appropriate route-tag (show) is NOT set in the custom property in route config`, () => {
    cy.visit('/route-tags/first');
    cy.url().should('contain', 'route-tags/first');
    cy.get('[data-test-id="the route does not have show tag - custom"]')
      .should('be.visible')
      .and('contain', "There is no show tag in this route's config property");
    cy.get('[data-test-id="the route has show tag - custom"]').should('not.exist');
  });

  it(`Displays different elements, when custom property is changed and the appropriate route-tag (show) is set in the CHANGED custom property in route config`, () => {
    cy.visit('/route-tags/first');
    cy.url().should('contain', 'route-tags/first');
    cy.get('[data-test-id="the route does not have show tag - custom"]')
      .should('be.visible')
      .and('contain', "There is no show tag in this route's config property");
    cy.get('[data-test-id="the route has show tag - custom"]').should('not.exist');

    cy.get('[data-test-id="custom prop selector"]')
      .click()
      .get('mat-option')
      .contains('routeTags')
      .click();

    cy.get('[data-test-id="the route does not have show tag - custom"]').should('not.exist');
    cy.get('[data-test-id="the route has show tag - custom"]')
      .should('be.visible')
      .and(
        'contain',
        "This text is only visible, if there is a 'routeTag.SHOW' in the route data property"
      );
  });
});
