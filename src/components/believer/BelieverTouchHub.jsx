import React, { useState, useEffect } from 'react';
import { 
  User, Users, DollarSign, QrCode, Heart, 
  Download, Palette, Globe, Award, Sparkles, CheckCircle2, ShieldCheck 
} from 'lucide-react';
import { getVaultData, setVaultData } from '../../utils/vaultStore';

export default function BelieverTouchHub({ session }) {
  const [activeSubTab, setActiveSubTab] = useState('PROFILE');
  const [memberData, setMemberData] = useState(null);
  const [donationAmount, setDonationAmount] = useState('');
  const [selectedFund, setSelectedFund] = useState('Tithe (10%)');
  const [prayerText, setPrayerText] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => {
    async function loadMemberProfile() {
      const families = await getVaultData('members', []);
      const myFamily = families.find(f => 
        f.headMember?.phone === session?.phone || 
        (f.members || []).some(m => m.phone === session?.phone)
      );
      setMemberData(myFamily || {
        familyName: session?.name || 'Blessed Believer Family',
        headMember: { name: session?.name || 'Believer', memberId: 'GCC-MBR-2026', phone: session?.phone },
        members: []
      });
    }
    loadMemberProfile();
  }, [session]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handlePostPrayer = async (e) => {
    e.preventDefault();
    if (!prayerText.trim()) return;
    const existingPrayers = await getVaultData('prayers', []);
    const newPrayer = {
      id: `PRY-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().slice(0, 10),
      requester: session?.name || 'Believer',
      phone: session?.phone,
      petition: prayerText.trim(),
      status: 'UNDER_PASTORAL_PRAYER'
    };
    await setVaultData('prayers', [newPrayer, ...existingPrayers], true);
    setPrayerText('');
    showToast('Prayer petition securely forwarded to Senior Pastor!');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 select-none pb-16 text-slate-100 animate-in fade-in">
      
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs px-4 py-2.5 rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-2">
          <CheckCircle2 size={15} />
          <span className="font-semibold">{toast}</span>
        </div>
      )}

      {/* Believer ID Header Card */}
      <div className="p-6 rounded-3xl win11-card border border-white/10 flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-slate-950">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-cyan-500/20">
            {session?.name?.charAt(0) || 'B'}
          </div>
          <div>
            <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider block">
              Verified Cathedral Believer
            </span>
            <h3 className="text-lg font-black text-white">{session?.name || 'Believer Household'}</h3>
            <span className="text-xs font-mono text-slate-400">ID: {memberData?.headMember?.memberId || 'GCC-MBR-2026'}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            type="button"
            onClick={() => showToast('Digital Member Pass is ready for Sunday check-in!')}
            className="px-4 py-2 rounded-xl bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-xs font-bold flex items-center gap-2"
          >
            <QrCode size={14} />
            <span>Digital QR Badge</span>
          </button>
        </div>
      </div>

      {/* 4 Bottom Navigation Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
        <button
          type="button"
          onClick={() => setActiveSubTab('PROFILE')}
          className={`p-4 rounded-2xl border text-left transition flex items-center gap-3 ${
            activeSubTab === 'PROFILE' ? 'bg-cyan-500/20 border-cyan-500 text-white shadow-lg' : 'win11-card border-white/10 text-slate-400 hover:text-white'
          }`}
        >
          <Users size={18} className="text-cyan-400" />
          <div>
            <div className="font-bold font-sans text-white text-xs">Family Tree</div>
            <span className="text-[10px] text-slate-400">Manage Household</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('GIVING')}
          className={`p-4 rounded-2xl border text-left transition flex items-center gap-3 ${
            activeSubTab === 'GIVING' ? 'bg-emerald-500/20 border-emerald-500 text-white shadow-lg' : 'win11-card border-white/10 text-slate-400 hover:text-white'
          }`}
        >
          <DollarSign size={18} className="text-emerald-400" />
          <div>
            <div className="font-bold font-sans text-white text-xs">Tithe & Giving</div>
            <span className="text-[10px] text-slate-400">Instant UPI & 80G</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('PRAYER')}
          className={`p-4 rounded-2xl border text-left transition flex items-center gap-3 ${
            activeSubTab === 'PRAYER' ? 'bg-rose-500/20 border-rose-500 text-white shadow-lg' : 'win11-card border-white/10 text-slate-400 hover:text-white'
          }`}
        >
          <Heart size={18} className="text-rose-400" />
          <div>
            <div className="font-bold font-sans text-white text-xs">Prayer Petitions</div>
            <span className="text-[10px] text-slate-400">Pastor Confidential</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('PREFERENCES')}
          className={`p-4 rounded-2xl border text-left transition flex items-center gap-3 ${
            activeSubTab === 'PREFERENCES' ? 'bg-indigo-500/20 border-indigo-500 text-white shadow-lg' : 'win11-card border-white/10 text-slate-400 hover:text-white'
          }`}
        >
          <Palette size={18} className="text-indigo-400" />
          <div>
            <div className="font-bold font-sans text-white text-xs">Theme & Locale</div>
            <span className="text-[10px] text-slate-400">Display Preference</span>
          </div>
        </button>
      </div>

      {/* Sub Tab Viewports */}
      {activeSubTab === 'PROFILE' && (
        <div className="p-6 rounded-3xl win11-card border border-white/10 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-300 font-mono flex items-center gap-1.5">
            <Users size={14} />
            <span>Family Household Directory</span>
          </h4>
          <p className="text-xs text-slate-400">Believers can verify their registered household members and water baptism dates.</p>
          
          <div className="p-4 rounded-2xl bg-slate-950 border border-white/5 space-y-2 text-xs">
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-slate-400">Household Name:</span>
              <span className="font-bold text-white">{memberData?.familyName}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-slate-400">Family Head:</span>
              <span className="font-bold text-white">{memberData?.headMember?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Contact Number:</span>
              <span className="font-mono text-cyan-300">{session?.phone}</span>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'GIVING' && (
        <div className="p-6 rounded-3xl win11-card border border-white/10 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono flex items-center gap-1.5">
            <DollarSign size={14} />
            <span>Kingdom Offering & 80G Tax Exemption</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-300 block mb-1">Fund Allocation</label>
              <select 
                value={selectedFund}
                onChange={(e) => setSelectedFund(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-400"
              >
                <option>Sunday Tithes (10%)</option>
                <option>Missions & Outreach Fund</option>
                <option>Church Building Fund</option>
                <option>Thanksgiving Offering</option>
              </select>
            </div>
            <div>
              <label className="text-slate-300 block mb-1">Offering Amount (₹)</label>
              <input 
                type="number"
                placeholder="₹ 5000"
                value={donationAmount}
                onChange={(e) => setDonationAmount(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => showToast('Opening NPCI UPI Gateway for direct offering...')}
            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-white font-bold text-xs rounded-xl shadow-lg transition"
          >
            Pay Offering via UPI / NetBanking
          </button>
        </div>
      )}

      {activeSubTab === 'PRAYER' && (
        <form onSubmit={handlePostPrayer} className="p-6 rounded-3xl win11-card border border-white/10 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 font-mono flex items-center gap-1.5">
            <Heart size={14} />
            <span>Pastoral Prayer Petition (Confidential)</span>
          </h4>
          <textarea 
            rows="3"
            required
            placeholder="Share your personal prayer request or thanksgiving testimony..."
            value={prayerText}
            onChange={(e) => setPrayerText(e.target.value)}
            className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-rose-400"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition shadow-lg"
          >
            Send to Senior Pastor
          </button>
        </form>
      )}

      {activeSubTab === 'PREFERENCES' && (
        <div className="p-6 rounded-3xl win11-card border border-white/10 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 font-mono flex items-center gap-1.5">
            <Palette size={14} />
            <span>Display & Dialect Preferences</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-950 border border-white/5 space-y-2">
              <span className="font-bold text-white block">Theme Mode</span>
              <div className="flex gap-2">
                <button type="button" onClick={() => showToast('Dark Mode Set')} className="px-3 py-1.5 rounded-lg bg-white/10 text-white font-bold">Dark Obsidian</button>
                <button type="button" onClick={() => showToast('Clean Mode Set')} className="px-3 py-1.5 rounded-lg bg-white/5 text-slate-400">Light Glass</button>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-white/5 space-y-2">
              <span className="font-bold text-white block">Language Dialect</span>
              <div className="flex gap-2">
                <button type="button" onClick={() => showToast('Language: English')} className="px-3 py-1.5 rounded-lg bg-white/10 text-cyan-300 font-bold">English</button>
                <button type="button" onClick={() => showToast('Language: தமிழ்')} className="px-3 py-1.5 rounded-lg bg-white/5 text-slate-400">தமிழ்</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}