# DAUST Marketplace Backend

A robust Node.js backend for the DAUST Marketplace application, featuring user authentication, product management, order processing, and shopping cart functionality.

## Features

- 🔐 **Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (User, Seller, Admin)
  - Secure password hashing

- 🛍️ **Product Management**
  - CRUD operations for products
  - Category support
  - Stock management
  - Seller-specific product control

- 🛒 **Shopping Cart**
  - Add/remove items
  - Update quantities
  - Cart total calculation
  - Stock validation

- 📦 **Order System**
  - Order creation with transaction support
  - Order status management
  - Order history and details
  - Stock updates on order

## Tech Stack

- Node.js
- Express.js
- MySQL
- JWT for authentication
- Winston for logging
- Express Validator for input validation

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v8 or higher)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/daust-marketplace-backend.git
cd daust-marketplace-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=daust_marketplace
JWT_SECRET=your_jwt_secret
PORT=3000
NODE_ENV=development
```

4. Initialize the database:
```bash
npm run init-db
```

5. Start the development server:
```bash
npm run dev
```

## API Documentation

### Authentication Endpoints
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login user
- `GET /api/users/profile` - Get user profile (requires auth)

### Product Endpoints
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create new product (requires seller auth)
- `PUT /api/products/:id` - Update product (requires seller auth)
- `DELETE /api/products/:id` - Delete product (requires seller auth)

### Cart Endpoints
- `POST /api/cart/add` - Add item to cart (requires auth)
- `GET /api/cart` - Get cart items (requires auth)
- `PUT /api/cart/items/:product_id` - Update cart item quantity (requires auth)
- `DELETE /api/cart/items/:product_id` - Remove item from cart (requires auth)
- `DELETE /api/cart/clear` - Clear cart (requires auth)

### Order Endpoints
- `POST /api/orders` - Create new order (requires auth)
- `GET /api/orders/my-orders` - Get user orders (requires auth)
- `GET /api/orders/:id` - Get order details (requires auth)
- `PATCH /api/orders/:id/status` - Update order status (requires seller/admin auth)

## Development

```bash
# Run in development mode
npm run dev

# Run in production mode
npm start
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License. 