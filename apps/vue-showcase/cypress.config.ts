import { defineConfig } from 'cypress';
import { nxE2EPreset } from '@nrwl/cypress/plugins/cypress-preset';

const cypressJsonConfig = {
  fileServerFolder: '.',
  fixturesFolder: './cypress/fixtures',
  video: true,
  videosFolder: '../../dist/cypress/apps/vue-showcase/videos',
  screenshotsFolder: '../../dist/cypress/apps/vue-showcase/screenshots',
  chromeWebSecurity: false,
  specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
  supportFile: 'cypress/support/e2e.ts',
};
export default defineConfig({
  e2e: {
    ...nxE2EPreset(__dirname),
    ...cypressJsonConfig,
    /**
     * TODO(@nrwl/cypress): In Cypress v12,the testIsolation option is turned on by default.
     * This can cause tests to start breaking where not indended.
     * You should consider enabling this once you verify tests do not depend on each other
     * More Info: https://docs.cypress.io/guides/references/migration-guide#Test-Isolation
     **/
    testIsolation: false,
  },
});
