# API Reference

Base URL: `http://localhost:3000/api`

This is a quick map of the API surface, not a full OpenAPI spec.

## Health

- `GET /health`
  - Purpose: quick service check

## Authentication

- `POST /auth/login`
  - Purpose: sign in with email and 4-digit PIN
- `POST /auth/register`
  - Purpose: create the very first store admin during initial setup
- `GET /auth/setup-status`
  - Purpose: tell the frontend whether first-time registration is still open
- `GET /auth/me`
  - Purpose: fetch the authenticated user

## Users

- `GET /users/profile`
  - Purpose: fetch the signed-in user profile
- `GET /users`
  - Purpose: list users
  - Access: admin
- `GET /users/:id`
  - Purpose: fetch a user by id
  - Access: admin
- `POST /users`
  - Purpose: create a staff account after store setup is complete
  - Access: admin
- `PUT /users/:id`
  - Purpose: update a user
  - Access: admin
- `DELETE /users/:id`
  - Purpose: delete a user
  - Access: admin

## Categories

- `GET /categories`
  - Purpose: list categories
- `POST /categories`
  - Purpose: create a category
  - Access: admin
- `PUT /categories/:id`
  - Purpose: update a category
  - Access: admin
- `DELETE /categories/:id`
  - Purpose: delete a category
  - Access: admin

## Products

- `GET /products`
  - Purpose: list products
- `GET /products/search`
  - Purpose: search products by text, category, or stock status
- `GET /products/:id`
  - Purpose: fetch a product by id
- `POST /products`
  - Purpose: create a product
  - Access: admin, manager
- `PUT /products/:id`
  - Purpose: update a product
  - Access: admin, manager
- `DELETE /products/:id`
  - Purpose: delete a product
  - Access: admin

## Sales

- `POST /sales`
  - Purpose: create a sale and update stock
  - Access: admin, manager, cashier
- `GET /sales`
  - Purpose: list sales
  - Access: admin, manager
- `GET /sales/report`
  - Purpose: fetch sales summary and top-product reporting data
  - Access: admin, manager
- `GET /sales/:id`
  - Purpose: fetch a sale with line items
  - Access: admin, manager

## Notes

- Protected routes expect `Authorization: Bearer <token>`.
- Write routes are validated before controller logic runs.
- Authentication routes are rate-limited.
- `POST /auth/register` is not a normal open signup route. It is only meant for first-time setup.
