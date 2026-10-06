// @ts-check
'use strict';

/**
 * Playwright smoke tests — runs against every HTML page in the project.
 *
 * For each page and viewport (Desktop / Tablet / Mobile) the suite:
 *   1. Loads the page and verifies it renders without fatal errors
 *   2. Checks the page title
 *   3. Asserts key structural elements are visible
 *   4. Captures a full-page screenshot saved under screenshots/
 *
 * Additional itinerary-specific checks:
 *   - CSS is applied (accent colour is not the browser default)
 *   - Countdown timer text is populated (not the placeholder "--d --h")
 *   - Live clocks are populated (not "--:--:--")
 *   - All six main sections scroll into view without error
 *   - Theme toggle switches dark mode on and off
 *   - Day-card expand / collapse works
 *   - FAB navigation bar is visible and links are present
 */

const { test, expect } = require('@playwright/test');
const path  = require('path');
const fs    = require('fs');

// ── Screenshot output directory ───────────────────────────────────────────────
const SCREENSHOTS_DIR = path.join(__dirname, '..', 'screenshots');
if (!fs.existsSync(SCREENSHOTS_DIR)) fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

/** Derive a safe filename prefix from the Playwright project name */
function viewportLabel(testInfo) {
  return testInfo.project.name.toLowerCase().replace(/\s+/g, '-');
}

// ─────────────────────────────────────────────────────────────────────────────
// Page catalogue
// ─────────────────────────────────────────────────────────────────────────────
const PAGES = [
  {
    url:   '/',
    name:  'home',
    title: 'Tito Travel Pages',
  },
  {
    url:   '/us-east-coast-itinerary-day6-rebalanced-museum.html',
    name:  'itinerary',
    title: 'Tito & Kanika — US East Coast Itinerary',
  },
  {
    url:   '/titos_travel_map_progress_with_cities.html',
    name:  'travel-map',
    title: "Tito's Travel Map",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helper: block external network requests so tests don't depend on 3rd-party
// services (weatherwidget.io, Unsplash, Google Maps, etc.)
// ─────────────────────────────────────────────────────────────────────────────
async function blockExternalRequests(page) {
  await page.route('**/*', (route) => {
    const url = route.request().url();
    // Allow localhost (our server)
    if (url.startsWith('http://localhost') || url.startsWith('data:')) {
      route.continue();
    } else {
      route.abort();
    }
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Generic smoke tests — run for EVERY page × EVERY viewport
// ─────────────────────────────────────────────────────────────────────────────
for (const pg of PAGES) {
  test.describe(`${pg.name} — generic smoke`, () => {
    test.beforeEach(async ({ page }) => {
      await blockExternalRequests(page);
      await page.goto(pg.url, { waitUntil: 'domcontentloaded' });
    });

    test(`has correct title [${pg.name}]`, async ({ page }) => {
      await expect(page).toHaveTitle(pg.title);
    });

    test(`page body is not empty [${pg.name}]`, async ({ page }) => {
      const body = page.locator('body');
      await expect(body).not.toBeEmpty();
    });

    test(`no uncaught JavaScript errors [${pg.name}]`, async ({ page }) => {
      const errors = [];
      page.on('pageerror', (err) => errors.push(err.message));
      await page.waitForTimeout(500);
      // Filter out errors caused by deliberately blocked external scripts
      const realErrors = errors.filter(
        (e) => !e.includes('net::ERR_ABORTED') && !e.includes('Failed to fetch')
      );
      expect(realErrors).toHaveLength(0);
    });

    test(`full-page screenshot — desktop [${pg.name}]`, async ({ page }, testInfo) => {
      // Only run the screenshot on Desktop Chrome to avoid duplicates from
      // the generic describe block; per-viewport screenshots are in the
      // itinerary-specific describe blocks below.
      if (testInfo.project.name !== 'Desktop Chrome') test.skip();
      const screenshotPath = path.join(
        SCREENSHOTS_DIR,
        `${pg.name}-desktop-full.png`
      );
      await page.screenshot({ path: screenshotPath, fullPage: true });
      expect(fs.existsSync(screenshotPath)).toBe(true);
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Per-viewport screenshots — every page × every viewport
// ─────────────────────────────────────────────────────────────────────────────
for (const pg of PAGES) {
  test.describe(`${pg.name} — viewport screenshots`, () => {
    test(`full-page screenshot [${pg.name}]`, async ({ page }, testInfo) => {
      await blockExternalRequests(page);
      await page.goto(pg.url, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(400); // let JS settle

      const vp = viewportLabel(testInfo);
      const screenshotPath = path.join(SCREENSHOTS_DIR, `${pg.name}-${vp}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      expect(fs.existsSync(screenshotPath)).toBe(true);
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Itinerary-specific smoke tests
// ─────────────────────────────────────────────────────────────────────────────
test.describe('itinerary — structural checks', () => {
  const URL = '/us-east-coast-itinerary-day6-rebalanced-museum.html';

  test.beforeEach(async ({ page }) => {
    await blockExternalRequests(page);
    await page.goto(URL, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(400);
  });

  // ── Navigation ─────────────────────────────────────────────────────────────
  test('sticky topbar / header is visible', async ({ page }) => {
    await expect(page.locator('header.topbar')).toBeVisible();
  });

  test('brand name is present in the topbar', async ({ page }) => {
    await expect(page.locator('.brand strong')).toContainText('US East Coast Itinerary');
  });

  test('days navigation menu button is present', async ({ page }) => {
    await expect(page.locator('#daysMenuButton')).toBeVisible();
  });

  test('theme toggle button is present', async ({ page }) => {
    await expect(page.locator('#themeToggle')).toBeVisible();
  });

  // ── Hero section ───────────────────────────────────────────────────────────
  test('hero h1 contains trip names', async ({ page }) => {
    await expect(page.locator('h1').first()).toContainText('US East Coast');
  });

  test('trip-status countdown is populated (not placeholder)', async ({ page }) => {
    const countdown = page.locator('#tripCountdownTop');
    await expect(countdown).not.toHaveText('--d --h');
  });

  test('New York live clock is populated (not placeholder)', async ({ page }) => {
    const clock = page.locator('#nyClockTop');
    await expect(clock).not.toHaveText('--:--:--');
  });

  test('Ireland live clock is populated (not placeholder)', async ({ page }) => {
    await expect(page.locator('#ieClockTop')).not.toHaveText('--:--:--');
  });

  test('India live clock is populated (not placeholder)', async ({ page }) => {
    await expect(page.locator('#inClockTop')).not.toHaveText('--:--:--');
  });

  // ── Day cards ──────────────────────────────────────────────────────────────
  test('all 10 day cards are present', async ({ page }) => {
    const cards = page.locator('.day-section');
    await expect(cards).toHaveCount(10);
  });

  test('Day 1 card has correct heading', async ({ page }) => {
    await expect(page.locator('#day1 h3')).toContainText('Arrival in NYC');
  });

  test('Day 4 birthday card is labelled correctly', async ({ page }) => {
    await expect(page.locator('#day4 h3')).toContainText('Birthday');
  });

  test('expand-all button opens every day card', async ({ page }) => {
    // Close all first to start from a known state
    await page.locator('#collapseAll').click();
    await page.waitForTimeout(200);
    await page.locator('#expandAll').click();
    await page.waitForTimeout(200);
    // All <details> should now be open
    const closedCards = await page.locator('.day-section:not([open])').count();
    expect(closedCards).toBe(0);
  });

  test('collapse-all button closes every day card', async ({ page }) => {
    await page.locator('#expandAll').click();
    await page.waitForTimeout(200);
    await page.locator('#collapseAll').click();
    await page.waitForTimeout(200);
    const openCards = await page.locator('.day-section[open]').count();
    expect(openCards).toBe(0);
  });

  // ── Theme toggle ───────────────────────────────────────────────────────────
  test('theme toggle adds dark class to body', async ({ page }) => {
    await page.locator('#themeToggle').click();
    await expect(page.locator('body')).toHaveClass(/dark/);
  });

  test('theme toggle removes dark class on second click', async ({ page }) => {
    await page.locator('#themeToggle').click();
    await page.locator('#themeToggle').click();
    const cls = await page.locator('body').getAttribute('class');
    expect(cls ?? '').not.toMatch(/\bdark\b/);
  });

  // ── FAB navigation bar ────────────────────────────────────────────────────
  test('FAB navigation bar is visible', async ({ page }) => {
    await expect(page.locator('.fab-container')).toBeVisible();
  });

  test('FAB itinerary link is present', async ({ page }) => {
    await expect(page.locator('#fabDays')).toBeVisible();
  });

  test('FAB packing link is present', async ({ page }) => {
    await expect(page.locator('#fabPacking')).toBeVisible();
  });

  // ── Sections ───────────────────────────────────────────────────────────────
  for (const sectionId of ['overview', 'arrival', 'connectivity', 'itinerary', 'packing', 'budget']) {
    test(`section #${sectionId} exists and is reachable`, async ({ page }) => {
      const section = page.locator(`#${sectionId}`);
      await expect(section).toBeAttached();
      await section.scrollIntoViewIfNeeded();
    });
  }

  // ── Per-section screenshots (Desktop Chrome only to keep artifact count sane)
  for (const sectionId of ['overview', 'arrival', 'connectivity', 'itinerary', 'packing', 'budget']) {
    test(`screenshot — section #${sectionId}`, async ({ page }, testInfo) => {
      if (testInfo.project.name !== 'Desktop Chrome') test.skip();
      await page.locator(`#${sectionId}`).scrollIntoViewIfNeeded();
      await page.waitForTimeout(200);
      const screenshotPath = path.join(
        SCREENSHOTS_DIR,
        `itinerary-section-${sectionId}.png`
      );
      await page.screenshot({ path: screenshotPath });
      expect(fs.existsSync(screenshotPath)).toBe(true);
    });
  }

  // ── CSS applied check ──────────────────────────────────────────────────────
  test('external CSS is applied (accent colour is not browser default)', async ({ page }) => {
    // The :root --accent variable sets #2563eb; verify the topbar background
    // is not simply transparent (i.e., CSS was loaded and applied)
    const bg = await page.evaluate(() =>
      getComputedStyle(document.querySelector('.topbar')).backgroundColor
    );
    // Any non-empty, non-"rgba(0,0,0,0)" value means CSS is applied
    expect(bg).toBeTruthy();
    expect(bg).not.toBe('rgba(0, 0, 0, 0)');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Travel-map page smoke tests
// ─────────────────────────────────────────────────────────────────────────────
test.describe('travel-map — structural checks', () => {
  const URL = '/titos_travel_map_progress_with_cities.html';

  test.beforeEach(async ({ page }) => {
    await blockExternalRequests(page);
    await page.goto(URL, { waitUntil: 'domcontentloaded' });
  });

  test('page body is non-empty', async ({ page }) => {
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('has correct page title', async ({ page }) => {
    await expect(page).toHaveTitle("Tito's Travel Map");
  });
});
