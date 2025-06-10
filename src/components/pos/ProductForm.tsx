import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { useAppContext } from '../../context/AppContext';

interface ProductFormProps {
  productId?: string | null;
  onSuccess: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ productId, onSuccess }) => {
  const { products, categories, addProduct, updateProduct } = useAppContext();
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    description: '',
    imageUrl: '',
    stockQuantity: '',
    barcode: '',
    transcription: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  useEffect(() => {
    if (productId) {
      const productToEdit = products.find(p => p.id === productId);
      if (productToEdit) {
        setFormData({
          name: productToEdit.name,
          price: productToEdit.price.toString(),
          category: productToEdit.category,
          description: productToEdit.description,
          imageUrl: productToEdit.imageUrl || '',
          stockQuantity: productToEdit.stockQuantity.toString(),
          barcode: productToEdit.barcode || '',
          transcription: productToEdit.transcription || '',
        });
      }
    }
  }, [productId, products]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.price.trim()) {
      newErrors.price = 'Price is required';
    } else if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      newErrors.price = 'Price must be a positive number';
    }
    
    if (!formData.category) newErrors.category = 'Category is required';
    
    if (!formData.stockQuantity.trim()) {
      newErrors.stockQuantity = 'Quantity is required';
    } else if (isNaN(Number(formData.stockQuantity)) || Number(formData.stockQuantity) < 0) {
      newErrors.stockQuantity = 'Quantity must be a non-negative number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const productData = {
      name: formData.name,
      price: Number(formData.price),
      category: formData.category,
      description: formData.description,
      imageUrl: formData.imageUrl || undefined,
      stockQuantity: Number(formData.stockQuantity),
      barcode: formData.barcode || undefined,
      transcription: formData.transcription || undefined,
    };
    
    if (productId) {
      const existingProduct = products.find(p => p.id === productId);
      if (existingProduct) {
        updateProduct({
          ...existingProduct,
          ...productData,
        });
      }
    } else {
      addProduct(productData);
    }
    
    onSuccess();
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Product Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          required
        />
        
        <Input
          label="Price"
          name="price"
          type="number"
          step="0.01"
          min="0"
          value={formData.price}
          onChange={handleChange}
          error={errors.price}
          required
        />
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full rounded-md shadow-sm border-gray-600 bg-gray-700 text-white focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select Category</option>
            {categories.map(category => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
        </div>
        
        <Input
          label="Stock Quantity"
          name="stockQuantity"
          type="number"
          min="0"
          value={formData.stockQuantity}
          onChange={handleChange}
          error={errors.stockQuantity}
          required
        />
        
        <Input
          label="Barcode (Optional)"
          name="barcode"
          value={formData.barcode}
          onChange={handleChange}
        />
        
        <Input
          label="Image URL (Optional)"
          name="imageUrl"
          value={formData.imageUrl}
          onChange={handleChange}
          placeholder="https://example.com/image.jpg"
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="w-full rounded-md shadow-sm border-gray-600 bg-gray-700 text-white focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={onSuccess}
        >
          Cancel
        </Button>
        
        <Button
          type="submit"
          variant="primary"
          icon={<Save size={18} />}
        >
          {productId ? 'Update Product' : 'Save Product'}
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;