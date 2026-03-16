import React from 'react';
import { Trash2, ShoppingBag, CreditCard, Plus, Minus } from 'lucide-react';
import Button from '../ui/Button';
import { useAppContext } from '../../context/AppContext';
import { formatCurrency } from '../../utils/formatters';

interface CartProps {
  onCheckout: () => void;
}

const Cart: React.FC<CartProps> = ({ onCheckout }) => {
  const { cart, removeFromCart, updateCartItem, darkMode } = useAppContext();
  
  // Calculate subtotal
  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + tax;
  
  return (
    <div className={`h-full flex flex-col ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} rounded-lg shadow-md`}>
      <div className="p-4 border-b dark:border-gray-700">
        <div className="flex items-center">
          <ShoppingBag className="mr-2" size={20} />
          <h2 className="text-lg font-semibold">Current Sale</h2>
        </div>
      </div>
      
      {cart.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-gray-500 dark:text-gray-400">
          <ShoppingBag size={48} className="mb-4 opacity-30" />
          <p className="text-center">Your cart is empty</p>
          <p className="text-center text-sm mt-2">Add products to start a new sale</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <ul className="divide-y dark:divide-gray-700">
            {cart.map((item, index) => (
              <li key={item.product.id} className="p-3">
                <div className="flex justify-between mb-1">
                  <span className="font-medium">{item.product.name}</span>
                  <button 
                    onClick={() => removeFromCart(index)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                  <div>
                    {formatCurrency(item.product.price)} × {item.quantity}
                  </div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(item.product.price * item.quantity)}
                  </div>
                </div>
                
                <div className="mt-2 flex items-center">
                  <button
                    className={`p-1 rounded ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                    onClick={() => updateCartItem(index, item.quantity - 1)}
                  >
                    <Minus size={14} />
                  </button>
                  <span className="px-3">{item.quantity}</span>
                  <button
                    className={`p-1 rounded ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                    onClick={() => updateCartItem(index, item.quantity + 1)}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <div className={`p-4 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} border-t dark:border-gray-700`}>
        <div className="space-y-1 mb-4">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Tax (8%)</span>
            <span>{formatCurrency(tax)}</span>
          </div>
          <div className="flex justify-between font-bold pt-2 border-t dark:border-gray-700">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
        
        <Button
          variant="primary"
          className="w-full"
          onClick={onCheckout}
          disabled={cart.length === 0}
          icon={<CreditCard className="mr-2" size={18} />}
        >
          Checkout
        </Button>
      </div>
    </div>
  );
};

export default Cart;
