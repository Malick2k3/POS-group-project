# DAUST Marketplace

A full-stack e-commerce platform built with modern web technologies. This project consists of a React frontend and Node.js backend with MySQL database.

## 🚀 Features

- User Authentication & Authorization
- Product Management
- Shopping Cart
- Order Processing
- Sales Management
- Category Management
- Admin Dashboard
- Real-time Updates
- Secure Payment Integration

## 🛠️ Tech Stack

### Frontend
- React.js
- TypeScript
- Tailwind CSS
- Vite
- React Router
- Axios

### Backend
- Node.js
- Express.js
- MySQL
- JWT Authentication
- Winston Logger
- Express Validator

## 📋 Prerequisites

- Node.js (>= 14.0.0)
- MySQL Server
- Git

## 🔧 Installation

1. Clone the repository:
```bash
git clone https://github.com/Malick2k3/POS-group-project.git
cd POS-group-project
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

4. Create a `.env` file in the backend directory with the following variables:
```env
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=daust_marketplace
JWT_SECRET=your_jwt_secret
PORT=3000
```

5. Initialize the database:
```bash
cd backend
npm run init-db
```

## 🚀 Running the Application

### Backend
```bash
cd backend
npm run dev
```

### Frontend
```bash
cd frontend
npm run dev
```

The backend will run on `http://localhost:3000` and the frontend on `http://localhost:5173`

## 📁 Project Structure

```
├── backend/
│   ├── src/
│   │   ├── config/         # Database and app configuration
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Custom middleware
│   │   ├── routes/         # API routes
│   │   └── server.js       # Entry point
│   ├── package.json
│   └── README.md
│
└── frontend/
    ├── src/
    │   ├── components/     # React components
    │   ├── pages/         # Page components
    │   ├── services/      # API services
    │   └── App.tsx        # Main component
    └── package.json
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Branch Naming Convention
- Feature branches: `feature/feature-name`
- Bug fixes: `fix/bug-name`
- Documentation: `docs/doc-name`

## 📝 API Documentation

### Authentication
- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - Login user
- GET `/api/auth/profile` - Get user profile

### Products
- GET `/api/products` - Get all products
- POST `/api/products` - Create new product
- GET `/api/products/:id` - Get product by ID
- PUT `/api/products/:id` - Update product
- DELETE `/api/products/:id` - Delete product

### Orders
- GET `/api/orders` - Get all orders
- POST `/api/orders` - Create new order
- GET `/api/orders/:id` - Get order by ID

## 🔐 Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=daust_marketplace
JWT_SECRET=your_jwt_secret
PORT=3000
```

## 📄 License

This project is licensed under the ISC License.

## 👥 Authors

- Malick2k3 - Initial work

## 🙏 Acknowledgments

- Thanks to all contributors who have helped shape this project
- Special thanks to the DAUST community for their support 
