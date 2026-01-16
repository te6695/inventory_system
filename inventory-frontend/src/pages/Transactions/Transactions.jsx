import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { transactionService } from '../../services/endpoints';
import { 
  ShoppingBagIcon, 
  ArrowUpIcon, 
  ArrowDownIcon,
  CalendarIcon,
  FunnelIcon 
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const Transactions = () => {
  const [typeFilter, setTypeFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const { data: transactionsResponse, isLoading } = useQuery({
    queryKey: ['transactions', { type: typeFilter, date_from: dateFrom, date_to: dateTo }],
    queryFn: () => transactionService.getAll({ 
      type: typeFilter, 
      date_from: dateFrom, 
      date_to: dateTo 
    }),
  });

  // Helper to normalize data (handle both array and paginated responses)
  const getNormalizedData = (data) => {
    if (!data) return [];
    
    // If data has a data property (paginated Laravel response)
    if (data.data && Array.isArray(data.data)) {
      return data.data;
    }
    
    // If it's already an array
    if (Array.isArray(data)) {
      return data;
    }
    
    // If it has transactions property
    if (data.transactions && Array.isArray(data.transactions)) {
      return data.transactions;
    }
    
    return [];
  };

  const transactions = getNormalizedData(transactionsResponse);

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'purchase':
        return ArrowDownIcon;
      case 'sale':
        return ArrowUpIcon;
      default:
        return ShoppingBagIcon;
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'purchase':
        return 'bg-blue-100 text-blue-800';
      case 'sale':
        return 'bg-green-100 text-green-800';
      case 'return':
        return 'bg-yellow-100 text-yellow-800';
      case 'adjustment':
        return 'bg-purple-100 text-purple-800';
      case 'transfer':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTransactionLabel = (type) => {
    switch (type) {
      case 'purchase': return 'Purchase';
      case 'sale': return 'Sale';
      case 'return': return 'Return';
      case 'adjustment': return 'Adjustment';
      case 'transfer': return 'Transfer';
      default: return type;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Transactions</h1>
          <p className="mt-1 text-sm text-gray-600">
            View all inventory transactions from inventory_transactions table
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Link
            to="/transactions/purchase"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowDownIcon className="h-5 w-5 mr-2" />
            New Purchase
          </Link>
          <Link
            to="/transactions/sale"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <ArrowUpIcon className="h-5 w-5 mr-2" />
            New Sale
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FunnelIcon className="h-4 w-4 inline mr-1" />
              Transaction Type
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="">All Types</option>
              <option value="purchase">Purchase</option>
              <option value="sale">Sale</option>
              <option value="return">Return</option>
              <option value="adjustment">Adjustment</option>
              <option value="transfer">Transfer</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <CalendarIcon className="h-4 w-4 inline mr-1" />
              Date From
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <CalendarIcon className="h-4 w-4 inline mr-1" />
              Date To
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setTypeFilter('');
                setDateFrom('');
                setDateTo('');
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      {transactions.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-sm text-gray-500">Total Transactions</div>
              <div className="text-2xl font-bold">{transactions.length}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500">Purchases</div>
              <div className="text-2xl font-bold text-blue-600">
                {transactions.filter(t => t.type === 'purchase').length}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500">Sales</div>
              <div className="text-2xl font-bold text-green-600">
                {transactions.filter(t => t.type === 'sale').length}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500">Total Value</div>
              <div className="text-2xl font-bold text-indigo-600">
                ${transactions.reduce((sum, t) => sum + (parseFloat(t.total_amount) || 0), 0).toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transactions List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  sold/purchased by
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.length > 0 ? (
                transactions.map((transaction) => {
                  const Icon = getTransactionIcon(transaction.type);
                  return (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-xs font-mono text-gray-500">#{transaction.id}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`p-2 rounded-full ${getTransactionColor(transaction.type)}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {getTransactionLabel(transaction.type)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {transaction.reference_number || `REF-${transaction.id}`}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {transaction.product?.name || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {transaction.product?.sku || 'No SKU'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          transaction.type === 'purchase' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {transaction.type === 'purchase' ? '+' : '-'}{transaction.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          ${parseFloat(transaction.unit_price || 0).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-gray-900">
                          ${parseFloat(transaction.total_amount || 0).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {transaction.user?.name || 'System'}
                            </div>
                            <div className="text-xs text-gray-500">
                              {transaction.user?.email || ''}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(transaction.created_at)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(transaction.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <ShoppingBagIcon className="h-12 w-12 text-gray-300 mb-3" />
                      <h3 className="text-lg font-medium text-gray-900 mb-1">No transactions found</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        {typeFilter || dateFrom || dateTo 
                          ? 'Try changing your filters' 
                          : 'Start by creating your first transaction'}
                      </p>
                      <div className="flex space-x-3">
                        <Link
                          to="/transactions/purchase"
                          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                        >
                          <ArrowDownIcon className="h-4 w-4 mr-2" />
                          Record Purchase
                        </Link>
                        <Link
                          to="/transactions/sale"
                          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                        >
                          <ArrowUpIcon className="h-4 w-4 mr-2" />
                          Record Sale
                        </Link>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination (if using paginated response) */}
        {transactionsResponse?.links && (
          <div className="px-6 py-3 border-t border-gray-200">
            <nav className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing <span className="font-medium">{transactions.length}</span> transactions
              </div>
              <div className="flex space-x-2">
                {transactionsResponse.links.map((link, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      if (link.url) {
                        // Handle pagination (you might need to adjust the query)
                        const page = link.url.split('page=')[1];
                        // Refetch with new page parameter
                      }
                    }}
                    className={`px-3 py-1 rounded-md text-sm ${
                      link.active
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                  />
                ))}
              </div>
            </nav>
          </div>
        )}
      </div>

      {/* Transaction Stats by Type */}
      {transactions.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Transaction Summary by Type</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {['purchase', 'sale', 'return', 'adjustment', 'transfer'].map((type) => {
              const typeTransactions = transactions.filter(t => t.type === type);
              if (typeTransactions.length === 0) return null;
              
              return (
                <div key={type} className={`p-4 rounded-lg ${getTransactionColor(type)}`}>
                  <div className="text-sm font-medium capitalize mb-1">{getTransactionLabel(type)}</div>
                  <div className="text-xl font-bold">{typeTransactions.length}</div>
                  <div className="text-sm">
                    Total: ${typeTransactions.reduce((sum, t) => sum + (parseFloat(t.total_amount) || 0), 0).toFixed(2)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;