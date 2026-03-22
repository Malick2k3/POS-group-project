import React, { useMemo, useState } from 'react';
import { Bell, Menu } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { currentUser, products } = useAppContext();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = useMemo(() => {
    const lowStockProducts = products.filter((product) => product.stockQuantity < 10).slice(0, 3);

    return lowStockProducts.map((product, index) => ({
      id: index + 1,
      text: `Low stock alert: ${product.name}`,
      time: `${product.stockQuantity} left`
    }));
  }, [products]);

  const pageMeta = useMemo(() => {
    switch (location.pathname) {
      case '/':
        return {
          title: 'Dashboard',
          subtitle: 'Track revenue, sales activity, and inventory risk at a glance.'
        };
      case '/pos':
        return {
          title: 'Point of Sale',
          subtitle: 'Run live checkout and keep the cart aligned with actual stock.'
        };
      case '/inventory':
        return {
          title: 'Inventory',
          subtitle: 'Manage catalog status, pricing, stock, and category coverage.'
        };
      case '/reports':
        return {
          title: 'Reports',
          subtitle: 'Review revenue trends and product performance from live sales data.'
        };
      case '/users':
        return {
          title: 'Users',
          subtitle: 'Control staff access and account status with admin-level safeguards.'
        };
      default:
        return {
          title: 'Modern POS',
          subtitle: 'Retail workspace'
        };
    }
  }, [location.pathname]);

  return (
    <header className="border-b border-slate-200 bg-white px-4 py-4 md:px-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          >
            <Menu size={20} />
          </button>

          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">{pageMeta.title}</h2>
            <p className="mt-1 max-w-2xl text-sm text-slate-500">{pageMeta.subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <button
              type="button"
              className="relative rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-100"
              onClick={() => setShowNotifications((current) => !current)}
            >
              <Bell size={20} />
              {notifications.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[11px] font-semibold text-slate-950">
                  {notifications.length}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 z-50 mt-3 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                <div className="border-b border-slate-200 px-4 py-3">
                  <p className="text-sm font-semibold text-slate-900">Inventory alerts</p>
                </div>
                <div className="divide-y divide-slate-100">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div key={notification.id} className="px-4 py-3">
                        <p className="text-sm text-slate-800">{notification.text}</p>
                        <p className="mt-1 text-xs font-medium text-amber-600">{notification.time}</p>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-slate-500">No active alerts</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {currentUser && (
            <div className="hidden items-center gap-3 rounded-2xl border border-slate-200 px-3 py-2 sm:flex">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                <span className="text-sm font-semibold text-slate-700">
                  {currentUser.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">{currentUser.name}</p>
                <p className="text-xs capitalize text-slate-500">{currentUser.role}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
