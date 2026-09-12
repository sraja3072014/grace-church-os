import React, { useState, useMemo } from 'react';
import { 
  Baby, Sparkles, Heart, Shield, Users, 
  Phone, Plus, CheckCircle2, MessageSquare, 
  Calendar, KeyRound, ArrowRight, Award, UserCheck
} from 'lucide-react';
import { soundFX } from '../../utils/audioEngine';

export default function MinistriesHubDesk() {
  const [activeTab, setActiveTab] = useState('SUNDAY_SCHOOL'); // 'SUNDAY_SCHOOL' | 'YOUTH' | 'WOMEN' | 'MEN'
  const [searchQuery, setSearchQuery] = useState('');

  // 1. சண்டே ஸ்கூல் & குழந்தை பாதுகாப்பு பாஸ் லெட்ஜர்
  const [kidsList, setKidsList] = useState(() => {
    try {
      const raw = localStorage.getItem('graceos_sundayschool_kids_db');
      return raw ? JSON.parse(raw) : [
        {
          id: 'KID-101',
          name: 'Sharon David',
          age: 7,
          classGroup: 'Primary (Age 6-8)',
          parentName: 'Bro. David Paul',
          parentPhone: '+91 98401 22334',
          pickupPassToken: 'PASS-8841',
          status: 'CHECKED_IN', // 'CHECKED_IN' | 'PICKED_UP'
          teacher: 'Sis. Rachel'
        },
        {
          id: 'KID-102',
          name: 'Jason Stephen',
          age: 10,
          classGroup: 'Juniors (Age 9-11)',
          parentName: 'Bro. Stephen Raj',
          parentPhone: '+91 98401 55667',
          pickupPassToken: 'PASS-3920',
          status: 'PICKED_UP',
          teacher: 'Bro. Daniel'
        }
      ];
    } catch {
      return [];
    }
  });

  // 2. யூத் பெல்லோஷிப் பட்டியல்
  const [youthList, setYouthList] = useState(() => {
    try {
      const raw = localStorage.getItem('graceos_youth_fellowship_db');
      return raw ? JSON.parse(raw) : [
        { id: 'YTH-01', name: 'Bro. Joshua Raj', phone: '+91 98401 11223', role: 'Youth Leader', talent: 'Keyboard / Worship', attendanceRate: '94%' },
        { id: 'YTH-02', name: 'Sis. Blessy Grace', phone: '+91 98401 44556', role: 'Member', talent: 'Media & PPT Projection', attendanceRate: '88%' },
        { id: 'YTH-03', name: 'Bro. Timothy Paul', phone: '+91 98401 77889', role: 'Member', talent: 'Sound Engineering / Drums', attendanceRate: '90%' }
      ];
    } catch {
      return [];
    }
  });

  // 3. சகோதரிகள் கூடுகை (Ladies Fellowship)
  const [womenList, setWomenList] = useState(() => {
    try {
      const raw = localStorage.getItem('graceos_women_fellowship_db');
      return raw ? JSON.parse(raw) : [
        { id: 'WMN-01', name: 'Sis. Hepzibah Stephen', phone: '+91 98401 88990', role: 'President', ministryTask: 'Fasting Prayer Leader' },
        { id: 'WMN-02', name: 'Sis. Esther Rani', phone: '+91 98401 99001', role: 'Coordinator', ministryTask: 'Sunday Hospitality & Care' }
      ];
    } catch {
      return [];
    }
  });

  // 4. சகோதரர்கள் கூடுகை (Men's Fellowship)
  const [menList, setMenList] = useState(() => {
    try {
      const raw = localStorage.getItem('graceos_men_fellowship_db');
      return raw ? JSON.parse(raw) : [
        { id: 'MEN-01', name: 'Bro. Samuel Raj', phone: '+91 98401 33445', role: 'Coordinator', ministryTask: 'Early Morning Prayer & Ushering' },
        { id: 'MEN-02', name: 'Bro. Andrew Selvam', phone: '+91 98401 66778', role: 'Security Head', ministryTask: 'Campus Safety & Logistics' }
      ];
    } catch {
      return [];
    }
  });

  // சண்டே ஸ்கூல் குழந்தை செக்-அவுட் (Child Pickup Verification)
  const handleChildPickup = (kidId) => {
    soundFX?.playSuccessChime?.();
    const enteredToken = prompt('பெற்றோரின் பிக்-அப் டோக்கன் எண்ணை உள்ளிடவும் (Enter Pickup Pass Token):');
    if (!enteredToken) return;

    const targetKid = kidsList.find(k => k.id === kidId);
    if (targetKid && targetKid.pickupPassToken.toLowerCase() === enteredToken.trim().toLowerCase()) {
      const updated = kidsList.map(k => k.id === kidId ? { ...k, status: 'PICKED_UP' } : k);
      setKidsList(updated);
      localStorage.setItem('graceos_sundayschool_kids_db', JSON.stringify(updated));
      alert(`பாதுகாப்பு சரிபார்ப்பு முடிந்தது! ${targetKid.name} பெற்றோரிடம் ஒப்படைக்கப்பட்டார்.`);
    } else {
      alert('❌ தவறான பாஸ் டோக்கன்! குழந்தை பாதுகாப்பிற்காக ஒப்படைக்க இயலாது.');
    }
  };

  // வாட்ஸ்அப் நோட்டிஃபிகேஷன்
  const handleSendFellowshipNotice = (phone, title, memberName) => {
    soundFX?.playClickPop?.();
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const finalPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

    const msg = 
`🕊️ *${title} கூடுகை அறிவிப்பு!*
அன்பான ${memberName},
வரவிருக்கும் சிறப்பு ஐக்கிய கூடுகையில் கலந்து கொண்டு ஆசீர்வாதம் பெற அன்புடன் அழைக்கிறோம்.

📍 *இடம்:* Church Campus
⏰ *நேரம்:* குறிப்பிட்ட நேரத்தில் தொடங்கப்படும்.

அன்புடன்,
*Grace Cathedral Fellowship Committee*`;

    window.open(`https://web.whatsapp.com/send?phone=${finalPhone}&text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="space-y-6 max-w-5xl select-none text-slate-200 animate-in fade-in pb-12">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <span>Ministries & Fellowships Hub</span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono border border-indigo-500/30">
              Departmental Engines
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            சண்டே ஸ்கூல், இளைஞர், சகோதரிகள் மற்றும் சகோதரர்கள் ஐக்கியங்களின் மேலாண்மை தளம்.
          </p>
        </div>

        {/* 4 Main Ministry Tab Switchers */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-900 p-1 rounded-2xl border border-white/10 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('SUNDAY_SCHOOL')}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'SUNDAY_SCHOOL' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Baby size={14} />
            <span>சண்டே ஸ்கூல் (Kids)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('YOUTH')}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'YOUTH' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles size={14} />
            <span>இளைஞர் ஐக்கியம் (Youth)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('WOMEN')}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'WOMEN' ? 'bg-rose-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Heart size={14} />
            <span>சகோதரிகள் (Women's)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('MEN')}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'MEN' ? 'bg-indigo-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Shield size={14} />
            <span>சகோதரர்கள் (Men's)</span>
          </button>
        </div>
      </div>

      {/* 🌟 1. Sunday School & Child Pickup Safety Section */}
      {activeTab === 'SUNDAY_SCHOOL' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold text-amber-300 flex items-center gap-2">
                <Shield size={16} />
                <span>Sunday School Child Security Pass Protocol</span>
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                ஆராதனை முடிந்ததும் பெற்றோரின் கையில் உள்ள Pass Token-ஐ சரிபார்த்த பின்பே குழந்தை ஒப்படைக்கப்பட வேண்டும்.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-white bg-slate-950 px-3 py-1.5 rounded-xl border border-white/10">
              Total Enrolled: {kidsList.length} Kids
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {kidsList.map((kid) => (
              <div key={kid.id} className="p-4 rounded-2xl bg-slate-900 border border-white/10 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h5 className="text-sm font-bold text-white">{kid.name}</h5>
                    <span className="text-[10px] text-slate-400 font-mono block">
                      {kid.classGroup} • Teacher: {kid.teacher}
                    </span>
                  </div>
                  <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                    kid.status === 'CHECKED_IN' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}>
                    {kid.status === 'CHECKED_IN' ? 'வகுப்பறையில் (In Class)' : 'ஒப்படைக்கப்பட்டது (Picked Up)'}
                  </span>
                </div>

                <div className="p-2.5 bg-slate-950 rounded-xl border border-white/5 flex items-center justify-between text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Parent & Phone</span>
                    <span className="text-slate-300">{kid.parentName}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-amber-400 block uppercase font-bold">Pickup Token</span>
                    <span className="text-white font-bold">{kid.pickupPassToken}</span>
                  </div>
                </div>

                {kid.status === 'CHECKED_IN' && (
                  <button
                    type="button"
                    onClick={() => handleChildPickup(kid.id)}
                    className="w-full py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <KeyRound size={13} />
                    <span>Verify Pass & Release Child</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 🌟 2. Youth Fellowship Section */}
      {activeTab === 'YOUTH' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5 text-xs">
            <span className="font-bold text-cyan-300 uppercase tracking-wider">இளைஞர் ஐக்கிய தாலந்துகள் & வருகை</span>
            <span className="font-mono text-slate-400">{youthList.length} Active Youths</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {youthList.map((y) => (
              <div key={y.id} className="p-4 rounded-2xl bg-slate-900 border border-white/10 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-white">{y.name}</h5>
                    <span className="text-[10px] text-cyan-400 font-mono block">{y.role}</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                    {y.attendanceRate}
                  </span>
                </div>

                <div className="text-[11px] text-slate-300 bg-slate-950 p-2.5 rounded-xl border border-white/5">
                  <span className="text-[9px] text-slate-500 block uppercase font-mono">Ministry Talent:</span>
                  <span className="font-semibold text-amber-300">{y.talent}</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleSendFellowshipNotice(y.phone, 'Youth Fellowship', y.name)}
                  className="w-full py-1.5 bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <MessageSquare size={12} />
                  <span>Send WhatsApp</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 🌟 3. Women's Fellowship Section */}
      {activeTab === 'WOMEN' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5 text-xs">
            <span className="font-bold text-rose-300 uppercase tracking-wider">சகோதரிகள் கூடுகை & உபவாச ஜெபப் பொறுப்பாளர்கள்</span>
            <span className="font-mono text-slate-400">{womenList.length} Sisters</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {womenList.map((w) => (
              <div key={w.id} className="p-4 rounded-2xl bg-slate-900 border border-white/10 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-white">{w.name}</h5>
                    <span className="text-[10px] text-rose-400 font-mono block">{w.role}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">{w.phone}</span>
                </div>

                <div className="text-[11px] text-slate-300 bg-slate-950 p-2.5 rounded-xl border border-white/5">
                  <span className="text-[9px] text-slate-500 block uppercase font-mono">Assigned Ministry:</span>
                  <span className="font-semibold text-slate-200">{w.ministryTask}</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleSendFellowshipNotice(w.phone, "Women's Ministry", w.name)}
                  className="w-full py-1.5 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <MessageSquare size={12} />
                  <span>Send WA Notice</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 🌟 4. Men's Fellowship Section */}
      {activeTab === 'MEN' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5 text-xs">
            <span className="font-bold text-indigo-300 uppercase tracking-wider">சகோதரர்கள் கூடுகை & சபை பாதுகாப்புப் பணிகள்</span>
            <span className="font-mono text-slate-400">{menList.length} Brothers</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {menList.map((m) => (
              <div key={m.id} className="p-4 rounded-2xl bg-slate-900 border border-white/10 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-white">{m.name}</h5>
                    <span className="text-[10px] text-indigo-400 font-mono block">{m.role}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">{m.phone}</span>
                </div>

                <div className="text-[11px] text-slate-300 bg-slate-950 p-2.5 rounded-xl border border-white/5">
                  <span className="text-[9px] text-slate-500 block uppercase font-mono">Campus Responsibility:</span>
                  <span className="font-semibold text-slate-200">{m.ministryTask}</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleSendFellowshipNotice(m.phone, "Men's Fellowship", m.name)}
                  className="w-full py-1.5 bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <MessageSquare size={12} />
                  <span>Send WA Notice</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}