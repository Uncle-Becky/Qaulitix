import React, { useState } from 'react';
import QRGenerator from './QRGenerator';
import { Dialog } from '@headlessui/react';
import { QrCodeIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';

interface ShareLinkProps {
  path: string;
  title?: string;
}

export default function ShareLink({ path, title }: ShareLinkProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const shareUrl = `${window.location.origin}${path}`;
  const shareData = {
    url: shareUrl,
    title: title || 'Construction QC System'
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Share
      </button>

      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="fixed inset-0 z-10 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
          <div className="relative bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <Dialog.Title className="text-lg font-medium mb-4">
              Share {title || 'Link'}
            </Dialog.Title>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 p-2 border rounded-md"
                />
                <button
                  onClick={copyToClipboard}
                  className="p-2 text-gray-500 hover:text-gray-700"
                  title="Copy to clipboard"
                >
                  <DocumentDuplicateIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={() => setShowQR(!showQR)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <QrCodeIcon className="h-5 w-5 mr-2" />
                  {showQR ? 'Hide QR Code' : 'Show QR Code'}
                </button>
              </div>

              {showQR && (
                <div className="flex justify-center">
                  <QRGenerator value={shareUrl} size={200} />
                </div>
              )}

              {navigator.share && (
                <button
                  onClick={() => navigator.share(shareData)}
                  className="w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Share via...
                </button>
              )}
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
}