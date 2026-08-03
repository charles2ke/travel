/**
 * Unit tests for the US East Coast Itinerary refactoring.
 *
 * Test groups:
 *   1. Folder structure — all assets are in the expected paths
 *   2. styles.css       — no duplicate rules, required selectors present
 *   3. HTML structure   — external refs, section nesting, alt attrs, <time> tags
 *   4. script.js logic  — countdown, clock, progress, photo-modal exports
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT    = path.join(__dirname, '..');
const HTML    = path.join(ROOT, 'us-east-coast-itinerary-day6-rebalanced-museum.html');
const CSS     = path.join(ROOT, 'assets', 'css', 'styles.css');
const JS      = path.join(ROOT, 'assets', 'js', 'script.js');

// ─── helpers ─────────────────────────────────────────────────────────────────

let htmlContent, cssContent;

beforeAll(() => {
  htmlContent = fs.readFileSync(HTML, 'utf-8');
  cssContent  = fs.readFileSync(CSS,  'utf-8');
});

// ─────────────────────────────────────────────────────────────────────────────
// 1. Folder structure
// ─────────────────────────────────────────────────────────────────────────────

describe('Folder structure', () => {
  test('assets/css/styles.css exists', () => {
    expect(fs.existsSync(CSS)).toBe(true);
  });

  test('assets/js/script.js exists', () => {
    expect(fs.existsSync(JS)).toBe(true);
  });

  test('HTML file exists at repository root', () => {
    expect(fs.existsSync(HTML)).toBe(true);
  });

  test('no styles.css at repository root', () => {
    expect(fs.existsSync(path.join(ROOT, 'styles.css'))).toBe(false);
  });

  test('no script.js at repository root', () => {
    expect(fs.existsSync(path.join(ROOT, 'script.js'))).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. styles.css
// ─────────────────────────────────────────────────────────────────────────────

describe('styles.css — duplicate rules removed', () => {
  test('.fab-bar rule appears exactly once', () => {
    const matches = cssContent.match(/\.fab-bar\s*\{/g) || [];
    expect(matches).toHaveLength(1);
  });

  test('.fab-btn rule appears exactly once', () => {
    const matches = cssContent.match(/\.fab-btn\s*\{/g) || [];
    expect(matches).toHaveLength(1);
  });

  test('orphaned @media (min-width:901px) fab-bar override is removed', () => {
    // The old first fab-bar had bottom:16px; the overriding media query is gone
    expect(cssContent).not.toMatch(/@media\s*\(min-width\s*:\s*901px\)\s*\{\s*\.fab-bar\s*\{/);
  });
});

describe('styles.css — required selectors present', () => {
  test('.fab-container is defined', () => {
    expect(cssContent).toMatch(/\.fab-container\s*\{/);
  });

  test('.fab-btn.active is defined', () => {
    expect(cssContent).toMatch(/\.fab-btn\.active\s*\{/);
  });

  test('.fab-btn:hover is defined', () => {
    expect(cssContent).toMatch(/\.fab-btn:hover\s*\{/);
  });

  test('.fab-btn has cursor:pointer', () => {
    // Grab the single .fab-btn block
    const match = cssContent.match(/\.fab-btn\s*\{([^}]+)\}/);
    expect(match).not.toBeNull();
    expect(match[1]).toMatch(/cursor\s*:\s*pointer/);
  });

  test(':root CSS custom properties are defined', () => {
    expect(cssContent).toMatch(/:root\s*\{/);
    expect(cssContent).toMatch(/--bg\s*:/);
    expect(cssContent).toMatch(/--accent\s*:/);
  });

  test('dark-mode body.dark overrides are defined', () => {
    expect(cssContent).toMatch(/body\.dark\s*\{/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. HTML structure
// ─────────────────────────────────────────────────────────────────────────────

describe('HTML — external file references', () => {
  test('links to assets/css/styles.css, not inline styles', () => {
    expect(htmlContent).toMatch(/href="assets\/css\/styles\.css"/);
  });

  test('links to assets/js/script.js with defer, not inline script', () => {
    expect(htmlContent).toMatch(/src="assets\/js\/script\.js"[^>]*defer/);
  });

  test('no large inline <style> block remains', () => {
    // Allow a zero-line <style> tag but not one with CSS content
    expect(htmlContent).not.toMatch(/<style>[^<]{100}/);
  });

  test('no inline JavaScript logic block remains', () => {
    // Inline scripts with JS code (const / let / function) should be gone
    expect(htmlContent).not.toMatch(/<script>\s*(const|let|var|function|document)/);
  });
});

describe('HTML — section nesting fix', () => {
  test('section#connectivity is NOT nested inside section#arrival', () => {
    // After the fix, </section> must appear before <section id="connectivity">
    const arrivalClose = htmlContent.indexOf('</section>');
    const connOpen     = htmlContent.indexOf('<section id="connectivity">');
    expect(arrivalClose).toBeGreaterThan(-1);
    expect(connOpen).toBeGreaterThan(-1);
    expect(arrivalClose).toBeLessThan(connOpen);
  });

  test('section#arrival and section#connectivity are siblings at the same nesting depth', () => {
    // Both must be preceded by </section> at the same level — verified by
    // checking there is no <section id="arrival"> opener between the
    // </section> closing tag and the <section id="connectivity"> opener.
    const chunk = htmlContent.slice(
      htmlContent.indexOf('<section id="arrival">'),
      htmlContent.indexOf('<section id="connectivity">')
    );
    // chunk should contain exactly one </section> (closing arrival) and no
    // nested <section id="..."> other than arrival's own opening
    const innerSectionOpens = (chunk.match(/<section\s+id=/g) || []).length;
    expect(innerSectionOpens).toBe(1); // only the arrival opening itself
  });
});

describe('HTML — image alt attributes', () => {
  test('no SVG placeholder image has an empty alt attribute', () => {
    const emptyAlts = htmlContent.match(/data:image\/svg[^"]*"[^>]*alt=""/g) || [];
    expect(emptyAlts).toHaveLength(0);
  });

  test('all 10 day-card SVG images have descriptive alt text', () => {
    const descriptiveAlts = (htmlContent.match(/data:image\/svg[^"]*"[^>]*alt="[^"]+"/g) || []);
    expect(descriptiveAlts.length).toBeGreaterThanOrEqual(10);
  });
});

describe('HTML — <time> datetime tags', () => {
  test('day-date spans use <time datetime="..."> elements', () => {
    const timeTags = htmlContent.match(/<time\s+datetime="20\d\d-\d\d-\d\d">/g) || [];
    expect(timeTags.length).toBeGreaterThanOrEqual(10);
  });

  test('Day 1 date has correct ISO datetime', () => {
    expect(htmlContent).toMatch(/<time datetime="2026-05-23">Sat 23 May<\/time>/);
  });

  test('Day 4 (birthday) date has correct ISO datetime', () => {
    expect(htmlContent).toMatch(/<time datetime="2026-05-26">Tue 26 May<\/time>/);
  });

  test('Day 10 (fly home) date has correct ISO datetime', () => {
    expect(htmlContent).toMatch(/<time datetime="2026-06-01">Mon 1 June<\/time>/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. script.js — exported logic functions
// ─────────────────────────────────────────────────────────────────────────────

describe('script.js — module exports', () => {
  let mod;

  beforeAll(() => {
    // Set up a minimal DOM so the auto-execution at the bottom of the script
    // does not throw (all getElementById calls return null, which is guarded)
    document.body.innerHTML = `
      <div id="themeToggle"></div>
      <div id="tripCountdownTop"></div>
      <div id="tripCountdownFill" style="width:0%"></div>
      <div id="tripCountdownAlert"></div>
      <div id="nyClockTop"></div>
      <div id="ieClockTop"></div>
      <div id="inClockTop"></div>
      <div id="timeDiffBadgeIE"></div>
      <div id="timeDiffBadgeIN"></div>
      <div id="callIndiaBadge"></div>
      <div id="nyDayNightBadge"></div>
      <div id="fabProgressFill" style="width:0%"></div>
      <div id="fabCurrentDay">Day 1</div>
      <div id="expandAll"></div>
      <div id="collapseAll"></div>
      <div id="daysMenuButton"></div>
      <div id="daysMenuPanel"></div>
      <div id="photoSummaryModal"></div>
      <div id="photoSummaryTitle"></div>
      <div id="photoSummaryText"></div>
      <div id="photoSummaryGrid"></div>
      <div id="photoSummaryClose"></div>
    `;
    jest.resetModules();
    mod = require(JS);
  });

  test('exports updateTripCountdownTop function', () => {
    expect(typeof mod.updateTripCountdownTop).toBe('function');
  });

  test('exports updateTopClocks function', () => {
    expect(typeof mod.updateTopClocks).toBe('function');
  });

  test('exports updateFabProgress function', () => {
    expect(typeof mod.updateFabProgress).toBe('function');
  });

  test('exports pictureSummaries object with 5 city keys', () => {
    expect(mod.pictureSummaries).toBeDefined();
    const keys = Object.keys(mod.pictureSummaries);
    expect(keys).toEqual(expect.arrayContaining(['nyc', 'birthday', 'dc', 'boston', 'soho']));
  });
});

describe('script.js — countdown logic', () => {
  let mod;

  beforeAll(() => {
    jest.resetModules();
    mod = require(JS);
  });

  test('updateTripCountdownTop sets countdown text in the DOM', () => {
    const el = document.getElementById('tripCountdownTop');
    mod.updateTripCountdownTop();
    // The trip date is 2026-05-23; the current test date may be before or after.
    // Either way, the element must be non-empty after the call.
    expect(el.textContent).not.toBe('');
    expect(el.textContent).not.toBe('--d --h');
  });

  test('updateTripCountdownTop text matches "Xd Yh", "Today ✈️", or "Trip started"', () => {
    const el = document.getElementById('tripCountdownTop');
    mod.updateTripCountdownTop();
    const validPatterns = [/^\d+d \d+h$/, /^Today ✈️$/, /^Trip started$/];
    const text = el.textContent;
    const matchesAny = validPatterns.some(p => p.test(text));
    expect(matchesAny).toBe(true);
  });

  test('countdown fill bar width is a valid percentage', () => {
    mod.updateTripCountdownTop();
    const fill = document.getElementById('tripCountdownFill');
    const widthStr = fill.style.width;
    const pct = parseFloat(widthStr);
    expect(pct).toBeGreaterThanOrEqual(0);
    expect(pct).toBeLessThanOrEqual(100);
  });

  test('countdown alert has non-empty text after update', () => {
    mod.updateTripCountdownTop();
    const alert = document.getElementById('tripCountdownAlert');
    expect(alert.textContent.trim().length).toBeGreaterThan(0);
  });
});

describe('script.js — clock updates', () => {
  let mod;

  beforeAll(() => {
    jest.resetModules();
    mod = require(JS);
  });

  test('updateTopClocks populates New York clock element', () => {
    mod.updateTopClocks();
    const ny = document.getElementById('nyClockTop');
    expect(ny.textContent).toMatch(/\d+:\d{2}:\d{2}/);
  });

  test('updateTopClocks populates Ireland clock element', () => {
    mod.updateTopClocks();
    const ie = document.getElementById('ieClockTop');
    expect(ie.textContent).toMatch(/\d+:\d{2}:\d{2}/);
  });

  test('updateTopClocks populates India clock element', () => {
    mod.updateTopClocks();
    const india = document.getElementById('inClockTop');
    expect(india.textContent).toMatch(/\d+:\d{2}:\d{2}/);
  });

  test('Ireland time-difference badge is populated', () => {
    mod.updateTopClocks();
    const badge = document.getElementById('timeDiffBadgeIE');
    expect(badge.textContent).toMatch(/Ireland/);
  });

  test('India time-difference badge is populated', () => {
    mod.updateTopClocks();
    const badge = document.getElementById('timeDiffBadgeIN');
    expect(badge.textContent).toMatch(/India/);
  });

  test('call-India badge reflects a valid state', () => {
    mod.updateTopClocks();
    const badge = document.getElementById('callIndiaBadge');
    expect(badge.textContent).toMatch(/Best time to call India: (Yes|Probably not)/);
  });

  test('New York day/night badge reflects a valid state', () => {
    mod.updateTopClocks();
    const badge = document.getElementById('nyDayNightBadge');
    expect(badge.textContent).toMatch(/New York: (Daytime|Nighttime)/);
  });
});

describe('script.js — FAB scroll progress', () => {
  let mod;

  beforeAll(() => {
    jest.resetModules();
    mod = require(JS);
  });

  test('updateFabProgress sets fill width without throwing', () => {
    expect(() => mod.updateFabProgress()).not.toThrow();
    const fill = document.getElementById('fabProgressFill');
    expect(fill.style.width).toMatch(/\d+(\.\d+)?%/);
  });
});

describe('script.js — photo modal data', () => {
  let mod;

  beforeAll(() => {
    jest.resetModules();
    mod = require(JS);
  });

  test.each(['nyc', 'birthday', 'dc', 'boston', 'soho'])(
    'pictureSummaries.%s has title, text and 4 items',
    (key) => {
      const entry = mod.pictureSummaries[key];
      expect(entry.title).toBeTruthy();
      expect(entry.text).toBeTruthy();
      expect(Array.isArray(entry.items)).toBe(true);
      expect(entry.items).toHaveLength(4);
    }
  );

  test('each photo item has img and cap fields', () => {
    Object.values(mod.pictureSummaries).forEach(entry => {
      entry.items.forEach(item => {
        expect(item.img).toBeTruthy();
        expect(item.cap).toBeTruthy();
      });
    });
  });
});
