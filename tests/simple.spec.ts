import { test, expect } from '@playwright/test';

test.setTimeout(120000); // 2 minute timeout

test('capture screenshots', async ({ page }) => {
  // Navigate to the page
  console.log('Navigating to page...');
  await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  console.log('Page loaded!');

  // Wait for content to render
  await page.waitForTimeout(3000);
  console.log('Taking screenshot...');

  // Take a viewport screenshot (not full page)
  await page.screenshot({
    path: 'test-results/screenshots/01-viewport.png',
    timeout: 60000
  });
  console.log('Screenshot 1 captured!');

  // Try to find and screenshot specific elements
  const header = page.locator('h1');
  if (await header.count() > 0) {
    await header.screenshot({ path: 'test-results/screenshots/02-header.png' });
    console.log('Header screenshot captured!');
  }

  console.log('Done!');
});
