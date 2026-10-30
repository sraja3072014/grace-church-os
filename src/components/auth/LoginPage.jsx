// src/components/auth/LoginPage.jsx
import React, { useState } from 'react';
import { Lock, User, KeyRound, ShieldCheck, UserPlus, LogIn, AlertCircle, Building2 } from 'lucide-react';
import { getVaultData, setVaultData } from '../../utils/vaultStore';
import { getSupabase } from '../../utils/supabaseClient';

const CHURCH_REGISTRATION_PASSCODE = 'GRACE2026'; // சபை நிர்வாக குறியீடு

export default function LoginPage({ onLoginSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Login Form State
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });

  // Sign Up Form State
  const [signUpForm, setSignUpForm] = useState({
    name: '',
    username: '',
    phone: '',
    email: '',
    role: 'Sunday School Teacher',
    campus: 'Headquarters',
    password: '',
    passcode: ''
  });

  // 🌟 1. Sign In Logic
  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const uName = loginForm.username.trim().toLowerCase();
      const pWord = loginForm.password.trim();

      // Master Fallback Account
      if ((uName === 'pastor.lead' || uName === 'admin') && pWord === 'Grace@2026') {
        const masterSession = {
          id: 'STF-101',
          name: 'Rev. Dr. S. Johnraja',
          username: 'pastor.lead',
          role: 'Senior Pastor / Super Admin',
          campus: 'All Campuses'
        };
        localStorage.setItem('graceos_auth_session', JSON.stringify(masterSession));
        onLoginSuccess(masterSession);
        return;
      }

      // Check Local & Cloud Staff Records
      const staffList = await getVaultData('staff', []);
      const matchedUser = staffList.find(
        (s) => (s.username?.toLowerCase() === uName || s.email?.toLowerCase() === uName) && 
               (s.password === pWord || (!s.password && pWord === 'Grace@2026'))
      );

      if (matchedUser) {
        localStorage.setItem('graceos_auth_session', JSON.stringify(matchedUser));
        onLoginSuccess(matchedUser);
      } else {
        setErrorMsg('பயனர்பெயர் அல்லது கடவுச்சொல் தவறானது!');
      }
    } catch (err) {
      setErrorMsg(`உள்நுழைவில் பிழை: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 🌟 2. Sign Up Logic
  const handleSignUp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      // Security Passcode Verification
      if (signUpForm.passcode.trim() !== CHURCH_REGISTRATION_PASSCODE) {
        setErrorMsg('தவறான சபை நிர்வாக குறியீடு (Invalid Church Passcode)!');
        setLoading(false);
        return;
      }

      const staffList = await getVaultData('staff', []);
      const uName = signUpForm.username.trim().toLowerCase();

      // Check existing username
      if (staffList.some((s) => s.username?.toLowerCase() === uName)) {
        setErrorMsg('இந்தப் பயனர்பெயர் ஏற்கெனவே பயன்பாட்டில் உள்ளது!');
        setLoading(false);
        return;
      }

      const newId = `STF-${Date.now().toString().slice(-4)}`;
      const newStaffRecord = {
        id: newId,
        name: signUpForm.name.trim(),
        username: uName,
        phone: signUpForm.phone.trim(),
        email: signUpForm.email.trim(),
        role: signUpForm.role,
        campus: signUpForm.campus,
        department: signUpForm.role,
        password: signUpForm.password,
        status: 'Active',
        createdAt: new Date().toISOString()
      };

      // 1. Save to Local Vault
      const updatedList = [...staffList, newStaffRecord];
      await setVaultData('staff', updatedList, true);
      localStorage.setItem('graceos_vault_staff', JSON.stringify(updatedList));

      // 2. Direct Sync to Supabase
      const supabase = getSupabase();
      if (supabase && navigator.onLine) {
        await supabase.from('staff').upsert([{
          id: newId,
          name: newStaffRecord.name,
          username: newStaffRecord.username,
          phone: newStaffRecord.phone,
          email: newStaffRecord.email,
          role: newStaffRecord.role,
          campus: newStaffRecord.campus,
          status: 'Active',
          raw_payload: newStaffRecord,
          updated_at: new Date().toISOString()
        }], { onConflict: 'id' });
      }

      setSuccessMsg('கணக்கு வெற்றிகரமாக உருவாக்கப்பட்டது! இப்போது உள்நுழையவும்.');
      setMode('login');
      setLoginForm({ username: uName, password: signUpForm.password });
    } catch (err) {
      setErrorMsg(`பதிவு செய்வதில் பிழை: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden select-none font-sans text-slate-100">
      {/* Background Glows */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Glass Card */}
      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Church Branding Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/25 mb-3 border border-white/20">
            <Building2 size={28} />
          </div>
          <h2 className="text-xl font-black tracking-tight text-white">Grace Cathedral Church</h2>
          <p className="text-xs text-slate-400 mt-1">GraceOS • Centralized Enterprise Administrative Portal</p>
        </div>

        {/* Mode Toggle Tabs */}
        <div className="flex bg-slate-950/80 p-1 rounded-2xl border border-white/5 mb-6 text-xs font-bold">
          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMsg(''); }}
            className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'login' ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20' : 'text-slate-400 hover:text-white'
            }`}
          >
            <LogIn size={14} />
            <span>உள்நுழைவு (Sign In)</span>
          </button>

          <button
            type="button"
            onClick={() => { setMode('signup'); setErrorMsg(''); }}
            className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'signup' ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20' : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus size={14} />
            <span>புதிய ஊழியர் பதிவு (Sign Up)</span>
          </button>
        </div>

        {/* Notifications */}
        {errorMsg && (
          <div className="p-3 mb-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="p-3 mb-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <ShieldCheck size={15} className="shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* 🌟 FORM: LOGIN */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1.5">பயனர்பெயர் (Username / Email)</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="pastor.lead அல்லது username"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400"
                />
                <User size={15} className="absolute left-3 top-3 text-slate-500" />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1.5">கடவுச்சொல் (Password)</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400"
                />
                <Lock size={15} className="absolute left-3 top-3 text-slate-500" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/20 active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <LogIn size={15} />
              <span>{loading ? 'சரிபார்க்கப்படுகிறது...' : 'உள்நுழைய (Sign In)'}</span>
            </button>

            <div className="pt-2 text-center text-[11px] text-slate-500 font-mono">
              Master Admin: <span className="text-cyan-400">pastor.lead</span> • Default: <span className="text-slate-300">Grace@2026</span>
            </div>
          </form>
        )}

        {/* 🌟 FORM: SIGN UP */}
        {mode === 'signup' && (
          <form onSubmit={handleSignUp} className="space-y-3 text-xs">
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">ஊழியர் பெயர் (Leader Name) *</label>
              <input
                type="text"
                required
                placeholder="எ.கா: Brother Samuel"
                value={signUpForm.name}
                onChange={(e) => setSignUpForm({ ...signUpForm, name: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Username *</label>
                <input
                  type="text"
                  required
                  placeholder="samuel.youth"
                  value={signUpForm.username}
                  onChange={(e) => setSignUpForm({ ...signUpForm, username: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">துறை / பொறுப்பு *</label>
                <select
                  value={signUpForm.role}
                  onChange={(e) => setSignUpForm({ ...signUpForm, role: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-2 py-2 text-cyan-300 font-bold focus:outline-none focus:border-cyan-400 cursor-pointer"
                >
                  <option value="Sunday School Teacher">Sunday School</option>
                  <option value="Youth Leader">Youth Leader</option>
                  <option value="Women Fellowship Lead">Women Fellowship</option>
                  <option value="Men Fellowship Lead">Men Fellowship</option>
                  <option value="Accountant">Accountant</option>
                  <option value="Media Coordinator">Media Lead</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Mobile No *</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98400..."
                  value={signUpForm.phone}
                  onChange={(e) => setSignUpForm({ ...signUpForm, phone: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">கடவுச்சொல் *</label>
                <input
                  type="password"
                  required
                  placeholder="Password"
                  value={signUpForm.password}
                  onChange={(e) => setSignUpForm({ ...signUpForm, password: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-amber-300 block mb-1 flex items-center gap-1">
                <KeyRound size={12} />
                <span>சபை நிர்வாக குறியீடு (Church Security Passcode) *</span>
              </label>
              <input
                type="text"
                required
                placeholder="நிர்வாகியிடம் பெற்ற குறியீடு (Default: GRACE2026)"
                value={signUpForm.passcode}
                onChange={(e) => setSignUpForm({ ...signUpForm, passcode: e.target.value })}
                className="w-full bg-slate-950 border border-amber-500/30 rounded-xl px-3 py-2 text-amber-300 font-mono tracking-widest focus:outline-none focus:border-amber-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 mt-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <UserPlus size={15} />
              <span>{loading ? 'பதிவு செய்யப்படுகிறது...' : 'கணக்கை உருவாக்கு (Create Account)'}</span>
            </button>
          </form>
        )}

      </div>

      <div className="mt-4 text-[11px] text-slate-500 font-mono">
        GraceOS v2.4 • Secured Hybrid Architecture
      </div>
    </div>
  );
}