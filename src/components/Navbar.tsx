import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../hooks/useApi';
import { Menu } from '@headlessui/react';
import { BellIcon } from '@heroicons/react/24/outline';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const { data: notifications = [], markAllAsRead } = useNotifications();
  
  const unreadCount = notifications?.length || 0;

  const handleMarkAllAsRead = () => {
    if (markAllAsRead) {
      markAllAsRead();
    }
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold">Construction QC</h1>
            </div>
          </div>

          <div className="flex items-center">
            <Menu as="div" className="relative">
              <Menu.Button className="p-2 rounded-full hover:bg-gray-100 relative">
                <BellIcon className="h-6 w-6" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
                )}
              </Menu.Button>

              <Menu.Items className="absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="py-1">
                  {notifications.map((notification) => (
                    <Menu.Item key={notification.id}>
                      {({ active }) => (
                        <div className={`${
                          active ? 'bg-gray-100' : ''
                        } px-4 py-2`}>
                          <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                          <p className="text-sm text-gray-500">{notification.message}</p>
                        </div>
                      )}
                    </Menu.Item>
                  ))}
                  {unreadCount > 0 && (
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={handleMarkAllAsRead}
                          className={`${
                            active ? 'bg-gray-100' : ''
                          } block w-full text-left px-4 py-2 text-sm text-indigo-600`}
                        >
                          Mark all as read
                        </button>
                      )}
                    </Menu.Item>
                  )}
                </div>
              </Menu.Items>
            </Menu>

            <Menu as="div" className="ml-3 relative">
              <Menu.Button className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <span className="sr-only">Open user menu</span>
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                  {user?.email?.[0].toUpperCase()}
                </div>
              </Menu.Button>

              <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => signOut()}
                      className={`${
                        active ? 'bg-gray-100' : ''
                      } block px-4 py-2 text-sm text-gray-700 w-full text-left`}
                    >
                      Sign out
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Menu>
          </div>
        </div>
      </div>
    </nav>
  );
}