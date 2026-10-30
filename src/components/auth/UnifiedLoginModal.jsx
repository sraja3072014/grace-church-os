import React, { useState } from 'react';
import { 
  Shield, Users, UserCheck, KeyRound, 
  ArrowRight, Church, Phone, CheckCircle2, AlertCircle 
} from 'lucide-react';
import { soundFX } from '../../utils/audioEngine';

export default function UnifiedLoginModal({ onLoginSuccess }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    setErrorMsg('');
    soundFX?.playClickPop?.();

    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
    const staffUsers = JSON.parse(localStorage.getItem('graceos_staff_users') || '[]');
    const families = JSON.parse(localStorage.getItem('app_members_family_database') || '[]');

    // 1. Root Senior Pastor / Super Admin (Default PIN: 1234)
    if (cleanPhone === '9999999999' || cleanPhone === '9840000000') {
      if (pin === '1234') {
        soundFX?.playSuccessChime?.();
        onLoginSuccess({ role: 'ADMIN', name: 'Senior Pastor', phone: cleanPhone });
        return;
      } else {
        setErrorMsg('Invalid Administrator Security PIN!');
        return;
      }
    }

    // 2. Departmental Leaders (Sunday School, Youth, Women, Men Fellowships)
    const matchedStaff = staffUsers.find(u => u.phone?.replace(/[^0-9]/g, '').endsWith(cleanPhone.slice(-10)));
    if (matchedStaff) {
      soundFX?.playSuccessChime?.();
      onLoginSuccess({ 
        role: 'DEPARTMENT_LEAD',
        departmentRole: matchedStaff.role,
        name: matchedStaff.name, 
        campus: matchedStaff.campus || 'Headquarters',
        phone: cleanPhone 
      });
      return;
    }

    // 3. Regular Believer / Member Verification
    let foundMember = null;
    let memberFamily = null;

    for (const fam of families) {
      if (fam.headMember?.phone?.replace(/[^0-9]/g, '').endsWith(cleanPhone.slice(-10))) {
        foundMember = fam.headMember;
        memberFamily = fam;
        break;
      }
      const matchedChild = (fam.members || []).find(m => m.phone?.replace(/[^0-9]/g, '').endsWith(cleanPhone.slice(-10)));
      if (matchedChild) {
        foundMember = matchedChild;
        memberFamily = fam;
        break;
      }
    }

    if (foundMember) {
      soundFX?.playSuccessChime?.();
      onLoginSuccess({ 
        role: 'MEMBER', 
        member: foundMember, 
        family: memberFamily,
        phone: cleanPhone 
      });
    } else {
      // Guest Believer Auto-Entry
      soundFX?.playSuccessChime?.();
      onLoginSuccess({ 
        role: 'MEMBER', 
        member: { name: 'Believer Guest', phone: cleanPhone, memberId: 'MBR-GUEST' }, 
        family: { familyName: 'Visiting Believer Household', area: 'Main Sanctuary' },
        phone: cleanPhone 
      });
    }
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

          {(phoneNumber.includes('9999999999') || phoneNumber.includes('9840000000')) && (
            <div className="animate-in fade-in">
              <label className="text-xs font-semibold text-slate-300 block mb-1">Pastor Admin PIN</label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-400" size={16} />
                <input 
                  type="password"
                  maxLength={4}
                  placeholder="4-Digit Security PIN (Default: 1234)"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-amber-300 font-mono focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>
          )}

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
          <div>👑 <strong>Pastor:</strong> 9999999999 (PIN: 1234)</div>
          <div>👥 <strong>Department Lead:</strong> Sunday School / Youth / Fellowship Phone</div>
          <div>👤 <strong>Member:</strong> Registered Believer Mobile Number[cite: 38]</div>
        </div>

      </div>
    </div>
  );
}