import React from 'react';
import { NavLink } from 'react-router-dom';
import { BarChart2, Home, LogOut, Package, ShoppingCart, Users } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const Sidebar: React.FC = () => {
  const { logout, currentUser } = useAppContext();

  const navItems = [
    { to: '/', icon: <Home size={20} />, label: 'Dashboard' },
    { to: '/pos', icon: <ShoppingCart size={20} />, label: 'Point of Sale' },
    { to: '/inventory', icon: <Package size={20} />, label: 'Inventory' }
  ];

  if (currentUser?.role !== 'cashier') {
    navItems.push({ to: '/reports', icon: <BarChart2 size={20} />, label: 'Reports' });
  }

  if (currentUser?.role === 'admin') {
    navItems.push({ to: '/users', icon: <Users size={20} />, label: 'Users' });
  }

  return (
    <aside className="w-full md:w-64 h-auto md:h-screen md:flex-shrink-0 border-r bg-white flex flex-col">
      <div className="p-4 flex items-center justify-center border-b">
        <ShoppingCart className="mr-2 text-blue-600" size={24} />
        <h1 className="text-xl font-bold text-gray-800">Modern POS</h1>
      </div>

      {currentUser ? (
        <>
          <div className="p-4 border-b">
            <p className="text-sm text-gray-500">Logged in as</p>
            <p className="font-medium text-gray-800">{currentUser.name}</p>
            <p className="text-xs text-gray-500 capitalize">{currentUser.role}</p>
          </div>

          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center px-4 py-2 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-600'
                          : 'hover:bg-gray-50 text-gray-600 hover:text-blue-600'
                      }`
                    }
                  >
                    {item.icon}
                    <span className="ml-3">{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="p-4 border-t">
            <button
              onClick={logout}
              className="flex items-center w-full px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg"
            >
              <LogOut size={20} />
              <span className="ml-3">Logout</span>
            </button>
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Please login</p>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
