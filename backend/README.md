# Modern POS Backend

This backend is the part of the project that keeps the POS workflow honest.

The frontend is what staff sees. This API is what decides whether a login is valid, whether a user is allowed to do something, whether a product exists, and whether a sale should change stock.

If the frontend is the counter, this backend is the part keeping the books straight.

## What it handles

- first-time store admin setup
- staff login with email and 4-digit PIN
- role-based access for `admin`, `manager`, and `cashier`
- product and category management
- stock tracking and stock movement history
- sales creation with line items
- sales reporting for managers and admins

## Stack

- Node.js
- Express
- MySQL
- JWT
- Helmet
- Express Validator
- Express Rate Limit
- Winston

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create an environment file

```bash
copy .env.example .env
```

### 3. Fill in the backend values

At minimum, update:

- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `JWT_SECRET`

You can also change the default seeded admin values if you want.

### 4. Initialize the database

```bash
npm run init-db
```

### 5. Start the API

```bash
npm run dev
```

## Local verification

Once the API is running, the quickest useful checks are:

- `GET /` returns service metadata
- `GET /api/health` responds successfully
- `GET /api-docs` returns the API index
- `POST /api/auth/login` works with the seeded admin account

## Environment variables

- `PORT`
- `NODE_ENV`
- `CORS_ORIGIN`
- `JWT_SECRET`
- `AUTH_RATE_LIMIT_WINDOW_MS`
- `AUTH_RATE_LIMIT_MAX`
- `JSON_BODY_LIMIT`
- `URLENCODED_BODY_LIMIT`
- `URLENCODED_PARAMETER_LIMIT`
- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `DEFAULT_ADMIN_NAME`
- `DEFAULT_ADMIN_EMAIL`
- `DEFAULT_ADMIN_PIN`

## Main routes

- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/setup-status`
- `GET /api/auth/me`
- `GET /api/users/profile`
- `GET /api/users`
- `POST /api/users`
- `GET /api/products`
- `POST /api/products`
- `GET /api/categories`
- `POST /api/categories`
- `POST /api/sales`
- `GET /api/sales/report`

## Notes

- `POST /api/auth/register` is intentionally limited to first-time setup. After the first admin exists, staff accounts should be created through the admin flow.
- PINs are stored as hashes, not plain text.
- Category and product records use UUIDs.
- Auth routes are rate-limited and write routes are validated before reaching controllers.
- The bootstrap script creates the schema and seeds a default admin only if one does not already exist.

## Current gaps

- no automated backend tests yet
- no deployment setup yet
- local development still assumes a separately running MySQL instance

That is acceptable for this stage, but those are the next obvious upgrades if the project needs to look more production-minded.
