import React, { useState } from 'react';
import { 
  Home, QrCode, DollarSign, Heart, Shield, Users, 
  Globe, LogOut, CheckCircle2, ChevronRight, X, ArrowUpRight
} from 'lucide-react';
import { supabase } from '../../utils/supabaseClient';

export default function MobileAppRoot({ session, onLogout, onSwitchToDesktop }) {
  const [lang, setLang] = useState(() => localStorage.getItem('graceos_lang') || 'ta');
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'scanner' | 'finance' | 'prayer' | 'admin'
  const [modalState, setModalState] = useState(null); // 'tithe_success' | 'qr_view' | null
  const [prayerText, setPrayerText] = useState('');
  const [titheAmount, setTitheAmount] = useState('');
  const [syncNotice, setSyncNotice] = useState('');

  const isPastor = session?.role === 'SUPER_ADMIN' || session?.role === 'PASTOR' || session?.role === 'ADMIN';

  const t = {
    ta: {
      islandLive: 'ஆலய நேரலை இணைப்பு',
      passTitle: 'சபை உறுப்பினர் அட்டை',
      fastCheckin: 'வருகைப் பதிவு தயார்',
      quickTithe: 'தசமபாகம் / காணிக்கை',
      prayerDesk: 'ஜெபக் குறிப்புகள்',
      adminSummary: 'சபை நிர்வாகச் சுருக்கம்',
      membersCount: 'மொத்த உறுப்பினர்கள்',
      todayTithe: 'இன்றைய காணிக்கை',
      deskSwitch: 'முழு டெஸ்க்டாப் வியூ',
      sendPrayer: 'ஜெபக் குறிப்பு அனுப்புக',
      payUpi: 'UPI மூலம் செலுத்துக'
    },
    en: {
      islandLive: 'Sanctuary Live Node',
      passTitle: 'Cathedral Digital Pass',
      fastCheckin: 'Check-in Verified',
      quickTithe: 'Online Tithe / Offering',
      prayerDesk: 'Prayer Requests',
      adminSummary: 'Pastoral Overview',
      membersCount: 'Total Members',
      todayTithe: "Today's Tithe",
      deskSwitch: 'Open Desktop Console',
      sendPrayer: 'Submit Prayer Petition',
      payUpi: 'Pay via UPI / GPay'
    }
  }[lang];

  const handleSendPrayer = async () => {
    if (!prayerText.trim()) return;
    setSyncNotice('Sending...');
    try {
      if (supabase) {
        await supabase.from('prayer_requests').insert([{
          requester_name: session?.name || 'Believer',
          phone: session?.phone || '',
          petition: prayerText
        }]);
      }
      setSyncNotice('அனுப்பப்பட்டது! Sent to Pastor ✓');
      setTimeout(() => { setPrayerText(''); setSyncNotice(''); }, 2000);
    } catch {
      setSyncNotice('Error sending');
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 font-sans pb-28 relative overflow-x-hidden select-none">
      
      {/* 1. macOS Dynamic Island Header */}
      <div className="sticky top-0 z-40 px-4 pt-3 pb-2 backdrop-blur-xl bg-slate-950/60 border-b border-white/5">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-[10px] font-mono font-bold tracking-wider text-cyan-300 uppercase">{t.islandLive}</span>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                const next = lang === 'ta' ? 'en' : 'ta';
                setLang(next);
                localStorage.setItem('graceos_lang', next);
              }}
              className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-bold text-slate-200 flex items-center gap-1 transition"
            >
              <Globe size={12} />
              <span>{lang === 'ta' ? 'English' : 'தமிழ்'}</span>
            </button>
            <button 
              onClick={onLogout}
              className="p-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400"
            >
              <LogOut size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* ஆம்பியன்ஸ் குளோவ் எஃபெக்ட்ஸ் */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 w-72 h-44 bg-cyan-500/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-24 right-4 w-60 h-60 bg-blue-600/15 rounded-full blur-[90px] pointer-events-none" />

      {/* 2. பிரதான உள்ளடக்கத் திரைகள் (Role-Based Views) */}
      <div className="max-w-md mx-auto px-4 pt-4 space-y-4">

        {/* HOME TAB: விசுவாசி அட்டை + பாஸ்டர் சம்மரி */}
        {activeTab === 'home' && (
          <>
            {/* iOS Style Frosted Pass Card */}
            <div 
              onClick={() => setModalState('qr_view')}
              className="p-5 rounded-3xl bg-gradient-to-br from-white/[0.12] via-white/[0.05] to-transparent border border-white/20 backdrop-blur-2xl shadow-2xl relative overflow-hidden active:scale-[0.98] transition cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[9px] font-mono tracking-widest text-cyan-400 uppercase font-bold">{t.passTitle}</span>
                  <h2 className="text-xl font-black text-white mt-1">{session?.name || 'Senior Pastor'}</h2>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{session?.phone || 'ID: GCC-84920'}</p>
                </div>
                <div className="p-3 bg-white/10 rounded-2xl border border-white/20 shadow-inner">
                  <QrCode size={34} className="text-cyan-300" />
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-emerald-400 font-mono text-[11px] flex items-center gap-1">
                  <CheckCircle2 size={13} />
                  {t.fastCheckin}
                </span>
                <span className="text-cyan-300 font-bold flex items-center gap-0.5 text-xs">
                  <span>Show Pass</span>
                  <ChevronRight size={14} />
                </span>
              </div>
            </div>

            {/* போதகர் மற்றும் அட்மின்களுக்கான மேலாண்மைப் பலகை */}
            {isPastor && (
              <div className="p-4 rounded-3xl bg-white/[0.04] border border-white/10 backdrop-blur-xl space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Shield size={14} className="text-cyan-400" />
                    {t.adminSummary}
                  </h3>
                  {onSwitchToDesktop && (
                    <button 
                      onClick={onSwitchToDesktop}
                      className="text-[11px] text-cyan-300 font-bold flex items-center gap-1 hover:underline"
                    >
                      {t.deskSwitch}
                      <ArrowUpRight size={13} />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-2xl bg-black/30 border border-white/5">
                    <span className="text-[10px] text-slate-400 font-mono">{t.membersCount}</span>
                    <p className="text-lg font-black text-white mt-0.5">248</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-black/30 border border-white/5">
                    <span className="text-[10px] text-slate-400 font-mono">{t.todayTithe}</span>
                    <p className="text-lg font-black text-emerald-400 mt-0.5">₹ 18,500</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* FINANCE TAB: காணிக்கை மற்றும் தசமபாகம் */}
        {activeTab === 'finance' && (
          <div className="p-5 rounded-3xl bg-white/[0.05] border border-white/15 backdrop-blur-2xl space-y-4">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <DollarSign className="text-emerald-400" size={18} />
              {t.quickTithe}
            </h3>
            <input 
              type="number"
              value={titheAmount}
              onChange={(e) => setTitheAmount(e.target.value)}
              placeholder="₹ 1,000"
              className="w-full p-3.5 bg-black/40 border border-white/10 rounded-2xl text-lg font-mono text-white text-center focus:border-emerald-400 focus:outline-none"
            />
            <button 
              onClick={() => setModalState('tithe_success')}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-black text-sm active:scale-95 transition"
            >
              {t.payUpi}
            </button>
          </div>
        )}

        {/* PRAYER TAB: ஜெபக் குறிப்புகள் */}
        {activeTab === 'prayer' && (
          <div className="p-5 rounded-3xl bg-white/[0.05] border border-white/15 backdrop-blur-2xl space-y-3">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <Heart className="text-rose-400" size={18} />
              {t.prayerDesk}
            </h3>
            <textarea 
              rows={4}
              value={prayerText}
              onChange={(e) => setPrayerText(e.target.value)}
              placeholder="உங்கள் ஜெபக் குறிப்பை இங்கே உள்ளிடவும்..."
              className="w-full p-3 bg-black/40 border border-white/10 rounded-2xl text-xs text-white focus:border-rose-400 focus:outline-none"
            />
            {syncNotice && <p className="text-xs text-cyan-300 font-mono">{syncNotice}</p>}
            <button 
              onClick={handleSendPrayer}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold text-xs active:scale-95 transition"
            >
              {t.sendPrayer}
            </button>
          </div>
        )}

        {/* SCANNER TAB: வருகைப் பதிவு கியோஸ்க் */}
        {activeTab === 'scanner' && (
          <div className="p-6 rounded-3xl bg-white/[0.05] border border-white/15 text-center space-y-4">
            <h3 className="text-sm font-bold text-white">Attendance QR Scanner</h3>
            <div className="w-56 h-56 mx-auto rounded-2xl border-2 border-dashed border-cyan-400/60 flex items-center justify-center bg-black/30">
              <QrCode size={100} className="text-cyan-400/80 animate-pulse" />
            </div>
            <p className="text-xs text-slate-400">கேமராவின் முன் உறுப்பினர் QR அட்டையைக் காட்டவும்</p>
          </div>
        )}

      </div>

      {/* 3. iOS Floating Glass Bottom Dock */}
      <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto h-16 rounded-3xl bg-slate-900/80 border border-white/15 backdrop-blur-2xl shadow-2xl flex items-center justify-around px-2 z-50">
        <button 
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-1 transition ${activeTab === 'home' ? 'text-cyan-400 scale-105' : 'text-slate-400'}`}
        >
          <Home size={18} />
          <span className="text-[9px] font-bold">Home</span>
        </button>

        <button 
          onClick={() => setActiveTab('finance')}
          className={`flex flex-col items-center gap-1 transition ${activeTab === 'finance' ? 'text-emerald-400 scale-105' : 'text-slate-400'}`}
        >
          <DollarSign size={18} />
          <span className="text-[9px] font-bold">Tithe</span>
        </button>

        {/* Android Material FAB Scanner Center */}
        <button 
          onClick={() => setActiveTab('scanner')}
          className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950 flex items-center justify-center shadow-lg shadow-cyan-500/40 -translate-y-2.5 active:scale-90 transition border border-cyan-300/40"
        >
          <QrCode size={22} className="text-slate-950 stroke-[2.5]" />
        </button>

        <button 
          onClick={() => setActiveTab('prayer')}
          className={`flex flex-col items-center gap-1 transition ${activeTab === 'prayer' ? 'text-rose-400 scale-105' : 'text-slate-400'}`}
        >
          <Heart size={18} />
          <span className="text-[9px] font-bold">Prayer</span>
        </button>

        {isPastor && (
          <button 
            onClick={() => setActiveTab('admin')}
            className={`flex flex-col items-center gap-1 transition ${activeTab === 'admin' ? 'text-cyan-400 scale-105' : 'text-slate-400'}`}
          >
            <Shield size={18} />
            <span className="text-[9px] font-bold">Admin</span>
          </button>
        )}
      </div>

      {/* QR வியூ பாப்-அப் மோடல் */}
      {modalState === 'qr_view' && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-xs bg-slate-900 border border-white/20 rounded-3xl p-6 text-center space-y-4 shadow-2xl">
            <div className="flex justify-end">
              <button onClick={() => setModalState(null)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <div className="p-4 bg-white rounded-2xl inline-block shadow-xl">
              <QrCode size={150} className="text-slate-950" />
            </div>
            <p className="text-xs text-slate-300 font-mono">{session?.name || 'Member Pass'}</p>
          </div>
        </div>
      )}

    </div>
  );
}