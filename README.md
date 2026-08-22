# travel

> Explore.. Dream.. Discover..

## 🌐 Live site

### 👉 **[https://charles2ke.github.io/travel/](https://charles2ke.github.io/travel/)**

[![View the live site](https://img.shields.io/badge/View%20the%20live%20site-1985ff?style=for-the-badge&logo=githubpages&logoColor=white)](https://charles2ke.github.io/travel/)

Tito & Kanika US East Coast trip itinerary.

## Pages

- [<div class="card-header"> <div class="card-icon">🗽</div> </div> <div class="card-body"> <div> <div class="card-title">US East Coast Itinerary</div> <p class="card-description">Explore a detailed travel guide through the historic landmarks and vibrant cities of America's East Coast.</p> </div> <span class="card-button">View Itinerary →</span> </div>](us-east-coast-itinerary-day6-rebalanced-museum.html)
- [<div class="card-header"> <div class="card-icon">🗺️</div> </div> <div class="card-body"> <div> <div class="card-title">Tito's Travel Map</div> <p class="card-description">Track Tito's adventures across the globe with an interactive travel map and city progress updates.</p> </div> <span class="card-button">View Map →</span> </div>](titos_travel_map_progress_with_cities.html)

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
    ├── port-config.test.js
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
| `npm run package` | Package site files into site-package.zip |
| `npm run serve` | Serve pages locally at http://localhost:1985 |

## Testing

- **Unit tests** (Jest): `tests/itinerary.test.js`
- **Unit tests** (Jest): `tests/port-config.test.js`
- **Smoke tests** (Playwright): `tests/smoke.spec.js` — Desktop Chrome, Tablet Chrome, Mobile Chrome

## CI / CD

| Workflow | Trigger | Description |
|---|---|---|
| Auto Create PR | push to non-`main` branches | Opens a draft PR to `main` if one doesn't already exist |
| CI | push / PR (all branches) | Runs Jest unit tests + Playwright smoke tests + packages site artifact |
| Deploy to GitHub Pages | push to `main` (tests must pass) | Runs unit tests, then deploys to GitHub Pages only on success |
| Update README | push to `main` | Regenerates this file from the current codebase |

> **Deployment gate:** the `Deploy to GitHub Pages` workflow runs unit tests as a required first job. The deployment step is skipped if tests fail, ensuring broken code is never published to the live site.

---

_This README is automatically regenerated on every push to `main`._
