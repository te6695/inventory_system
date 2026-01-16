import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, ChevronDoubleLeftIcon, ChevronDoubleRightIcon } from '@heroicons/react/24/outline';
import {
  HomeIcon,
  CubeIcon,
  TagIcon,
  CreditCardIcon,
  ShoppingCartIcon,
  BanknotesIcon,
  UsersIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const icons = {
  Home: HomeIcon,
  Package: CubeIcon,
  Tag: TagIcon,
  CreditCard: CreditCardIcon,
  ShoppingCart: ShoppingCartIcon,
  DollarSign: BanknotesIcon,
  Users: UsersIcon,
  BarChart: ChartBarIcon,
};

const Sidebar = ({ 
  navigation, 
  sidebarOpen, 
  setSidebarOpen,
  sidebarCollapsed,
  setSidebarCollapsed 
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <>
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog as="div" className="relative z-40 lg:hidden" onClose={setSidebarOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-1"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-1"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
          </Transition.Child>

          <div className="fixed inset-0 z-40 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative flex w-full max-w-xs flex-1 flex-col bg-white pt-5 pb-4">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-1"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-1"
                  leaveTo="opacity-0"
                >
                  <div className="absolute top-0 right-0 -mr-12 pt-2">
                    <button
                      type="button"
                      className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <span className="sr-only">Close sidebar</span>
                      <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                    </button>
                  </div>
                </Transition.Child>
                <div className="flex flex-shrink-0 items-center px-4">
                  <div className="h-8 w-auto font-bold text-xl text-indigo-600">
                    {sidebarCollapsed ? 'IS' : 'Inventory System'}
                  </div>
                </div>
                <div className="mt-5 h-0 flex-1 overflow-y-auto">
                  <nav className="space-y-1 px-2">
                    {navigation.map((item) => {
                      const Icon = icons[item.icon];
                      const isActive = location.pathname === item.href;
                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          onClick={() => setSidebarOpen(false)}
                          className={`${
                            isActive
                              ? 'bg-gray-100 text-gray-900'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                        >
                          <Icon
                            className={`${
                              isActive ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500'
                            } mr-3 flex-shrink-0 h-6 w-6`}
                            aria-hidden="true"
                          />
                          <span className={`${sidebarCollapsed ? 'hidden' : 'block'}`}>
                            {item.name}
                          </span>
                        </Link>
                      );
                    })}
                  </nav>
                </div>
                <div className="flex flex-shrink-0 border-t border-gray-200 p-4">
                  <div className="flex items-center justify-between w-full">
                    <div className={`${sidebarCollapsed ? 'hidden' : 'block'}`}>
                      <div className="text-base font-medium text-gray-800">{user?.name}</div>
                      <div className="text-sm font-medium text-gray-500 capitalize">
                        {user?.role?.name}
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="text-sm text-red-600 hover:text-red-900 font-medium"
                    >
                      {sidebarCollapsed ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm11 4a1 1 0 10-2 0v4a1 1 0 102 0V7zm-3 1a1 1 0 10-2 0v2a1 1 0 102 0V8zM8 9a1 1 0 00-2 0v2a1 1 0 102 0V9zM5 10a1 1 0 10-2 0v2a1 1 0 102 0v-2z" clipRule="evenodd" />
                        </svg>
                      ) : 'Logout'}
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
            <div className="w-14 flex-shrink-0" aria-hidden="true"></div>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Static sidebar for desktop */}
      <div className={`hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col transition-all duration-300 ${
        sidebarCollapsed ? 'lg:w-20' : 'lg:w-64'
      }`}>
        <div className="flex flex-grow flex-col overflow-y-auto border-r border-gray-200 bg-white pt-5">
          <div className="flex flex-shrink-0 items-center px-4 justify-between">
            <div className={`h-8 w-auto font-bold text-xl text-indigo-600 transition-all duration-300 ${
              sidebarCollapsed ? 'text-center w-full text-lg' : ''
            }`}>
              {sidebarCollapsed ? 'IS' : 'Inventory System'}
            </div>
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-500 ml-2"
            >
              {sidebarCollapsed ? (
                <ChevronDoubleRightIcon className="h-5 w-5" />
              ) : (
                <ChevronDoubleLeftIcon className="h-5 w-5" />
              )}
            </button>
          </div>
          <div className="mt-5 flex flex-1 flex-col">
            <nav className="flex-1 space-y-1 px-2 pb-4">
              {navigation.map((item) => {
                const Icon = icons[item.icon];
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`${
                      isActive
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    } group flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'px-2'} py-2 text-sm font-medium rounded-md`}
                  >
                    <Icon
                      className={`${
                        isActive ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500'
                      } ${sidebarCollapsed ? 'mr-0' : 'mr-3'} flex-shrink-0 h-6 w-6`}
                      aria-hidden="true"
                    />
                    <span className={`transition-all duration-300 ${
                      sidebarCollapsed ? 'hidden' : 'block'
                    }`}>
                      {item.name}
                    </span>
                  </Link>
                );
              })}
            </nav>
            <div className="flex flex-shrink-0 border-t border-gray-200 p-4">
              <div className="flex items-center justify-between w-full">
                <div className={`transition-all duration-300 ${sidebarCollapsed ? 'hidden' : 'block'}`}>
                  <div className="text-base font-medium text-gray-800">{user?.name}</div>
                  <div className="text-sm font-medium text-gray-500 capitalize">
                    {user?.role?.name}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {sidebarCollapsed && (
                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                      <span className="text-indigo-800 font-medium text-sm">
                        {user?.name?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                  )}
                  <button
                    onClick={handleLogout}
                    className="text-sm text-red-600 hover:text-red-900 font-medium"
                    title={sidebarCollapsed ? "Logout" : ""}
                  >
                    {sidebarCollapsed ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm11 4a1 1 0 10-2 0v4a1 1 0 102 0V7zm-3 1a1 1 0 10-2 0v2a1 1 0 102 0V8zM8 9a1 1 0 00-2 0v2a1 1 0 102 0V9zM5 10a1 1 0 10-2 0v2a1 1 0 102 0v-2z" clipRule="evenodd" />
                      </svg>
                    ) : 'Logout'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;