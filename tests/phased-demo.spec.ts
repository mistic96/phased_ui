import { test, expect } from '@playwright/test';

test.describe('Phased Framework Demo', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for initial animations
    await page.waitForTimeout(1000);
  });

  test('page loads with header', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Phased');
    await expect(page.getByText('Intent-first interfaces')).toBeVisible();
    await page.screenshot({ path: 'test-results/screenshots/01-initial-load.png' });
  });

  test('status indicator shows all states', async ({ page }) => {
    const statuses = [
      { button: 'Ready', class: 'status-idle' },
      { button: 'Listening...', class: 'status-listening' },
      { button: 'Analyzing...', class: 'status-thinking' },
      { button: 'Processing', class: 'status-processing' },
      { button: 'Complete', class: 'status-success' },
      { button: 'Attention needed', class: 'status-warning' },
      { button: 'Error', class: 'status-error' },
    ];

    for (const [index, status] of statuses.entries()) {
      await page.getByRole('button', { name: status.button }).click();
      await page.waitForTimeout(500);

      const indicator = page.locator('.status-indicator').first();
      await expect(indicator).toHaveClass(new RegExp(status.class));

      await page.screenshot({
        path: `test-results/screenshots/02-status-${String(index + 1).padStart(2, '0')}-${status.class.replace('status-', '')}.png`
      });
    }
  });

  test('phase lifecycle visualization', async ({ page }) => {
    await expect(page.getByText('Phase Lifecycle')).toBeVisible();
    await page.screenshot({ path: 'test-results/screenshots/03-phase-lifecycle.png' });

    // Click through each phase
    const phases = ['dormant', 'warming', 'surfaced', 'focused', 'dissolving'];

    for (const phase of phases) {
      await page.getByRole('button', { name: new RegExp(phase, 'i') }).click();
      await page.waitForTimeout(300);
    }

    await page.screenshot({ path: 'test-results/screenshots/04-phase-selected.png' });
  });

  test('transition animations work', async ({ page }) => {
    await page.getByRole('button', { name: 'Surface In' }).click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: 'test-results/screenshots/05-animation-surface.png' });

    await page.getByRole('button', { name: 'Dissolve Out' }).click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: 'test-results/screenshots/06-animation-dissolve.png' });
  });

  test('interactive phase components', async ({ page }) => {
    await expect(page.getByText('Interactive Phase Components')).toBeVisible();
    await page.screenshot({ path: 'test-results/screenshots/07-phase-components.png' });

    // Find File Upload card and test phase transitions
    const card = page.locator('.glass-elevated').filter({ hasText: 'File Upload' });

    // Click Focus
    await card.getByRole('button', { name: 'Focus' }).click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: 'test-results/screenshots/08-card-focused.png' });

    // Click Blur
    await card.getByRole('button', { name: 'Blur' }).click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: 'test-results/screenshots/09-card-blurred.png' });

    // Click Dissolve
    await card.getByRole('button', { name: 'Dissolve' }).click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: 'test-results/screenshots/10-card-dissolving.png' });
  });

  test('forensic mode toggle', async ({ page }) => {
    await expect(page.getByText('Adaptive Mode')).toBeVisible();
    await page.screenshot({ path: 'test-results/screenshots/11-adaptive-mode.png' });

    await page.getByText('Adaptive Mode').click();
    await expect(page.getByText('Forensic Mode')).toBeVisible();
    await page.screenshot({ path: 'test-results/screenshots/12-forensic-mode.png' });
  });

  test('substrate hint visible', async ({ page }) => {
    await expect(page.getByText('12 more components available on demand')).toBeVisible();
    await page.screenshot({ path: 'test-results/screenshots/13-substrate-hint.png' });
  });

  test('full page screenshot in different states', async ({ page }) => {
    // Default state
    await page.screenshot({
      path: 'test-results/screenshots/14-full-page-default.png',
      fullPage: true
    });

    // Processing state
    await page.getByRole('button', { name: 'Processing' }).click();
    await page.waitForTimeout(500);
    await page.screenshot({
      path: 'test-results/screenshots/15-full-page-processing.png',
      fullPage: true
    });

    // Success state with forensic mode
    await page.getByRole('button', { name: 'Complete' }).click();
    await page.getByText('Adaptive Mode').click();
    await page.waitForTimeout(300);
    await page.screenshot({
      path: 'test-results/screenshots/16-full-page-forensic.png',
      fullPage: true
    });
  });
});
