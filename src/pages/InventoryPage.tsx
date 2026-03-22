import React, { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Download, Edit, Package, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import ProductForm from '../components/pos/ProductForm';
import { useAppContext } from '../context/AppContext';
import { formatCurrency } from '../utils/formatters';
import { exportInventoryToExcel } from '../utils/exportToExcel';

const InventoryPage: React.FC = () => {
  const { products, categories, deleteProduct, currentUser } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const canManageProducts = currentUser?.role === 'admin' || currentUser?.role === 'manager';

  const inventoryData = useMemo(() => {
    const filteredProducts = products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.barcode || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory ? product.categoryId === selectedCategory : true;

      return matchesSearch && matchesCategory;
    });

    const sortedProducts = [...filteredProducts].sort((left, right) => {
      const direction = sortDirection === 'asc' ? 1 : -1;

      switch (sortField) {
        case 'price':
          return (left.price - right.price) * direction;
        case 'stock':
          return (left.stockQuantity - right.stockQuantity) * direction;
        case 'category':
          return left.category.localeCompare(right.category) * direction;
        case 'updated':
          return (new Date(left.updatedAt).getTime() - new Date(right.updatedAt).getTime()) * direction;
        default:
          return left.name.localeCompare(right.name) * direction;
      }
    });

    const activeCount = filteredProducts.filter((product) => product.isActive).length;
    const lowStockCount = filteredProducts.filter((product) => product.stockQuantity < 10).length;
    const inventoryValue = filteredProducts.reduce((sum, product) => sum + (product.price * product.stockQuantity), 0);

    return {
      filteredProducts,
      sortedProducts,
      activeCount,
      lowStockCount,
      inventoryValue
    };
  }, [products, searchTerm, selectedCategory, sortDirection, sortField]);

  const handleDelete = async () => {
    if (!deletingProductId) {
      return;
    }

    try {
      setError('');
      await deleteProduct(deletingProductId);
      setIsDeleteModalOpen(false);
      setDeletingProductId(null);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete the product');
    }
  };

  const columns = [
    { key: 'name', label: 'Product' },
    { key: 'category', label: 'Category' },
    { key: 'price', label: 'Price' },
    { key: 'stock', label: 'Stock' },
    { key: 'updated', label: 'Updated' }
  ];

  return (
    <div className="space-y-6">
      <Card className="border-none bg-slate-900 text-white shadow-none">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-slate-400">Inventory control</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">Catalog health and stock movement.</h1>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Review stock exposure, product status, and pricing from one table without losing scan speed.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Visible</p>
              <p className="mt-2 text-2xl font-semibold text-white">{inventoryData.filteredProducts.length}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Low Stock</p>
              <p className="mt-2 text-2xl font-semibold text-white">{inventoryData.lowStockCount}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Inventory Value</p>
              <p className="mt-2 text-2xl font-semibold text-white">{formatCurrency(inventoryData.inventoryValue)}</p>
            </div>
          </div>
        </div>
      </Card>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <Card>
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Search</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by product, description, or barcode"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition-colors focus:border-slate-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Category</label>
              <select
                value={selectedCategory}
                onChange={(event) => setSelectedCategory(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition-colors focus:border-slate-400"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {canManageProducts && (
              <Button
                variant="primary"
                onClick={() => {
                  setEditingProductId(null);
                  setIsAddEditModalOpen(true);
                }}
                icon={<Plus size={18} />}
              >
                Add Product
              </Button>
            )}

            <Button
              variant="secondary"
              icon={<Download size={18} />}
              onClick={() => exportInventoryToExcel(products)}
            >
              Export
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className="cursor-pointer px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500"
                    onClick={() => {
                      if (sortField === column.key) {
                        setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
                      } else {
                        setSortField(column.key);
                        setSortDirection('asc');
                      }
                    }}
                  >
                    <span className="inline-flex items-center gap-1">
                      {column.label}
                      {sortField === column.key ? (
                        sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                      ) : null}
                    </span>
                  </th>
                ))}
                {canManageProducts && (
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {inventoryData.sortedProducts.length === 0 ? (
                <tr>
                  <td
                    colSpan={canManageProducts ? columns.length + 1 : columns.length}
                    className="px-4 py-12 text-center text-sm text-slate-500"
                  >
                    No products match the current filters.
                  </td>
                </tr>
              ) : (
                inventoryData.sortedProducts.map((product) => (
                  <tr key={product.id} className="align-middle">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="h-11 w-11 rounded-2xl object-cover"
                          />
                        ) : (
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                            <Package size={18} />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="truncate font-medium text-slate-900">{product.name}</p>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                            {product.barcode && <span>{product.barcode}</span>}
                            {!product.isActive && (
                              <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                                inactive
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600">{product.category}</td>
                    <td className="px-4 py-4 text-sm font-medium text-slate-900">{formatCurrency(product.price)}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          product.stockQuantity === 0
                            ? 'bg-red-50 text-red-700'
                            : product.stockQuantity < 10
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {product.stockQuantity} units
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-500">
                      {format(new Date(product.updatedAt), 'MMM d, yyyy')}
                    </td>
                    {canManageProducts && (
                      <td className="px-4 py-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditingProductId(product.id);
                              setIsAddEditModalOpen(true);
                            }}
                            className="rounded-xl border border-slate-200 p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                          >
                            <Edit size={16} />
                          </button>
                          {currentUser?.role === 'admin' && (
                            <button
                              onClick={() => {
                                setDeletingProductId(product.id);
                                setIsDeleteModalOpen(true);
                              }}
                              className="rounded-xl border border-red-200 p-2 text-red-600 transition-colors hover:bg-red-50"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        isOpen={isAddEditModalOpen}
        onClose={() => {
          setIsAddEditModalOpen(false);
          setEditingProductId(null);
        }}
        title={editingProductId ? 'Edit Product' : 'Add New Product'}
        size="lg"
      >
        <ProductForm
          productId={editingProductId}
          onSuccess={() => {
            setIsAddEditModalOpen(false);
            setEditingProductId(null);
          }}
        />
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingProductId(null);
        }}
        title="Confirm Delete"
        size="sm"
        footer={(
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setDeletingProductId(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete
            </Button>
          </>
        )}
      >
        <p className="text-slate-700">Are you sure you want to delete this product? This action cannot be undone.</p>
      </Modal>
    </div>
  );
};

export default InventoryPage;
