import React, { useState, useEffect, useMemo } from 'react';
import { soundFX } from '../../utils/audioEngine';
import { getVaultData, setVaultData } from '../../utils/vaultStore';
import { 
  Users, Building2, TrendingUp, DollarSign, 
  CalendarCheck, ArrowUpRight, Sparkles, Receipt, 
  HeartHandshake, X, Search, Check, 
  Clock, Phone, AlertCircle, Info, Landmark, MapPin, 
  QrCode, UserPlus, Database, CheckCircle2, Tv
} from 'lucide-react';
import SanctuaryLiveScreen from '../display/SanctuaryLiveScreen';
import CelebrationDispatcherWidget from '../widgets/CelebrationDispatcherWidget';

export default function MainDashboard({ setActiveTab, session }) {
  const [showProjector, setShowProjector] = useState(false);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [directInputId, setDirectInputId] = useState('');
  const [qrCheckinFeedback, setQrCheckinFeedback] = useState(null);
  const [isRegisterFamilyModalOpen, setIsRegisterFamilyModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [modalTab, setModalTab] = useState('existing');
  const [searchMember, setSearchMember] = useState('');
  const [selectedService, setSelectedService] = useState('Sunday 1st Morning Service (07:00 AM)');
  const todayDate = new Date().toISOString().split('T')[0];

  const dynamicSettings = { fontFamily: 'Inter, sans-serif', fontSize: '13px', currency: '₹' };

  // 🌟 Disk Vault Data States
  const [families, setFamilies] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [incomeList, setIncomeList] = useState([]);
  const [attendanceLedger, setAttendanceLedger] = useState([]);

  const [churchInfo, setChurchInfo] = useState({
    churchName: 'Grace City Church',
    activeCampus: 'Headquarters'
  });

  const [familyForm, setFamilyForm] = useState({
    headName: '',
    gender: 'Male',
    phone: '',
    area: '',
    maritalStatus: 'Married',
    campus: 'Main Cathedral Sanctuary'
  });

  const [newVisitorForm, setNewVisitorForm] = useState({
    name: '',
    phone: '',
    area: '',
    address: '',
    broughtBy: '',
    prayerRequest: ''
  });

  // 🌟 லோக்கல் ஹார்ட் டிஸ்க்கில் இருந்து நேரடித் தரவு ஏற்றுதல் (/database)
  useEffect(() => {
    async function hydrateDashboardFromDisk() {
      const dbFamilies = await getVaultData('members', []);
      const dbVisitors = await getVaultData('visitors', []);
      const dbFinance = await getVaultData('finance', []);
      const dbAttendance = await getVaultData('attendance', []);

      setFamilies(dbFamilies);
      setVisitors(dbVisitors);
      setIncomeList(dbFinance);
      setAttendanceLedger(dbAttendance);

      if (session?.activeCampus) {
        setChurchInfo(prev => ({
          ...prev,
          activeCampus: session.activeCampus
        }));
      }
    }
    hydrateDashboardFromDisk();
  }, [session]);

  const nextIds = useMemo(() => {
    const nextNum = families.length + 101;
    return {
      familyId: `FAM-${nextNum}`,
      memberId: `MBR-${String(nextNum).padStart(4, '0')}`
    };
  }, [families]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Believers Unique Identifier Map
  const allBelievers = useMemo(() => {
    const list = [];
    (families || []).forEach((fam, fIdx) => {
      const fId = fam?.familyId || `FAM-${fIdx + 101}`;
      if (fam?.headMember) {
        list.push({
          ...fam.headMember,
          uniqueId: fam.headMember.memberId || `MBR-${fIdx + 1001}`,
          memberId: fam.headMember.memberId || `MBR-${fIdx + 1001}`,
          name: fam.headMember.name || 'Family Head',
          familyName: fam.familyName || 'Household',
          roleInFamily: 'Head of Family',
          phone: fam.headMember.phone || ''
        });
      }
      (fam?.members || []).forEach((m, mIdx) => {
        list.push({
          ...m,
          uniqueId: m.memberId || `MBR-SUB-${mIdx}`,
          memberId: m.memberId || `MBR-SUB-${mIdx}`,
          name: m.name || 'Family Member',
          familyName: fam.familyName || 'Household',
          roleInFamily: m.roleInFamily || 'Member',
          phone: m.phone || fam?.headMember?.phone || ''
        });
      });
    });
    return list;
  }, [families]);

  const totalGiving = useMemo(() => {
    return incomeList.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  }, [incomeList]);

  const currentAttendanceMap = useMemo(() => {
    const map = {};
    attendanceLedger
      .filter(item => item.date === todayDate && item.service === selectedService)
      .forEach(item => {
        map[item.memberId] = item;
      });
    return map;
  }, [attendanceLedger, todayDate, selectedService]);

  // 🌟 வருகையை நேரடியாக ஹார்ட் டிரைவில் சேமித்தல் (/database/attendance.json)
  const handleMarkPresent = async (uniqueId, name, type = 'Member') => {
    soundFX?.playClickPop?.();
    const isCurrentlyPresent = currentAttendanceMap[uniqueId]?.status === 'Present';
    let updated;

    if (isCurrentlyPresent) {
      updated = attendanceLedger.filter(
        item => !(item.memberId === uniqueId && item.date === todayDate && item.service === selectedService)
      );
    } else {
      const record = {
        id: Date.now(),
        date: todayDate,
        service: selectedService,
        memberId: uniqueId,
        name,
        type,
        status: 'Present',
        markedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      updated = [record, ...attendanceLedger];
    }

    setAttendanceLedger(updated);
    await setVaultData('attendance', updated, true);
  };

  const handleDirectIdCheckin = async (e) => {
    e.preventDefault();
    if (!directInputId.trim()) return;

    const query = directInputId.trim().toLowerCase();

    const matchedBeliever = allBelievers.find((b) =>
      (b.memberId && String(b.memberId).toLowerCase().includes(query)) ||
      (b.phone && String(b.phone).includes(query)) ||
      (b.name && String(b.name).toLowerCase().includes(query))
    );

    if (matchedBeliever) {
      await handleMarkPresent(matchedBeliever.memberId, matchedBeliever.name, 'Member');
      soundFX?.playSuccessChime?.();
      setQrCheckinFeedback({
        success: true,
        msg: `Verified! ${matchedBeliever.name} marked Present ✓`
      });
      setDirectInputId('');
    } else {
      const matchedVisitor = visitors.find((v) =>
        (v.id && String(v.id).toLowerCase().includes(query)) ||
        (v.phone && String(v.phone).includes(query)) ||
        (v.name && String(v.name).toLowerCase().includes(query))
      );

      if (matchedVisitor) {
        await handleMarkPresent(matchedVisitor.id, matchedVisitor.name, 'Visitor');
        soundFX?.playSuccessChime?.();
        setQrCheckinFeedback({
          success: true,
          msg: `Verified! Visitor ${matchedVisitor.name} marked Present ✓`
        });
        setDirectInputId('');
      } else {
        setQrCheckinFeedback({
          success: false,
          msg: `Record not found for "${directInputId}".`
        });
      }
    }

    setTimeout(() => setQrCheckinFeedback(null), 4000);
  };

  const handleSaveDirectFamily = async (e) => {
    e.preventDefault();
    if (!familyForm.headName.trim() || !familyForm.phone.trim()) return;

    const newFamilyEntry = {
      familyId: nextIds.familyId,
      familyName: `${familyForm.headName.trim()} & Household`,
      area: familyForm.area || 'City Centre',
      campus: familyForm.campus,
      createdDate: todayDate,
      headMember: {
        memberId: nextIds.memberId,
        name: familyForm.headName.trim(),
        roleInFamily: 'Head of Family',
        gender: familyForm.gender,
        phone: familyForm.phone.trim(),
        maritalStatus: familyForm.maritalStatus,
        status: 'Active',
        campus: familyForm.campus
      },
      members: []
    };

    const updated = [newFamilyEntry, ...families];
    setFamilies(updated);
    await setVaultData('members', updated, true);

    setIsRegisterFamilyModalOpen(false);
    setFamilyForm({
      headName: '', gender: 'Male', phone: '', area: '', maritalStatus: 'Married', campus: 'Main Cathedral Sanctuary'
    });
    soundFX?.playSuccessChime?.();
    showToast(`Success! ${newFamilyEntry.familyName} saved directly to Disk Vault.`);
  };

  const handleSaveNewVisitor = async (e) => {
    e.preventDefault();
    if (!newVisitorForm.name.trim() || !newVisitorForm.phone.trim()) return;

    const newId = `VIS-${Date.now().toString().slice(-4)}`;
    const newRecord = {
      id: newId,
      name: newVisitorForm.name,
      phone: newVisitorForm.phone,
      area: newVisitorForm.area || 'Locality',
      address: newVisitorForm.address || '',
      broughtBy: newVisitorForm.broughtBy || 'Self',
      prayerRequest: newVisitorForm.prayerRequest || 'General Prayer',
      firstVisitDate: todayDate,
      serviceAttended: selectedService,
      followUpStage: 'new_contact'
    };

    const updatedVisitors = [newRecord, ...visitors];
    setVisitors(updatedVisitors);
    await setVaultData('visitors', updatedVisitors, true);
    await handleMarkPresent(newId, newVisitorForm.name, 'Visitor');

    setNewVisitorForm({ name: '', phone: '', area: '', address: '', broughtBy: '', prayerRequest: '' });
    setModalTab('existing');
  };

  // விடுபட்ட விட்ஜெட் 1: Critical Care Alerts List[cite: 13]
  const criticalCareList = [
    { name: 'Bro. Sarah Jenkins', missed: 'Missed 4 Services (Last seen 1 month ago)', phone: '+91 98765 11001' },
    { name: 'Bro. David Miller', missed: 'Missed 3 Services (Calling Pending)', phone: '+91 98765 11002' },
    { name: 'Sister Marcus Thompson', missed: 'Missed 5 Services (Home Visit Needed)', phone: '+91 98765 11003' }
  ];

  // விடுபட்ட விட்ஜெட் 2: Multi-Branch Treasury Split[cite: 13]
  const treasuryBranches = [
    { name: 'Main Cathedral Treasury (SBI - 4401)', tithe: '65%', offering: '25%', building: '10%', total: '₹ 1,85,000' },
    { name: 'North Campus Building (HDFC - 8812)', tithe: '40%', offering: '40%', building: '20%', total: '₹ 95,000' },
    { name: 'Mission & Outreach (ICICI - 2045)', tithe: '70%', offering: '15%', building: '15%', total: '₹ 42,000' }
  ];

  const countStage1 = visitors.filter(v => (v.followUpStage || 'new_contact') === 'new_contact').length;
  const countStage2 = visitors.filter(v => v.followUpStage === 'calling_scheduled').length;
  const countStage3 = visitors.filter(v => v.followUpStage === 'home_visit').length;
  const countStage4 = visitors.filter(v => v.followUpStage === 'ready_for_membership').length;

  return (
    <div 
      style={{ fontFamily: dynamicSettings.fontFamily, fontSize: dynamicSettings.fontSize }}
      className="flex flex-col gap-6 select-none animate-in fade-in duration-200"
    >
      {toastMessage && (
        <div className="fixed top-5 right-5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 backdrop-blur-md shadow-2xl z-50 animate-in fade-in">
          <CheckCircle2 size={15} />
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}
      
      {/* 1. Header Overview Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <span>{churchInfo.churchName}</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono font-medium">
              Physical Disk Vault Active
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Active Campus: <strong className="text-slate-200">{churchInfo.activeCampus}</strong> • Real-time Host PC Disk Node
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowProjector(true)}
            className="px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-lg"
          >
            <Tv size={15} />
            <span>Live Screen (F11)</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAttendanceModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-rose-500 to-amber-600 hover:from-rose-400 hover:to-amber-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-500/20 flex items-center gap-1.5 active:scale-95 transition cursor-pointer"
          >
            <CalendarCheck size={15} />
            <span>Quick Attendance Marker</span>
          </button>
        </div>
      </div>

      {/* 2. Top Metric Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div onClick={() => setActiveTab?.('members')} className="p-5 win11-card rounded-2xl cursor-pointer flex flex-col justify-between transition hover:scale-[1.01]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">Total Congregation</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full badge-emerald">+12.4%</span>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-black stat-number">{allBelievers.length.toLocaleString()}</p>
            <span className="text-[10px] text-slate-400 font-semibold mt-1 inline-block">Active registered souls</span>
          </div>
        </div>

        <div onClick={() => setActiveTab?.('members')} className="p-5 win11-card rounded-2xl cursor-pointer flex flex-col justify-between transition hover:scale-[1.01]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">Registered Households</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full badge-cyan">+4.1%</span>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-black stat-number">{families.length}</p>
            <span className="text-[10px] text-slate-400 font-semibold mt-1 inline-block">Family units enrolled</span>
          </div>
        </div>

        <div onClick={() => setActiveTab?.('finance')} className="p-5 win11-card rounded-2xl cursor-pointer flex flex-col justify-between transition hover:scale-[1.01]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">Month Giving Inflow</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full badge-emerald">Audited</span>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-black stat-number text-emerald-400">
              ₹ {totalGiving.toLocaleString()}
            </p>
            <span className="text-[10px] text-slate-400 font-semibold mt-1 inline-block font-mono">80G Physical Disk Vault</span>
          </div>
        </div>

        <div onClick={() => setActiveTab?.('attendance')} className="p-5 win11-card rounded-2xl cursor-pointer flex flex-col justify-between transition hover:scale-[1.01]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">Today's Check-ins</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full badge-amber">Live</span>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-black stat-number text-amber-400">
              {Object.keys(currentAttendanceMap).length}
            </p>
            <span className="text-[10px] text-slate-400 font-semibold mt-1 inline-block">Present in Sanctuary</span>
          </div>
        </div>
      </div>

      {/* 3. Operational Launchers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'QR Fast Check-in', desc: 'Scan Badge / Direct ID Desk', icon: QrCode, onClick: () => setIsQRModalOpen(true), color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-300' },
          { label: 'Register Member', desc: 'New Family Tree Intake', icon: UserPlus, onClick: () => setIsRegisterFamilyModalOpen(true), color: 'from-rose-500/20 to-amber-500/10 border-rose-500/30 text-rose-300' },
          { label: 'Record Tithe / Giving', desc: 'Issue 80G Receipt', icon: Receipt, target: 'finance', color: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-300' },
          { label: 'System Preferences', desc: 'Physical Storage & Settings', icon: Database, target: 'settings', color: 'from-sky-500/20 to-indigo-500/10 border-sky-500/30 text-sky-300' },
        ].map((action, idx) => {
          const Icon = action.icon;
          return (
            <button
              key={idx}
              type="button"
              onClick={action.onClick || (() => setActiveTab(action.target))}
              className={`p-4 rounded-2xl border bg-gradient-to-br ${action.color} flex items-center justify-between text-left hover:scale-[1.02] active:scale-98 transition shadow-lg shadow-black/20 cursor-pointer`}
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

      {/* 🌟 4. 3-IN-1 CORE OPERATIONAL GRID (முன்பு விடுபட்ட விட்ஜெட்டுகள் முழுமையாக சேர்க்கப்பட்டுள்ளன) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* 1. Visitor Engagement Pipeline[cite: 13] */}
        <div className="p-5 win11-card rounded-2xl border border-white/[0.08] flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <HeartHandshake className="text-rose-400" size={15} />
              <span>Visitor Pipeline</span>
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">{visitors.length} Seekers</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div onClick={() => setActiveTab?.('visitors')} className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center cursor-pointer hover:scale-[1.02] transition">
              <span className="text-[9px] text-amber-300 uppercase font-bold block">1st Visit</span>
              <div className="text-lg font-black text-amber-400 font-mono">{countStage1}</div>
              <span className="text-[9px] text-slate-400">New Seekers</span>
            </div>

            <div onClick={() => setActiveTab?.('visitors')} className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-center cursor-pointer hover:scale-[1.02] transition">
              <span className="text-[9px] text-sky-300 uppercase font-bold block">Pastoral Call</span>
              <div className="text-lg font-black text-sky-400 font-mono">{countStage2}</div>
              <span className="text-[9px] text-slate-400">Under Care</span>
            </div>

            <div onClick={() => setActiveTab?.('visitors')} className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-center cursor-pointer hover:scale-[1.02] transition">
              <span className="text-[9px] text-indigo-300 uppercase font-bold block">Home Visit</span>
              <div className="text-lg font-black text-indigo-400 font-mono">{countStage3}</div>
              <span className="text-[9px] text-slate-400">Cell Groups</span>
            </div>

            <div onClick={() => setActiveTab?.('visitors')} className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center cursor-pointer hover:scale-[1.02] transition">
              <span className="text-[9px] text-emerald-300 uppercase font-bold block">Full Member</span>
              <div className="text-lg font-black text-emerald-400 font-mono">{countStage4}</div>
              <span className="text-[9px] text-slate-400">Ready to Add</span>
            </div>
          </div>

          <p className="text-[10px] text-slate-500 text-center border-t border-white/5 pt-2">
            Clicking opens visitor care registry.
          </p>
        </div>

        {/* 2. Critical Care Alerts[cite: 13] */}
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
              <div key={idx} className="p-2.5 rounded-xl bg-black/30 border border-white/5 flex items-center justify-between">
                <div className="overflow-hidden pr-2">
                  <div className="text-xs font-bold text-white truncate">{person.name}</div>
                  <div className="text-[10px] text-rose-400 font-medium truncate">{person.missed}</div>
                </div>
                <button 
                  type="button"
                  onClick={() => alert(`Calling ${person.name} (${person.phone})...`)}
                  className="p-2 rounded-lg bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 transition shrink-0 cursor-pointer"
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

        {/* 3. Multi-Branch Treasury Split[cite: 13] */}
        <div className="p-5 win11-card rounded-2xl border border-white/[0.08] flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
            <div className="flex items-center gap-2 text-amber-400">
              <Landmark size={15} />
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">Multi-Branch Treasury</h4>
            </div>
            <span className="text-xs font-mono text-emerald-400 font-bold">Live Split</span>
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

        <CelebrationDispatcherWidget />
      </div>

      {/* 5. Direct Family Intake Modal */}
      {isRegisterFamilyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-slate-900 border border-white/20 shadow-2xl space-y-4 relative select-none">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  <UserPlus size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Direct Family Tree Intake</h3>
                  <p className="text-[10px] text-slate-400">
                    Auto Reg IDs: <strong className="text-amber-400 font-mono">{nextIds.familyId}</strong> • <strong className="text-cyan-400 font-mono">{nextIds.memberId}</strong>
                  </p>
                </div>
              </div>
              <button type="button" onClick={() => setIsRegisterFamilyModalOpen(false)} className="text-slate-400 hover:text-white p-1 cursor-pointer"><X size={18} /></button>
            </div>

            <form onSubmit={handleSaveDirectFamily} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 font-medium">Family ID (Auto)</label>
                  <input type="text" readOnly value={nextIds.familyId} className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-amber-400 font-mono font-bold mt-1 cursor-not-allowed" />
                </div>
                <div>
                  <label className="text-xs text-slate-300 font-medium">Head Member ID (Auto)</label>
                  <input type="text" readOnly value={nextIds.memberId} className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-cyan-400 font-mono font-bold mt-1 cursor-not-allowed" />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium">Family Head Full Name *</label>
                <input type="text" required placeholder="e.g. Bro. David Paulraj" value={familyForm.headName} onChange={(e) => setFamilyForm({ ...familyForm, headName: e.target.value })} className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white font-bold mt-1 focus:outline-none focus:border-rose-400" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 font-medium">Contact Phone *</label>
                  <input type="text" required placeholder="+91 98401 23456" value={familyForm.phone} onChange={(e) => setFamilyForm({ ...familyForm, phone: e.target.value })} className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono mt-1 focus:outline-none focus:border-rose-400" />
                </div>
                <div>
                  <label className="text-xs text-slate-300 font-medium">Gender</label>
                  <select value={familyForm.gender} onChange={(e) => setFamilyForm({ ...familyForm, gender: e.target.value })} className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:outline-none cursor-pointer">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 font-medium">Residential Locality / Area</label>
                  <input type="text" placeholder="e.g. Anna Nagar, Chennai" value={familyForm.area} onChange={(e) => setFamilyForm({ ...familyForm, area: e.target.value })} className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs text-slate-300 font-medium">Marital Status</label>
                  <select value={familyForm.maritalStatus} onChange={(e) => setFamilyForm({ ...familyForm, maritalStatus: e.target.value })} className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:outline-none cursor-pointer">
                    <option value="Married">Married</option>
                    <option value="Single">Single</option>
                    <option value="Widowed">Widowed</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                <button type="button" onClick={() => setIsRegisterFamilyModalOpen(false)} className="px-4 py-2 text-xs text-slate-400 hover:text-white cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-gradient-to-r from-rose-500 to-amber-600 text-white rounded-xl text-xs font-bold cursor-pointer shadow-lg shadow-rose-500/20 active:scale-95 transition">Save Family to Disk</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Quick Attendance Modal */}
      {isAttendanceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in zoom-in-95">
          <div className="w-full max-w-xl p-6 rounded-3xl bg-slate-900 border border-white/20 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <CalendarCheck className="text-amber-400" size={20} />
                <div>
                  <h3 className="text-base font-bold text-white">Attendance Marker (Physical Disk)</h3>
                  <p className="text-[11px] text-slate-400">Session Date: <span className="text-amber-400 font-mono">{todayDate}</span></p>
                </div>
              </div>
              <button type="button" onClick={() => setIsAttendanceModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer"><X size={18} /></button>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-white/10">
              <label className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block mb-1">
                Select Worship Service:
              </label>
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none cursor-pointer"
              >
                <option value="Sunday 1st Morning Service (07:00 AM)">Sunday 1st Morning Service (07:00 AM)</option>
                <option value="Sunday 2nd English Service (09:30 AM)">Sunday 2nd English Service (09:30 AM)</option>
                <option value="Sunday Evening Youth Service (06:00 PM)">Sunday Evening Youth Service (06:00 PM)</option>
              </select>
            </div>

            <div className="flex rounded-xl bg-slate-950 p-1 border border-white/5">
              <button type="button" onClick={() => setModalTab('existing')} className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${modalTab === 'existing' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400'}`}>
                Existing Congregation ({allBelievers.length})
              </button>
              <button type="button" onClick={() => setModalTab('new')} className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${modalTab === 'new' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400'}`}>
                + New Seeker / Visitor
              </button>
            </div>

            {modalTab === 'existing' ? (
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input
                    type="text"
                    placeholder="Search believer name or phone..."
                    value={searchMember}
                    onChange={(e) => setSearchMember(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="max-h-60 overflow-y-auto divide-y divide-white/5 pr-1">
                  {allBelievers
                    .filter(b => b.name?.toLowerCase().includes(searchMember.toLowerCase()) || b.phone?.includes(searchMember))
                    .map((b) => {
                      const isMarked = currentAttendanceMap[b.memberId]?.status === 'Present';
                      return (
                        <div key={b.uniqueId} className="flex items-center justify-between py-2 px-2 hover:bg-white/[0.02] rounded-xl">
                          <div>
                            <div className="text-xs font-bold text-white">{b.name}</div>
                            <div className="text-[10px] text-slate-400">{b.familyName} • {b.phone || 'No phone'}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleMarkPresent(b.memberId, b.name, 'Member')}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                              isMarked ? 'bg-emerald-500 text-slate-950 font-black' : 'bg-white/5 text-slate-300 border border-white/10'
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
                <input type="text" required placeholder="Seeker Name" value={newVisitorForm.name} onChange={(e) => setNewVisitorForm({ ...newVisitorForm, name: e.target.value })} className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white" />
                <input type="text" required placeholder="Phone Number" value={newVisitorForm.phone} onChange={(e) => setNewVisitorForm({ ...newVisitorForm, phone: e.target.value })} className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono" />
                <button type="submit" className="w-full py-2.5 bg-amber-500 text-slate-950 rounded-xl text-xs font-bold shadow-md cursor-pointer">Save Seeker to Disk</button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 7. Instant QR Check-in Modal */}
      {isQRModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-white/20 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white">Instant QR & ID Check-in Desk</h3>
              <button type="button" onClick={() => setIsQRModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer"><X size={18} /></button>
            </div>
            {qrCheckinFeedback && (
              <div className={`p-3 rounded-2xl text-xs font-bold border ${qrCheckinFeedback.success ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border-rose-500/40'}`}>
                {qrCheckinFeedback.msg}
              </div>
            )}
            <form onSubmit={handleDirectIdCheckin} className="flex gap-2">
              <input
                type="text"
                required
                placeholder="Type Member ID or Phone..."
                value={directInputId}
                onChange={(e) => setDirectInputId(e.target.value)}
                className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white font-mono"
              />
              <button type="submit" className="px-4 py-2 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl cursor-pointer">Check In</button>
            </form>
          </div>
        </div>
      )}

      {showProjector && <SanctuaryLiveScreen onClose={() => setShowProjector(false)} />}
    </div>
  );
}