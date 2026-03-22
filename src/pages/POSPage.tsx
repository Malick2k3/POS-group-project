import React, { useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { Camera, DollarSign, Keyboard } from 'lucide-react';
import ProductList from '../components/pos/ProductList';
import Cart from '../components/pos/Cart';
import CheckoutModal from '../components/pos/CheckoutModal';
import BarcodeScanner from '../components/pos/BarcodeScanner';
import CashDrawer from '../components/pos/CashDrawer';
import Button from '../components/ui/Button';
import { useAppContext } from '../context/AppContext';

const POSPage: React.FC = () => {
  const { products, addToCart } = useAppContext();
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isBarcodeScannerOpen, setIsBarcodeScannerOpen] = useState(false);
  const [isCashDrawerOpen, setIsCashDrawerOpen] = useState(false);

  useHotkeys('ctrl+b', () => setIsBarcodeScannerOpen(true), []);
  useHotkeys('ctrl+d', () => setIsCashDrawerOpen(true), []);
  useHotkeys('ctrl+space', () => setIsCheckoutModalOpen(true), []);

  const handleBarcodeDetected = (code: string) => {
    const product = products.find((item) => item.barcode === code);
    if (product && product.isActive && product.stockQuantity > 0) {
      addToCart(product, 1);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-slate-400">Checkout workspace</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">Fast register flow, fewer mistakes.</h1>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Search the catalog, scan items, and move to payment without losing sight of stock availability.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <Keyboard size={16} />
            <span>`Ctrl+B` scan, `Ctrl+D` drawer, `Ctrl+Space` checkout</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="min-h-[calc(100vh-21rem)] rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex flex-wrap gap-3">
            <Button
              variant="primary"
              onClick={() => setIsBarcodeScannerOpen(true)}
              icon={<Camera size={18} />}
            >
              Scan Barcode
            </Button>

            <Button
              variant="secondary"
              onClick={() => setIsCashDrawerOpen(true)}
              icon={<DollarSign size={18} />}
            >
              Cash Drawer
            </Button>
          </div>

          <div className="h-full">
            <ProductList />
          </div>
        </div>

        <div className="flex flex-col">
          <Cart onCheckout={() => setIsCheckoutModalOpen(true)} />
        </div>
      </div>

      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
      />

      {isBarcodeScannerOpen && (
        <BarcodeScanner
          onDetected={handleBarcodeDetected}
          onClose={() => setIsBarcodeScannerOpen(false)}
        />
      )}

      <CashDrawer
        isOpen={isCashDrawerOpen}
        onClose={() => setIsCashDrawerOpen(false)}
      />
    </div>
  );
};

export default POSPage;
