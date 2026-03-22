# Modern POS Platform

This repository is a full-stack point-of-sale system built for a small retail workflow.

The frontend is a React dashboard used by staff at the register. The backend is an Express and MySQL API that handles authentication, products, categories, sales, stock updates, and reporting.

The simplest way to think about it is this:

- the frontend is the counter
- the backend is the ledger

One side needs to feel fast for staff. The other side needs to stay strict so sales and stock data do not drift.

## What the project does

- first-time store setup for the initial admin account
- staff login with email and 4-digit PIN
- role-based access for `admin`, `manager`, and `cashier`
- product and category management
- inventory-aware checkout
- sales history and report views
- barcode scanning and cash drawer utilities in the register flow

## Stack

Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Chart.js

Backend
- Node.js
- Express
- MySQL
- JWT
- Helmet
- Express Validator
- Express Rate Limit

## Repository layout

```text
.
|-- backend/
|   |-- src/
|   |   |-- config/
|   |   |-- controllers/
|   |   |-- middleware/
|   |   |-- routes/
|   |   `-- server.js
|   |-- .env.example
|   |-- package.json
|   `-- README.md
|-- docs/
|   |-- api-reference.md
|   |-- architecture.md
|   `-- verification-checklist.md
|-- src/
|   |-- components/
|   |-- context/
|   |-- lib/
|   |-- pages/
|   `-- types/
|-- .github/workflows/ci.yml
|-- .env.example
`-- package.json
```

## Local setup

### 1. Install dependencies

From the project root:

```bash
npm install
npm install --prefix backend
```

### 2. Create environment files

Windows:

```bash
copy .env.example .env
copy backend\.env.example backend\.env
```

### 3. Fill in backend values

Update `backend/.env` with:

- MySQL host, port, user, password, and database name
- a real `JWT_SECRET`
- optional default admin values if you want to change the seeded account

### 4. Initialize the database

```bash
npm run init-db
```

### 5. Start the backend

```bash
npm run dev:backend
```

### 6. Start the frontend

```bash
npm run dev
```

Default local URLs:

- frontend: `http://localhost:5173`
- backend: `http://localhost:3000`
- health check: `http://localhost:3000/api/health`

## Notes before you run it

- The frontend build expects local frontend dependencies to be installed. If `tsc` is not found, the root `npm install` step did not complete yet.
- `POST /api/auth/register` is only meant for first-time setup. After the first admin exists, new staff accounts should be created by an admin through the app.
- The current auth model is fine for local development, but a production version should move away from browser-stored bearer tokens to `httpOnly` cookies plus CSRF protection.

## Useful scripts

Root:

```bash
npm run dev
npm run dev:backend
npm run build
npm run check
npm run init-db
```

Backend:

```bash
npm run dev --prefix backend
npm run init-db --prefix backend
npm run check:syntax --prefix backend
```

## What is already in good shape

- one-time admin bootstrap instead of open registration
- request validation on write routes
- basic security middleware and auth throttling
- healthier sales handling around stock checks and duplicate line items
- cleaner, more consistent frontend than the original classroom-style version
- CI workflow for frontend build and backend syntax checks

## What is still missing

This project is in a much better state than it started in, but it is not pretending to be finished.

Current gaps:

- no automated backend test suite yet
- no deployment setup yet
- no demo screenshots or live instance in the repo yet

That is normal for a student or internship-level project. The important thing is that the core workflow is real and the repo is now structured enough to improve further without rewriting everything.

## Documentation

- [Architecture overview](docs/architecture.md)
- [API reference](docs/api-reference.md)
- [Verification checklist](docs/verification-checklist.md)
- [Backend README](backend/README.md)

## Quick manual verification

If you want to sanity-check the project after setup, this is the shortest useful pass:

1. Start the backend and confirm `GET /api/health` responds.
2. Run the database init script.
3. Open the frontend and sign in with the seeded admin account.
4. Create or update a product and category.
5. Add products to the cart and complete a sale.
6. Confirm the sale appears in the reporting views.

## Why this repo exists

This is not trying to be a huge ERP system. The scope is smaller and more practical than that.

The goal is to show a believable POS workflow with:

- real user roles
- real inventory constraints
- real checkout behavior
- a backend that does more than act like a thin CRUD wrapper

That is the kind of line between "school project" and "actual engineering project" that matters most here.
