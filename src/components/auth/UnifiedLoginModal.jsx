import React, { useState } from 'react';
import { ArrowRight, Church, Phone, AlertCircle } from 'lucide-react';
import { soundFX } from '../../utils/audioEngine';

export default function UnifiedLoginModal({ onLoginSuccess }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    setErrorMsg('');
    soundFX?.playClickPop?.();

    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setErrorMsg('Enter a valid mobile number to continue.');
      return;
    }

    setErrorMsg('Phone-based legacy sign-in is disabled for security. Please use the secure staff sign-in page and complete the authenticated flow.');
    soundFX?.playFailureChime?.();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-white/10 shadow-2xl space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center mx-auto">
            <Church size={24} />
          </div>
          <h3 className="text-lg font-black text-white">GraceOS Portal Authentication</h3>
          <p className="text-xs text-slate-400">Sign in using your registered mobile number</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Registered Mobile Number</label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input 
                type="tel"
                required
                placeholder="e.g. 9840123456"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle size={14} />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition cursor-pointer active:scale-95"
          >
            <span>Sign In to Workspace</span>
            <ArrowRight size={15} />
          </button>
        </form>

        <div className="p-3 rounded-2xl bg-black/40 border border-white/5 text-[11px] text-slate-400 text-center space-y-1">
          <div>🔒 Secure access requires the authenticated staff sign-in flow.</div>
          <div>Use the main GraceOS sign-in screen to continue.</div>
        </div>

      </div>
    </div>
  );
}