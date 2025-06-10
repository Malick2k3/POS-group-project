import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Product, CartItem, Sale, User, Category, Report, PaymentMethod } from '../types';
import { formatISO } from 'date-fns';
import { sampleProducts, sampleUsers, sampleCategories } from '../data/sampleData';

interface AppContextProps {
  products: Product[];
  cart: CartItem[];
  sales: Sale[];
  users: User[];
  categories: Category[];
  reports: Report[];
  currentUser: User | null;


  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  
  addToCart: (product: Product, quantity: number) => void;
  updateCartItem: (index: number, quantity: number) => void;
  removeFromCart: (index: number) => void;
  clearCart: () => void;
  
  checkout: (paymentMethod: PaymentMethod, customerName?: string) => void;
  
  login: (email: string, pin: string) => boolean;
  register: (name: string, email: string, pin: string) => boolean;
  logout: () => void;
  
  generateReport: (title: string, type: 'sales' | 'inventory' | 'employee', dateRange: { start: string; end: string }, data: any) => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('pos-products');
    return saved ? JSON.parse(saved) : sampleProducts;
  });
  
  const [cart, setCart] = useState<CartItem[]>([]); // Fixed syntax error here
  
  const [sales, setSales] = useState<Sale[]>(() => {
    const saved = localStorage.getItem('pos-sales');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('pos-users');
    return saved ? JSON.parse(saved) : sampleUsers;
  });
  
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('pos-categories');
    return saved ? JSON.parse(saved) : sampleCategories;
  });
  
  const [reports, setReports] = useState<Report[]>(() => {
    const saved = localStorage.getItem('pos-reports');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  useEffect(() => {
    localStorage.setItem('pos-products', JSON.stringify(products));
    localStorage.setItem('pos-sales', JSON.stringify(sales));
    localStorage.setItem('pos-users', JSON.stringify(users));
    localStorage.setItem('pos-categories', JSON.stringify(categories));
    localStorage.setItem('pos-reports', JSON.stringify(reports));
  }, [products, sales, users, categories, reports]);
  
  const addProduct = (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProduct: Product = {
      ...productData,
      id: uuidv4(),
      createdAt: formatISO(new Date()),
      updatedAt: formatISO(new Date()),
    };
    
    setProducts([...products, newProduct]);
  };
  
  const updateProduct = (updatedProduct: Product) => {
    setProducts(products.map(product => 
      product.id === updatedProduct.id 
        ? { ...updatedProduct, updatedAt: formatISO(new Date()) } 
        : product
    ));
  };
  
  const deleteProduct = (id: string) => {
    setProducts(products.filter(product => product.id !== id));
  };
  
  const addToCart = (product: Product, quantity: number) => {
    const existingItemIndex = cart.findIndex(item => item.product.id === product.id);
    
    if (existingItemIndex !== -1) {
      const newCart = [...cart];
      newCart[existingItemIndex].quantity += quantity;
      setCart(newCart);
    } else {
      setCart([...cart, { product, quantity }]);
    }
  };
  
  const updateCartItem = (index: number, quantity: number) => {
    const newCart = [...cart];
    if (quantity <= 0) {
      newCart.splice(index, 1);
    } else {
      newCart[index].quantity = quantity;
    }
    setCart(newCart);
  };
  
  const removeFromCart = (index: number) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };
  
  const clearCart = () => {
    setCart([]);
  };
  
  const calculateCartTotals = () => {
    const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const tax = subtotal * 0.08;
    const total = subtotal + tax;
    
    return { subtotal, tax, total };
  };
  
  const checkout = (paymentMethod: PaymentMethod, customerName?: string) => {
    if (cart.length === 0 || !currentUser) return;
    
    const { subtotal, tax, total } = calculateCartTotals();
    
    const newSale: Sale = {
      id: uuidv4(),
      items: [...cart],
      subtotal,
      tax,
      discount: 0,
      total,
      paymentMethod,
      cashierId: currentUser.id,
      customerName,
      createdAt: formatISO(new Date()),
    };
    
    cart.forEach(item => {
      const product = products.find(p => p.id === item.product.id);
      if (product) {
        const updatedProduct = { 
          ...product, 
          stockQuantity: product.stockQuantity - item.quantity,
          updatedAt: formatISO(new Date())
        };
        updateProduct(updatedProduct);
      }
    });
    
    setSales([...sales, newSale]);
    clearCart();
    return newSale;
  };
  
  const login = (email: string, pin: string): boolean => {
    const user = users.find(u => u.email === email && u.pin === pin);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };
  
  const register = (name: string, email: string, pin: string): boolean => {
    if (users.some(u => u.email === email)) {
      return false;
    }
    
    const newUser: User = {
      id: uuidv4(),
      name,
      email,
      pin,
      role: 'cashier',
    };
    
    setUsers([...users, newUser]);
    return true;
  };
  const logout = () => {
    setCurrentUser(null);
  };
  
  const generateReport = (
    title: string, 
    type: 'sales' | 'inventory' | 'employee', 
    dateRange: { start: string; end: string }, 
    data: any
  ) => {
    const newReport: Report = {
      id: uuidv4(),
      title,
      type,
      dateRange,
      data,
      createdAt: formatISO(new Date()),
    };
    
    setReports([...reports, newReport]);
    return newReport;
  };
  
  const contextValue: AppContextProps = {
    products,
    cart,
    sales,
    users,
    categories,
    reports,
    currentUser,
    
    addProduct,
    updateProduct,
    deleteProduct,
    
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    
    checkout,
    
    login,
    register,
    logout,
    
    generateReport,
  };
  
  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};