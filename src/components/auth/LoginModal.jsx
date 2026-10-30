import React, { useState, useEffect } from 'react';
import { Lock, User, Building2, ArrowRight } from 'lucide-react';

export default function LoginModal({ onLoginSuccess }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('••••••••');
  const [churchLogo, setChurchLogo] = useState(null);

  const mainChurch = JSON.parse(localStorage.getItem('graceos_main_church') || '{"churchName": "Grace City Church"}');
  const branches = JSON.parse(localStorage.getItem('graceos_branches') || '[]');
  
  const [selectedCampus, setSelectedCampus] = useState(mainChurch.churchName);

  useEffect(() => {
    const savedLogo = localStorage.getItem('graceos_church_logo');
    if (savedLogo) setChurchLogo(savedLogo);
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    const userSession = {
      username: username || 'System Admin',
      role: 'Super Admin',
      activeCampus: selectedCampus,
      isLoggedIn: true
    };
    localStorage.setItem('graceos_session', JSON.stringify(userSession));
    onLoginSuccess(userSession);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#07050d]/80 backdrop-blur-xl flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-md win11-glass rounded-3xl p-7 border border-white/10 shadow-2xl animate-in zoom-in-95">
        
        {/* Dynamic Logo Box */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 flex items-center justify-center font-black text-white text-2xl shadow-xl shadow-cyan-500/20 border border-white/20 mb-3 overflow-hidden">
            {churchLogo ? (
              <img src={churchLogo} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <span>G</span>
            )}
          </div>
          <h2 className="text-xl font-black text-white tracking-wide">{mainChurch.churchName}</h2>
          <p className="text-xs text-slate-400 mt-1">Church Network OS • Touch Workspace</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Building2 size={13} className="text-cyan-400" /> Select Active Campus
            </label>
            <select 
              value={selectedCampus}
              onChange={(e) => setSelectedCampus(e.target.value)}
              className="w-full bg-slate-950/70 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 transition"
            >
              <option value={mainChurch.churchName}>{mainChurch.churchName} (Headquarters)</option>
              {branches.filter(b => b.code !== 'GCC-MAIN').map(b => (
                <option key={b.id} value={b.name}>{b.name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <User size={13} className="text-indigo-400" /> Staff Username
            </label>
            <input 
              type="text" 
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-950/70 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 transition font-mono"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Lock size={13} className="text-rose-400" /> Password / Touch PIN
            </label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950/70 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 transition"
            />
          </div>

          <button 
            type="submit"
            className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 active:scale-95 transition flex items-center justify-center gap-2"
          >
            <span>Sign In to Workspace</span>
            <ArrowRight size={15} />
          </button>
        </form>

      </div>
    </div>
  );
}