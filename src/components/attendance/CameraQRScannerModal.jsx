import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { soundFX } from '../../utils/audioEngine';

export default function CameraQRScannerModal({ isOpen, onClose, onScanSuccess }) {
  const [cameraError, setCameraError] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const html5QrCode = new Html5Qrcode('qr-reader-container');
    scannerRef.current = html5QrCode;

    const qrConfig = { fps: 15, qrbox: { width: 250, height: 250 } };

    html5QrCode.start(
      { facingMode: 'environment' },
      qrConfig,
      (decodedText) => {
        soundFX?.playSuccessChime?.();
        onScanSuccess(decodedText);
      },
      () => {
        // Scanning in progress
      }
    ).then(() => {
      setIsScanning(true);
    }).catch((err) => {
      setCameraError('Unable to access video camera. Please verify device permissions and hardware connection.');
      console.error(err);
    });

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().then(() => scannerRef.current.clear()).catch(console.error);
      }
    };
  }, [isOpen, onScanSuccess]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-5 shadow-2xl space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              <Camera size={18} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Live Camera QR Scanner</h4>
              <p className="text-[10px] text-slate-400">Position the member badge inside the viewfinder</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Viewfinder Frame */}
        <div className="relative rounded-2xl overflow-hidden bg-black border border-white/10 flex items-center justify-center min-h-[300px]">
          <div id="qr-reader-container" className="w-full h-full" />

          {isScanning && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="w-60 h-60 border-2 border-cyan-400/50 rounded-2xl relative animate-pulse">
                <div className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-cyan-400 rounded-tl" />
                <div className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-cyan-400 rounded-tr" />
                <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-cyan-400 rounded-bl" />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-cyan-400 rounded-br" />
              </div>
            </div>
          )}

          {cameraError && (
            <div className="p-4 text-center space-y-2 text-rose-400 text-xs">
              <AlertCircle size={24} className="mx-auto" />
              <p>{cameraError}</p>
            </div>
          )}
        </div>

        <div className="text-center">
          <span className="text-[11px] text-slate-400 font-mono">
            Supports Smart PVC Badges and Mobile Digital Passes
          </span>
        </div>

      </div>
    </div>
  );
}