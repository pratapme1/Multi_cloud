import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const BASE_URL = process.env.E2E_BASE_URL ?? 'http://127.0.0.1:5173';
const OUT = 'e2e_screenshots';
const RUN_ID = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
const UPLOAD_NAME = `codex-e2e-${RUN_ID}.txt`;

mkdirSync(OUT, { recursive: true });

const results = [];
let passed = 0;
let failed = 0;

const browser = await chromium.launch({
  headless: process.env.E2E_HEADLESS === 'true',
  slowMo: Number(process.env.E2E_SLOWMO ?? 120),
});

const context = await browser.newContext({
  viewport: { width: 1366, height: 820 },
  acceptDownloads: true,
});
const page = await context.newPage();

page.on('console', msg => {
  if (msg.type() === 'error') console.log(`  browser console error: ${msg.text()}`);
});

const snap = async name => {
  await page.screenshot({ path: join(OUT, `${name}.png`), fullPage: true });
  console.log(`  screenshot: ${name}`);
};

const test = async (name, fn) => {
  try {
    await fn();
    results.push({ name, status: 'pass' });
    passed++;
    console.log(`  PASS ${name}`);
  } catch (err) {
    results.push({ name, status: 'fail', error: err.message });
    failed++;
    console.log(`  FAIL ${name} - ${err.message}`);
    await snap(`FAIL_${name.replace(/[^a-z0-9]+/gi, '_')}`).catch(() => {});
  }
};

const expectVisible = async (selector, timeout = 8000) => {
  await page.locator(selector).first().waitFor({ state: 'visible', timeout });
};

const expectText = async (selector, text, timeout = 8000) => {
  await page.locator(selector).filter({ hasText: text }).first().waitFor({ state: 'visible', timeout });
};

const signIn = async (username, password) => {
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
  await page.locator('input[type="text"]').fill(username);
  await page.locator('input[type="password"]').fill(password);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL('**/app/**', { timeout: 10000 });
};

const closeDrawerIfOpen = async () => {
  const close = page.locator('.drawer .dw-head .icb').first();
  if (await close.isVisible().catch(() => false)) {
    await close.click();
    await page.locator('.cw.open').waitFor({ state: 'detached', timeout: 3000 }).catch(() => {});
  }
};

console.log(`\nE2E started against ${BASE_URL}`);

await test('login page renders current app shell', async () => {
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await expectVisible('.lcard');
  await expectText('.lbrand', 'Multi-Cloud Storage');
  await expectText('.lchips', 'AWS S3');
  await expectText('.lchips', 'Azure Blob');
  await expectText('.lchips', 'GCS');
  await snap('01_login_page');
});

await test('wrong credentials show validation error', async () => {
  await page.locator('input[type="text"]').fill('wrong-user');
  await page.locator('input[type="password"]').fill('wrong-password');
  await page.locator('button[type="submit"]').click();
  await expectVisible('.a-err');
  await snap('02_login_error');
});

await test('admin can sign in and reach files workspace', async () => {
  await signIn('admin', 'Admin@123');
  await expectVisible('.rail');
  await expectVisible('.topbar');
  await page.locator('.shelf').waitFor({ state: 'visible', timeout: 15000 });
  await snap('03_admin_workspace');
});

await test('provider health shows AWS and Azure live, GCS placeholder', async () => {
  await page.getByRole('button', { name: /Health/ }).click();
  await expectText('.drawer', 'Provider Health');
  await expectText('.drawer', 'AWS S3');
  await expectText('.drawer', 'Azure Blob');
  await expectText('.drawer', 'GCS');
  await expectText('.drawer', 'Pending');
  await snap('04_health_drawer');
  await closeDrawerIfOpen();
});

await test('admin can upload one real file to AWS and Azure', async () => {
  const uploadButton = page.getByRole('button', { name: /Upload/ }).first();
  await uploadButton.click();
  await expectVisible('.modal');
  await expectText('.modal', 'Upload File');

  const checked = await page.locator('.pchk.checked').count();
  if (checked !== 2) throw new Error(`Expected AWS and Azure selected by default, got ${checked}`);
  await expectText('.modal', 'Placeholder');

  const [chooser] = await Promise.all([
    page.waitForEvent('filechooser', { timeout: 5000 }),
    page.locator('.dz').click(),
  ]);
  await chooser.setFiles({
    name: UPLOAD_NAME,
    mimeType: 'text/plain',
    buffer: Buffer.from(`Codex end-to-end upload ${RUN_ID}\nAWS + Azure active, GCS placeholder.\n`),
  });

  await expectText('.modal', UPLOAD_NAME);
  await page.getByRole('button', { name: /Upload to 2 providers/ }).click();
  await expectText('.modal', 'Upload Successful', 30000);
  await expectText('.modal', 'AWS S3');
  await expectText('.modal', 'Azure Blob Storage');
  await snap('05_upload_success');
  await page.getByRole('button', { name: /^Close$/ }).click();
});

await test('uploaded file appears in the live file list and search', async () => {
  await expectVisible('.shelf', 15000);
  await page.getByLabel('Search files').fill(UPLOAD_NAME);
  await expectText('.frow', UPLOAD_NAME, 20000);
  await expectText('.frow', '2 providers');
  await snap('06_uploaded_file_listed');
});

await test('uploaded file can be downloaded from the UI', async () => {
  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 20000 }),
    page.locator('.frow').filter({ hasText: UPLOAD_NAME }).locator('button[title="Download"]').click(),
  ]);
  const suggested = download.suggestedFilename();
  if (suggested !== UPLOAD_NAME) throw new Error(`Expected download ${UPLOAD_NAME}, got ${suggested}`);
  await snap('07_download_started');
});

await test('file details open in one click with cloud placement', async () => {
  await page.locator('.frow').filter({ hasText: UPLOAD_NAME }).click();
  await expectText('.drawer', 'File Details');
  await expectText('.drawer', UPLOAD_NAME);
  await expectText('.drawer', 'AWS S3');
  await expectText('.drawer', 'Azure Blob');
  await snap('08_file_details');
  await closeDrawerIfOpen();
});

await test('sync flow runs AWS to Azure while GCS remains disabled', async () => {
  await page.getByRole('button', { name: /Sync/ }).first().click();
  await expectText('.drawer', 'Sync');
  await expectText('.drawer', 'GCS');

  const gcsDisabled = await page.locator('.tgchk.disabled').filter({ hasText: 'GCS' }).count();
  if (gcsDisabled === 0) throw new Error('GCS destination should be disabled as a placeholder');

  await page.getByRole('button', { name: /Sync to 1 destination/ }).click();
  await expectText('.drawer', 'Last result', 60000);
  await expectText('.drawer', 'skipped', 60000);
  await snap('09_sync_result');
  await closeDrawerIfOpen();
});

await test('viewer is read-only against the same live data', async () => {
  await page.locator('[data-tip="Sign out"]').click();
  await expectVisible('.lcard');
  await signIn('viewer', 'View@123');
  await page.getByLabel('Search files').fill(UPLOAD_NAME);
  await expectText('.frow', UPLOAD_NAME, 20000);
  await expectText('.topbar', 'Read-only');

  const uploadButtons = await page.getByRole('button', { name: /Upload/ }).count();
  if (uploadButtons > 0) throw new Error('Viewer should not see Upload');

  const deleteButtons = await page.locator('button[title="Delete"]').count();
  if (deleteButtons > 0) throw new Error('Viewer should not see Delete');

  await snap('10_viewer_readonly');
});

await test('sign out returns to login page', async () => {
  await page.locator('[data-tip="Sign out"]').click();
  await expectVisible('.lcard');
  await snap('11_signed_out');
});

await browser.close();

const total = passed + failed;
console.log(`\nResults: ${passed}/${total} passed, ${failed} failed`);
console.log(`Uploaded test file left in storage for console verification: ${UPLOAD_NAME}`);
console.log(`Screenshots saved to: src/frontend/${OUT}/`);

writeFileSync(join(OUT, 'results.json'), JSON.stringify({
  baseUrl: BASE_URL,
  uploadedFile: UPLOAD_NAME,
  results,
}, null, 2));

if (failed > 0) process.exit(1);
