import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { api } from '../lib/api';
import type { CartItem, Category, PaymentMethod, Product, Report, Sale, User, UserRole } from '../types';

interface ProductInput {
  name: string;
  price: number;
  categoryId?: string | null;
  description: string;
  imageUrl?: string;
  stockQuantity: number;
  barcode?: string;
  isActive?: boolean;
}

interface UserInput {
  name: string;
  email: string;
  role: UserRole;
  pin: string;
  isActive?: boolean;
}

interface AppContextProps {
  products: Product[];
  cart: CartItem[];
  sales: Sale[];
  users: User[];
  categories: Category[];
  reports: Report[];
  currentUser: User | null;
  darkMode: boolean;
  isInitializing: boolean;
  isLoading: boolean;
  authError: string | null;
  addProduct: (product: ProductInput) => Promise<Product>;
  updateProduct: (product: Product) => Promise<Product>;
  deleteProduct: (id: string) => Promise<void>;
  addToCart: (product: Product, quantity: number) => void;
  updateCartItem: (index: number, quantity: number) => void;
  removeFromCart: (index: number) => void;
  clearCart: () => void;
  checkout: (paymentMethod: PaymentMethod, customerName?: string) => Promise<Sale | null>;
  login: (email: string, pin: string) => Promise<boolean>;
  register: (name: string, email: string, pin: string) => Promise<boolean>;
  logout: () => void;
  createUser: (user: UserInput) => Promise<User>;
  updateUser: (id: string, user: UserInput) => Promise<User>;
  deleteUserById: (id: string) => Promise<void>;
  generateReport: (
    title: string,
    type: 'sales' | 'inventory' | 'employee',
    dateRange: { start: string; end: string }
  ) => Promise<Report | null>;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

function canViewSales(user: User | null) {
  return user?.role === 'admin' || user?.role === 'manager';
}

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const darkMode = false;

  async function loadReferenceData(user: User) {
    const [nextProducts, nextCategories] = await Promise.all([
      api.getProducts(),
      api.getCategories()
    ]);

    setProducts(nextProducts);
    setCategories(nextCategories);

    if (canViewSales(user)) {
      const nextSales = await api.getSales();
      setSales(nextSales);
    } else {
      setSales([]);
    }

    if (user.role === 'admin') {
      const nextUsers = await api.getUsers();
      setUsers(nextUsers);
    } else {
      setUsers([]);
    }
  }

  useEffect(() => {
    async function bootstrap() {
      if (!api.getStoredToken()) {
        setIsInitializing(false);
        return;
      }

      try {
        const user = await api.getCurrentUser();
        setCurrentUser(user);
        await loadReferenceData(user);
      } catch (error) {
        console.error('Bootstrap error:', error);
        api.clearStoredToken();
        setCurrentUser(null);
      } finally {
        setIsInitializing(false);
      }
    }

    bootstrap();
  }, []);

  const addProduct = async (productData: ProductInput) => {
    const createdProduct = await api.createProduct(productData);
    setProducts((currentProducts) => [createdProduct, ...currentProducts]);
    return createdProduct;
  };

  const updateProduct = async (product: Product) => {
    const updatedProduct = await api.updateProduct(product.id, {
      name: product.name,
      description: product.description,
      price: product.price,
      stockQuantity: product.stockQuantity,
      categoryId: product.categoryId,
      barcode: product.barcode,
      imageUrl: product.imageUrl,
      isActive: product.isActive
    });

    setProducts((currentProducts) =>
      currentProducts.map((item) => (item.id === updatedProduct.id ? updatedProduct : item))
    );

    return updatedProduct;
  };

  const deleteProduct = async (id: string) => {
    await api.deleteProduct(id);
    setProducts((currentProducts) => currentProducts.filter((product) => product.id !== id));
  };

  const addToCart = (product: Product, quantity: number) => {
    setCart((currentCart) => {
      const existingItemIndex = currentCart.findIndex((item) => item.product.id === product.id);

      if (existingItemIndex === -1) {
        return [...currentCart, { product, quantity }];
      }

      return currentCart.map((item, index) =>
        index === existingItemIndex
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    });
  };

  const updateCartItem = (index: number, quantity: number) => {
    setCart((currentCart) => {
      if (quantity <= 0) {
        return currentCart.filter((_, itemIndex) => itemIndex !== index);
      }

      return currentCart.map((item, itemIndex) =>
        itemIndex === index ? { ...item, quantity } : item
      );
    });
  };

  const removeFromCart = (index: number) => {
    setCart((currentCart) => currentCart.filter((_, itemIndex) => itemIndex !== index));
  };

  const clearCart = () => {
    setCart([]);
  };

  const checkout = async (paymentMethod: PaymentMethod, customerName?: string) => {
    if (cart.length === 0 || !currentUser) {
      return null;
    }

    const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const tax = Number((subtotal * 0.08).toFixed(2));
    const createdSale = await api.createSale({
      items: cart.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity
      })),
      paymentMethod,
      customerName,
      tax,
      discount: 0
    });

    const sale: Sale = {
      ...createdSale,
      items: cart
    };

    setSales((currentSales) => [sale, ...currentSales]);
    clearCart();

    const refreshedProducts = await api.getProducts();
    setProducts(refreshedProducts);

    return sale;
  };

  const login = async (email: string, pin: string) => {
    setIsLoading(true);
    setAuthError(null);

    try {
      const user = await api.login(email, pin);
      setCurrentUser(user);
      await loadReferenceData(user);
      return true;
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Unable to log in');
      return false;
    } finally {
      setIsLoading(false);
      setIsInitializing(false);
    }
  };

  const register = async (name: string, email: string, pin: string) => {
    setIsLoading(true);
    setAuthError(null);

    try {
      const user = await api.register(name, email, pin);
      setCurrentUser(user);
      await loadReferenceData(user);
      return true;
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Unable to register');
      return false;
    } finally {
      setIsLoading(false);
      setIsInitializing(false);
    }
  };

  const logout = () => {
    api.clearStoredToken();
    setCurrentUser(null);
    setProducts([]);
    setCart([]);
    setSales([]);
    setUsers([]);
    setCategories([]);
    setReports([]);
    setAuthError(null);
  };

  const createUser = async (user: UserInput) => {
    const createdUser = await api.createUser(user);
    setUsers((currentUsers) => [...currentUsers, createdUser]);
    return createdUser;
  };

  const updateUserById = async (id: string, user: UserInput) => {
    const updatedUser = await api.updateUser(id, user);
    setUsers((currentUsers) =>
      currentUsers.map((currentUserItem) => (currentUserItem.id === id ? updatedUser : currentUserItem))
    );

    if (currentUser?.id === id) {
      setCurrentUser(updatedUser);
    }

    return updatedUser;
  };

  const deleteUserById = async (id: string) => {
    await api.deleteUser(id);
    setUsers((currentUsers) => currentUsers.filter((user) => user.id !== id));
  };

  const generateReport = async (
    title: string,
    type: 'sales' | 'inventory' | 'employee',
    dateRange: { start: string; end: string }
  ) => {
    if (type !== 'sales' || !canViewSales(currentUser)) {
      return null;
    }

    const report = await api.getSalesReport(dateRange);
    const titledReport = {
      ...report,
      title,
      type
    };

    setReports((currentReports) => [titledReport, ...currentReports.filter((item) => item.title !== title)]);
    return titledReport;
  };

  const value: AppContextProps = {
    products,
    cart,
    sales,
    users,
    categories,
    reports,
    currentUser,
    darkMode,
    isInitializing,
    isLoading,
    authError,
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
    createUser,
    updateUser: updateUserById,
    deleteUserById,
    generateReport
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export function useAppContext() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('useAppContext must be used inside AppProvider');
  }

  return context;
}
