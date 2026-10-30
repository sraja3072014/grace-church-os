import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // ஏற்கனவே இன்ஸ்டால் செய்யவில்லை என்றால் பேனரைக் காட்டு
      if (!window.matchMedia('(display-mode: standalone)').matches) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm p-4 rounded-2xl bg-slate-900/95 border border-cyan-500/30 shadow-2xl backdrop-blur-xl text-white animate-in slide-in-from-bottom-5 duration-300">
      <div className="flex items-start justify-between gap-3">
        <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shrink-0">
          <Smartphone size={20} />
        </div>
        <div className="space-y-1 flex-1">
          <h4 className="text-xs font-bold leading-tight">Install GraceOS App</h4>
          <p className="text-[11px] text-slate-300 leading-normal">
            இணையம் இல்லாமலும் விரைவாகப் பயன்படுத்த GraceOS-ஐ உங்கள் சாதனத்தில் நிறுவுங்கள்.
          </p>
        </div>
        <button 
          onClick={() => setShowPrompt(false)} 
          className="p-1 text-slate-400 hover:text-white cursor-pointer"
        >
          <X size={14} />
        </button>
      </div>

      <div className="mt-3 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => setShowPrompt(false)}
          className="px-3 py-1.5 text-[11px] text-slate-400 hover:text-slate-200 transition"
        >
          பிறகு (Later)
        </button>
        <button
          type="button"
          onClick={handleInstallClick}
          className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 transition cursor-pointer"
        >
          <Download size={13} />
          <span>இன்ஸ்டால் செய்</span>
        </button>
      </div>
    </div>
  );
}