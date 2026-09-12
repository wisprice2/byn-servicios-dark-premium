import { createRequire } from 'node:module';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('C:\\Users\\T-800\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\node\\node_modules\\playwright');
const baseUrl = process.env.QA_URL || 'http://127.0.0.1:4174';
const output = new URL('./design/qa/', import.meta.url);

await mkdir(output, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
});
const cases = [
  ['desktop', { width: 1440, height: 1000 }],
  ['reference-1024', { width: 1024, height: 900 }],
  ['tablet', { width: 768, height: 1024 }],
  ['mobile', { width: 390, height: 844 }]
];

for (const [name, viewport] of cases) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
  const errors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.evaluate(async () => {
    const images = [...document.images];
    images.forEach((image) => { image.loading = 'eager'; });
    await Promise.all(images.map(async (image) => {
      if (!image.complete) await new Promise((resolve) => image.addEventListener('load', resolve, { once: true }));
      if (image.decode) await image.decode().catch(() => {});
    }));
  });
  await page.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += Math.max(300, window.innerHeight * .75)) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 45));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(250);
  await page.screenshot({ path: fileURLToPath(new URL(`${name}.png`, output)), fullPage: true });
  const layout = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    document: document.documentElement.scrollWidth,
    height: document.documentElement.scrollHeight,
    brokenImages: [...document.images].filter((image) => !image.complete || image.naturalWidth === 0).map((image) => image.getAttribute('src'))
  }));
  console.log(JSON.stringify({ name, ...layout, errors }));
  await page.close();
}

const interactionPage = await browser.newPage({ viewport: { width: 390, height: 844 } });
await interactionPage.goto(baseUrl, { waitUntil: 'networkidle' });
await interactionPage.click('.menu-toggle');
const menuOpened = await interactionPage.locator('#mobile-nav').isVisible();
await interactionPage.keyboard.press('Escape');
const menuClosed = await interactionPage.locator('#mobile-nav').isHidden();
await interactionPage.click('.faq-list details:first-child summary');
const faqOpened = await interactionPage.locator('.faq-list details:first-child').evaluate((item) => item.open);
console.log(JSON.stringify({ interactions: { menuOpened, menuClosed, faqOpened } }));
await interactionPage.close();

await browser.close();
