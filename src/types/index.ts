export type UserRole = 'admin' | 'manager' | 'cashier';
export type PaymentMethod = 'cash' | 'credit' | 'debit' | 'mobile';

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  categoryId?: string | null;
  categoryColor?: string;
  description: string;
  imageUrl?: string;
  stockQuantity: number;
  barcode?: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  notes?: string;
}

export interface Sale {
  id: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  cashierId: string;
  cashierName?: string;
  customerName?: string;
  createdAt: string;
  status?: 'completed' | 'refunded' | 'voided';
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  description?: string;
}

export interface SalesReportSummary {
  saleDate: string;
  paymentMethod: PaymentMethod;
  totalSales: number;
  totalRevenue: number;
}

export interface SalesReportTopProduct {
  id: string;
  name: string;
  barcode?: string;
  totalQuantity: number;
  totalRevenue: number;
}

export interface Report {
  id: string;
  title: string;
  type: 'sales' | 'inventory' | 'employee';
  dateRange: {
    start: string;
    end: string;
  };
  data: {
    summary: SalesReportSummary[];
    topProducts: SalesReportTopProduct[];
  };
  createdAt: string;
}
