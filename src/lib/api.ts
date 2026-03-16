import type {
  Category,
  PaymentMethod,
  Product,
  Report,
  Sale,
  SalesReportSummary,
  SalesReportTopProduct,
  User,
  UserRole
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const TOKEN_STORAGE_KEY = 'modern-pos-token';

interface ApiUser {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

interface ApiCategory {
  id: string;
  name: string;
  color: string;
  description?: string | null;
}

interface ApiProduct {
  id: string;
  name: string;
  description?: string | null;
  price: number | string;
  stock_quantity: number | string;
  category_id?: string | null;
  category_name?: string | null;
  category_color?: string | null;
  barcode?: string | null;
  image_url?: string | null;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}

interface ApiSale {
  id: string;
  subtotal: number | string;
  tax: number | string;
  discount: number | string;
  total_amount: number | string;
  payment_method: PaymentMethod;
  cashier_id: string;
  cashier_name?: string | null;
  customer_name?: string | null;
  created_at: string;
  status?: 'completed' | 'refunded' | 'voided';
}

interface ApiSaleItem {
  product_id: string;
  product_name?: string;
  quantity: number | string;
  unit_price?: number | string;
}

interface AuthResponse {
  token: string;
  user: ApiUser;
}

interface SalesReportResponse {
  summary: Array<{
    sale_date: string;
    payment_method: PaymentMethod;
    total_sales: number | string;
    total_revenue: number | string;
  }>;
  top_products: Array<{
    id: string;
    name: string;
    barcode?: string | null;
    total_quantity: number | string;
    total_revenue: number | string;
  }>;
}

function getStoredToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

function setStoredToken(token: string) {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

function clearStoredToken() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

function mapUser(user: ApiUser): User {
  return {
    id: user.id,
    name: user.full_name,
    email: user.email,
    role: user.role,
    isActive: Boolean(user.is_active),
    createdAt: user.created_at,
    updatedAt: user.updated_at
  };
}

function mapCategory(category: ApiCategory): Category {
  return {
    id: category.id,
    name: category.name,
    color: category.color,
    description: category.description || undefined
  };
}

function mapProduct(product: ApiProduct): Product {
  return {
    id: product.id,
    name: product.name,
    description: product.description || '',
    price: Number(product.price),
    stockQuantity: Number(product.stock_quantity),
    category: product.category_name || 'Uncategorized',
    categoryId: product.category_id || null,
    categoryColor: product.category_color || undefined,
    barcode: product.barcode || undefined,
    imageUrl: product.image_url || undefined,
    isActive: product.is_active,
    createdAt: product.created_at,
    updatedAt: product.updated_at
  };
}

function mapSale(sale: ApiSale, items: ApiSaleItem[] = []): Sale {
  return {
    id: sale.id,
    items: items.map((item) => ({
      quantity: Number(item.quantity),
      product: {
        id: item.product_id,
        name: item.product_name || 'Product',
        description: '',
        price: Number(item.unit_price || 0),
        stockQuantity: 0,
        category: 'Unknown',
        createdAt: sale.created_at,
        updatedAt: sale.created_at
      }
    })),
    subtotal: Number(sale.subtotal),
    tax: Number(sale.tax),
    discount: Number(sale.discount),
    total: Number(sale.total_amount),
    paymentMethod: sale.payment_method,
    cashierId: sale.cashier_id,
    cashierName: sale.cashier_name || undefined,
    customerName: sale.customer_name || undefined,
    createdAt: sale.created_at,
    status: sale.status
  };
}

function mapSalesReport(title: string, dateRange: { start: string; end: string }, report: SalesReportResponse): Report {
  const summary: SalesReportSummary[] = report.summary.map((entry) => ({
    saleDate: entry.sale_date,
    paymentMethod: entry.payment_method,
    totalSales: Number(entry.total_sales),
    totalRevenue: Number(entry.total_revenue)
  }));

  const topProducts: SalesReportTopProduct[] = report.top_products.map((entry) => ({
    id: entry.id,
    name: entry.name,
    barcode: entry.barcode || undefined,
    totalQuantity: Number(entry.total_quantity),
    totalRevenue: Number(entry.total_revenue)
  }));

  return {
    id: globalThis.crypto?.randomUUID?.() || `${Date.now()}`,
    title,
    type: 'sales',
    dateRange,
    data: {
      summary,
      topProducts
    },
    createdAt: new Date().toISOString()
  };
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');

  if (!(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data as T;
}

export const api = {
  getStoredToken,
  clearStoredToken,
  async login(email: string, pin: string) {
    const response = await request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, pin })
    });

    setStoredToken(response.token);
    return mapUser(response.user);
  },
  async register(fullName: string, email: string, pin: string) {
    const response = await request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        full_name: fullName,
        email,
        pin,
        role: 'cashier'
      })
    });

    setStoredToken(response.token);
    return mapUser(response.user);
  },
  async getCurrentUser() {
    const user = await request<ApiUser>('/auth/me');
    return mapUser(user);
  },
  async getProducts() {
    const products = await request<ApiProduct[]>('/products');
    return products.map(mapProduct);
  },
  async getCategories() {
    const categories = await request<ApiCategory[]>('/categories');
    return categories.map(mapCategory);
  },
  async getUsers() {
    const users = await request<ApiUser[]>('/users');
    return users.map(mapUser);
  },
  async getSales() {
    const sales = await request<ApiSale[]>('/sales');
    return sales.map((sale) => mapSale(sale));
  },
  async createProduct(product: {
    name: string;
    description: string;
    price: number;
    stockQuantity: number;
    categoryId?: string | null;
    barcode?: string;
    imageUrl?: string;
  }) {
    const created = await request<ApiProduct>('/products', {
      method: 'POST',
      body: JSON.stringify({
        name: product.name,
        description: product.description,
        price: product.price,
        stock_quantity: product.stockQuantity,
        category_id: product.categoryId || null,
        barcode: product.barcode || null,
        image_url: product.imageUrl || null
      })
    });

    return mapProduct(created);
  },
  async updateProduct(id: string, product: {
    name: string;
    description: string;
    price: number;
    stockQuantity: number;
    categoryId?: string | null;
    barcode?: string;
    imageUrl?: string;
    isActive?: boolean;
  }) {
    const updated = await request<ApiProduct>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        name: product.name,
        description: product.description,
        price: product.price,
        stock_quantity: product.stockQuantity,
        category_id: product.categoryId || null,
        barcode: product.barcode || null,
        image_url: product.imageUrl || null,
        is_active: product.isActive
      })
    });

    return mapProduct(updated);
  },
  async deleteProduct(id: string) {
    await request<void>(`/products/${id}`, { method: 'DELETE' });
  },
  async createSale(input: {
    items: Array<{ productId: string; quantity: number }>;
    paymentMethod: PaymentMethod;
    customerName?: string;
    tax: number;
    discount: number;
  }) {
    const created = await request<ApiSale>('/sales', {
      method: 'POST',
      body: JSON.stringify({
        items: input.items.map((item) => ({
          product_id: item.productId,
          quantity: item.quantity
        })),
        payment_method: input.paymentMethod,
        customer_name: input.customerName,
        tax: input.tax,
        discount: input.discount
      })
    });

    return mapSale(created);
  },
  async createUser(user: { name: string; email: string; pin: string; role: UserRole }) {
    const created = await request<ApiUser>('/users', {
      method: 'POST',
      body: JSON.stringify({
        full_name: user.name,
        email: user.email,
        pin: user.pin,
        role: user.role
      })
    });

    return mapUser(created);
  },
  async updateUser(id: string, user: { name: string; email: string; pin?: string; role: UserRole; isActive?: boolean }) {
    const updated = await request<ApiUser>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        full_name: user.name,
        email: user.email,
        pin: user.pin,
        role: user.role,
        is_active: user.isActive
      })
    });

    return mapUser(updated);
  },
  async deleteUser(id: string) {
    await request<void>(`/users/${id}`, { method: 'DELETE' });
  },
  async getSalesReport(dateRange: { start: string; end: string }) {
    const report = await request<SalesReportResponse>(
      `/sales/report?start_date=${encodeURIComponent(dateRange.start)}&end_date=${encodeURIComponent(dateRange.end)}`
    );

    return mapSalesReport('Sales report', dateRange, report);
  }
};
