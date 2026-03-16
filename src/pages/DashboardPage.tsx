import React from 'react';
import { CreditCard, Package, TrendingUp, Clock, DollarSign } from 'lucide-react';
import Card from '../components/ui/Card';
import { useAppContext } from '../context/AppContext';
import { formatCurrency } from '../utils/formatters';
import { formatDistanceToNow } from 'date-fns';

const DashboardPage: React.FC = () => {
  const { sales, products, currentUser } = useAppContext();
  
  // Calculate stats
  const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
  const todaySales = sales
    .filter(sale => {
      const saleDate = new Date(sale.createdAt);
      const today = new Date();
      return (
        saleDate.getDate() === today.getDate() &&
        saleDate.getMonth() === today.getMonth() &&
        saleDate.getFullYear() === today.getFullYear()
      );
    })
    .reduce((sum, sale) => sum + sale.total, 0);
  
  const lowStockProducts = products.filter(p => p.stockQuantity < 10);
  
  const recentSales = [...sales]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Welcome back, {currentUser?.name}!
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex items-center">
          <div className="rounded-full p-3 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 mr-4">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Sales</p>
            <p className="text-xl font-bold">{formatCurrency(totalSales)}</p>
          </div>
        </Card>
        
        <Card className="flex items-center">
          <div className="rounded-full p-3 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 mr-4">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Today's Sales</p>
            <p className="text-xl font-bold">{formatCurrency(todaySales)}</p>
          </div>
        </Card>
        
        <Card className="flex items-center">
          <div className="rounded-full p-3 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 mr-4">
            <Package size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Products</p>
            <p className="text-xl font-bold">{products.length}</p>
          </div>
        </Card>
        
        <Card className="flex items-center">
          <div className="rounded-full p-3 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 mr-4">
            <Package size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Low Stock Items</p>
            <p className="text-xl font-bold">{lowStockProducts.length}</p>
          </div>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Recent Transactions">
          {recentSales.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 py-4 text-center">No transactions yet</p>
          ) : (
            <div className="divide-y dark:divide-gray-700">
              {recentSales.map(sale => (
                <div key={sale.id} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{sale.customerName || 'Anonymous Customer'}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                      <Clock size={14} className="mr-1" />
                      {formatDistanceToNow(new Date(sale.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(sale.total)}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-end">
                      <CreditCard size={12} className="mr-1" />
                      {sale.paymentMethod}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
        
        <Card title="Low Stock Products">
          {lowStockProducts.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 py-4 text-center">All products have sufficient stock</p>
          ) : (
            <div className="divide-y dark:divide-gray-700">
              {lowStockProducts.map(product => (
                <div key={product.id} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{product.category}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${product.stockQuantity === 0 ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                      {product.stockQuantity} in stock
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatCurrency(product.price)} each
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
