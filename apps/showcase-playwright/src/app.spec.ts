import { expect, test } from '@playwright/test';

import type { Page } from 'playwright';

test.describe.serial('App', () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
  });

  test('should do test one', async () => {
    await page.goto('http://localhost:4200/');

    await expect(page).toHaveURL('/');

    await new Promise((resolve) => {
      page.on('close', resolve);
    });

    page.close();
  });
});
