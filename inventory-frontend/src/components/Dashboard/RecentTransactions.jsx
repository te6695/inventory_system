import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/24/outline';

const RecentTransactions = ({ transactions }) => {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No recent transactions
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {transactions.slice(0, 5).map((transaction) => (
        <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center">
            <div className={`p-2 rounded-full ${
              transaction.type === 'purchase' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-green-100 text-green-800'
            }`}>
              {transaction.type === 'purchase' ? (
                <ArrowDownIcon className="h-4 w-4" />
              ) : (
                <ArrowUpIcon className="h-4 w-4" />
              )}
            </div>
            <div className="ml-3">
              <div className="text-sm font-medium text-gray-900">
                {transaction.product?.name}
              </div>
              <div className="text-xs text-gray-500 capitalize">
                {transaction.type} • {new Date(transaction.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-semibold text-gray-900">
              ${transaction.total_amount}
            </div>
            <div className="text-xs text-gray-500">
              {transaction.quantity} units
            </div>
          </div>
        </div>
      ))}
      {transactions.length > 5 && (
        <div className="text-center pt-4 border-t">
          <Link
            to="/transactions"
            className="text-sm text-indigo-600 hover:text-indigo-900"
          >
            View all transactions
          </Link>
        </div>
      )}
    </div>
  );
};

export default RecentTransactions;