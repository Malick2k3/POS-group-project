import React from 'react';
import { Edit, Plus } from 'lucide-react';
import Button from '../ui/Button';
import type { Product } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { useAppContext } from '../../context/AppContext';

interface ProductCardProps {
  product: Product;
  onEdit?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onEdit }) => {
  const { addToCart, darkMode, currentUser } = useAppContext();
  const canManageProducts = currentUser?.role === 'admin' || currentUser?.role === 'manager';

  return (
    <div
      className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg shadow-sm overflow-hidden transition-transform hover:scale-[1.02] hover:shadow-md`}
    >
      {product.imageUrl && (
        <div className="aspect-w-16 aspect-h-9 bg-gray-200 dark:bg-gray-700">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="object-cover w-full h-32"
          />
        </div>
      )}

      <div className="p-3">
        <h3 className="font-medium mb-1 truncate" title={product.name}>
          {product.name}
        </h3>

        <p className="text-xs mb-2 text-gray-500">{product.category}</p>

        <p className={`text-lg font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
          {formatCurrency(product.price)}
        </p>

        <p className={`text-xs mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Stock: {product.stockQuantity} units
        </p>

        <div className="flex justify-between items-center">
          <Button
            variant="primary"
            size="sm"
            onClick={() => addToCart(product, 1)}
            disabled={product.stockQuantity <= 0 || !product.isActive}
            icon={<Plus size={14} />}
            className="flex-1 mr-2"
          >
            Add
          </Button>

          {canManageProducts && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onEdit}
              icon={<Edit size={14} />}
            >
              Edit
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
