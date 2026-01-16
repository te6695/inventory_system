import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { productService, categoryService } from '../../services/endpoints';
import toast from 'react-hot-toast';

const ProductForm = ({ product, onSuccess }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      sku: '',
      name: '',
      description: '',
      category_id: '',
      purchase_price: 0,
      selling_price: 0,
      reorder_level: 10,
      unit: 'piece',
      is_active: '1',
    }
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getAll(),
  });

  const mutation = useMutation({
    mutationFn: (data) => 
      product 
        ? productService.update(product.id, data)
        : productService.create(data),
    onSuccess: () => {
      toast.success(`Product ${product ? 'updated' : 'created'} successfully!`);
      onSuccess();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || `Failed to ${product ? 'update' : 'create'} product`);
    },
  });

  useEffect(() => {
    if (product) {
      // Transform product data to match form structure
      const productData = {
        sku: product.sku || '',
        name: product.name || '',
        description: product.description || '',
        category_id: product.category_id || product.category?.id || '',
        purchase_price: product.purchase_price || 0,
        selling_price: product.selling_price || 0,
        reorder_level: product.reorder_level || 10,
        unit: product.unit || 'piece',
        is_active: product.is_active ? '1' : '0'
      };
      reset(productData);
    }
  }, [product, reset]);

  const onSubmit = (data) => {
    // Convert string values to appropriate types
    const formattedData = {
      sku: data.sku,
      name: data.name,
      description: data.description,
      category_id: data.category_id ? parseInt(data.category_id) : null,
      purchase_price: parseFloat(data.purchase_price) || 0,
      selling_price: parseFloat(data.selling_price) || 0,
      reorder_level: parseInt(data.reorder_level) || 10,
      unit: data.unit,
      is_active: data.is_active === '1',
    };

    // Handle image separately if present
    const formData = new FormData();
    
    Object.keys(formattedData).forEach(key => {
      if (formattedData[key] !== undefined && formattedData[key] !== null) {
        formData.append(key, formattedData[key]);
      }
    });

    // Append image if a new one was selected
    if (data.image && data.image[0]) {
      formData.append('image', data.image[0]);
    }

    mutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">SKU *</label>
          <input
            type="text"
            {...register('sku', { required: 'SKU is required' })}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
          {errors.sku && <p className="mt-1 text-sm text-red-600">{errors.sku.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Name *</label>
          <input
            type="text"
            {...register('name', { required: 'Name is required' })}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            {...register('description')}
            rows="3"
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Category *</label>
          <select
            {...register('category_id', { required: 'Category is required' })}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="">Select Category</option>
            {categories?.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.category_id && <p className="mt-1 text-sm text-red-600">{errors.category_id.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Unit *</label>
          <select
            {...register('unit', { required: 'Unit is required' })}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="piece">Piece</option>
            <option value="kg">Kilogram</option>
            <option value="liter">Liter</option>
            <option value="meter">Meter</option>
            <option value="box">Box</option>
            <option value="pack">Pack</option>
          </select>
          {errors.unit && <p className="mt-1 text-sm text-red-600">{errors.unit.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Purchase Price ($) *</label>
          <input
            type="number"
            step="0.01"
            min="0"
            {...register('purchase_price', { 
              required: 'Purchase price is required',
              min: { value: 0, message: 'Price must be positive' }
            })}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
          {errors.purchase_price && <p className="mt-1 text-sm text-red-600">{errors.purchase_price.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Selling Price ($) *</label>
          <input
            type="number"
            step="0.01"
            min="0"
            {...register('selling_price', { 
              required: 'Selling price is required',
              min: { value: 0, message: 'Price must be positive' }
            })}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
          {errors.selling_price && <p className="mt-1 text-sm text-red-600">{errors.selling_price.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Reorder Level *</label>
          <input
            type="number"
            min="0"
            {...register('reorder_level', { 
              required: 'Reorder level is required',
              min: { value: 0, message: 'Reorder level must be positive' }
            })}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
          {errors.reorder_level && <p className="mt-1 text-sm text-red-600">{errors.reorder_level.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select
            {...register('is_active')}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="1">Active</option>
            <option value="0">Inactive</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Product Image</label>
          <input
            type="file"
            accept="image/*"
            {...register('image')}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
          {product?.image && !product.image.includes('...') && (
            <div className="mt-2">
              <p className="text-sm text-gray-500">Current image:</p>
              <img 
                src={`/storage/${product.image}`} 
                alt={product.name}
                className="h-20 w-20 object-cover rounded mt-1"
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button
          type="button"
          onClick={onSuccess}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={mutation.isLoading}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {mutation.isLoading ? 'Saving...' : (product ? 'Update Product' : 'Create Product')}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;