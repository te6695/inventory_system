import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '../../hooks/useAuth.jsx';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user } = useAuth();
  const role = user?.role?.name;

  // Define navigation based on role
  const getNavigation = () => {
    const baseNav = [
      { name: 'Dashboard', href: '/dashboard', icon: 'Home', current: true },
    ];

    if (role === 'admin') {
      return [
        ...baseNav,
        { name: 'Users', href: '/users', icon: 'Users', current: false },
        { name: 'Reports', href: '/reports', icon: 'BarChart', current: false },
      ];
    }

    if (role === 'manager') {
      return [
        ...baseNav,
        { name: 'Products', href: '/products', icon: 'Package', current: false },
        { name: 'Categories', href: '/categories', icon: 'Tag', current: false },
        { name: 'Transactions', href: '/transactions', icon: 'CreditCard', current: false },
        { name: 'Purchase', href: '/transactions/purchase', icon: 'ShoppingCart', current: false },
        { name: 'Sale', href: '/transactions/sale', icon: 'DollarSign', current: false },
        { name: 'Reports', href: '/reports', icon: 'BarChart', current: false },
      ];
    }

    // Staff role (default)
    return [
      ...baseNav,
      { name: 'Products', href: '/products', icon: 'Package', current: false },
      { name: 'Transactions', href: '/transactions', icon: 'CreditCard', current: false },
      { name: 'Purchase', href: '/transactions/purchase', icon: 'ShoppingCart', current: false },
      { name: 'Sale', href: '/transactions/sale', icon: 'DollarSign', current: false },
    ];
  };

  const navigation = getNavigation();

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar 
        navigation={navigation} 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
      />
      <div className={`flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
        <Header 
          setSidebarOpen={setSidebarOpen} 
          sidebarCollapsed={sidebarCollapsed} 
          setSidebarCollapsed={setSidebarCollapsed}
        />
        <main className="flex-1 pb-8">
          <div className="px-4 sm:px-6 lg:px-8 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;