# Modern POS Backend

This backend powers a retail point-of-sale system focused on checkout, inventory, team accounts, and sales reporting. Think of it like the shop's engine room: the frontend is what staff sees, and this API is what keeps products, users, and transactions consistent behind the counter.

## What It Handles

- Staff authentication with `email + 4-digit PIN`
- Role-based access for `admin`, `manager`, and `cashier`
- Product and category management
- Stock tracking and stock movement history
- Sales creation with line items
- Sales reporting for managers and admins

## Stack

- Node.js
- Express
- MySQL
- JWT
- Winston

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create an environment file:

```bash
copy .env.example .env
```

3. Update the database values in `.env`.

4. Initialize the database schema and default admin account:

```bash
npm run init-db
```

5. Start the API:

```bash
npm run dev
```

## Environment Variables

- `PORT`
- `NODE_ENV`
- `CORS_ORIGIN`
- `JWT_SECRET`
- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `DEFAULT_ADMIN_NAME`
- `DEFAULT_ADMIN_EMAIL`
- `DEFAULT_ADMIN_PIN`

## Default API Surface

- `POST /api/auth/login`
- `POST /api/auth/register`
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

- The backend is modeled for a POS workflow, not a marketplace.
- PINs are stored as hashes, not plain text.
- Category and product records use UUIDs so data stays stable across environments.
