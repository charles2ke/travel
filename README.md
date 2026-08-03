# travel

> Explore.. Dream.. Discover..

Tito & Kanika US East Coast trip itinerary.

[![CI](https://github.com/charles2ke/travel/actions/workflows/test.yml/badge.svg)](https://github.com/charles2ke/travel/actions/workflows/test.yml)
[![Deploy to GitHub Pages](https://github.com/charles2ke/travel/actions/workflows/static.yml/badge.svg)](https://github.com/charles2ke/travel/actions/workflows/static.yml)

🌐 **Live site:** <https://charles2ke.github.io/travel/>

## Pages

- [US East Coast Itinerary](https://charles2ke.github.io/travel/us-east-coast-itinerary-day6-rebalanced-museum.html)
- [Tito's Travel Map](https://charles2ke.github.io/travel/titos_travel_map_progress_with_cities.html)

## Project structure

```
├── index.html                               Entry point / page index
├── titos_travel_map_progress_with_cities.html
├── us-east-coast-itinerary-day6-rebalanced-museum.html
├── assets/
│   ├── css/styles.css
│   └── js/script.js
└── tests/
    ├── itinerary.test.js
    ├── smoke.spec.js
```

## Getting started

```bash
npm install
npm run serve   # opens http://localhost:1985
```

## Scripts

| Command | Description |
|---|---|
| `npm test` | Run Jest unit tests with coverage |
| `npm run test:smoke` | Run Playwright smoke tests (Desktop Chrome, Tablet Chrome, Mobile Chrome) |
| `npm run test:all` | Run all tests (Jest + Playwright) |
| `npm run serve` | Serve pages locally at http://localhost:1985 |

## Testing

- **Unit tests** (Jest): `tests/itinerary.test.js`
- **Smoke tests** (Playwright): `tests/smoke.spec.js` — Desktop Chrome, Tablet Chrome, Mobile Chrome

## CI / CD

| Workflow | Trigger | Description |
|---|---|---|
| CI | push / PR (all branches) | Runs Jest unit tests + Playwright smoke tests |
| Deploy to GitHub Pages | push to `main` (tests must pass) | Runs unit tests, then deploys to GitHub Pages only on success |
| Update README | push to `main` | Regenerates this file from the current codebase |

> **Deployment gate:** the `Deploy to GitHub Pages` workflow runs unit tests as a required first job. The deployment step is skipped if tests fail, ensuring broken code is never published to the live site.

---

_This README is automatically regenerated on every push to `main`._
