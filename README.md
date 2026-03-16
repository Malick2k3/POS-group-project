# Modern POS Platform

Modern POS Platform is a retail point-of-sale system for small stores and growing teams. It combines a React dashboard for day-to-day operations with an Express and MySQL backend for products, categories, users, sales, and reporting.

## What It Does

- Staff login with email and 4-digit PIN
- Role-aware access for admins, managers, and cashiers
- Product and inventory management
- Checkout flow with tax calculation and payment method selection
- Sales reporting and exports
- Backend request validation, auth throttling, and hardened API defaults

## Stack

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- React Router

### Backend
- Node.js
- Express
- MySQL
- JWT authentication
- Helmet
- Express Rate Limit
- Express Validator

## Project Structure

```text
POS-group-project/
├─ backend/
│  ├─ src/
│  │  ├─ config/
│  │  ├─ controllers/
│  │  ├─ middleware/
│  │  ├─ routes/
│  │  └─ server.js
│  ├─ .env.example
│  └─ package.json
├─ src/
│  ├─ components/
│  ├─ context/
│  ├─ lib/
│  ├─ pages/
│  ├─ types/
│  └─ App.tsx
├─ .env.example
└─ package.json
```

## Setup

1. Install frontend dependencies:

```bash
npm install
```

2. Install backend dependencies:

```bash
cd backend
npm install
```

3. Create environment files:

```bash
copy .env.example .env
cd backend
copy .env.example .env
```

4. Update the backend `.env` values for your MySQL instance and JWT secret.

5. Initialize the database:

```bash
cd backend
npm run init-db
```

## Run Locally

Start the backend:

```bash
cd backend
npm run dev
```

Start the frontend in a second terminal:

```bash
npm run dev
```

Default URLs:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000`

## Current Branch History

Recent implementation milestones on `feature/backend-part1`:

- `fix: align backend with POS domain model`
- `feat: connect frontend workflows to live POS API`
- `security: harden backend defaults and request validation`
- `chore: remove obsolete marketplace backend code`

## Security Notes

- The backend uses `helmet`, bounded body sizes, request validation, and auth rate limiting.
- The frontend currently uses a bearer token stored in browser storage for API access. That is acceptable for development, but an eventual production hardening step would be moving auth to secure httpOnly cookies with a CSRF strategy.
- A CSP meta policy is included in the frontend shell as a baseline defense-in-depth layer.
