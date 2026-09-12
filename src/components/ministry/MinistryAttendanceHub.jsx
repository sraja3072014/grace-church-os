import React, { useState, useMemo } from 'react';
import { 
  Users, Baby, Flame, Heart, UserCheck, 
  CheckCircle2, XCircle, Search, Calendar, ShieldCheck, Printer, QrCode 
} from 'lucide-react';
import { soundFX } from '../../utils/audioEngine';

export default function MinistryAttendanceHub({ session }) {
  const [activeMinistry, setActiveMinistry] = useState('SUNDAY_SCHOOL'); // 'SUNDAY_SCHOOL' | 'YOUTH' | 'WOMEN' | 'MEN'
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTokenModal, setActiveTokenModal] = useState(null);

  // 1. மாஸ்டர் மெம்பர் டேட்டாபேஸிலிருந்து தரவுகளை எடுத்தல்
  const families = useMemo(() => {
    try {
      const raw = localStorage.getItem('app_members_family_database');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }, []);

  // 2. ஐக்கியத்திற்கு ஏற்ப நபர்களைத் தானாகப் பிரிக்கும் லாஜிக்
  const ministryMembers = useMemo(() => {
    const list = [];

    families.forEach(fam => {
      // குடும்பத் தலைவரை சரிபார்த்தல்
      if (fam.headMember) {
        const h = fam.headMember;
        if (activeMinistry === 'MEN' && (h.gender === 'Male' || !h.gender)) {
          list.push({ id: h.memberId, name: h.name, phone: h.phone, familyName: fam.familyName, role: 'Head' });
        }
      }

      // குடும்ப உறுப்பினர்களை சரிபார்த்தல்
      (fam.members || []).forEach(m => {
        const role = m.roleInFamily?.toLowerCase() || '';
        const status = m.status?.toLowerCase() || '';
        const gender = m.gender?.toLowerCase() || '';

        if (activeMinistry === 'SUNDAY_SCHOOL' && (status.includes('sunday') || role.includes('son') || role.includes('daughter') || role.includes('child'))) {
          list.push({ 
            id: m.memberId, 
            name: m.name, 
            familyName: fam.familyName, 
            parentName: fam.headMember?.name || 'Parent', 
            phone: fam.headMember?.phone || m.phone,
            role: m.roleInFamily 
          });
        } else if (activeMinistry === 'YOUTH' && (role.includes('son') || role.includes('daughter') || status.includes('youth'))) {
          list.push({ id: m.memberId, name: m.name, phone: m.phone || fam.headMember?.phone, familyName: fam.familyName, role: 'Youth Member' });
        } else if (activeMinistry === 'WOMEN' && (gender === 'female' || role.includes('wife') || role.includes('mother') || role.includes('spouse'))) {
          list.push({ id: m.memberId, name: m.name, phone: m.phone || fam.headMember?.phone, familyName: fam.familyName, role: m.roleInFamily });
        } else if (activeMinistry === 'MEN' && (gender === 'male' || role.includes('father') || role.includes('husband'))) {
          list.push({ id: m.memberId, name: m.name, phone: m.phone || fam.headMember?.phone, familyName: fam.familyName, role: m.roleInFamily });
        }
      });
    });

    return list;
  }, [families, activeMinistry]);

  // 3. வருகைப் பதிவு லெட்ஜர் (Attendance Ledger)
  const [attendanceLedger, setAttendanceLedger] = useState(() => {
    try {
      const raw = localStorage.getItem('graceos_ministry_attendance_db');
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  const saveLedger = (updated) => {
    setAttendanceLedger(updated);
    localStorage.setItem('graceos_ministry_attendance_db', JSON.stringify(updated));
  };

  // வருகை குறித்தல் (Toggle Present / Absent / Token)
  const toggleAttendance = (person) => {
    soundFX?.playClickPop?.();
    const key = `${selectedDate}_${activeMinistry}_${person.id}`;
    const exists = attendanceLedger[key];

    let updated;
    if (exists?.status === 'PRESENT') {
      // ஆப்சென்ட் என மாற்றுதல்
      updated = { ...attendanceLedger, [key]: { ...exists, status: 'ABSENT' } };
    } else {
      // பிரசன்ட் என மாற்றுதல் (சண்டே ஸ்கூலாக இருந்தால் செக்யூரிட்டி டோக்கனுடன்)
      const token = activeMinistry === 'SUNDAY_SCHOOL' ? `SEC-${Math.floor(1000 + Math.random() * 9000)}` : null;
      updated = {
        ...attendanceLedger,
        [key]: {
          id: person.id,
          name: person.name,
          ministry: activeMinistry,
          date: selectedDate,
          status: 'PRESENT',
          tokenCode: token,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      };

      if (token) {
        setActiveTokenModal({ ...person, tokenCode: token, checkinTime: updated[key].time });
      }
    }

    saveLedger(updated);
  };

  // புள்ளிவிவரங்கள் (Metrics)
  const stats = useMemo(() => {
    let present = 0;
    ministryMembers.forEach(m => {
      const rec = attendanceLedger[`${selectedDate}_${activeMinistry}_${m.id}`];
      if (rec?.status === 'PRESENT') present++;
    });
    return {
      total: ministryMembers.length,
      present,
      absent: ministryMembers.length - present,
      rate: ministryMembers.length > 0 ? Math.round((present / ministryMembers.length) * 100) : 0
    };
  }, [ministryMembers, attendanceLedger, selectedDate, activeMinistry]);

  const ministryTabs = [
    { id: 'SUNDAY_SCHOOL', label: 'சண்டே ஸ்கூல் (Kids)', icon: Baby, color: 'text-amber-400' },
    { id: 'YOUTH', label: 'வாலிபர் ஐக்கியம் (Youth)', icon: Flame, color: 'text-rose-400' },
    { id: 'WOMEN', label: 'சகோதரிகள் கூடுகை (Women)', icon: Heart, color: 'text-pink-400' },
    { id: 'MEN', label: 'சகோதரர்கள் கூடுகை (Men)', icon: Users, color: 'text-cyan-400' }
  ];

  const filteredMembers = ministryMembers.filter(m => 
    m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.familyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.phone?.includes(searchQuery)
  );

  return (
    <div className="space-y-6 max-w-5xl select-none text-slate-200 animate-in fade-in pb-12">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <UserCheck className="text-emerald-400" size={24} />
            <span>Ministry Fellowship Attendance Hub</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            சண்டே ஸ்கூல், இளைஞர், பெண்கள் மற்றும் ஆண்கள் ஐக்கியங்களுக்கான ஒருங்கிணைந்த வருகைப் பதிவு பலகை.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-cyan-300 font-mono focus:outline-none cursor-pointer"
          />
        </div>
      </div>

      {/* 🌟 4 ஐக்கியங்களுக்கான Sub-Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-900 p-1.5 rounded-2xl border border-white/10">
        {ministryTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeMinistry === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveMinistry(tab.id)}
              className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
                isActive 
                  ? 'bg-white/10 text-white shadow-lg border border-white/10' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon size={16} className={tab.color} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
        <div className="p-3.5 rounded-2xl bg-slate-900 border border-white/5">
          <span className="text-[10px] text-slate-400 uppercase">மொத்த உறுப்பினர்கள்</span>
          <div className="text-lg font-black text-white mt-0.5">{stats.total}</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
          <span className="text-[10px] uppercase">வந்தவர்கள் (Present)</span>
          <div className="text-lg font-black mt-0.5">{stats.present}</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300">
          <span className="text-[10px] uppercase">வராதவர்கள் (Absent)</span>
          <div className="text-lg font-black mt-0.5">{stats.absent}</div>
        </div>
        <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">
          <span className="text-[10px] uppercase">வருகை சதவீதம்</span>
          <div className="text-lg font-black mt-0.5">{stats.rate}%</div>
        </div>
      </div>

      {/* Search Input */}
      <div className="p-3 bg-slate-900 rounded-2xl border border-white/10 flex items-center gap-3">
        <Search size={16} className="text-slate-400" />
        <input
          type="text"
          placeholder="பெயர் அல்லது தொலைபேசி எண் மூலம் தேடுக..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
        />
      </div>

      {/* உறுப்பினர்கள் வருகைப் பட்டியல் */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredMembers.map(person => {
          const key = `${selectedDate}_${activeMinistry}_${person.id}`;
          const isPresent = attendanceLedger[key]?.status === 'PRESENT';
          const token = attendanceLedger[key]?.tokenCode;

          return (
            <div
              key={person.id}
              onClick={() => toggleAttendance(person)}
              className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                isPresent 
                  ? 'bg-emerald-500/10 border-emerald-500/40 shadow-lg shadow-emerald-500/5' 
                  : 'bg-slate-900 border-white/5 hover:border-white/20'
              }`}
            >
              <div>
                <h4 className="text-xs font-bold text-white">{person.name}</h4>
                <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                  {person.familyName} • {person.role}
                </span>
                {token && (
                  <span className="text-[9px] font-mono text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-md mt-1 inline-block">
                    Pass: {token}
                  </span>
                )}
              </div>

              <div className="shrink-0">
                {isPresent ? (
                  <CheckCircle2 size={22} className="text-emerald-400" />
                ) : (
                  <XCircle size={22} className="text-slate-600" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* சண்டே ஸ்கூல் பாதுகாப்பு டோக்கன் மாடல் */}
      {activeTokenModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-amber-500/40 rounded-3xl p-6 shadow-2xl space-y-4 text-center animate-in zoom-in-95">
            <ShieldCheck size={32} className="text-amber-400 mx-auto" />
            <span className="text-xs font-mono uppercase tracking-widest text-slate-300 font-bold block">
              Sunday School Pick-up Pass
            </span>
            <div className="p-4 bg-slate-950 rounded-2xl border border-white/10">
              <span className="text-3xl font-black font-mono text-amber-400">{activeTokenModal.tokenCode}</span>
              <p className="text-[10px] text-slate-400 mt-1">பெற்றோர் குழந்தையை அழைத்துச் செல்லும்போது இந்த எண்ணைக் காட்டவும்.</p>
            </div>
            <div className="text-xs text-left bg-white/5 p-3 rounded-xl space-y-1">
              <div>குழந்தை: <strong className="text-white">{activeTokenModal.name}</strong></div>
              <div>பெற்றோர்: <strong className="text-slate-300">{activeTokenModal.parentName}</strong></div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setActiveTokenModal(null)}
                className="flex-1 py-2 bg-white/10 text-xs font-bold rounded-xl text-white cursor-pointer"
              >
                சரி (Done)
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2 bg-amber-500 text-xs font-bold rounded-xl text-slate-950 flex items-center justify-center gap-1 cursor-pointer"
              >
                <Printer size={13} /> Print
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}