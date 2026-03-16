import React, { useState } from 'react';
import { Download, Edit, Package, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import Button from '../components/ui/Button';
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

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? product.categoryId === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const direction = sortDirection === 'asc' ? 1 : -1;

    switch (sortField) {
      case 'price':
        return (a.price - b.price) * direction;
      case 'stock':
        return (a.stockQuantity - b.stockQuantity) * direction;
      case 'category':
        return a.category.localeCompare(b.category) * direction;
      default:
        return a.name.localeCompare(b.name) * direction;
    }
  });

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-blue-900">Inventory Management</h1>
          <p className="text-sm text-gray-500">Track stock levels, pricing, and category coverage.</p>
        </div>

        <div className="flex gap-2">
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

          <Button variant="secondary" icon={<Download size={18} />} onClick={() => exportInventoryToExcel(products)}>
            Export
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search products..."
            className="w-full px-4 py-2 rounded-md border border-blue-300 bg-white focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <select
            value={selectedCategory}
            onChange={(event) => setSelectedCategory(event.target.value)}
            className="rounded-md border border-blue-300 py-2 pl-3 pr-10 text-sm bg-white text-blue-900"
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

      <div className="overflow-x-auto bg-white rounded-lg shadow-md">
        <table className="min-w-full divide-y divide-blue-200">
          <thead className="bg-blue-50">
            <tr>
              {[
                { key: 'name', label: 'Product Name' },
                { key: 'category', label: 'Category' },
                { key: 'price', label: 'Price' },
                { key: 'stock', label: 'Stock' }
              ].map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-3 text-left text-xs font-medium text-blue-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => {
                    if (sortField === column.key) {
                      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
                    } else {
                      setSortField(column.key);
                      setSortDirection('asc');
                    }
                  }}
                >
                  <div className="flex items-center">
                    {column.label}
                    {sortField === column.key && <span className="ml-1">{sortDirection === 'asc' ? '▲' : '▼'}</span>}
                  </div>
                </th>
              ))}
              <th className="px-6 py-3 text-left text-xs font-medium text-blue-500 uppercase tracking-wider">
                Last Updated
              </th>
              {canManageProducts && (
                <th className="px-6 py-3 text-right text-xs font-medium text-blue-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-blue-200">
            {sortedProducts.length === 0 ? (
              <tr>
                <td colSpan={canManageProducts ? 6 : 5} className="px-6 py-4 text-center text-blue-500">
                  No products found
                </td>
              </tr>
            ) : (
              sortedProducts.map((product) => (
                <tr key={product.id} className="hover:bg-blue-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="h-10 w-10 rounded-md object-cover mr-3" />
                      ) : (
                        <div className="h-10 w-10 rounded-md bg-blue-200 flex items-center justify-center mr-3">
                          <Package className="h-5 w-5 text-blue-500" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-blue-900">{product.name}</div>
                        {product.barcode && <div className="text-sm text-blue-500">{product.barcode}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-blue-900">{product.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-blue-900">{formatCurrency(product.price)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      product.stockQuantity === 0
                        ? 'bg-red-100 text-red-800'
                        : product.stockQuantity < 10
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                    }`}>
                      {product.stockQuantity} units
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-500">
                    {format(new Date(product.updatedAt), 'MMM d, yyyy')}
                  </td>
                  {canManageProducts && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          setEditingProductId(product.id);
                          setIsAddEditModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <Edit size={18} />
                      </button>
                      {currentUser?.role === 'admin' && (
                        <button
                          onClick={() => {
                            setDeletingProductId(product.id);
                            setIsDeleteModalOpen(true);
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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
        footer={
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
        }
      >
        <p className="text-blue-900">Are you sure you want to delete this product? This action cannot be undone.</p>
      </Modal>
    </div>
  );
};

export default InventoryPage;
