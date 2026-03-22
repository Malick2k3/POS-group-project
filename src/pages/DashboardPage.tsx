import React, { useMemo } from 'react';
import { AlertTriangle, CreditCard, DollarSign, Package, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Card from '../components/ui/Card';
import { useAppContext } from '../context/AppContext';
import { formatCurrency } from '../utils/formatters';

const DashboardPage: React.FC = () => {
  const { sales, products, currentUser } = useAppContext();

  const dashboardData = useMemo(() => {
    const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
    const todaySales = sales
      .filter((sale) => {
        const saleDate = new Date(sale.createdAt);
        const today = new Date();

        return (
          saleDate.getDate() === today.getDate() &&
          saleDate.getMonth() === today.getMonth() &&
          saleDate.getFullYear() === today.getFullYear()
        );
      })
      .reduce((sum, sale) => sum + sale.total, 0);

    const lowStockProducts = products
      .filter((product) => product.stockQuantity < 10)
      .sort((left, right) => left.stockQuantity - right.stockQuantity);

    const activeProducts = products.filter((product) => product.isActive);
    const inactiveProducts = products.length - activeProducts.length;

    const recentSales = [...sales]
      .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
      .slice(0, 5);

    return {
      totalSales,
      todaySales,
      lowStockProducts,
      activeProducts,
      inactiveProducts,
      recentSales
    };
  }, [products, sales]);

  const metrics = [
    {
      label: 'Total Sales',
      value: formatCurrency(dashboardData.totalSales),
      detail: 'All completed sales loaded in the workspace',
      accent: 'bg-slate-900 text-white',
      icon: <DollarSign size={18} />
    },
    {
      label: 'Today',
      value: formatCurrency(dashboardData.todaySales),
      detail: 'Revenue recorded since midnight',
      accent: 'bg-emerald-50 text-emerald-700',
      icon: <TrendingUp size={18} />
    },
    {
      label: 'Active Products',
      value: `${dashboardData.activeProducts.length}`,
      detail: `${dashboardData.inactiveProducts} inactive in catalog`,
      accent: 'bg-blue-50 text-blue-700',
      icon: <Package size={18} />
    },
    {
      label: 'Low Stock',
      value: `${dashboardData.lowStockProducts.length}`,
      detail: 'Products below the 10-unit threshold',
      accent: 'bg-amber-50 text-amber-700',
      icon: <AlertTriangle size={18} />
    }
  ];

  return (
    <div className="space-y-6">
      <Card className="border-none bg-slate-900 text-white shadow-none">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-slate-400">Operations snapshot</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">
              Welcome back{currentUser ? `, ${currentUser.name}` : ''}.
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              This view surfaces the numbers that matter first: sales, product availability, and where stock risk is
              starting to build up.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
            <p className="font-medium text-white">Current role</p>
            <p className="mt-1 capitalize">{currentUser?.role || 'staff'}</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
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

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card title="Recent Transactions">
          {dashboardData.recentSales.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
              No transactions yet.
            </div>
          ) : (
            <div className="space-y-4">
              {dashboardData.recentSales.map((sale) => (
                <div
                  key={sale.id}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 px-4 py-4"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-900">{sale.customerName || 'Walk-in customer'}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                      <span>{formatDistanceToNow(new Date(sale.createdAt), { addSuffix: true })}</span>
                      <span className="h-1 w-1 rounded-full bg-slate-300" />
                      <span className="inline-flex items-center gap-1 capitalize">
                        <CreditCard size={13} />
                        {sale.paymentMethod}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-slate-900">{formatCurrency(sale.total)}</p>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{sale.status || 'completed'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="Inventory Risk">
          {dashboardData.lowStockProducts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
              All products are above the low-stock threshold.
            </div>
          ) : (
            <div className="space-y-3">
              {dashboardData.lowStockProducts.slice(0, 6).map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 px-4 py-4"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-900">{product.name}</p>
                    <p className="mt-1 text-sm text-slate-500">{product.category}</p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm font-semibold ${
                        product.stockQuantity === 0 ? 'text-red-600' : 'text-amber-600'
                      }`}
                    >
                      {product.stockQuantity} units
                    </p>
                    <p className="mt-1 text-xs text-slate-400">{formatCurrency(product.price)} each</p>
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
