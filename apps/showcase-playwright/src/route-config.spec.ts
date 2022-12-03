import { expect, test } from '@playwright/test';
import { selectors } from 'playwright';

import type { Page } from 'playwright';
import { Idbhelper } from './idbhelper';

test.describe('@this-dot/route-config', () => {
  let page: Page;
  let playwrightIdb: Idbhelper;

  test.beforeAll(async ({ browser }) => {
    selectors.setTestIdAttribute('data-test-id');
    page = await browser.newPage();
  });

  test.beforeEach(async () => {
    playwrightIdb = new Idbhelper(page);

    await page.goto('/');

    await playwrightIdb.init('PLAYWRIGHT_DATABASE');
    await playwrightIdb.createObjectStore('PLAYWRIGHT_STORE');
  });

  test.describe('documentation section', () => {
    test.only('the documentation of the library is always visible', async () => {
      await page.goto('/');

      await playwrightIdb
        .store('PLAYWRIGHT_STORE')
        .createItem(`${Math.floor(Math.random() * 1000)}`, 'test');

      await expect(page).toHaveURL('/route-tags/first');
      const isFirstPageDocumentationSectionVisible = await page
        .getByTestId('documentation section')
        .isVisible();

      expect(isFirstPageDocumentationSectionVisible).toBe(true);

      await page.goto('/route-tags/second');
      await expect(page).toHaveURL('/route-tags/second');
      const isSecondPageDocumentationSectionVisible = await page
        .getByTestId('documentation section')
        .isVisible();
      expect(isSecondPageDocumentationSectionVisible).toBe(true);
    });
  });

  test.describe.serial('title section', () => {
    test('Displays the default title, when the title parameter is not set in the route config object', async ({
      page,
    }) => {
      await page.goto('/route-tags');

      await expect(page).toHaveURL('/route-tags/first');
      const heading = await page.locator('h1');
      const isHeadingVisible = await heading.isVisible();
      const headingInnerText = await heading.innerText();
      await expect(isHeadingVisible).toBe(true);
      await expect(headingInnerText).toMatch('Default Title');
    });

    test('Displays the custom title, when the title parameter is set in the route config object', async ({
      page,
    }) => {
      await page.goto('/route-tags/second');

      await expect(page).toHaveURL('/route-tags/second');
      const heading = await page.locator('h1');
      const isHeadingVisible = await heading.isVisible();
      const headingInnerText = await heading.innerText();
      await expect(isHeadingVisible).toBe(true);
      await expect(headingInnerText).toMatch('Second Route Title');
    });
  });

  test.describe.serial('tdRouteTag section', () => {
    test('Displays elements, when the appropriate route-tag (show) is set in the route config', async ({
      page,
    }) => {
      await page.goto('/route-tags');

      await expect(page).toHaveURL('/route-tags/first');

      const routeTagElseSection = page.getByTestId('route tag else section');
      await expect(await routeTagElseSection.isVisible()).toBe(false);

      const routeTagSection = page.getByTestId('route tag section');
      await expect(await routeTagSection.isVisible()).toBe(true);
      await expect(await routeTagSection.innerText()).toMatch(
        `This text is only visible, if there is a 'routeTag.SHOW' in the route data`
      );
    });

    test(`Does not render elements, when the appropriate route-tag (show) is NOT set in the route config`, async ({
      page,
    }) => {
      await page.goto('/route-tags/second');

      await expect(page).toHaveURL('/route-tags/second');

      const routeTagElseSection = page.getByTestId('route tag else section');
      await expect(await routeTagElseSection.isVisible()).toBe(true);
      await expect(await routeTagElseSection.innerText()).toMatch(
        `There is no show tag in this route's config`
      );

      const routeTagSection = page.getByTestId('route tag section');
      await expect(await routeTagSection.isVisible()).toBe(false);
    });
  });
});
