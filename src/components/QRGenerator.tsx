import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface QRGeneratorProps {
  value: string;
  size?: number;
}

export default function QRGenerator({ value, size = 256 }: QRGeneratorProps) {
  return (
    <div className="flex flex-col items-center">
      <QRCodeSVG
        value={value}
        size={size}
        level="H"
        includeMargin
        className="border p-2 rounded-lg"
      />
      <p className="mt-2 text-sm text-gray-500">Scan this QR code</p>
    </div>
  );
}