// @ts-check
'use strict';

const { defineConfig, devices } = require('@playwright/test');

/**
 * Playwright configuration.
 *
 * - Tests live in tests/*.spec.js (kept separate from Jest's *.test.js pattern)
 * - A local HTTP server (`serve`) is started automatically before the suite runs
 * - Screenshots are written to screenshots/ (uploaded as CI artifacts)
 * - Two browser projects: Desktop Chrome + Mobile Chrome (Pixel 5)
 */
module.exports = defineConfig({
  testDir: './tests',
  testMatch: ['**/*.spec.js'],

  /* Give each test up to 30 s; longer for CI where machines can be slower */
  timeout: 30_000,

  /* Retry once on CI to smooth over transient flakiness */
  retries: process.env.CI ? 1 : 0,

  /* Parallel workers — keep serial on CI to avoid port conflicts */
  workers: process.env.CI ? 1 : undefined,

  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],

  use: {
    /* Base URL for all page.goto() calls */
    baseURL: 'http://localhost:1985',

    /* Always capture traces and screenshots so CI artifacts are available on every run */
    trace: 'on',
    screenshot: 'on',
  },

  projects: [
    {
      name: 'Desktop Chrome',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 800 },
      },
    },
    {
      name: 'Tablet Chrome',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 768, height: 1024 },
      },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  /* Spin up a local static file server before running the tests */
  webServer: {
    command: 'npx serve . --listen 1985 --no-clipboard',
    url: 'http://localhost:1985',
    reuseExistingServer: !process.env.CI,
    timeout: 15_000,
  },

  /* Playwright test-result artifacts (traces, etc.) */
  outputDir: 'test-results/',
});
