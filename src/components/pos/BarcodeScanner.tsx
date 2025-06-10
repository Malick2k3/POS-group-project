import React, { useEffect, useRef } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';
import { Camera, X } from 'lucide-react';
import Button from '../ui/Button';

interface BarcodeScannerProps {
  onDetected: (code: string) => void;
  onClose: () => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onDetected, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = React.useState<string>('');

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();
    let mounted = true;

    const startScanning = async () => {
      try {
        const videoInputDevices = await codeReader.listVideoInputDevices();
        const selectedDeviceId = videoInputDevices[0]?.deviceId;

        if (!selectedDeviceId) {
          setError('No camera found');
          return;
        }

        if (videoRef.current) {
          await codeReader.decodeFromVideoDevice(
            selectedDeviceId,
            videoRef.current,
            (result) => {
              if (result && mounted) {
                onDetected(result.getText());
                onClose();
              }
            }
          );
        }
      } catch (err) {
        setError('Failed to access camera');
        console.error(err);
      }
    };

    startScanning();

    return () => {
      mounted = false;
      codeReader.reset();
    };
  }, [onDetected, onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full overflow-hidden">
        <div className="bg-blue-800 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Camera className="mr-2" size={20} />
            <h3 className="text-lg font-medium">Barcode Scanner</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-blue-700 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6">
          {error ? (
            <div className="text-center text-red-600 p-4 bg-red-50 rounded-lg">
              <p>{error}</p>
              <Button
                variant="secondary"
                onClick={onClose}
                className="mt-4"
              >
                Close
              </Button>
            </div>
          ) : (
            <>
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 border-2 border-blue-400 pointer-events-none">
                  <div className="absolute inset-0 border-4 border-blue-400 opacity-50" />
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2/3 h-1/3 border-2 border-blue-400" />
                </div>
              </div>
              
              <p className="mt-4 text-sm text-gray-600 text-center">
                Position the barcode within the frame to scan
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BarcodeScanner;