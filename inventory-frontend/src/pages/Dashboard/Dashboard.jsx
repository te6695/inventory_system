import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  ShoppingCartIcon, 
  CubeIcon, 
  UsersIcon, 
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon 
} from '@heroicons/react/24/outline';
import { dashboardService } from '../../services/endpoints';
import { useAuth } from '../../hooks/useAuth.jsx';
import StatsCard from '../../components/Common/StatsCard';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import RecentTransactions from '../../components/Dashboard/RecentTransactions';
import SalesChart from '../../components/Dashboard/SalesChart';

const Dashboard = () => {
  const { user } = useAuth();
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: () => dashboardService.getStats(),
  });

  const statCards = [
    {
      title: 'Total Products',
      value: stats?.stats?.total_products || 0,
      icon: CubeIcon,
      color: 'bg-blue-500',
      change: '+12%',
    },
    {
      title: 'Total Sales',
      value: `$${stats?.stats?.monthly_sales?.toLocaleString() || 0}`,
      icon: CurrencyDollarIcon,
      color: 'bg-green-500',
      change: '+23%',
    },
    {
      title: 'Low Stock',
      value: stats?.stats?.low_stock_products || 0,
      icon: ExclamationTriangleIcon,
      color: 'bg-red-500',
      change: 'Need Attention',
    },
    {
      title: 'Today Sales',
      value: `$${stats?.stats?.today_sales?.toLocaleString() || 0}`,
      icon: ArrowTrendingUpIcon,
      color: 'bg-purple-500',
      change: '+5%',
    },
  ];

  if (user?.role?.name === 'admin') {
    statCards.splice(2, 0, {
      title: 'Total Users',
      value: stats?.stats?.total_users || 0,
      icon: UsersIcon,
      color: 'bg-yellow-500',
      change: '+3%',
    });
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Here's what's happening with your inventory today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Sales Overview</h3>
            <SalesChart />
          </div>
        </div>

        {/* Recent Transactions */}
        <div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Transactions</h3>
            <RecentTransactions transactions={stats?.recent_transactions || []} />
          </div>
        </div>
      </div>

      {/* Low Stock Products */}
      {stats?.low_stock_products > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Low Stock Products</h3>
            <span className="px-3 py-1 text-sm font-medium text-red-800 bg-red-100 rounded-full">
              {stats.low_stock_products} products
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Stock</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reorder Level</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stats?.top_products?.map((product) => (
                  <tr key={product.id}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.sku}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{product.stock?.quantity || 0}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm text-gray-500">{product.reorder_level}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {product.stock?.quantity <= product.reorder_level ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          Low Stock
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          In Stock
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;