# Architecture Overview

This project is split into two applications that do different jobs:

- a React frontend for day-to-day store operations
- an Express and MySQL backend that owns the business rules

That split matters because a POS system is not just a pretty catalog. The UI has to stay quick for staff, but the backend has to stay stubborn about stock, permissions, and sales records.

## High-level shape

The frontend lives in `src/`.

Its main job is to give staff a usable workspace for:

- signing in
- browsing products
- managing inventory
- building a cart
- completing checkout
- reviewing reports

The backend lives in `backend/src/`.

Its main job is to:

- authenticate staff
- enforce roles
- validate writes before they hit the database
- keep product and category data consistent
- create sales and update stock safely
- return reporting data back to the dashboard

## Frontend structure

The frontend is organized into a few predictable areas:

- `pages/` for route-level screens like login, dashboard, inventory, POS, reports, and users
- `components/` for reusable UI and POS-specific widgets
- `context/` for shared application state and actions
- `lib/api.ts` for HTTP requests to the backend
- `types/` for shared frontend type definitions

The important frontend idea is that most user actions eventually go through the app context and then through `lib/api.ts`, rather than each screen inventing its own data flow.

## Backend structure

The backend follows a conventional Express layout:

- `config/` for database setup and schema/bootstrap scripts
- `controllers/` for request handling and business logic
- `middleware/` for auth, security, validation, and request handling concerns
- `routes/` for API registration

Nothing fancy here, and that is a good thing. For this size of project, boring structure is better than clever structure.

## Main request flow

Most requests follow this path:

1. A frontend page or component triggers an action through `src/context/` or `src/lib/api.ts`.
2. Express receives the request and applies global middleware such as CORS, body limits, and security headers.
3. Route validators reject malformed input early.
4. Auth and role middleware decide whether the caller is allowed to continue.
5. A controller runs the business logic.
6. The controller reads from or writes to MySQL.
7. The frontend updates its local state from the JSON response.

In simple terms: the frontend asks, middleware guards the door, controllers do the work, and the database stores the truth.

## Data model

The schema in `backend/src/config/database.sql` is centered around:

- `users`
- `categories`
- `products`
- `sales`
- `sale_items`
- `stock_movements`

That model is sensible for a POS app because it separates:

- catalog data
- sales records
- inventory movement history

If everything were collapsed into one or two broad tables, the app would be easier to start but much harder to trust.

## Current strengths

- clear separation between cashier, manager, and admin responsibilities
- first-time setup flow for the initial admin instead of permanent open signup
- inventory-aware checkout logic
- stock movement tracking
- request validation on write routes
- rate limiting on authentication routes
- basic CI for frontend build and backend syntax checks

## Current gaps

The project is in better shape than a raw class submission, but it still has obvious next steps:

- no automated backend test suite yet
- no deployment setup yet
- frontend auth still uses a browser-stored bearer token for local development

Those are normal gaps for this stage. The important part is that the current structure leaves room to add them without tearing the project apart.
