# Architecture Overview

## System Shape

Modern POS Platform is split into two main applications:

- a React frontend used by store staff
- an Express and MySQL backend that owns business rules and persistence

This is a conventional full-stack retail setup: the frontend handles user interaction, while the backend controls authentication, validation, stock updates, and sales records.

## Frontend Responsibilities

The frontend lives in `src/` and is organized around:

- `pages/` for route-level screens such as login, dashboard, inventory, POS, reports, and users
- `components/` for reusable UI and POS-specific widgets
- `context/` for shared application state and actions
- `lib/api.ts` for HTTP communication with the backend
- `utils/` for exports and formatting helpers

### Main frontend flows

- Authentication and current user bootstrap
- Product browsing and inventory management
- Cart building and checkout
- Sales reporting and export

## Backend Responsibilities

The backend lives in `backend/src/` and follows a conventional Express structure:

- `config/` for database setup and schema initialization
- `controllers/` for request handlers and business logic
- `middleware/` for auth, security, and validation
- `routes/` for API route registration

### Main backend flows

- Issue JWTs after PIN-based login
- Enforce role-based access on protected routes
- Validate write requests before controller execution
- Persist products, users, categories, sales, and stock movements
- Build sales summary and top-product reports

## Data Model

The schema in `backend/src/config/database.sql` centers around:

- `users`
- `categories`
- `products`
- `sales`
- `sale_items`
- `stock_movements`

This is a sensible retail domain model because stock changes and sales are tracked separately instead of being collapsed into a single flat table.

## Request Lifecycle

1. The frontend sends requests through `src/lib/api.ts`.
2. Express applies security middleware, body limits, and CORS rules.
3. Route validators reject malformed input before it reaches controllers.
4. Auth middleware verifies JWTs and role middleware checks permissions.
5. Controllers run business logic and persist data through MySQL.
6. Responses are returned as JSON to update the dashboard state.

## Current Strengths

- Clear role separation between admin, manager, and cashier actions
- Inventory-aware checkout flow
- Stock movement tracking
- Practical report endpoints
- Validation and rate limiting already present

## Current Gaps

- No automated test suite yet
- No containerized local setup yet
- No CI pipeline yet
- Auth storage is still frontend bearer-token based

Those gaps are normal for a student project, but they are the next layer needed to make the repository feel production-minded.
