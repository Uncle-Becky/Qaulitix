import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { useDocuments } from '../hooks/useApi';
import DocumentForm from '../components/forms/DocumentForm';
import LoadingSpinner from '../components/LoadingSpinner';
import ShareLink from '../components/ShareLink';

export default function Documents() {
  const { data: documents, isLoading } = useDocuments();
  const [isFormOpen, setIsFormOpen] = useState(false);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Documents</h1>
        <div className="space-x-2">
          <ShareLink path="/documents" title="Document Library" />
          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            New Document
          </button>
        </div>
      </div>

      {(!documents || documents.length === 0) ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
          No documents published yet. Use "New Document" to upload procedures and specifications for ISO 9001 clause 7.5 compliance.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {documents.map((document) => (
            <div
              key={document.id}
              className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{document.title}</p>
                <p className="text-sm text-gray-500 truncate">{document.type}</p>
                <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                    ${document.status === 'active' ? 'bg-green-100 text-green-800' :
                      document.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'}`}>
                    {document.status}
                  </span>
                  <span>v{document.version}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        className="fixed inset-0 z-10 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
          <div className="relative bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <Dialog.Title className="text-lg font-medium mb-4">
              Publish Controlled Document
            </Dialog.Title>
            <DocumentForm onSuccess={() => setIsFormOpen(false)} />
          </div>
        </div>
      </Dialog>
    </div>
  );
}

