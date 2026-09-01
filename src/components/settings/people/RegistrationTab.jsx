import React, { useState } from 'react';
import { UserPlus, Save, CheckCircle2, QrCode, Sliders, ToggleLeft, ToggleRight, Sparkles } from 'lucide-react';

export default function RegistrationTab() {
  const [toast, setToast] = useState(false);

  const [config, setConfig] = useState(() => {
    const local = localStorage.getItem('graceos_registration_config');
    return local ? JSON.parse(local) : {
      memberIdPrefix: 'GCC-MBR-',
      autoGenerateId: true,
      enableKioskMode: true,
      requireBaptismDate: true,
      requireFamilyHead: true,
      requireBloodGroup: false,
      requireAadharLast4: true,
      welcomeSms: true,
      welcomeWhatsapp: true,
      welcomeMessage: 'Welcome to Grace City Church! Your membership ID is generated and active in the GraceOS network.'
    };
  });

  const handleToggle = (key) => {
    setConfig(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('graceos_registration_config', JSON.stringify(config));
    setToast(true);
    setTimeout(() => setToast(false), 2500);
  };

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-6 max-w-4xl relative select-none">
      
      {toast && (
        <div className="absolute -top-3 right-0 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-2 backdrop-blur-md animate-in fade-in z-20">
          <CheckCircle2 size={14} />
          <span>Member Registration Workflow Saved!</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
            <UserPlus size={24} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              Member Intake & Kiosk Engine
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-mono">Touch Kiosk Ready</span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">Customize mandatory registration parameters, auto-generated Member ID prefixes, and touch-screen self-onboarding.</p>
          </div>
        </div>

        <button 
          type="submit"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 active:scale-95 transition"
        >
          <Save size={14} /> Save Intake Rules
        </button>
      </div>

      {/* ID Engine & Field Schema */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col gap-3">
          <label className="text-xs font-semibold text-slate-300">Member ID Card Prefix</label>
          <input 
            type="text" 
            value={config.memberIdPrefix}
            onChange={(e) => setConfig(prev => ({ ...prev, memberIdPrefix: e.target.value }))}
            className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-cyan-300 focus:outline-none focus:border-cyan-400 font-mono"
          />
          <p className="text-[10px] text-slate-500">Sample Generated ID: <span className="text-slate-300 font-mono">{config.memberIdPrefix}2026-0042</span></p>
        </div>

        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col gap-3">
          <label className="text-xs font-semibold text-slate-300">Welcome Dispatch Template</label>
          <input 
            type="text" 
            value={config.welcomeMessage}
            onChange={(e) => setConfig(prev => ({ ...prev, welcomeMessage: e.target.value }))}
            className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
          />
          <p className="text-[10px] text-slate-500">Dispatched via WhatsApp/SMS upon registration completion.</p>
        </div>

      </div>

      {/* Form Fields Toggle Matrix */}
      <div className="flex flex-col gap-3">
        <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300">Required Input Fields (Touch Form)</h5>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          
          {[
            { key: 'enableKioskMode', label: 'Enable Public Touch Kiosk Mode', desc: 'Allows members to register themselves on church lobby tablets.' },
            { key: 'requireBaptismDate', label: 'Mandatory Baptism Date', desc: 'Requires water baptism record for full member onboarding.' },
            { key: 'requireFamilyHead', label: 'Family Tree / Head of House Tagging', desc: 'Groups family units under a single household account.' },
            { key: 'requireAadharLast4', label: 'Identity Verification (Last 4 Digits)', desc: 'Stores partial ID for 80G tax compliance.' },
            { key: 'welcomeWhatsapp', label: 'Instant WhatsApp Welcome Card', desc: 'Sends membership QR pass directly to WhatsApp.' },
            { key: 'requireBloodGroup', label: 'Blood Group Record', desc: 'Enables church emergency blood donor network.' }
          ].map((item) => (
            <div 
              key={item.key}
              onClick={() => handleToggle(item.key)}
              className="p-3.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06] flex items-center justify-between cursor-pointer transition"
            >
              <div className="pr-3">
                <p className="text-xs font-semibold text-slate-200">{item.label}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{item.desc}</p>
              </div>
              <input 
                type="checkbox" 
                checked={config[item.key]} 
                onChange={() => {}} 
                className="w-4 h-4 accent-cyan-500 rounded shrink-0 pointer-events-none"
              />
            </div>
          ))}

        </div>
      </div>

    </form>
  );
}