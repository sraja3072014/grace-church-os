import React, { useState } from 'react';
import { Receipt, Save, CheckCircle2, ShieldCheck, FileCheck, Landmark, Signature } from 'lucide-react';

export default function Tax80GReceiptsTab() {
  const [toast, setToast] = useState(false);

  const [settings, setSettings] = useState(() => {
    const local = localStorage.getItem('graceos_tax_80g_config');
    return local ? JSON.parse(local) : {
      regNumber80G: 'CIT(E)/80G/2024-25/DEL/9842',
      panNumber: 'AAATG8492K',
      validFrom: '2024-04-01',
      validTill: '2029-03-31',
      signatoryName: 'Senior Pastor / Managing Trustee',
      receiptPrefix: 'GCC/80G/26-',
      autoEmailReceipt: true,
      autoWhatsappReceipt: true,
      customNote: 'Donations to Grace City Church Trust are exempt under Section 80G(5)(vi) of the Income Tax Act, 1961.'
    };
  });

  const handleChange = (field, val) => {
    setSettings(prev => ({ ...prev, [field]: val }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('graceos_tax_80g_config', JSON.stringify(settings));
    setToast(true);
    setTimeout(() => setToast(false), 2500);
  };

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-6 max-w-4xl relative select-none">
      
      {toast && (
        <div className="absolute -top-3 right-0 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-2 backdrop-blur-md animate-in fade-in">
          <CheckCircle2 size={14} />
          <span>80G Tax Engine Configuration Saved!</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <Receipt size={24} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              80G Tax Exemption & Automated PDF Engine
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono">Sec. 80G(5)(vi) Ready</span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">Automates PDF donation certificates with QR verification for donors during giving checkout.</p>
          </div>
        </div>

        <button 
          type="submit"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 active:scale-95 transition"
        >
          <Save size={14} /> Save 80G Rules
        </button>
      </div>

      {/* Input Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Landmark size={13} className="text-cyan-400" /> Income Tax 80G Approval Number
          </label>
          <input 
            type="text" 
            required
            value={settings.regNumber80G}
            onChange={(e) => handleChange('regNumber80G', e.target.value)}
            className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <FileCheck size={13} className="text-indigo-400" /> Trust PAN Number
          </label>
          <input 
            type="text" 
            required
            value={settings.panNumber}
            onChange={(e) => handleChange('panNumber', e.target.value)}
            className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono uppercase"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-300">Authorized Signatory Name & Designation</label>
          <input 
            type="text" 
            value={settings.signatoryName}
            onChange={(e) => handleChange('signatoryName', e.target.value)}
            className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-300">80G Receipt Number Prefix</label>
          <input 
            type="text" 
            value={settings.receiptPrefix}
            onChange={(e) => handleChange('receiptPrefix', e.target.value)}
            className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
          />
        </div>

        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label className="text-xs font-semibold text-slate-300">Legal Disclaimer / Footer Note on PDF Receipts</label>
          <textarea 
            rows="2"
            value={settings.customNote}
            onChange={(e) => handleChange('customNote', e.target.value)}
            className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
          />
        </div>

      </div>

      {/* Auto Dispatch Triggers */}
      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-300">
            <input 
              type="checkbox" 
              checked={settings.autoEmailReceipt} 
              onChange={(e) => handleChange('autoEmailReceipt', e.target.checked)}
              className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
            />
            <span>Auto Email PDF on Tithe Payment</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-300">
            <input 
              type="checkbox" 
              checked={settings.autoWhatsappReceipt} 
              onChange={(e) => handleChange('autoWhatsappReceipt', e.target.checked)}
              className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
            />
            <span>Auto WhatsApp 80G Receipt to Donor</span>
          </label>
        </div>
      </div>

    </form>
  );
}