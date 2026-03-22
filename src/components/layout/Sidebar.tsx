import React from 'react';
import { NavLink } from 'react-router-dom';
import { BarChart2, Home, LogOut, Package, ShoppingCart, Users, X } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
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
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-slate-950/30 md:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-200 md:static md:w-64 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white">
              <ShoppingCart size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Modern POS</p>
              <p className="text-xs text-slate-500">Retail workspace</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 md:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {currentUser ? (
          <>
            <div className="border-b border-slate-200 px-5 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Signed in</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">{currentUser.name}</p>
              <p className="text-sm capitalize text-slate-500">{currentUser.role}</p>
            </div>

            <nav className="flex-1 overflow-y-auto px-4 py-5">
              <ul className="space-y-2">
                {navItems.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-slate-900 text-white'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`
                      }
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="border-t border-slate-200 p-4">
              <button
                onClick={logout}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center px-6 text-sm text-slate-500">
            Please log in
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
