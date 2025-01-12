import React, { useRef, useState } from 'react';
import { usePhotos } from '../hooks/useApi';
import { useAuth } from '../contexts/AuthContext';
import { Dialog } from '@headlessui/react';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Photos() {
  const { user } = useAuth();
  const { data: photos = [], isLoading, upload } = usePhotos();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [location, setLocation] = useState('');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (selectedFile && location) {
      try {
        await upload({
          file: selectedFile,
          metadata: {
            location,
            description: selectedFile.name,
            job_number: 'DEFAULT'
          }
        });
        setIsUploadOpen(false);
        setSelectedFile(null);
        setLocation('');
      } catch (error) {
        console.error('Upload failed:', error);
      }
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Photos</h1>
        <button
          onClick={() => setIsUploadOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          Upload Photo
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {photos.map((photo) => (
          <div key={photo.id} className="relative group">
            <div className="aspect-w-1 aspect-h-1 rounded-lg bg-gray-200 overflow-hidden">
              <img
                src={photo.url}
                alt={photo.description || ''}
                className="object-cover"
              />
            </div>
            <div className="mt-2">
              <p className="text-sm text-gray-500 truncate">{photo.location}</p>
              <p className="text-xs text-gray-400">
                {new Date(photo.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      <Dialog
        open={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        className="fixed inset-0 z-10 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
          <div className="relative bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <Dialog.Title className="text-lg font-medium mb-4">
              Upload Photo
            </Dialog.Title>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  {selectedFile ? selectedFile.name : 'Select Photo'}
                </button>
              </div>
              <button
                onClick={handleUpload}
                disabled={!selectedFile || !location}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
}