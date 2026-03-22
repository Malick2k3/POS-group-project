import React, { useState } from 'react';
import { DollarSign, Plus, Minus, Wallet } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl">
        <div className="border-b border-slate-200 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
              <Wallet size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-slate-900">Cash Drawer</h2>
              <p className="text-sm text-slate-500">Adjust the current drawer amount for the active session.</p>
            </div>
          </div>
        </div>

        <div className="space-y-5 p-6">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-5">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">Current amount</p>
            <div className="mt-3 flex items-end justify-between gap-4">
              <p className="text-3xl font-semibold tracking-tight text-slate-900">{formatCurrency(drawerAmount)}</p>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-sm">
                <DollarSign size={20} />
              </div>
            </div>
          </div>

          <Input
            label="Adjustment Amount"
            type="number"
            value={adjustment}
            onChange={(e) => setAdjustment(e.target.value)}
            placeholder="Enter amount"
          />

          <Input
            label="Reason"
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter reason for adjustment"
          />

          <div className="flex gap-3">
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

          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Adjustments update the local drawer value for this session only.
          </div>

          <Button
            variant="secondary"
            className="w-full"
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
