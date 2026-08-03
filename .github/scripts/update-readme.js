#!/usr/bin/env node
'use strict';

/**
 * update-readme.js
 *
 * Generates README.md from the current state of the repository.
 * Run directly:  node .github/scripts/update-readme.js
 * Run via CI:    see .github/workflows/update-readme.yml
 */

const fs   = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');

// ── helpers ───────────────────────────────────────────────────────────────────

/** Extract <a href="...">title</a> pairs from index.html */
function extractPages() {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf-8');
  const pages = [];
  const re = /<a\s+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    pages.push({ href: m[1].trim(), title: m[2].replace(/\s+/g, ' ').trim() });
  }
  return pages;
}

/** Read package.json */
function readPkg() {
  return JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf-8'));
}

/** List files in a directory (relative to ROOT), filtered by extension */
function listFiles(dir, ext) {
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) return [];
  return fs.readdirSync(abs)
    .filter(f => !ext || f.endsWith(ext))
    .sort();
}

/** HTML files at the repo root */
function rootHtmlFiles() {
  return fs.readdirSync(ROOT)
    .filter(f => f.endsWith('.html'))
    .sort();
}

// ── README generation ─────────────────────────────────────────────────────────

const SCRIPT_LABELS = {
  test:          'Run Jest unit tests with coverage',
  'test:smoke':  'Run Playwright smoke tests (Desktop Chrome, Tablet Chrome, Mobile Chrome)',
  'test:all':    'Run all tests (Jest + Playwright)',
  serve:         'Serve pages locally at http://localhost:3000',
};

function generateReadme() {
  const pages     = extractPages();
  const pkg       = readPkg();
  const testFiles = listFiles('tests');
  const htmlFiles = rootHtmlFiles();

  const pageLines = pages
    .map(p => `- [${p.title}](${p.href})`)
    .join('\n');

  const scriptRows = Object.entries(pkg.scripts || {})
    .map(([k, _]) => {
      const cmd  = k === 'test' ? '`npm test`' : `\`npm run ${k}\``;
      const desc = SCRIPT_LABELS[k] || pkg.scripts[k];
      return `| ${cmd} | ${desc} |`;
    })
    .join('\n');

  const nonIndexHtml = htmlFiles
    .filter(f => f !== 'index.html')
    .map(f => `├── ${f}`)
    .join('\n');

  const testLines = testFiles
    .map(f => `    ├── ${f}`)
    .join('\n');

  const unitTests  = testFiles.filter(f => f.endsWith('.test.js'));
  const smokeTests = testFiles.filter(f => f.endsWith('.spec.js'));

  return `# travel

> Explore.. Dream.. Discover..

${pkg.description}.

## Pages

${pageLines}

## Project structure

\`\`\`
├── index.html                               Entry point / page index
${nonIndexHtml}
├── assets/
│   ├── css/styles.css
│   └── js/script.js
└── tests/
${testLines}
\`\`\`

## Getting started

\`\`\`bash
npm install
npm run serve   # opens http://localhost:3000
\`\`\`

## Scripts

| Command | Description |
|---|---|
${scriptRows}

## Testing

${unitTests.map(f => `- **Unit tests** (Jest): \`tests/${f}\``).join('\n')}
${smokeTests.map(f => `- **Smoke tests** (Playwright): \`tests/${f}\` — Desktop Chrome, Tablet Chrome, Mobile Chrome`).join('\n')}

## CI / CD

| Workflow | Trigger | Description |
|---|---|---|
| CI | push / PR (all branches) | Runs Jest unit tests + Playwright smoke tests |
| Deploy static content to Pages | push to \`main\` | Deploys to GitHub Pages |
| Update README | push to \`main\` | Regenerates this file from the current codebase |

---

_This README is automatically regenerated on every push to \`main\`._
`;
}

// ── main ──────────────────────────────────────────────────────────────────────

const content = generateReadme();
fs.writeFileSync(path.join(ROOT, 'README.md'), content, 'utf-8');
console.log('README.md updated.');
