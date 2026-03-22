import React from 'react';
import { Trash2, ShoppingBag, CreditCard, Plus, Minus } from 'lucide-react';
import Button from '../ui/Button';
import { useAppContext } from '../../context/AppContext';
import { formatCurrency } from '../../utils/formatters';

interface CartProps {
  onCheckout: () => void;
}

const Cart: React.FC<CartProps> = ({ onCheckout }) => {
  const { cart, removeFromCart, updateCartItem } = useAppContext();

  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
              <ShoppingBag size={18} />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-slate-900">Current Sale</h2>
              <p className="text-sm text-slate-500">Review items before payment.</p>
            </div>
          </div>

          <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            {cart.length} item{cart.length === 1 ? '' : 's'}
          </div>
        </div>
      </div>

      {cart.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center bg-slate-50/70 p-8 text-slate-500">
          <ShoppingBag size={48} className="mb-4 opacity-30" />
          <p className="text-center">Your cart is empty</p>
          <p className="mt-2 text-center text-sm">Add products to start a new sale</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <ul className="space-y-3">
            {cart.map((item, index) => (
              <li key={item.product.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-900">{item.product.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{item.product.category}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFromCart(index)}
                    className="h-8 w-8 rounded-full p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                    aria-label={`Remove ${item.product.name} from cart`}
                  >
                    <Trash2 size={15} />
                  </Button>
                </div>

                <div className="flex items-center justify-between text-sm text-slate-500">
                  <div className="truncate pr-4">
                    {formatCurrency(item.product.price)} x {item.quantity}
                  </div>
                  <div className="font-medium text-slate-900">
                    {formatCurrency(item.product.price * item.quantity)}
                  </div>
                </div>

                <div className="mt-4 flex items-center">
                  <button
                    className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition-colors hover:bg-slate-100"
                    onClick={() => updateCartItem(index, item.quantity - 1)}
                    aria-label={`Decrease quantity for ${item.product.name}`}
                  >
                    <Minus size={14} />
                  </button>
                  <span className="min-w-[3rem] text-center text-sm font-medium text-slate-900">{item.quantity}</span>
                  <button
                    className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={() => updateCartItem(index, item.quantity + 1)}
                    disabled={item.quantity >= item.product.stockQuantity}
                    aria-label={`Increase quantity for ${item.product.name}`}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="border-t border-slate-200 bg-slate-50 px-5 py-5">
        <div className="mb-4 rounded-2xl border border-slate-200 bg-white px-4 py-4">
          <div className="flex justify-between text-sm text-slate-500">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="mt-2 flex justify-between text-sm text-slate-500">
            <span>Tax (8%)</span>
            <span>{formatCurrency(tax)}</span>
          </div>
          <div className="mt-3 flex justify-between border-t border-slate-200 pt-3 text-base font-semibold text-slate-900">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>

        <Button
          variant="primary"
          className="w-full"
          onClick={onCheckout}
          disabled={cart.length === 0}
          icon={<CreditCard size={18} />}
        >
          Checkout
        </Button>
      </div>
    </div>
  );
};

export default Cart;
