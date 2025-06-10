import React, { useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { Camera, DollarSign } from 'lucide-react';
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
  
  // Keyboard shortcuts
  useHotkeys('ctrl+b', () => setIsBarcodeScannerOpen(true), []);
  useHotkeys('ctrl+d', () => setIsCashDrawerOpen(true), []);
  useHotkeys('ctrl+space', () => setIsCheckoutModalOpen(true), []);
  
  const handleBarcodeDetected = (code: string) => {
    const product = products.find(p => p.barcode === code);
    if (product) {
      addToCart(product, 1);
    }
  };
  
  return (
    <div className="min-h-[calc(100vh-80px)] grid grid-cols-1 lg:grid-cols-3 gap-6 p-4 sm:p-6 lg:p-8 bg-white">
      <div className="lg:col-span-2 flex flex-col">
        <div className="mb-6 flex gap-3">
          <Button
            variant="secondary"
            onClick={() => setIsBarcodeScannerOpen(true)}
            icon={<Camera size={20} />}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            Scan Barcode (Ctrl+B)
          </Button>
          
          <Button
            variant="secondary"
            onClick={() => setIsCashDrawerOpen(true)}
            icon={<DollarSign size={20} />}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            Cash Drawer (Ctrl+D)
          </Button>
        </div>
        
        <div className="flex-1">
          <ProductList />
        </div>
      </div>
      
      <div className="flex flex-col">
        <Cart onCheckout={() => setIsCheckoutModalOpen(true)} />
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