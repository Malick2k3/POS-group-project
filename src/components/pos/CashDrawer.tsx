import React, { useState } from 'react';
import { DollarSign, Plus, Minus } from 'lucide-react';
import Button from '../ui/Button';
import { formatCurrency } from '../../utils/formatters';

interface CashDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CashDrawer: React.FC<CashDrawerProps> = ({ isOpen, onClose }) => {
  const [drawerAmount, setDrawerAmount] = useState(500); // Default starting amount
  const [adjustment, setAdjustment] = useState('');
  const [reason, setReason] = useState('');

  const handleAdjustment = (type: 'add' | 'remove') => {
    const amount = parseFloat(adjustment);
    if (isNaN(amount)) return;

    if (type === 'add') {
      setDrawerAmount(prev => prev + amount);
    } else {
      setDrawerAmount(prev => prev - amount);
    }

    // Here you would typically log the adjustment
    console.log(`Cash drawer ${type}: ${amount} - Reason: ${reason}`);
    
    setAdjustment('');
    setReason('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <DollarSign className="mr-2" />
          Cash Drawer Management
        </h2>

        <div className="mb-6 p-4 bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-400">Current Amount</p>
          <p className="text-3xl font-bold text-green-400">{formatCurrency(drawerAmount)}</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Adjustment Amount
            </label>
            <input
              type="number"
              value={adjustment}
              onChange={(e) => setAdjustment(e.target.value)}
              className="w-full rounded-md border-gray-600 bg-gray-700 text-white"
              placeholder="Enter amount"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Reason
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-md border-gray-600 bg-gray-700 text-white"
              placeholder="Enter reason for adjustment"
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant="success"
              className="flex-1"
              onClick={() => handleAdjustment('add')}
              disabled={!adjustment || !reason}
              icon={<Plus size={18} />}
            >
              Add Cash
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              onClick={() => handleAdjustment('remove')}
              disabled={!adjustment || !reason || parseFloat(adjustment) > drawerAmount}
              icon={<Minus size={18} />}
            >
              Remove Cash
            </Button>
          </div>

          <Button
            variant="secondary"
            className="w-full mt-4"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CashDrawer;