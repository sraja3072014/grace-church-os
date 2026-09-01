import React, { useState } from 'react';
import { ShieldAlert, Save, CheckCircle2, Lock, HeartHandshake, PhoneCall, AlertTriangle } from 'lucide-react';

export default function ProtectionPolicyTab() {
  const [toast, setToast] = useState(false);

  const [policy, setPolicy] = useState(() => {
    const local = localStorage.getItem('graceos_safety_policy');
    return local ? JSON.parse(local) : {
      childSafetyCheckRequired: true,
      confidentialGrievanceDesk: true,
      twoAdultRuleMandatory: true,
      cctvMonitoringDisclosure: true,
      safetyOfficerName: 'Pastor Timothy / Sister Ruth',
      safetyHelpline: '+91 98765 11223',
      emergencyHospitalContact: '+91 421 2244555',
      protectionCharter: 'Grace City Church is committed to a zero-tolerance environment against abuse, misconduct, and unauthorized access. Child-care volunteers undergo mandatory identity and background screening.'
    };
  });

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('graceos_safety_policy', JSON.stringify(policy));
    setToast(true);
    setTimeout(() => setToast(false), 2500);
  };

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-6 max-w-4xl relative select-none">
      
      {toast && (
        <div className="absolute -top-3 right-0 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-2 backdrop-blur-md animate-in fade-in z-20">
          <CheckCircle2 size={14} />
          <span>Safety & Child Protection Policies Saved!</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
            <ShieldAlert size={24} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              Harassment, Abuse Prevention & Child Safety
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 font-mono">Zero Tolerance</span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">Enforce ministry safety guidelines, confidential grievance escalation, and Sunday School child-protection compliance.</p>
          </div>
        </div>

        <button 
          type="submit"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 active:scale-95 transition"
        >
          <Save size={14} /> Save Policy
        </button>
      </div>

      {/* Officers & Helpline Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-300">Designated Protection & Safeguarding Officers</label>
          <input 
            type="text" 
            value={policy.safetyOfficerName}
            onChange={(e) => setPolicy(prev => ({ ...prev, safetyOfficerName: e.target.value }))}
            className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-300">Confidential Helpline / Touch Hotline</label>
          <input 
            type="text" 
            value={policy.safetyHelpline}
            onChange={(e) => setPolicy(prev => ({ ...prev, safetyHelpline: e.target.value }))}
            className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
          />
        </div>

        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label className="text-xs font-semibold text-slate-300">Official Safety & Protection Charter</label>
          <textarea 
            rows="3"
            value={policy.protectionCharter}
            onChange={(e) => setPolicy(prev => ({ ...prev, protectionCharter: e.target.value }))}
            className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
          />
        </div>

      </div>

      {/* Compliance Toggles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        
        <div 
          onClick={() => setPolicy(prev => ({ ...prev, twoAdultRuleMandatory: !prev.twoAdultRuleMandatory }))}
          className="p-3.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06] flex items-center justify-between cursor-pointer transition"
        >
          <div>
            <p className="text-xs font-semibold text-slate-200">Enforce "Two-Adult" Ministry Rule</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Mandates two certified adults in every youth or children's classroom.</p>
          </div>
          <input 
            type="checkbox" 
            checked={policy.twoAdultRuleMandatory} 
            onChange={() => {}} 
            className="w-4 h-4 accent-cyan-500 rounded shrink-0 pointer-events-none"
          />
        </div>

        <div 
          onClick={() => setPolicy(prev => ({ ...prev, confidentialGrievanceDesk: !prev.confidentialGrievanceDesk }))}
          className="p-3.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06] flex items-center justify-between cursor-pointer transition"
        >
          <div>
            <p className="text-xs font-semibold text-slate-200">Anonymous Grievance Escalation</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Allows encrypted and confidential safety concerns directly to Trustees.</p>
          </div>
          <input 
            type="checkbox" 
            checked={policy.confidentialGrievanceDesk} 
            onChange={() => {}} 
            className="w-4 h-4 accent-cyan-500 rounded shrink-0 pointer-events-none"
          />
        </div>

      </div>

    </form>
  );
}