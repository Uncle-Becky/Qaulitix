import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface QRScannerProps {
  onScan: (data: string) => void;
  onError?: (error: Error) => void;
}

export default function QRScanner({ onScan, onError }: QRScannerProps) {
  const [started, setStarted] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const startScanner = async () => {
    try {
      const scanner = new Html5Qrcode('reader');
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          onScan(decodedText);
        },
        (error) => {
          if (onError) {
            onError(error);
          }
        }
      );

      setStarted(true);
    } catch (err) {
      console.error(err);
      if (onError && err instanceof Error) {
        onError(err);
      }
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      await scannerRef.current.stop();
      setStarted(false);
    }
  };

  if (!started) {
    return (
      <button
        onClick={startScanner}
        className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
      >
        Start Scanner
      </button>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <div id="reader" className="w-full"></div>
      <button
        onClick={stopScanner}
        className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
      >
        Stop Scanner
      </button>
    </div>
  );
}