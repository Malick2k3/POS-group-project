# Modern POS Platform

Modern POS Platform is a full-stack retail point-of-sale application for small stores and growing teams. It combines a React dashboard used by staff on the shop floor with an Express and MySQL backend that handles users, categories, products, checkout, stock updates, and reporting.

The idea is simple: the frontend helps staff move quickly, while the backend keeps the business data consistent. Think of it like a cashier terminal connected to the store's operating system.

## Core Capabilities

- Staff authentication with email and 4-digit PIN
- Role-aware access for admins, managers, and cashiers
- Product, category, and inventory management
- Checkout flow with tax, discount, and payment method handling
- Sales history and reporting
- Backend request validation, auth throttling, and hardened API defaults

## Tech Stack

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Chart.js
- XLSX export utilities

### Backend
- Node.js
- Express
- MySQL
- JWT authentication
- Helmet
- Express Rate Limit
- Express Validator
- Winston logging

## Repository Layout

```text
POS-group-project/
|-- backend/
|   |-- src/
|   |   |-- config/
|   |   |-- controllers/
|   |   |-- middleware/
|   |   |-- routes/
|   |   `-- server.js
|   |-- .env.example
|   `-- package.json
|-- docs/
|   |-- api-reference.md
|   |-- architecture.md
|   `-- verification-checklist.md
|-- src/
|   |-- components/
|   |-- context/
|   |-- lib/
|   |-- pages/
|   |-- types/
|   `-- App.tsx
|-- .env.example
`-- package.json
```

## Quick Start

### 1. Install dependencies

```bash
npm install
npm install --prefix backend
```

### 2. Create environment files

```bash
copy .env.example .env
copy backend\.env.example backend\.env
```

### 3. Update backend configuration

Set the MySQL credentials and replace the placeholder JWT secret in `backend/.env`.

### 4. Initialize the database

```bash
npm run init-db
```

### 5. Run the application

Backend:

```bash
npm run dev:backend
```

Frontend:

```bash
npm run dev
```

Default local URLs:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000`
- API docs JSON: `http://localhost:3000/api-docs`

## Verification Checklist

Use the full checklist in [docs/verification-checklist.md](docs/verification-checklist.md). At minimum:

1. Start the backend and confirm `GET /api/health` responds successfully.
2. Seed the database and log in with the default admin account.
3. Load products, categories, and sales data through the frontend.
4. Complete a test checkout and confirm the sale appears in reports.

## Documentation

- [Architecture overview](docs/architecture.md)
- [API reference](docs/api-reference.md)
- [Verification checklist](docs/verification-checklist.md)
- [Backend README](backend/README.md)

## Security Notes

- The backend uses `helmet`, bounded body sizes, request validation, and auth rate limiting.
- The frontend currently stores a bearer token in browser storage for local development.
- A stronger production version would move auth to secure `httpOnly` cookies with CSRF protection.

## Current Status

The implementation already covers the main POS workflow. The current focus is on polish, reproducibility, and operational quality so the repository feels like a serious engineering project rather than a class submission.
