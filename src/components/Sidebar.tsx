import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  DocumentIcon,
  ExclamationTriangleIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', to: '/', icon: HomeIcon },
  { name: 'Inspections', to: '/inspections', icon: ClipboardDocumentListIcon },
  { name: 'Documents', to: '/documents', icon: DocumentIcon },
  { name: 'Deficiencies', to: '/deficiencies', icon: ExclamationTriangleIcon },
  { name: 'Photos', to: '/photos', icon: PhotoIcon },
];

export default function Sidebar() {
  return (
    <div className="w-64 bg-white shadow-sm">
      <nav className="mt-5 px-2">
        <div className="space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.to}
              className={({ isActive }) =>
                `group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActive
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <item.icon
                className="mr-3 h-6 w-6 flex-shrink-0"
                aria-hidden="true"
              />
              {item.name}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}