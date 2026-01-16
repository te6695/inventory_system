import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService, transactionService } from '../../services/endpoints';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const Purchase = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    defaultValues: {
      product_id: '',
      quantity: 1,
      unit_price: 0,
      notes: '',
      reference_number: '',
    }
  });

  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: () => productService.getAll(),
  });
 
const availableProducts = Array.isArray(products) ? products : products?.data || [];



  const purchaseMutation = useMutation({
    mutationFn: (data) => transactionService.purchase(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['transactions']);
      queryClient.invalidateQueries(['products']);
      toast.success('Purchase recorded successfully!');
      reset();
      setSelectedProduct(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to record purchase');
    },
  });

  const handleProductSelect = (productId) => {
    const product = products?.data?.find(p => p.id == productId);
    if (product) {
      setSelectedProduct(product);
      setValue('unit_price', product.purchase_price);
    }
  };

  const onSubmit = (data) => {
    purchaseMutation.mutate(data);
  };

  const calculateTotal = () => {
    const quantity = parseFloat(document.querySelector('input[name="quantity"]')?.value || 0);
    const unitPrice = parseFloat(document.querySelector('input[name="unit_price"]')?.value || 0);
    return (quantity * unitPrice).toFixed(2);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          to="/transactions"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to Transactions
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900 mt-2">Record Purchase</h1>
        <p className="mt-1 text-sm text-gray-600">
          Add new stock to your inventory
        </p>
      </div>

      <div className="bg-white shadow rounded-lg">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product *
              </label>
              <select
                {...register('product_id', { required: 'Product is required' })}
                onChange={(e) => handleProductSelect(e.target.value)}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">Select a product</option>
  {availableProducts.map((product) => (
    <option key={product.id} value={product.id}>
      {product.name} ({product.sku}) - Stock: {product.stock?.quantity || 0}
    </option>
  ))}
              </select>
              {errors.product_id && (
                <p className="mt-1 text-sm text-red-600">{errors.product_id.message}</p>
              )}
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity *
              </label>
              <input
                type="number"
                min="1"
                step="1"
                {...register('quantity', { 
                  required: 'Quantity is required',
                  min: { value: 1, message: 'Quantity must be at least 1' }
                })}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              {errors.quantity && (
                <p className="mt-1 text-sm text-red-600">{errors.quantity.message}</p>
              )}
            </div>

            {/* Unit Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit Price ($) *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                {...register('unit_price', { 
                  required: 'Unit price is required',
                  min: { value: 0, message: 'Unit price must be positive' }
                })}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              {errors.unit_price && (
                <p className="mt-1 text-sm text-red-600">{errors.unit_price.message}</p>
              )}
            </div>

            {/* Total Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Amount
              </label>
              <div className="p-2 bg-gray-50 border border-gray-300 rounded-md">
                <p className="text-lg font-semibold text-gray-900">${calculateTotal()}</p>
              </div>
            </div>

            {/* Reference Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reference Number
              </label>
              <input
                type="text"
                {...register('reference_number')}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="e.g., PO-12345"
              />
            </div>

            {/* Notes */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                {...register('notes')}
                rows="3"
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Additional notes about this purchase..."
              />
            </div>
          </div>

          {/* Product Info */}
          {selectedProduct && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h3 className="text-sm font-medium text-blue-800 mb-2">Product Information</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Current Stock:</span>
                  <span className="ml-2 font-medium">{selectedProduct.stock?.quantity || 0}</span>
                </div>
                <div>
                  <span className="text-gray-600">Selling Price:</span>
                  <span className="ml-2 font-medium">${selectedProduct.selling_price}</span>
                </div>
                <div>
                  <span className="text-gray-600">Category:</span>
                  <span className="ml-2 font-medium">{selectedProduct.category?.name || 'Uncategorized'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Reorder Level:</span>
                  <span className="ml-2 font-medium">{selectedProduct.reorder_level}</span>
                </div>
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Link
              to="/transactions"
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={purchaseMutation.isLoading}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {purchaseMutation.isLoading ? 'Processing...' : 'Record Purchase'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Purchase;