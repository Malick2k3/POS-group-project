import React, { useState } from 'react';
import { Package, Edit, Trash2, Plus, Download } from 'lucide-react';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import ProductForm from '../components/pos/ProductForm';
import { useAppContext } from '../context/AppContext';
import { formatCurrency } from '../utils/formatters';
import { format } from 'date-fns';

const InventoryPage: React.FC = () => {
  const { products, categories, deleteProduct, currentUser } = useAppContext();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortField, setSortField] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  const handleOpenEditModal = (productId: string) => {
    setEditingProductId(productId);
    setIsAddEditModalOpen(true);
  };
  
  const handleOpenDeleteModal = (productId: string) => {
    setDeletingProductId(productId);
    setIsDeleteModalOpen(true);
  };
  
  const handleDelete = () => {
    if (deletingProductId) {
      deleteProduct(deletingProductId);
      setIsDeleteModalOpen(false);
      setDeletingProductId(null);
    }
  };
  
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? product.category === selectedCategory : true;
    
    return matchesSearch && matchesCategory;
  });
  
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let comparison = 0;
    
    switch (sortField) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'price':
        comparison = a.price - b.price;
        break;
      case 'stock':
        comparison = a.stockQuantity - b.stockQuantity;
        break;
      case 'category':
        comparison = a.category.localeCompare(b.category);
        break;
      default:
        comparison = 0;
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });
  
  const isAdmin = currentUser?.role === 'admin';
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-blue-900 dark:text-blue-200">Inventory Management</h1>
        
        <div className="flex gap-2">
          {isAdmin && (
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
          >
            Export
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products..."
            className="w-full px-4 py-2 rounded-md border border-blue-300 dark:border-blue-600 dark:bg-blue-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-md border border-blue-300 dark:border-blue-600 py-2 pl-3 pr-10 text-sm bg-white dark:bg-blue-900 text-blue-900 dark:text-white"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="overflow-x-auto bg-white dark:bg-blue-900 rounded-lg shadow-md">
        <table className="min-w-full divide-y divide-blue-200 dark:divide-blue-700">
          <thead className="bg-blue-50 dark:bg-blue-800">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-blue-500 dark:text-blue-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center">
                  Product Name
                  {sortField === 'name' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '▲' : '▼'}</span>
                  )}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-blue-500 dark:text-blue-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('category')}
              >
                <div className="flex items-center">
                  Category
                  {sortField === 'category' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '▲' : '▼'}</span>
                  )}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-blue-500 dark:text-blue-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('price')}
              >
                <div className="flex items-center">
                  Price
                  {sortField === 'price' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '▲' : '▼'}</span>
                  )}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-blue-500 dark:text-blue-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('stock')}
              >
                <div className="flex items-center">
                  Stock
                  {sortField === 'stock' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '▲' : '▼'}</span>
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-blue-500 dark:text-blue-300 uppercase tracking-wider">
                Last Updated
              </th>
              {isAdmin && (
                <th className="px-6 py-3 text-right text-xs font-medium text-blue-500 dark:text-blue-300 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-blue-900 divide-y divide-blue-200 dark:divide-blue-700">
            {sortedProducts.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 6 : 5} className="px-6 py-4 text-center text-blue-500 dark:text-blue-400">
                  No products found
                </td>
              </tr>
            ) : (
              sortedProducts.map(product => (
                <tr key={product.id} className="hover:bg-blue-50 dark:hover:bg-blue-800">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="h-10 w-10 rounded-md object-cover mr-3"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-md bg-blue-200 dark:bg-blue-700 flex items-center justify-center mr-3">
                          <Package className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-blue-900 dark:text-blue-200">{product.name}</div>
                        {product.barcode && (
                          <div className="text-sm text-blue-500 dark:text-blue-400">
                            {product.barcode}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-blue-900 dark:text-blue-200">
                    {product.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-blue-900 dark:text-blue-200">
                    {formatCurrency(product.price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      product.stockQuantity === 0
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        : product.stockQuantity < 10
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    }`}>
                      {product.stockQuantity} units
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-500 dark:text-blue-400">
                    {format(new Date(product.updatedAt), 'MMM d, yyyy')}
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleOpenEditModal(product.id)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 mr-3"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleOpenDeleteModal(product.id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                      >
                        <Trash2 size={18} />
                      </button>
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
        title={editingProductId ? "Edit Product" : "Add New Product"}
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
            <Button
              variant="danger"
              onClick={handleDelete}
            >
              Delete
            </Button>
          </>
        }
      >
        <p className="text-blue-900 dark:text-blue-200">Are you sure you want to delete this product? This action cannot be undone.</p>
      </Modal>
    </div>
  );
};

export default InventoryPage;