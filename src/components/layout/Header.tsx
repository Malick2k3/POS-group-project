import React, { useMemo, useState } from 'react';
import { Bell, Menu, Search } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';

const Header: React.FC = () => {
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

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Dashboard';
      case '/pos':
        return 'Point of Sale';
      case '/inventory':
        return 'Inventory Management';
      case '/reports':
        return 'Reports & Analytics';
      case '/users':
        return 'User Management';
      default:
        return 'Modern POS';
    }
  };

  return (
    <header className="px-6 py-4 bg-white border-b flex items-center justify-between">
      <div className="flex items-center">
        <button className="md:hidden mr-4 text-gray-600 hover:text-blue-600">
          <Menu size={24} />
        </button>
        <h2 className="text-2xl font-semibold text-gray-800">{getPageTitle()}</h2>
      </div>

      <div className="flex items-center space-x-6">
        <div className="relative hidden md:block">
          <input
            type="text"
            placeholder="Search catalog..."
            className="pl-10 pr-4 py-2 bg-white text-gray-800 placeholder-gray-400 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>

        <div className="relative">
          <button
            className="text-gray-600 hover:text-blue-600"
            onClick={() => setShowNotifications((current) => !current)}
          >
            <Bell size={24} />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {notifications.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg overflow-hidden z-50">
              <div className="p-3 bg-blue-600 text-white font-medium">Notifications</div>
              <div className="divide-y divide-gray-100">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div key={notification.id} className="p-3 hover:bg-gray-50">
                      <p className="text-sm text-gray-800">{notification.text}</p>
                      <p className="text-xs text-blue-600 mt-1">{notification.time}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-sm text-gray-500">No active alerts</div>
                )}
              </div>
            </div>
          )}
        </div>

        {currentUser && (
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">{new Date().toLocaleDateString()}</span>
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-sm font-medium text-blue-600">
                  {currentUser.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="ml-2 text-sm font-medium text-gray-800">{currentUser.name}</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
