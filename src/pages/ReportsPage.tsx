import React, { useState } from 'react';
import { PieChart, DownloadCloud, Calendar } from 'lucide-react';
import { format, subDays } from 'date-fns';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useAppContext } from '../context/AppContext';
import { formatCurrency } from '../utils/formatters';
import { exportSalesToExcel } from '../utils/exportToExcel';
import ProductPerformanceChart from '../components/reports/ProductPerformanceChart';

const ReportsPage: React.FC = () => {
  const { sales, products } = useAppContext();
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'custom'>('week');
  const [customStartDate, setCustomStartDate] = useState<string>(format(subDays(new Date(), 7), 'yyyy-MM-dd'));
  const [customEndDate, setCustomEndDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));

  // Calculate total sales for the current period
  const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
  const totalOrders = sales.length;
  const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

  // Generate sample data for charts
  const productPerformanceData = {
    labels: ['Electronics', 'Clothing', 'Food & Beverages', 'Home & Kitchen', 'Beauty'],
    values: [35, 25, 20, 15, 5],
  };

  const handleExportExcel = () => {
    exportSalesToExcel(sales);
  };

  return (
    <div className="space-y-6 bg-white p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-blue-600">Reports & Analytics</h1>
        
        <Button
          variant="primary"
          onClick={handleExportExcel}
          icon={<DownloadCloud size={18} />}
        >
          Export to Excel
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-blue-200 dark:shadow-blue-700">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-2">Total Sales</h3>
            <p className="text-3xl font-bold">{formatCurrency(totalSales)}</p>
            <p className="text-sm mt-2 opacity-90">+15.8% from last month</p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white shadow-blue-200 dark:shadow-blue-700">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-2">Total Orders</h3>
            <p className="text-3xl font-bold">{totalOrders}</p>
            <p className="text-sm mt-2 opacity-90">+12.3% from last month</p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-blue-200 dark:shadow-blue-700">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-2">Average Order Value</h3>
            <p className="text-3xl font-bold">{formatCurrency(averageOrderValue)}</p>
            <p className="text-sm mt-2 opacity-90">+8.7% from last month</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="shadow-blue-200 dark:shadow-blue-700">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-blue-600">Product Categories Performance</h3>
            <div className="h-80">
              <ProductPerformanceChart data={productPerformanceData} />
            </div>
          </div>
        </Card>

        <Card className="shadow-blue-200 dark:shadow-blue-700">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-blue-600">Recent Transactions</h3>
            <div className="space-y-4">
              {sales.slice(0, 5).map(sale => (
                <div key={sale.id} className="flex justify-between items-center border-b border-blue-100 pb-2">
                  <div>
                    <p className="font-medium text-blue-900 dark:text-blue-200">{sale.customerName || 'Anonymous'}</p>
                    <p className="text-sm text-blue-600">{format(new Date(sale.createdAt), 'MMM d, yyyy')}</p>
                  </div>
                  <p className="font-bold text-blue-900 dark:text-blue-200">{formatCurrency(sale.total)}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ReportsPage;