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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
              <Camera size={20} />
            </div>
            <div>
              <h3 className="text-lg font-semibold tracking-tight text-slate-900">Barcode Scanner</h3>
              <p className="text-sm text-slate-500">Use your device camera to add products faster.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {error ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
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
              <div className="relative aspect-video overflow-hidden rounded-[1.75rem] bg-slate-950">
                <video
                  ref={videoRef}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="pointer-events-none absolute inset-0">
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:32px_32px]" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_38%,rgba(15,23,42,0.52)_100%)]" />
                  <div className="absolute left-1/2 top-1/2 h-32 w-[72%] -translate-x-1/2 -translate-y-1/2 rounded-3xl border-2 border-sky-400 shadow-[0_0_0_9999px_rgba(15,23,42,0.18)]" />
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-sm text-slate-600">
                Position the barcode inside the highlighted frame to scan.
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BarcodeScanner;
