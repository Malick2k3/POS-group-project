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
  const { addToCart, currentUser } = useAppContext();
  const canManageProducts = currentUser?.role === 'admin' || currentUser?.role === 'manager';

  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-md">
      {product.imageUrl && (
        <div className="bg-slate-100">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-36 w-full object-cover"
          />
        </div>
      )}

      <div className="p-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate font-medium text-slate-900" title={product.name}>
              {product.name}
            </h3>
            <p className="mt-1 text-xs text-slate-500">{product.category}</p>
          </div>

          {!product.isActive && (
            <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium uppercase tracking-wide text-slate-600">
              Inactive
            </span>
          )}
        </div>

        <p className="text-xl font-semibold tracking-tight text-slate-900">
          {formatCurrency(product.price)}
        </p>

        <p className="mt-2 text-xs text-slate-500">
          Stock: {product.stockQuantity} units
        </p>

        <div className="mt-4 flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => addToCart(product, 1)}
            disabled={product.stockQuantity <= 0 || !product.isActive}
            icon={<Plus size={14} />}
            className="flex-1"
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
