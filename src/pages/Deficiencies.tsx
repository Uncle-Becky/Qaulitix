import React, { useState } from 'react';
import { useDeficiencies } from '../hooks/useApi';
import { Dialog } from '@headlessui/react';
import DeficiencyForm from '../components/forms/DeficiencyForm';
import ShareLink from '../components/ShareLink';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Deficiencies() {
  const { data: deficiencies, isLoading } = useDeficiencies();
  const [isFormOpen, setIsFormOpen] = useState(false);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Deficiencies</h1>
        <div className="space-x-2">
          <ShareLink path="/deficiencies" title="Deficiencies List" />
          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            Report Deficiency
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {deficiencies?.map((deficiency) => (
          <div
            key={deficiency.id}
            className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{deficiency.description}</p>
              <p className="text-sm text-gray-500">{deficiency.location}</p>
              <div className="mt-1 flex items-center space-x-2">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                  ${deficiency.severity === 'high' ? 'bg-red-100 text-red-800' : 
                    deficiency.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'}`}>
                  {deficiency.severity}
                </span>
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                  ${deficiency.status === 'resolved' ? 'bg-green-100 text-green-800' : 
                    deficiency.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'}`}>
                  {deficiency.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        className="fixed inset-0 z-10 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
          <div className="relative bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <Dialog.Title className="text-lg font-medium mb-4">
              Report Deficiency
            </Dialog.Title>
            <DeficiencyForm onSuccess={() => setIsFormOpen(false)} />
          </div>
        </div>
      </Dialog>
    </div>
  );
}