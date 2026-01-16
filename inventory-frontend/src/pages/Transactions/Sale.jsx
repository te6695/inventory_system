import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService, transactionService } from '../../services/endpoints';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import { ArrowLeftIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const Sale = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [stockError, setStockError] = useState('');
  
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      product_id: '',
      quantity: 1,
      unit_price: 0,
      notes: '',
      reference_number: '',
    }
  });

  const { data: productsResponse } = useQuery({
    queryKey: ['products'],
    queryFn: () => productService.getAll(),
  });

  // Helper to normalize product data
  const getNormalizedProducts = () => {
    if (!productsResponse) return [];
    
    if (Array.isArray(productsResponse)) {
      return productsResponse;
    }
    
    if (productsResponse?.data && Array.isArray(productsResponse.data)) {
      return productsResponse.data;
    }
    
    if (productsResponse?.products && Array.isArray(productsResponse.products)) {
      return productsResponse.products;
    }
    
    return [];
  };

  const products = getNormalizedProducts();
  
  // Watch quantity and product_id for real-time validation
  const quantity = watch('quantity');
  const productId = watch('product_id');

  useEffect(() => {
    if (productId) {
      const product = products.find(p => p.id == productId);
      if (product) {
        setSelectedProduct(product);
        setValue('unit_price', product.selling_price);
        
        // Check stock immediately
        if (quantity > 0) {
          validateStock(product, quantity);
        }
      }
    }
  }, [productId, quantity, products, setValue]);

  const saleMutation = useMutation({
    mutationFn: (data) => transactionService.sale(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['transactions']);
      queryClient.invalidateQueries(['products']);
      queryClient.invalidateQueries(['dashboardStats']);
      toast.success('Sale recorded successfully!');
      reset();
      setSelectedProduct(null);
      setStockError('');
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors?.quantity?.[0] || 
                          'Failed to record sale';
      toast.error(errorMessage);
      
      // If it's a stock error, update the stock error state
      if (errorMessage.includes('stock') || errorMessage.includes('insufficient')) {
        setStockError(errorMessage);
      }
    },
  });

  const validateStock = (product, qty) => {
    if (!product) return true;
    
    const availableStock = product.stock?.available_quantity || 
                          product.stock?.quantity || 
                          product.quantity || 
                          0;
    
    if (qty > availableStock) {
      setStockError(`Insufficient stock! Available: ${availableStock}, Requested: ${qty}`);
      return false;
    }
    
    setStockError('');
    return true;
  };

  const handleProductSelect = (productId) => {
    const product = products.find(p => p.id == productId);
    if (product) {
      setSelectedProduct(product);
      setValue('unit_price', product.selling_price);
      
      // Validate stock immediately
      if (quantity > 0) {
        validateStock(product, quantity);
      }
    }
  };

  const onSubmit = (data) => {
    // Find the product again to get latest stock
    const product = products.find(p => p.id == data.product_id);
    
    // Validate stock before submitting
    if (product && !validateStock(product, data.quantity)) {
      toast.error('Please adjust quantity to available stock');
      return;
    }
    
    // Prepare sale data
    const saleData = {
      product_id: parseInt(data.product_id),
      quantity: parseInt(data.quantity),
      unit_price: parseFloat(data.unit_price),
      notes: data.notes,
      reference_number: data.reference_number || `SALE-${Date.now()}`,
    };
    
    // Ensure unit price is not below purchase price (if we have that info)
    if (product && saleData.unit_price < (product.purchase_price || 0)) {
      if (!window.confirm(`Sale price ($${saleData.unit_price}) is below purchase price ($${product.purchase_price}). Continue anyway?`)) {
        return;
      }
    }
    
    saleMutation.mutate(saleData);
  };

  const calculateTotal = () => {
    const qty = parseFloat(watch('quantity') || 0);
    const unitPrice = parseFloat(watch('unit_price') || 0);
    return (qty * unitPrice).toFixed(2);
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
        <h1 className="text-2xl font-semibold text-gray-900 mt-2">Record Sale</h1>
        <p className="mt-1 text-sm text-gray-600">
          Record a sale from your inventory
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
                {...register('product_id', { 
                  required: 'Product is required',
                  onChange: (e) => handleProductSelect(e.target.value)
                })}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
              >
                <option value="">Select a product</option>
                {products.map(product => {
                  const availableStock = product.stock?.available_quantity || 
                                        product.stock?.quantity || 
                                        product.quantity || 
                                        0;
                  return (
                    <option key={product.id} value={product.id}>
                      {product.name} ({product.sku}) - Stock: {availableStock}
                    </option>
                  );
                })}
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
                  min: { value: 1, message: 'Quantity must be at least 1' },
                  validate: (value) => {
                    if (!selectedProduct) return true;
                    const qty = parseInt(value);
                    const availableStock = selectedProduct.stock?.available_quantity || 
                                          selectedProduct.stock?.quantity || 
                                          0;
                    return qty <= availableStock || `Max available: ${availableStock}`;
                  }
                })}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                onChange={(e) => {
                  const qty = parseInt(e.target.value);
                  if (selectedProduct && qty > 0) {
                    validateStock(selectedProduct, qty);
                  }
                }}
              />
              {errors.quantity && (
                <p className="mt-1 text-sm text-red-600">{errors.quantity.message}</p>
              )}
              {stockError && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                  {stockError}
                </p>
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
                  min: { value: 0.01, message: 'Unit price must be greater than 0' }
                })}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
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
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                placeholder="e.g., SO-12345"
                defaultValue={`SALE-${Date.now()}`}
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
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                placeholder="Additional notes about this sale..."
              />
            </div>
          </div>

          {/* Product Information */}
          {selectedProduct && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <h3 className="text-sm font-medium text-green-800 mb-2">Product Information</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">SKU:</span>
                  <span className="ml-2 font-medium">{selectedProduct.sku}</span>
                </div>
                <div>
                  <span className="text-gray-600">Current Stock:</span>
                  <span className="ml-2 font-medium">{selectedProduct.stock?.quantity || 0}</span>
                </div>
                <div>
                  <span className="text-gray-600">Available Stock:</span>
                  <span className="ml-2 font-medium">{selectedProduct.stock?.available_quantity || 0}</span>
                </div>
                <div>
                  <span className="text-gray-600">Reserved:</span>
                  <span className="ml-2 font-medium">{selectedProduct.stock?.reserved_quantity || 0}</span>
                </div>
                <div>
                  <span className="text-gray-600">Purchase Price:</span>
                  <span className="ml-2 font-medium">${selectedProduct.purchase_price}</span>
                </div>
                <div>
                  <span className="text-gray-600">Selling Price:</span>
                  <span className="ml-2 font-medium">${selectedProduct.selling_price}</span>
                </div>
                <div>
                  <span className="text-gray-600">Reorder Level:</span>
                  <span className="ml-2 font-medium">{selectedProduct.reorder_level}</span>
                </div>
                <div>
                  <span className="text-gray-600">Category:</span>
                  <span className="ml-2 font-medium">{selectedProduct.category?.name || 'Uncategorized'}</span>
                </div>
              </div>
              
              {/* Low Stock Warning */}
              {selectedProduct.stock && 
               (selectedProduct.stock.available_quantity <= selectedProduct.reorder_level) && (
                <div className="mt-3 flex items-center text-amber-800 bg-amber-50 p-2 rounded">
                  <ExclamationTriangleIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="text-sm">
                    Stock is {selectedProduct.stock.available_quantity <= 0 ? 'out of' : 'below reorder'} level 
                    ({selectedProduct.reorder_level})
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Current Transaction Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h3 className="text-sm font-medium text-blue-800 mb-2">Transaction Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Quantity:</span>
                <span className="ml-2 font-medium">{watch('quantity') || 0}</span>
              </div>
              <div>
                <span className="text-gray-600">Unit Price:</span>
                <span className="ml-2 font-medium">${watch('unit_price') || '0.00'}</span>
              </div>
              <div>
                <span className="text-gray-600">Total Amount:</span>
                <span className="ml-2 font-medium">${calculateTotal()}</span>
              </div>
              {selectedProduct && (
                <div>
                  <span className="text-gray-600">Stock After Sale:</span>
                  <span className={`ml-2 font-medium ${
                    (selectedProduct.stock?.available_quantity || 0) - (parseInt(watch('quantity')) || 0) <= 0
                      ? 'text-red-600'
                      : (selectedProduct.stock?.available_quantity || 0) - (parseInt(watch('quantity')) || 0) <= selectedProduct.reorder_level
                      ? 'text-amber-600'
                      : 'text-green-600'
                  }`}>
                    {(selectedProduct.stock?.available_quantity || 0) - (parseInt(watch('quantity')) || 0)}
                  </span>
                </div>
              )}
            </div>
          </div>

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
              disabled={saleMutation.isLoading || !!stockError}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saleMutation.isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </>
              ) : 'Record Sale'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Sale;