import React, { useState } from 'react';
import { CreditCard, DollarSign, Smartphone, Receipt } from 'lucide-react';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import { formatCurrency } from '../../utils/formatters';
import { useAppContext } from '../../context/AppContext';
import { PaymentMethod } from '../../types';

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
  
  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + tax;
  
  const handlePaymentMethodChange = (method: PaymentMethod) => {
    setPaymentMethod(method);
    setReceipt(null);
  };
  
  const handleCheckout = () => {
    const sale = checkout(paymentMethod, customerName || undefined);
    
    if (sale) {
      // Calculate change if cash payment
      const change = paymentMethod === 'cash' && cashAmount 
        ? parseFloat(cashAmount) - total 
        : 0;
      
      setReceipt({ id: sale.id, change });
    }
  };
  
  const renderPaymentForm = () => {
    switch (paymentMethod) {
      case 'cash':
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Cash Amount</label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                $
              </span>
              <input
                type="number"
                min={total}
                step="0.01"
                value={cashAmount}
                onChange={(e) => setCashAmount(e.target.value)}
                className="flex-1 rounded-r-md shadow-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="Enter amount"
              />
            </div>
            {cashAmount && parseFloat(cashAmount) < total && (
              <p className="mt-1 text-sm text-red-600">Amount must be at least {formatCurrency(total)}</p>
            )}
          </div>
        );
      case 'credit':
      case 'debit':
        return (
          <div className="mb-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Please swipe the card or insert chip...
            </p>
          </div>
        );
      case 'mobile':
        return (
          <div className="mb-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Please scan the QR code with your mobile payment app...
            </p>
          </div>
        );
      default:
        return null;
    }
  };
  
  const renderReceipt = () => {
    if (!receipt) return null;
    
    return (
      <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg border border-green-200 dark:border-green-800 mb-4">
        <div className="flex items-center text-green-700 dark:text-green-300 mb-2">
          <Receipt size={20} className="mr-2" />
          <h3 className="font-semibold">Sale Complete!</h3>
        </div>
        
        <p className="text-sm text-green-700 dark:text-green-300">Receipt #: {receipt.id.slice(0, 8)}</p>
        
        {paymentMethod === 'cash' && receipt.change > 0 && (
          <p className="mt-2 font-medium text-green-700 dark:text-green-300">
            Change due: {formatCurrency(receipt.change)}
          </p>
        )}
        
        <div className="mt-4">
          <Button
            variant="success"
            size="sm"
            onClick={onClose}
            className="w-full"
          >
            Done
          </Button>
        </div>
      </div>
    );
  };
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Checkout"
      size="md"
    >
      {receipt ? (
        renderReceipt()
      ) : (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Customer Name (Optional)</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="Enter customer name"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Payment Method</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handlePaymentMethodChange('cash')}
                className={`p-3 border rounded-md flex flex-col items-center justify-center ${
                  paymentMethod === 'cash' 
                    ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900 dark:border-blue-800 dark:text-blue-300' 
                    : 'border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800'
                }`}
              >
                <DollarSign size={24} />
                <span className="mt-1 text-sm">Cash</span>
              </button>
              
              <button
                type="button"
                onClick={() => handlePaymentMethodChange('credit')}
                className={`p-3 border rounded-md flex flex-col items-center justify-center ${
                  paymentMethod === 'credit' 
                    ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900 dark:border-blue-800 dark:text-blue-300' 
                    : 'border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800'
                }`}
              >
                <CreditCard size={24} />
                <span className="mt-1 text-sm">Credit</span>
              </button>
              
              <button
                type="button"
                onClick={() => handlePaymentMethodChange('debit')}
                className={`p-3 border rounded-md flex flex-col items-center justify-center ${
                  paymentMethod === 'debit' 
                    ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900 dark:border-blue-800 dark:text-blue-300' 
                    : 'border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800'
                }`}
              >
                <CreditCard size={24} />
                <span className="mt-1 text-sm">Debit</span>
              </button>
              
              <button
                type="button"
                onClick={() => handlePaymentMethodChange('mobile')}
                className={`p-3 border rounded-md flex flex-col items-center justify-center ${
                  paymentMethod === 'mobile' 
                    ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900 dark:border-blue-800 dark:text-blue-300' 
                    : 'border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800'
                }`}
              >
                <Smartphone size={24} />
                <span className="mt-1 text-sm">Mobile</span>
              </button>
            </div>
          </div>
          
          {renderPaymentForm()}
          
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 mb-4">
            <div className="space-y-1">
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
          </div>
          
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={onClose}
            >
              Cancel
            </Button>
            
            <Button
              variant="primary"
              onClick={handleCheckout}
              disabled={
                (paymentMethod === 'cash' && (!cashAmount || parseFloat(cashAmount) < total)) ||
                cart.length === 0
              }
            >
              Complete Sale
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
};

export default CheckoutModal;