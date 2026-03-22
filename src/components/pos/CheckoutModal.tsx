import React, { useEffect, useState } from 'react';
import { CreditCard, DollarSign, Receipt, Smartphone } from 'lucide-react';
import Button from '../ui/Button';
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
        <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-4">
          <div className="flex items-center text-green-700 mb-2">
            <Receipt size={20} className="mr-2" />
            <h3 className="font-semibold">Sale Complete</h3>
          </div>

          <p className="text-sm text-green-700">Receipt #: {receipt.id.slice(0, 8)}</p>

          {paymentMethod === 'cash' && receipt.change > 0 && (
            <p className="mt-2 font-medium text-green-700">
              Change due: {formatCurrency(receipt.change)}
            </p>
          )}

          <div className="mt-4">
            <Button variant="success" size="sm" onClick={onClose} className="w-full">
              Done
            </Button>
          </div>
        </div>
      ) : (
        <>
          {error && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Customer Name (Optional)</label>
            <input
              type="text"
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              className="w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300"
              placeholder="Enter customer name"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Payment Method</label>
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
                  className={`p-3 border rounded-md flex flex-col items-center justify-center ${
                    paymentMethod === option.key
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {option.icon}
                  <span className="mt-1 text-sm">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {paymentMethod === 'cash' && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Cash Amount</label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                  $
                </span>
                <input
                  type="number"
                  min={total}
                  step="0.01"
                  value={cashAmount}
                  onChange={(event) => setCashAmount(event.target.value)}
                  className="flex-1 rounded-r-md shadow-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300"
                  placeholder="Enter amount"
                />
              </div>
            </div>
          )}

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax (8%)</span>
                <span>{formatCurrency(tax)}</span>
              </div>
              <div className="flex justify-between font-bold pt-2 border-t border-gray-200">
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
