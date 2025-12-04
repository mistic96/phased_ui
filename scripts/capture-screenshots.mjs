import puppeteer from 'puppeteer-core';
import { mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const screenshotsDir = join(__dirname, '..', 'test-results', 'screenshots');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function captureScreenshots() {
  // Ensure screenshots directory exists
  await mkdir(screenshotsDir, { recursive: true });

  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    executablePath: process.env.HOME + '/.cache/ms-playwright/chromium-1194/chrome-linux/chrome',
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-software-rasterizer',
      '--single-process',
    ],
  });

  console.log('Browser launched!');
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  console.log('Navigating to http://localhost:5173...');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0', timeout: 30000 });
  console.log('Page loaded!');

  // Wait for animations to settle
  await sleep(2000);

  // Capture initial full page
  console.log('Capturing full page screenshot...');
  await page.screenshot({
    path: join(screenshotsDir, '01-full-page.png'),
    fullPage: true,
  });
  console.log('Screenshot saved: 01-full-page.png');

  // Click through status indicators
  const statuses = [
    { text: 'Ready', key: 'idle' },
    { text: 'Listening...', key: 'listening' },
    { text: 'Analyzing...', key: 'thinking' },
    { text: 'Processing', key: 'processing' },
    { text: 'Complete', key: 'success' },
    { text: 'Attention needed', key: 'warning' },
    { text: 'Error', key: 'error' },
  ];

  for (let i = 0; i < statuses.length; i++) {
    const { text, key } = statuses[i];
    try {
      console.log(`Clicking ${text}...`);
      const buttons = await page.$$('button');
      for (const button of buttons) {
        const buttonText = await page.evaluate(el => el.textContent, button);
        if (buttonText && buttonText.includes(text)) {
          await button.click();
          break;
        }
      }
      await sleep(600);
      await page.screenshot({
        path: join(screenshotsDir, `02-status-${String(i + 1).padStart(2, '0')}-${key}.png`),
      });
      console.log(`Screenshot saved for ${text}`);
    } catch (e) {
      console.log(`Could not click ${text}: ${e.message}`);
    }
  }

  // Toggle forensic mode
  try {
    console.log('Toggling forensic mode...');
    const buttons = await page.$$('button');
    for (const button of buttons) {
      const buttonText = await page.evaluate(el => el.textContent, button);
      if (buttonText && buttonText.includes('Adaptive Mode')) {
        await button.click();
        break;
      }
    }
    await sleep(500);
    await page.screenshot({
      path: join(screenshotsDir, '03-forensic-mode.png'),
    });
    console.log('Forensic mode screenshot saved');
  } catch (e) {
    console.log(`Could not toggle forensic mode: ${e.message}`);
  }

  // Click on phase demo cards - Focus button
  try {
    console.log('Testing phase transitions...');
    const buttons = await page.$$('button');
    for (const button of buttons) {
      const buttonText = await page.evaluate(el => el.textContent, button);
      if (buttonText && buttonText.trim() === 'Focus') {
        await button.click();
        await sleep(500);
        await page.screenshot({
          path: join(screenshotsDir, '04-card-focused.png'),
        });
        console.log('Focused state screenshot saved');
        break;
      }
    }
  } catch (e) {
    console.log(`Could not test phase transitions: ${e.message}`);
  }

  // Final full page
  await page.screenshot({
    path: join(screenshotsDir, '05-final-state.png'),
    fullPage: true,
  });
  console.log('Final screenshot saved');

  await browser.close();
  console.log('Done! Screenshots saved to:', screenshotsDir);
}

captureScreenshots().catch(console.error);
