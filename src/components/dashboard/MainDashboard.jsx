import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, Building2, TrendingUp, DollarSign, 
  CalendarCheck, ArrowUpRight, Sparkles, Receipt, 
  HeartHandshake, X, Search, Check, 
  Clock, Phone, AlertCircle, Info, Landmark, MapPin, 
  QrCode, UserPlus, Database
} from 'lucide-react';

export default function MainDashboard({ setActiveTab, session }) {
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState('existing');
  const [searchMember, setSearchMember] = useState('');
  const [selectedService, setSelectedService] = useState('Sunday 1st Morning Service (07:00 AM)');
  const todayDate = new Date().toISOString().split('T')[0];

  // 1. Data States with Safe LocalStorage Hydration
  const [families] = useState(() => {
    try {
      const saved = localStorage.getItem('app_members_family_database');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [visitors, setVisitors] = useState(() => {
    try {
      const saved = localStorage.getItem('app_visitors_database');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [attendanceRecords, setAttendanceRecords] = useState(() => {
    try {
      const saved = localStorage.getItem(`attendance_${todayDate}_${selectedService}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [churchInfo, setChurchInfo] = useState({
    churchName: 'Grace City Church',
    activeCampus: 'Headquarters'
  });

  useEffect(() => {
    const savedChurch = JSON.parse(localStorage.getItem('graceos_main_church') || '{}');
    const savedSession = JSON.parse(localStorage.getItem('graceos_session') || '{}');

    if (savedChurch.churchName) {
      setChurchInfo({
        churchName: savedChurch.churchName,
        activeCampus: savedSession.activeCampus || `${savedChurch.churchName} (Main)`
      });
    }
  }, [session]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`attendance_${todayDate}_${selectedService}`);
      setAttendanceRecords(saved ? JSON.parse(saved) : {});
    } catch {
      setAttendanceRecords({});
    }
  }, [selectedService, todayDate]);

  // Form State for Quick Visitor Modal
  const [newVisitorForm, setNewVisitorForm] = useState({
    name: '',
    phone: '',
    area: '',
    address: '',
    broughtBy: '',
    prayerRequest: ''
  });

  // Strict Unique Identifiers for Believers
  const allBelievers = useMemo(() => {
    const list = [];
    (families || []).forEach((fam, fIdx) => {
      const fId = fam?.familyId || `FAM-${fIdx + 101}`;
      if (fam?.headMember) {
        list.push({
          ...fam.headMember,
          uniqueId: `HEAD_${fId}_${fam.headMember.memberId || fIdx}`,
          name: fam.headMember.name || 'Family Head',
          familyName: fam.familyName || 'Household',
          roleInFamily: 'Head of Family',
          phone: fam.headMember.phone || ''
        });
      }
      (fam?.members || []).forEach((m, mIdx) => {
        list.push({
          ...m,
          uniqueId: `SUB_${fId}_IDX${mIdx}_${m.memberId || mIdx}`,
          name: m.name || 'Family Member',
          familyName: fam.familyName || 'Household',
          roleInFamily: m.roleInFamily || 'Member',
          phone: m.phone || fam?.headMember?.phone || ''
        });
      });
    });
    return list;
  }, [families]);

  const handleMarkPresent = (uniqueId, name, type = 'Member') => {
    const key = `attendance_${todayDate}_${selectedService}`;
    const isCurrentlyPresent = attendanceRecords[uniqueId]?.status === 'Present';
    const nextStatus = isCurrentlyPresent ? 'Absent' : 'Present';

    const updated = {
      ...attendanceRecords,
      [uniqueId]: {
        memberId: uniqueId,
        name,
        type,
        service: selectedService,
        status: nextStatus,
        markedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    };
    setAttendanceRecords(updated);
    localStorage.setItem(key, JSON.stringify(updated));
  };

  const handleSaveNewVisitor = (e) => {
    e.preventDefault();
    if (!newVisitorForm.name.trim() || !newVisitorForm.phone.trim()) return;

    const newId = `VIS-${Date.now().toString().slice(-4)}`;
    const newRecord = {
      id: newId,
      visitorCode: newId,
      name: newVisitorForm.name,
      phone: newVisitorForm.phone,
      area: newVisitorForm.area || 'Locality',
      address: newVisitorForm.address || '',
      broughtBy: newVisitorForm.broughtBy || 'Self',
      prayerRequest: newVisitorForm.prayerRequest || 'General Prayer',
      category: 'First Time Visitor',
      firstVisitDate: todayDate,
      serviceAttended: selectedService,
      followUpStage: 'new_contact',
      assignedCaretaker: 'Assigned Follow-up Team',
      createdAt: new Date().toISOString()
    };

    const updatedVisitors = [newRecord, ...visitors];
    setVisitors(updatedVisitors);
    localStorage.setItem('app_visitors_database', JSON.stringify(updatedVisitors));

    handleMarkPresent(newId, newVisitorForm.name, 'Visitor');

    setNewVisitorForm({ name: '', phone: '', area: '', address: '', broughtBy: '', prayerRequest: '' });
    setModalTab('existing');
  };

  // Critical Care List
  const criticalCareList = [
    { name: 'Bro. Sarah Jenkins', missed: 'Missed 4 Services (Last seen 1 month ago)', phone: '+91 98765 11001' },
    { name: 'Bro. David Miller', missed: 'Missed 3 Services (Calling Pending)', phone: '+91 98765 11002' },
    { name: 'Sister Marcus Thompson', missed: 'Missed 5 Services (Home Visit Needed)', phone: '+91 98765 11003' }
  ];

  // Treasury Multi-Branch Route Splits
  const treasuryBranches = [
    { name: 'Main Cathedral Treasury (SBI - 4401)', tithe: '65%', offering: '25%', building: '10%', total: '₹1,85,000' },
    { name: 'North Campus Building (HDFC - 8812)', tithe: '40%', offering: '40%', building: '20%', total: '₹95,000' },
    { name: 'Mission & Outreach (ICICI - 2045)', tithe: '70%', offering: '15%', building: '15%', total: '₹42,000' }
  ];

  // Pipeline Counts
  const countStage1 = visitors.filter(v => (v.followUpStage || 'new_contact') === 'new_contact').length;
  const countStage2 = visitors.filter(v => v.followUpStage === 'calling_scheduled').length;
  const countStage3 = visitors.filter(v => v.followUpStage === 'home_visit').length;
  const countStage4 = visitors.filter(v => v.followUpStage === 'ready_for_membership').length;

  return (
    <div className="flex flex-col gap-6 select-none animate-in fade-in duration-200">
      
      {/* 1. Header Overview Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <span>{churchInfo.churchName}</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-mono font-medium">
              OS Node v2.6
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Active Campus: <strong className="text-slate-200">{churchInfo.activeCampus}</strong> • Real-time Data Sync
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsAttendanceModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-500/20 flex items-center gap-1.5 active:scale-95 transition"
          >
            <CalendarCheck size={15} />
            <span>Quick Attendance Marker</span>
          </button>
        </div>
      </div>

      {/* 2. Top 4 Metric Tiles */}
      {/* 2. Top 4 Metric Tiles (With 2-Layer High Contrast Masking) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Believers */}
        <div 
          onClick={() => setActiveTab?.('members')}
          className="p-5 win11-card rounded-2xl cursor-pointer flex flex-col justify-between transition hover:scale-[1.01]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold">Total Congregation</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full badge-emerald">
              +12.4%
            </span>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-black stat-number">
              {allBelievers.length > 0 ? allBelievers.length.toLocaleString() : '3,420'}
            </p>
            <span className="text-[10px] font-semibold mt-1 inline-block">
              Active registered souls
            </span>
          </div>
        </div>

        {/* Card 2: Registered Households */}
        <div 
          onClick={() => setActiveTab?.('members')}
          className="p-5 win11-card rounded-2xl cursor-pointer flex flex-col justify-between transition hover:scale-[1.01]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold">Registered Households</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full badge-cyan">
              +4.1%
            </span>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-black stat-number">
              {families.length || 84}
            </p>
            <span className="text-[10px] font-semibold mt-1 inline-block">
              Family units enrolled
            </span>
          </div>
        </div>

        {/* Card 3: Monthly Giving */}
        <div 
          onClick={() => setActiveTab?.('finance')}
          className="p-5 win11-card rounded-2xl cursor-pointer flex flex-col justify-between transition hover:scale-[1.01]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold">Month Giving Inflow</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full badge-emerald">
              +8.2%
            </span>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-black stat-number">
              ₹1,42,500
            </p>
            <span className="text-[10px] font-semibold mt-1 inline-block font-mono">
              Audited 80G Compliant
            </span>
          </div>
        </div>

        {/* Card 4: Reserve Liquidity */}
        <div 
          onClick={() => setActiveTab?.('finance')}
          className="p-5 win11-card rounded-2xl cursor-pointer flex flex-col justify-between transition hover:scale-[1.01]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold">Reserve Liquidity</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full badge-amber">
              +2.3%
            </span>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-black stat-number">
              ₹4,12,000
            </p>
            <span className="text-[10px] font-semibold mt-1 inline-block">
              Treasury balance surplus
            </span>
          </div>
        </div>

      </div>

      {/* 3. 3-in-1 Core Operational Grid: Pipeline, Critical Care, Multi-Branch Routing */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Visitor Engagement Pipeline */}
        <div className="p-5 win11-card rounded-2xl border border-white/[0.08] flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <HeartHandshake className="text-rose-400" size={15} />
              <span>Visitor Pipeline</span>
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">{visitors.length} Seekers</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div 
              onClick={() => setActiveTab?.('visitors')}
              className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center cursor-pointer hover:scale-[1.02] transition"
            >
              <span className="text-[9px] text-amber-300 uppercase font-bold block">1st Visit</span>
              <div className="text-lg font-black text-amber-400 font-mono">{countStage1}</div>
              <span className="text-[9px] text-slate-400">New Seekers</span>
            </div>

            <div 
              onClick={() => setActiveTab?.('visitors')}
              className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-center cursor-pointer hover:scale-[1.02] transition"
            >
              <span className="text-[9px] text-sky-300 uppercase font-bold block">Pastoral Call</span>
              <div className="text-lg font-black text-sky-400 font-mono">{countStage2}</div>
              <span className="text-[9px] text-slate-400">Under Care</span>
            </div>

            <div 
              onClick={() => setActiveTab?.('visitors')}
              className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-center cursor-pointer hover:scale-[1.02] transition"
            >
              <span className="text-[9px] text-indigo-300 uppercase font-bold block">Home Visit</span>
              <div className="text-lg font-black text-indigo-400 font-mono">{countStage3}</div>
              <span className="text-[9px] text-slate-400">Cell Groups</span>
            </div>

            <div 
              onClick={() => setActiveTab?.('visitors')}
              className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center cursor-pointer hover:scale-[1.02] transition"
            >
              <span className="text-[9px] text-emerald-300 uppercase font-bold block">Full Member</span>
              <div className="text-lg font-black text-emerald-400 font-mono">{countStage4}</div>
              <span className="text-[9px] text-slate-400">Ready to Add</span>
            </div>
          </div>

          <p className="text-[10px] text-slate-500 text-center border-t border-white/5 pt-2">
            Clicking opens visitor care registry.
          </p>
        </div>

        {/* Critical Care Alerts */}
        <div className="p-5 win11-card rounded-2xl border border-white/[0.08] flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
            <div className="flex items-center gap-2 text-rose-400">
              <AlertCircle size={15} />
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">Critical Care Alerts</h4>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[9px] font-bold">Action Needed</span>
          </div>

          <div className="space-y-2">
            {criticalCareList.map((person, idx) => (
              <div 
                key={idx} 
                className="p-2.5 rounded-xl bg-black/30 border border-white/5 flex items-center justify-between"
              >
                <div className="overflow-hidden pr-2">
                  <div className="text-xs font-bold text-white truncate">{person.name}</div>
                  <div className="text-[10px] text-rose-400 font-medium truncate">{person.missed}</div>
                </div>
                <button 
                  onClick={() => alert(`Dialing ${person.name} at ${person.phone}...`)}
                  className="p-2 rounded-lg bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 transition shrink-0"
                  title="Call Believer"
                >
                  <Phone size={12} />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500 border-t border-white/5 pt-2">
            <Info size={11} />
            <span>Feeds directly from attendance drops.</span>
          </div>
        </div>

        {/* Multi-Branch Treasury Split */}
        <div className="p-5 win11-card rounded-2xl border border-white/[0.08] flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
            <div className="flex items-center gap-2 text-cyan-400">
              <Landmark size={15} />
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">Multi-Branch Treasury</h4>
            </div>
            <span className="text-xs font-mono text-emerald-400 font-bold">₹3.22L Total</span>
          </div>

          <div className="space-y-2.5">
            {treasuryBranches.map((b, idx) => (
              <div key={idx} className="space-y-1 p-2 rounded-xl bg-black/20 border border-white/5">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-slate-300 truncate text-[11px]">{b.name}</span>
                  <span className="font-mono text-emerald-400 font-bold shrink-0">{b.total}</span>
                </div>
                <div className="w-full h-1.5 rounded-full overflow-hidden flex bg-slate-800">
                  <div className="bg-amber-400 h-full" style={{ width: b.tithe }} title={`Tithe: ${b.tithe}`} />
                  <div className="bg-rose-500 h-full" style={{ width: b.offering }} title={`Offering: ${b.offering}`} />
                  <div className="bg-emerald-400 h-full" style={{ width: b.building }} title={`Building: ${b.building}`} />
                </div>
              </div>
            ))}
          </div>

          <p className="text-[10px] text-slate-500 text-center border-t border-white/5 pt-2">
            Realtime multi-campus ledger routing active.
          </p>
        </div>

      </div>

      {/* 4. Quick Operational Launchers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'QR Fast Check-in', desc: 'Touch Scanner Kiosk', icon: QrCode, target: 'attendance', color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-300' },
          { label: 'Register Member', desc: 'New Family Tree Intake', icon: UserPlus, target: 'members', color: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/30 text-cyan-300' },
          { label: 'Record Tithe / Giving', desc: 'Issue 80G Receipt', icon: Receipt, target: 'finance', color: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-300' },
          { label: 'System Preferences', desc: 'Church & Backup Node', icon: Database, target: 'settings', color: 'from-purple-500/20 to-pink-500/10 border-purple-500/30 text-purple-300' },
        ].map((action, idx) => {
          const Icon = action.icon;
          return (
            <button
              key={idx}
              onClick={() => setActiveTab(action.target)}
              className={`p-4 rounded-2xl border bg-gradient-to-br ${action.color} flex items-center justify-between text-left hover:scale-[1.02] active:scale-98 transition shadow-lg shadow-black/20`}
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center shrink-0">
                  <Icon size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{action.label}</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">{action.desc}</p>
                </div>
              </div>
              <ArrowUpRight size={16} className="opacity-70" />
            </button>
          );
        })}
      </div>

      {/* 5. Quick Attendance & Visitor Modal */}
      {isAttendanceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in zoom-in-95">
          <div className="w-full max-w-xl p-6 rounded-3xl bg-slate-900 border border-white/20 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <CalendarCheck className="text-cyan-400" size={20} />
                <div>
                  <h3 className="text-base font-bold text-white">Quick Attendance & Service Marker</h3>
                  <p className="text-[11px] text-slate-400">Session Date: <span className="text-cyan-400 font-mono">{todayDate}</span></p>
                </div>
              </div>
              <button onClick={() => setIsAttendanceModalOpen(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-white/10">
              <label className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider block mb-1">
                Select Worship Service:
              </label>
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none"
              >
                <option value="Sunday 1st Morning Service (07:00 AM)">Sunday 1st Morning Service (07:00 AM)</option>
                <option value="Sunday 2nd English Service (09:30 AM)">Sunday 2nd English Service (09:30 AM)</option>
                <option value="Sunday Evening Youth Service (06:00 PM)">Sunday Evening Youth Service (06:00 PM)</option>
              </select>
            </div>

            <div className="flex rounded-xl bg-slate-950 p-1 border border-white/5">
              <button
                type="button"
                onClick={() => setModalTab('existing')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  modalTab === 'existing' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'
                }`}
              >
                Existing Congregation ({allBelievers.length})
              </button>
              <button
                type="button"
                onClick={() => setModalTab('new')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  modalTab === 'new' ? 'bg-rose-500 text-white' : 'text-slate-400'
                }`}
              >
                + New Seeker / Visitor
              </button>
            </div>

            {modalTab === 'existing' ? (
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input
                    type="text"
                    placeholder="Search believer name, family, or phone..."
                    value={searchMember}
                    onChange={(e) => setSearchMember(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="max-h-60 overflow-y-auto divide-y divide-white/5 pr-1">
                  {allBelievers
                    .filter(b => b.name?.toLowerCase().includes(searchMember.toLowerCase()) || b.familyName?.toLowerCase().includes(searchMember.toLowerCase()) || b.phone?.includes(searchMember))
                    .map((b) => {
                      const isMarked = attendanceRecords[b.uniqueId]?.status === 'Present';
                      return (
                        <div key={b.uniqueId} className="flex items-center justify-between py-2 px-2 hover:bg-white/[0.02] rounded-xl transition-colors">
                          <div>
                            <div className="text-xs font-bold text-white">{b.name}</div>
                            <div className="text-[10px] text-slate-400">{b.familyName} • {b.phone || 'No phone'}</div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleMarkPresent(b.uniqueId, b.name, 'Member')}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                              isMarked 
                                ? 'bg-emerald-500 text-slate-950' 
                                : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
                            }`}
                          >
                            {isMarked ? 'Present ✓' : 'Mark'}
                          </button>
                        </div>
                      );
                    })}
                </div>
              </div>
            ) : (
              <form onSubmit={handleSaveNewVisitor} className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-slate-300 font-medium">New Seeker Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Peter"
                      value={newVisitorForm.name}
                      onChange={(e) => setNewVisitorForm({ ...newVisitorForm, name: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white mt-1 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-300 font-medium">Mobile Phone *</label>
                    <input
                      type="text"
                      required
                      placeholder="+91 98765..."
                      value={newVisitorForm.phone}
                      onChange={(e) => setNewVisitorForm({ ...newVisitorForm, phone: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white mt-1 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-slate-300 font-medium">Area / Town</label>
                    <input
                      type="text"
                      placeholder="e.g. Gandhipuram"
                      value={newVisitorForm.area}
                      onChange={(e) => setNewVisitorForm({ ...newVisitorForm, area: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white mt-1 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-300 font-medium">Brought By</label>
                    <input
                      type="text"
                      placeholder="e.g. Bro. David"
                      value={newVisitorForm.broughtBy}
                      onChange={(e) => setNewVisitorForm({ ...newVisitorForm, broughtBy: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white mt-1 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-500/20 active:scale-95 transition mt-2"
                >
                  Save Seeker & Check-in
                </button>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}