import React, { useEffect, useMemo, useState } from 'react';
import { BarChart3, DownloadCloud, Receipt, TrendingUp } from 'lucide-react';
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

  const metrics = [
    {
      label: 'Total Sales',
      value: formatCurrency(totalSales),
      detail: `${resolvedDateRange.start} to ${resolvedDateRange.end}`,
      icon: <TrendingUp size={18} />,
      accent: 'bg-slate-900 text-white'
    },
    {
      label: 'Orders',
      value: `${totalOrders}`,
      detail: 'Completed transactions in this range',
      icon: <Receipt size={18} />,
      accent: 'bg-emerald-50 text-emerald-700'
    },
    {
      label: 'Average Order',
      value: formatCurrency(averageOrderValue),
      detail: 'Revenue per completed sale',
      icon: <BarChart3 size={18} />,
      accent: 'bg-blue-50 text-blue-700'
    }
  ];

  return (
    <div className="space-y-6">
      <Card className="border-none bg-slate-900 text-white shadow-none">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-slate-400">Reporting</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">Sales performance with less noise.</h1>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Compare revenue, order volume, and top-selling products from the live sales feed without digging through
              raw transactions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={dateRange}
              onChange={(event) => setDateRange(event.target.value as 'today' | 'week' | 'month')}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
            >
              <option value="today" className="text-slate-900">Today</option>
              <option value="week" className="text-slate-900">Last 7 days</option>
              <option value="month" className="text-slate-900">Last 30 days</option>
            </select>

            <Button variant="secondary" onClick={() => exportSalesToExcel(sales)} icon={<DownloadCloud size={18} />}>
              Export
            </Button>
          </div>
        </div>
      </Card>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-500">{metric.label}</p>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{metric.value}</p>
                <p className="mt-2 text-sm text-slate-500">{metric.detail}</p>
              </div>
              <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${metric.accent}`}>
                {metric.icon}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card title="Top Products by Quantity">
          <div className="h-80">
            <ProductPerformanceChart data={productPerformanceData} />
          </div>
        </Card>

        <Card title="Recent Transactions">
          {sales.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
              No transactions available in the current workspace.
            </div>
          ) : (
            <div className="space-y-3">
              {sales.slice(0, 5).map((sale) => (
                <div
                  key={sale.id}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 px-4 py-4"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-900">{sale.customerName || 'Walk-in customer'}</p>
                    <p className="mt-1 text-sm text-slate-500">{format(new Date(sale.createdAt), 'MMM d, yyyy')}</p>
                  </div>
                  <p className="text-right text-lg font-semibold text-slate-900">{formatCurrency(sale.total)}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ReportsPage;
