import React from 'react';
import { ShoppingCart } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-blue-600 text-white py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <ShoppingCart className="h-6 w-6 text-white mr-2" />
              <span className="text-xl font-semibold">DAUST MARKET</span>
            </div>
            <p className="text-sm text-blue-100">
              Streamlining retail operations with modern technology solutions.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-4">Features</h3>
            <ul className="space-y-3 text-sm text-blue-100">
              <li>Point of Sale</li>
              <li>Inventory Management</li>
              <li>Sales Analytics</li>
              <li>User Management</li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-4">Support</h3>
            <ul className="space-y-3 text-sm text-blue-100">
              <li>Documentation</li>
              <li>Help Center</li>
              <li>Contact Support</li>
              <li>System Status</li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-4">Company</h3>
            <ul className="space-y-3 text-sm text-blue-100">
              <li>About Us</li>
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
              <li>Contact: +221 77 479 54 77</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-blue-500">
          <p className="text-center text-sm text-blue-100">
            © {new Date().getFullYear()} DAUST MARKET. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;