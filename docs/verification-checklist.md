# Verification Checklist

Use this checklist after setup or before sharing the project.

## Backend

- Install backend dependencies successfully.
- Create `backend/.env` from `backend/.env.example`.
- Run `npm run init-db --prefix backend`.
- Start the API with `npm run dev --prefix backend`.
- Confirm `GET /api/health` returns a success response.
- Confirm `GET /api-docs` returns the API index.

## Authentication

- Log in with the seeded default admin account.
- Confirm invalid credentials are rejected.
- Confirm protected routes reject missing tokens.

## Inventory and Catalog

- Create a new category.
- Create a new product.
- Edit a product and verify the change appears in the UI.

## Checkout

- Add at least one product to the cart.
- Complete a checkout flow.
- Confirm stock quantity decreases after the sale.
- Confirm the sale appears in the sales list.

## Reporting

- Open the reports page.
- Load a date range.
- Confirm summary cards and charts render.
- Export at least one report to Excel.

## Final Sanity Check

- Run the frontend without console-breaking errors.
- Confirm the backend logs requests and errors cleanly.
- Remove local secrets before pushing changes.
