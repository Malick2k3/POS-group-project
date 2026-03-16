CREATE DATABASE IF NOT EXISTS modern_pos;
USE modern_pos;

CREATE TABLE IF NOT EXISTS users (
    id CHAR(36) PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    pin_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'manager', 'cashier') NOT NULL DEFAULT 'cashier',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    color VARCHAR(20) NOT NULL DEFAULT '#3b82f6',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 0,
    category_id CHAR(36),
    barcode VARCHAR(64) UNIQUE,
    image_url VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by CHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS sales (
    id CHAR(36) PRIMARY KEY,
    cashier_id CHAR(36) NOT NULL,
    customer_name VARCHAR(120),
    subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
    tax DECIMAL(10, 2) NOT NULL DEFAULT 0,
    discount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_method ENUM('cash', 'credit', 'debit', 'mobile') NOT NULL,
    status ENUM('completed', 'refunded', 'voided') NOT NULL DEFAULT 'completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cashier_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS sale_items (
    id CHAR(36) PRIMARY KEY,
    sale_id CHAR(36) NOT NULL,
    product_id CHAR(36) NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS stock_movements (
    id CHAR(36) PRIMARY KEY,
    product_id CHAR(36) NOT NULL,
    quantity INT NOT NULL,
    movement_type ENUM('in', 'out') NOT NULL,
    reference_type ENUM('restock', 'sale', 'adjustment') NOT NULL,
    reference_id CHAR(36),
    user_id CHAR(36),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

INSERT INTO categories (id, name, color, description)
SELECT 'cat-electronics', 'Electronics', '#3b82f6', 'Devices and accessories'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE id = 'cat-electronics');

INSERT INTO categories (id, name, color, description)
SELECT 'cat-clothing', 'Clothing', '#10b981', 'Wearables and apparel'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE id = 'cat-clothing');

INSERT INTO categories (id, name, color, description)
SELECT 'cat-food', 'Food & Beverages', '#f59e0b', 'Consumable goods'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE id = 'cat-food');

INSERT INTO categories (id, name, color, description)
SELECT 'cat-home', 'Home & Kitchen', '#8b5cf6', 'Home and kitchen items'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE id = 'cat-home');
