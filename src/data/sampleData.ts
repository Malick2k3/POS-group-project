import { formatISO, subDays } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { Product, User, Category } from '../types';

export const sampleCategories: Category[] = [
  { id: 'cat1', name: 'Electronics', color: '#3b82f6' },
  { id: 'cat2', name: 'Clothing', color: '#10b981' },
  { id: 'cat3', name: 'Food & Beverages', color: '#f59e0b' },
  { id: 'cat4', name: 'Home & Kitchen', color: '#8b5cf6' },
  { id: 'cat5', name: 'Beauty & Health', color: '#ec4899' },
];

export const sampleProducts: Product[] = [
  {
    id: uuidv4(),
    name: 'Wireless Headphones',
    price: 79.99,
    category: 'Electronics',
    description: 'Premium wireless headphones with noise cancellation',
    imageUrl: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg',
    stockQuantity: 25,
    barcode: '123456789',
    createdAt: formatISO(subDays(new Date(), 30)),
    updatedAt: formatISO(subDays(new Date(), 15)),
  },
  {
    id: uuidv4(),
    name: 'Coffee Mug',
    price: 12.99,
    category: 'Home & Kitchen',
    description: 'Ceramic coffee mug, 12oz capacity',
    imageUrl: 'https://images.pexels.com/photos/3690740/pexels-photo-3690740.jpeg',
    stockQuantity: 50,
    barcode: '234567890',
    createdAt: formatISO(subDays(new Date(), 25)),
    updatedAt: formatISO(subDays(new Date(), 25)),
  },
  {
    id: uuidv4(),
    name: 'Cotton T-Shirt',
    price: 19.99,
    category: 'Clothing',
    description: '100% cotton t-shirt, available in multiple colors',
    imageUrl: 'https://images.pexels.com/photos/5384423/pexels-photo-5384423.jpeg',
    stockQuantity: 100,
    barcode: '345678901',
    createdAt: formatISO(subDays(new Date(), 20)),
    updatedAt: formatISO(subDays(new Date(), 10)),
  },
  {
    id: uuidv4(),
    name: 'Smartphone',
    price: 699.99,
    category: 'Electronics',
    description: 'Latest model smartphone with 128GB storage',
    imageUrl: 'https://images.pexels.com/photos/1786433/pexels-photo-1786433.jpeg',
    stockQuantity: 15,
    barcode: '456789012',
    createdAt: formatISO(subDays(new Date(), 15)),
    updatedAt: formatISO(subDays(new Date(), 5)),
  },
  {
    id: uuidv4(),
    name: 'Chocolate Bar',
    price: 3.99,
    category: 'Food & Beverages',
    description: 'Premium dark chocolate bar, 70% cocoa',
    imageUrl: 'https://images.pexels.com/photos/65882/chocolate-dark-coffee-confiserie-65882.jpeg',
    stockQuantity: 200,
    barcode: '567890123',
    createdAt: formatISO(subDays(new Date(), 10)),
    updatedAt: formatISO(subDays(new Date(), 5)),
  },
  {
    id: uuidv4(),
    name: 'Face Moisturizer',
    price: 24.99,
    category: 'Beauty & Health',
    description: 'Hydrating face moisturizer for all skin types',
    imageUrl: 'https://images.pexels.com/photos/3321416/pexels-photo-3321416.jpeg',
    stockQuantity: 30,
    barcode: '678901234',
    createdAt: formatISO(subDays(new Date(), 5)),
    updatedAt: formatISO(subDays(new Date(), 2)),
  },
];

export const sampleUsers: User[] = [
  {
    id: uuidv4(),
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    isActive: true,
  },
  {
    id: uuidv4(),
    name: 'Cashier 1',
    email: 'cashier1@example.com',
    role: 'cashier',
    isActive: true,
  },
];
