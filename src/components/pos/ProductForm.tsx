import React, { useEffect, useState } from 'react';
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
    categoryId: '',
    description: '',
    imageUrl: '',
    stockQuantity: '',
    barcode: '',
    isActive: true
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!productId) {
      return;
    }

    const productToEdit = products.find((product) => product.id === productId);
    if (!productToEdit) {
      return;
    }

    setFormData({
      name: productToEdit.name,
      price: productToEdit.price.toString(),
      categoryId: productToEdit.categoryId || '',
      description: productToEdit.description,
      imageUrl: productToEdit.imageUrl || '',
      stockQuantity: productToEdit.stockQuantity.toString(),
      barcode: productToEdit.barcode || '',
      isActive: productToEdit.isActive
    });
  }, [productId, products]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));

    if (errors[name]) {
      setErrors((current) => {
        const nextErrors = { ...current };
        delete nextErrors[name];
        return nextErrors;
      });
    }
  };

  const validateForm = () => {
    const nextErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      nextErrors.name = 'Product name is required';
    }

    if (!formData.price.trim()) {
      nextErrors.price = 'Price is required';
    } else if (Number.isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      nextErrors.price = 'Price must be a positive number';
    }

    if (!formData.categoryId) {
      nextErrors.categoryId = 'Category is required';
    }

    if (!formData.stockQuantity.trim()) {
      nextErrors.stockQuantity = 'Quantity is required';
    } else if (Number.isNaN(Number(formData.stockQuantity)) || Number(formData.stockQuantity) < 0) {
      nextErrors.stockQuantity = 'Quantity must be a non-negative number';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const productData = {
        name: formData.name.trim(),
        price: Number(formData.price),
        categoryId: formData.categoryId,
        description: formData.description.trim(),
        imageUrl: formData.imageUrl.trim() || undefined,
        stockQuantity: Number(formData.stockQuantity),
        barcode: formData.barcode.trim() || undefined,
        isActive: formData.isActive
      };

      if (productId) {
        const existingProduct = products.find((product) => product.id === productId);
        if (existingProduct) {
          await updateProduct({
            ...existingProduct,
            ...productData
          });
        }
      } else {
        await addProduct(productData);
      }

      onSuccess();
    } catch (error) {
      setErrors({
        form: error instanceof Error ? error.message : 'Unable to save the product'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.form && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {errors.form}
        </div>
      )}

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
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            className="w-full rounded-md shadow-sm border border-gray-300 bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select Category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.categoryId && <p className="mt-1 text-sm text-red-600">{errors.categoryId}</p>}
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
        <label className="block text-sm font-medium mb-1">Availability</label>
        <select
          name="isActive"
          value={formData.isActive ? 'true' : 'false'}
          onChange={(event) =>
            setFormData((current) => ({ ...current, isActive: event.target.value === 'true' }))
          }
          className="w-full rounded-md shadow-sm border border-gray-300 bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="true">Active and available for sale</option>
          <option value="false">Inactive and hidden from checkout</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="w-full rounded-md shadow-sm border border-gray-300 bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onSuccess}>
          Cancel
        </Button>

        <Button type="submit" variant="primary" icon={<Save size={18} />} disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : productId ? 'Update Product' : 'Save Product'}
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;
