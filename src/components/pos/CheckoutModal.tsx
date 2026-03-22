import React, { useEffect, useState } from 'react';
import { CreditCard, DollarSign, Receipt, Smartphone } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Modal from '../ui/Modal';
import { formatCurrency } from '../../utils/formatters';
import { useAppContext } from '../../context/AppContext';
import type { PaymentMethod } from '../../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
  const { cart, checkout } = useAppContext();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [customerName, setCustomerName] = useState('');
  const [cashAmount, setCashAmount] = useState('');
  const [receipt, setReceipt] = useState<{ id: string; change: number } | null>(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  useEffect(() => {
    if (!isOpen) {
      setPaymentMethod('cash');
      setCustomerName('');
      setCashAmount('');
      setReceipt(null);
      setError('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleCheckout = async () => {
    setError('');
    setIsSubmitting(true);

    try {
      const sale = await checkout(paymentMethod, customerName || undefined);

      if (!sale) {
        setError('Unable to complete the sale');
        return;
      }

      const change = paymentMethod === 'cash' && cashAmount
        ? Number(cashAmount) - total
        : 0;

      setReceipt({ id: sale.id, change });
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : 'Unable to complete the sale');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Checkout" size="md">
      {receipt ? (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
          <div className="mb-2 flex items-center text-emerald-700">
            <Receipt size={20} className="mr-2" />
            <h3 className="font-semibold">Sale Complete</h3>
          </div>

          <p className="text-sm text-emerald-700">Receipt #: {receipt.id.slice(0, 8)}</p>

          {paymentMethod === 'cash' && receipt.change > 0 && (
            <p className="mt-3 font-medium text-emerald-700">
              Change due: {formatCurrency(receipt.change)}
            </p>
          )}

          <div className="mt-5">
            <Button variant="success" size="sm" onClick={onClose} className="w-full">
              Done
            </Button>
          </div>
        </div>
      ) : (
        <>
          {error && (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <Input
            label="Customer Name (Optional)"
            type="text"
            value={customerName}
            onChange={(event) => setCustomerName(event.target.value)}
            placeholder="Enter customer name"
          />

          <div className="mb-5">
            <label className="mb-2 block text-sm font-medium text-slate-700">Payment Method</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'cash', label: 'Cash', icon: <DollarSign size={24} /> },
                { key: 'credit', label: 'Credit', icon: <CreditCard size={24} /> },
                { key: 'debit', label: 'Debit', icon: <CreditCard size={24} /> },
                { key: 'mobile', label: 'Mobile', icon: <Smartphone size={24} /> }
              ].map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setPaymentMethod(option.key as PaymentMethod)}
                  className={`rounded-2xl border p-4 text-left transition-colors ${
                    paymentMethod === option.key
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{option.icon}</span>
                    <span className={`h-3 w-3 rounded-full border ${paymentMethod === option.key ? 'border-white bg-white' : 'border-slate-300 bg-transparent'}`} />
                  </div>
                  <span className="mt-4 block text-sm font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {paymentMethod === 'cash' && (
            <div className="mb-5">
              <label className="mb-2 block text-sm font-medium text-slate-700">Cash Amount</label>
              <div className="flex">
                <span className="inline-flex items-center rounded-l-xl border border-r-0 border-slate-200 bg-slate-50 px-4 text-slate-500">
                  $
                </span>
                <input
                  type="number"
                  min={total}
                  step="0.01"
                  value={cashAmount}
                  onChange={(event) => setCashAmount(event.target.value)}
                  className="flex-1 rounded-r-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition-colors focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  placeholder="Enter amount"
                />
              </div>
            </div>
          )}

          <div className="mb-5 rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div className="space-y-1">
              <div className="flex justify-between text-sm text-slate-500">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-500">
                <span>Tax (8%)</span>
                <span>{formatCurrency(tax)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-3 text-base font-semibold text-slate-900">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>

            <Button
              variant="primary"
              onClick={handleCheckout}
              disabled={isSubmitting || (paymentMethod === 'cash' && (!cashAmount || Number(cashAmount) < total)) || cart.length === 0}
            >
              {isSubmitting ? 'Processing...' : 'Complete Sale'}
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
};

export default CheckoutModal;
