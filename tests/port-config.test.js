'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

function read(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), 'utf-8');
}

describe('default localhost port configuration', () => {
  test('package serve script uses port 1985', () => {
    const pkg = JSON.parse(read('package.json'));
    expect(pkg.scripts.serve).toContain('--listen 1985');
    expect(pkg.scripts.serve).not.toContain('--listen 3000');
  });

  test('Playwright config uses localhost:1985 for base URL and web server', () => {
    const cfg = read('playwright.config.js');
    expect(cfg).toContain("baseURL: 'http://localhost:1985'");
    expect(cfg).toContain("command: 'npx serve . --listen 1985 --no-clipboard'");
    expect(cfg).toContain("url: 'http://localhost:1985'");
    expect(cfg).not.toContain('localhost:3000');
  });

  test('README and README generator reference localhost:1985', () => {
    const readme = read('README.md');
    const generator = read('.github/scripts/update-readme.js');

    expect(readme).toContain('http://localhost:1985');
    expect(generator).toContain('http://localhost:1985');

    expect(readme).not.toContain('http://localhost:3000');
    expect(generator).not.toContain('http://localhost:3000');
  });
});
