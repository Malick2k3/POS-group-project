export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  imageUrl?: string;
  stockQuantity: number;
  barcode?: string;
  audio?: string;
  transcription?: string;
  transcriptionSalesCount?: number;
  createdAt: string;
  updatedAt: string;
  audioNotes?: {
    timestamp: string;
    content: string;
  }[];
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
  customerName?: string;
  createdAt: string;
  audioNotes?: string;
  transcription?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'cashier';
  pin: string;
}

export type PaymentMethod = 'cash' | 'credit' | 'debit' | 'mobile';

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface Report {
  id: string;
  title: string;
  type: 'sales' | 'inventory' | 'employee';
  dateRange: {
    start: string;
    end: string;
  };
  data: any;
  createdAt: string;
}