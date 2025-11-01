# Generator Platform Frontend

Generator Platform is a standalone Angular 19 PWA that brings the public portal, administration area and generator-owner cockpit together. The app ships with SSR-ready configuration, mock APIs, Tailwind + Angular Material theming, role-based routing and localisation (English + Arabic RTL).

## Getting started

```bash
npm install
npm start
```

The SPA is served on `http://localhost:4200`. The PWA manifest and service worker are enabled automatically for production builds (`npm run build`).

### Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Run the Angular dev server with blocking initial navigation. |
| `npm run build` | Production build with service worker. |
| `npm run build:ssr` | SSR-ready client/server bundle. |
| `npm run test` | Execute Jest unit tests. |
| `npm run e2e` | Run Cypress end-to-end smoke specs. |
| `npm run lint` | ESLint (strict) over `src/`. |
| `npm run format` | Prettier format check/fix. |

## Architecture highlights

- **Routing & RBAC** – route-level canMatch guards for anonymous, admin and generator-owner flows; granular permission checks via `PermissionGuard` and structural directives (`*hasPerm`, `*hasRole`).
- **Mock API** – `MockApiClient` hydrates fixtures from `assets/mocks/mock-state.json`, persists updates to `localStorage` and simulates latency + intermittent errors.
- **State management** – NgRx entity stores for requests, users, owner customers, bills, imports, SMS campaigns/messages with matching effects.
- **Internationalisation** – runtime JSON loading through `I18nService`, toggle between EN and AR (RTL) whilst updating `dir` and `lang` attributes.
- **Theming** – Tailwind backed by CSS tokens, Angular Material configured for Dark + Soft Light themes, persisted per user.
- **PWA** – Service worker caches app shell, portal routes, mock fixtures, plus offline banner and update prompts from `PwaService`.
- **Testing** – Jest specs cover guards, directives, check-bill flow, bill creation and import parser; Cypress smoke tests exercise key user journeys.

## Mock credentials

| Role | Email | Password |
|------|-------|----------|
| Admin reviewer | `maya.saab@generator.example` | `password123` |
| Generator owner | `karim@generator.example` | `password123` |

Use the role selector on the login screen to switch personas during demos.
