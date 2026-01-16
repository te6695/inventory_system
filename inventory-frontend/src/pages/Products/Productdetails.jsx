import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productService } from '../../services/endpoints';
import { ArrowLeftIcon, CubeIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const ProductDetails = () => {
  const { id } = useParams();
  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productService.getById(id),
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Product not found</h3>
        <Link to="/products" className="text-indigo-600 hover:text-indigo-900">
          Go back to products
        </Link>
      </div>
    );
  }

  // Calculate available stock safely
  const quantity = parseFloat(product.stock?.quantity) || 0;
  const reservedQuantity = parseFloat(product.stock?.reserved_quantity) || 0;
  const availableStock = quantity - reservedQuantity;
  
  // Safely parse numeric values
  const totalValue = parseFloat(product.stock?.total_value) || 0;
  const reorderLevel = parseFloat(product.reorder_level) || 0;

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/products"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to Products
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900 mt-2">{product.name}</h1>
        <p className="mt-1 text-sm text-gray-600">SKU: {product.sku}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Product Info */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Product Information</h2>
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">SKU</dt>
              <dd className="mt-1 text-sm text-gray-900">{product.sku}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Category</dt>
              <dd className="mt-1 text-sm text-gray-900">{product.category?.name || 'Uncategorized'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Purchase Price</dt>
              <dd className="mt-1 text-sm text-gray-900">${parseFloat(product.purchase_price || 0).toFixed(2)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Selling Price</dt>
              <dd className="mt-1 text-sm text-gray-900">${parseFloat(product.selling_price || 0).toFixed(2)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Reorder Level</dt>
              <dd className="mt-1 text-sm text-gray-900">{reorderLevel} {product.unit}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Unit</dt>
              <dd className="mt-1 text-sm text-gray-900">{product.unit}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Description</dt>
              <dd className="mt-1 text-sm text-gray-900">{product.description || 'No description'}</dd>
            </div>
          </dl>
        </div>

        {/* Stock Info */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Stock Information</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Current Stock</h3>
              <p className="mt-1 text-3xl font-semibold text-gray-900">
                {quantity} <span className="text-lg text-gray-600">{product.unit}</span>
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Available Stock</h3>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {availableStock} <span className="text-lg text-gray-600">{product.unit}</span>
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Reserved Stock</h3>
              <p className="mt-1 text-lg font-semibold text-gray-500">
                {reservedQuantity} <span className="text-md text-gray-600">{product.unit}</span>
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Stock Value</h3>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                ${totalValue.toFixed(2)}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Status</h3>
              <p className="mt-1">
                {availableStock <= 0 ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                    Out of Stock
                  </span>
                ) : availableStock <= reorderLevel ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                    Low Stock
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    In Stock
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;