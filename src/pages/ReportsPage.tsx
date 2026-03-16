import React, { useEffect, useMemo, useState } from 'react';
import { DownloadCloud } from 'lucide-react';
import { format, subDays } from 'date-fns';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useAppContext } from '../context/AppContext';
import { formatCurrency } from '../utils/formatters';
import { exportSalesToExcel } from '../utils/exportToExcel';
import ProductPerformanceChart from '../components/reports/ProductPerformanceChart';
import type { Report } from '../types';

const ReportsPage: React.FC = () => {
  const { sales, generateReport } = useAppContext();
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month'>('week');

  const resolvedDateRange = useMemo(() => {
    const end = format(new Date(), 'yyyy-MM-dd');

    if (dateRange === 'today') {
      return { start: end, end };
    }

    if (dateRange === 'month') {
      return { start: format(subDays(new Date(), 30), 'yyyy-MM-dd'), end };
    }

    return { start: format(subDays(new Date(), 7), 'yyyy-MM-dd'), end };
  }, [dateRange]);

  useEffect(() => {
    async function loadReport() {
      try {
        setError('');
        const nextReport = await generateReport('Sales overview', 'sales', resolvedDateRange);
        setReport(nextReport);
      } catch (reportError) {
        setError(reportError instanceof Error ? reportError.message : 'Unable to load the report');
      }
    }

    loadReport();
  }, [resolvedDateRange.end, resolvedDateRange.start]);

  const totalSales = report?.data.summary.reduce((sum, item) => sum + item.totalRevenue, 0) || 0;
  const totalOrders = report?.data.summary.reduce((sum, item) => sum + item.totalSales, 0) || 0;
  const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

  const productPerformanceData = {
    labels: report?.data.topProducts.map((product) => product.name) || [],
    values: report?.data.topProducts.map((product) => product.totalQuantity) || []
  };

  return (
    <div className="space-y-6 bg-white p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-blue-600">Reports & Analytics</h1>
          <p className="text-sm text-gray-500">Live sales performance pulled from the backend API.</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(event) => setDateRange(event.target.value as 'today' | 'week' | 'month')}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="today">Today</option>
            <option value="week">Last 7 days</option>
            <option value="month">Last 30 days</option>
          </select>

          <Button variant="primary" onClick={() => exportSalesToExcel(sales)} icon={<DownloadCloud size={18} />}>
            Export to Excel
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-blue-200">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-2">Total Sales</h3>
            <p className="text-3xl font-bold">{formatCurrency(totalSales)}</p>
            <p className="text-sm mt-2 opacity-90">{resolvedDateRange.start} to {resolvedDateRange.end}</p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white shadow-blue-200">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-2">Total Orders</h3>
            <p className="text-3xl font-bold">{totalOrders}</p>
            <p className="text-sm mt-2 opacity-90">Completed sales in this range</p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-blue-200">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-2">Average Order Value</h3>
            <p className="text-3xl font-bold">{formatCurrency(averageOrderValue)}</p>
            <p className="text-sm mt-2 opacity-90">Revenue per completed sale</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="shadow-blue-200">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-blue-600">Top Products by Quantity</h3>
            <div className="h-80">
              <ProductPerformanceChart data={productPerformanceData} />
            </div>
          </div>
        </Card>

        <Card className="shadow-blue-200">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-blue-600">Recent Transactions</h3>
            <div className="space-y-4">
              {sales.slice(0, 5).map((sale) => (
                <div key={sale.id} className="flex justify-between items-center border-b border-blue-100 pb-2">
                  <div>
                    <p className="font-medium text-blue-900">{sale.customerName || 'Walk-in customer'}</p>
                    <p className="text-sm text-blue-600">{format(new Date(sale.createdAt), 'MMM d, yyyy')}</p>
                  </div>
                  <p className="font-bold text-blue-900">{formatCurrency(sale.total)}</p>
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
