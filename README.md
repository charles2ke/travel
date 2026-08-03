# travel

> Explore.. Dream.. Discover..

Tito & Kanika US East Coast trip itinerary.

## Pages

- [US East Coast Itinerary](us-east-coast-itinerary-day6-rebalanced-museum.html)
- [Tito's Travel Map](titos_travel_map_progress_with_cities.html)

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
npm run serve   # opens http://localhost:3000
```

## Scripts

| Command | Description |
|---|---|
| `npm test` | Run Jest unit tests with coverage |
| `npm run test:smoke` | Run Playwright smoke tests (Desktop Chrome, Tablet Chrome, Mobile Chrome) |
| `npm run test:all` | Run all tests (Jest + Playwright) |
| `npm run serve` | Serve pages locally at http://localhost:3000 |

## Testing

- **Unit tests** (Jest): `tests/itinerary.test.js`
- **Smoke tests** (Playwright): `tests/smoke.spec.js` — Desktop Chrome, Tablet Chrome, Mobile Chrome

## CI / CD

| Workflow | Trigger | Description |
|---|---|---|
| CI | push / PR (all branches) | Runs Jest unit tests + Playwright smoke tests |
| Deploy static content to Pages | push to `main` | Deploys to GitHub Pages |
| Update README | push to `main` | Regenerates this file from the current codebase |

---

_This README is automatically regenerated on every push to `main`._
