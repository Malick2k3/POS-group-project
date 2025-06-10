import React, { useState } from 'react';
import { Search, Package, Filter } from 'lucide-react';
import ProductCard from './ProductCard';
import ProductForm from './ProductForm';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useAppContext } from '../../context/AppContext';

const ProductList: React.FC = () => {
  const { products, categories } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  
  const handleOpenEditModal = (productId: string) => {
    setEditingProduct(productId);
    setIsAddProductModalOpen(true);
  };
  
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? product.category === selectedCategory : true;
    
    return matchesSearch && matchesCategory;
  });
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col md:flex-row items-center gap-3 mb-4">
        <div className="relative flex-1 w-full">
          <Input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search className="h-5 w-5 text-gray-400" />}
            className="w-full"
          />
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-md border border-gray-300 dark:border-gray-600 py-2 pl-3 pr-10 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
          
          <Button
            variant="secondary"
            onClick={() => {
              setEditingProduct(null);
              setIsAddProductModalOpen(true);
            }}
          >
            Add Product
          </Button>
        </div>
      </div>
      
      {filteredProducts.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-gray-500 dark:text-gray-400">
          <Package size={48} className="mb-4 opacity-30" />
          <p className="text-center">No products found</p>
          <p className="text-center text-sm mt-2">Try a different search term or category</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto">
          {filteredProducts.map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onEdit={() => handleOpenEditModal(product.id)}
            />
          ))}
        </div>
      )}
      
      <Modal
        isOpen={isAddProductModalOpen}
        onClose={() => {
          setIsAddProductModalOpen(false);
          setEditingProduct(null);
        }}
        title={editingProduct ? "Edit Product" : "Add New Product"}
        size="lg"
      >
        <ProductForm 
          productId={editingProduct} 
          onSuccess={() => {
            setIsAddProductModalOpen(false);
            setEditingProduct(null);
          }} 
        />
      </Modal>
    </div>
  );
};

export default ProductList;