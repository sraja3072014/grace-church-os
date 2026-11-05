// src/components/dashboard/MainDashboard.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { soundFX } from '../../utils/audioEngine';
import { getVaultData, setVaultData } from '../../utils/vaultStore';
import { 
  Users, Building2, TrendingUp,
  CalendarCheck, ArrowUpRight, Sparkles, Receipt, 
  X, Search, Check,
  Clock,
  UserPlus, Database, CheckCircle2
} from 'lucide-react';
import CelebrationDispatcherWidget from '../widgets/CelebrationDispatcherWidget';
import ExecutiveSummaryRow from './ExecutiveSummaryRow';
import { isFinanceDeskRole } from '../../config/navigationConfig';

export default function MainDashboard({
  setActiveTab,
  session,
  onRegisterMember,
  onOpenSettings
}) {
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
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
  const [expensesList, setExpensesList] = useState([]);
  const [attendanceLedger, setAttendanceLedger] = useState([]);
  const [careRequests, setCareRequests] = useState([]);

  const [churchInfo, setChurchInfo] = useState(() => {
    try {
      const cfg = JSON.parse(localStorage.getItem('graceos_main_church') || '{}');
      return {
        churchName: cfg.churchName || 'Grace Cathedral Church',
        activeCampus: session?.activeCampus || 'Headquarters'
      };
    } catch {
      return {
        churchName: 'Grace Cathedral Church',
        activeCampus: 'Headquarters'
      };
    }
  });

  // Updated Visitor Form with Address Field
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
      const dbExpenses = await getVaultData('expenses', []);
      const dbAttendance = await getVaultData('attendance', []);
      const dbCareRequests = await getVaultData('care_requests', []);

      setFamilies(Array.isArray(dbFamilies) ? dbFamilies : []);
      setVisitors(Array.isArray(dbVisitors) ? dbVisitors : []);
      setIncomeList(Array.isArray(dbFinance) ? dbFinance : []);
      setExpensesList(Array.isArray(dbExpenses) ? dbExpenses : []);
      setAttendanceLedger(Array.isArray(dbAttendance) ? dbAttendance : []);
      setCareRequests(Array.isArray(dbCareRequests) ? dbCareRequests : []);

      if (session?.activeCampus) {
        setChurchInfo(prev => ({
          ...prev,
          activeCampus: session.activeCampus
        }));
      }
    }
    hydrateDashboardFromDisk();
    const refreshAfterSync = () => hydrateDashboardFromDisk();
    window.addEventListener('graceos_full_sync_completed', refreshAfterSync);
    window.addEventListener('graceos_realtime_data_update', refreshAfterSync);
    window.addEventListener('storage', refreshAfterSync);
    const handleVisitorConversion = (event) => showToast(`Visitor successfully welcomed as Full Member (ID: ${event.detail?.memberId || 'MEM-NEW'})!`);
    window.addEventListener('graceos_visitor_converted', handleVisitorConversion);
    return () => {
      window.removeEventListener('graceos_full_sync_completed', refreshAfterSync);
      window.removeEventListener('graceos_realtime_data_update', refreshAfterSync);
      window.removeEventListener('storage', refreshAfterSync);
      window.removeEventListener('graceos_visitor_converted', handleVisitorConversion);
    };
  }, [session]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Believers Unique Identifier Map
  const allBelievers = useMemo(() => {
    const list = [];
    const seenMemberIds = new Set();
    const addBeliever = (believer, fallbackId) => {
      const memberId = String(
        believer?.id || believer?.memberId || believer?.member_id || fallbackId
      );
      if (seenMemberIds.has(memberId)) return;
      seenMemberIds.add(memberId);
      return memberId;
    };
    (families || []).forEach((fam, fIdx) => {
      const fId = fam?.familyId || `FAM-${fIdx + 101}`;
      if (fam?.headMember) {
        const memberId = addBeliever(fam.headMember, `${fId}-HEAD`);
        if (memberId) {
          list.push({
            ...fam.headMember,
            uniqueId: memberId,
            memberId,
            name: fam.headMember.name || 'Family Head',
            familyName: fam.familyName || 'Household',
            roleInFamily: 'Head of Family',
            phone: fam.headMember.phone || ''
          });
        }
      }
      (fam?.members || []).forEach((m, mIdx) => {
        const memberId = addBeliever(m, `${fId}-MEMBER-${mIdx + 1}`);
        if (!memberId) return;
        list.push({
          ...m,
          uniqueId: memberId,
          memberId,
          name: m.name || 'Family Member',
          familyName: fam.familyName || 'Household',
          roleInFamily: m.roleInFamily || 'Member',
          phone: m.phone || fam?.headMember?.phone || ''
        });
      });
    });
    return list;
  }, [families]);

  const uniqueMemberCount = useMemo(() => {
    const memberIds = new Set([
      ...(families || []).map((family) => (
        family?.headMember?.id || family?.headMember?.memberId || family?.headMember?.member_id
      )),
      ...(families || []).flatMap((family) => (
        (Array.isArray(family?.members) ? family.members : [])
          .map((member) => member?.id || member?.memberId || member?.member_id)
      ))
    ].filter(Boolean).map(String));
    return memberIds.size;
  }, [families]);

  const totalGiving = useMemo(() => {
    return incomeList.reduce((acc, curr) => acc + (Number(curr?.amount) || 0), 0);
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
      followUpStage: 'new_contact',
      pipeline_stage: '1ST_VISIT',
      is_converted: false
    };

    const updatedVisitors = [newRecord, ...visitors];
    setVisitors(updatedVisitors);
    await setVaultData('visitors', updatedVisitors, true);
    await handleMarkPresent(newId, newVisitorForm.name, 'Visitor');

    setNewVisitorForm({ name: '', phone: '', area: '', address: '', broughtBy: '', prayerRequest: '' });
    setModalTab('existing');
    showToast('New Seeker registered & marked present successfully!');
  };

  const openVisitorStage = (stage) => {
    setActiveTab?.('visitors');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('graceos_visitor_pipeline_filter', { detail: { stage } }));
    }
  };

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

      </div>

      {/* 2. Top Metric Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div onClick={() => setActiveTab?.('members')} className="p-5 win11-card rounded-2xl cursor-pointer flex flex-col justify-between transition hover:scale-[1.01]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">Total Congregation</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full badge-emerald">+12.4%</span>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-black stat-number">{uniqueMemberCount.toLocaleString()}</p>
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

        <div
          onClick={isFinanceDeskRole(session?.role) ? () => setActiveTab?.('finance') : undefined}
          className={`p-5 win11-card rounded-2xl flex flex-col justify-between transition ${isFinanceDeskRole(session?.role) ? 'cursor-pointer hover:scale-[1.01]' : ''}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">
              {isFinanceDeskRole(session?.role) ? 'Month Giving Inflow' : 'Giving Summary'}
            </span>
            {isFinanceDeskRole(session?.role) && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full badge-emerald">Audited</span>
            )}
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-black stat-number text-emerald-400">
              {isFinanceDeskRole(session?.role) ? `₹ ${totalGiving.toLocaleString()}` : 'Restricted'}
            </p>
            <span className="text-[10px] text-slate-400 font-semibold mt-1 inline-block font-mono">
              {isFinanceDeskRole(session?.role) ? '80G Physical Disk Vault' : 'Finance roles only'}
            </span>
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
          { label: 'Quick Attendance Marker', desc: 'Mark Live Congregation Check-in', icon: CalendarCheck, onClick: () => setIsAttendanceModalOpen(true), color: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-300' },
          { label: 'Register Member', desc: 'New Family Tree Intake', icon: UserPlus, onClick: onRegisterMember, color: 'from-rose-500/20 to-amber-500/10 border-rose-500/30 text-rose-300' },
          { label: 'Record Tithe / Giving', desc: 'Issue 80G Receipt', icon: Receipt, target: 'finance', color: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-300' },
          { label: 'System Preferences', desc: 'Physical Storage & Settings', icon: Database, onClick: () => onOpenSettings?.('vault_drive'), color: 'from-sky-500/20 to-indigo-500/10 border-sky-500/30 text-sky-300' },
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

      {/* 4. Core Operational Grid */}
      <div className="space-y-5">
        <ExecutiveSummaryRow
          visitors={visitors}
          careRequests={careRequests}
          finance={incomeList}
          expenses={expensesList}
          canViewTreasury={isFinanceDeskRole(session?.role)}
          onOpenVisitorFunnel={(stage) => openVisitorStage(stage)}
          onOpenCare={() => setActiveTab?.('ministries')}
          onOpenFinance={() => setActiveTab?.('finance')}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Celebration Dispatcher */}
          <CelebrationDispatcherWidget />
        </div>
      </div>

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
                <div>
                  <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">Seeker Name *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Bro. Michael Raj" 
                    value={newVisitorForm.name} 
                    onChange={(e) => setNewVisitorForm({ ...newVisitorForm, name: e.target.value })} 
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-bold" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">Mobile Number *</label>
                    <input 
                      type="tel" 
                      required 
                      placeholder="98430XXXXX" 
                      value={newVisitorForm.phone} 
                      onChange={(e) => setNewVisitorForm({ ...newVisitorForm, phone: e.target.value })} 
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono" 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">Area / Locality</label>
                    <input 
                      type="text" 
                      placeholder="e.g. RS Puram" 
                      value={newVisitorForm.area} 
                      onChange={(e) => setNewVisitorForm({ ...newVisitorForm, area: e.target.value })} 
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white" 
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">Full Residential Address *</label>
                  <textarea 
                    required
                    rows="2"
                    placeholder="Door No, Street Name, City, Pincode..." 
                    value={newVisitorForm.address} 
                    onChange={(e) => setNewVisitorForm({ ...newVisitorForm, address: e.target.value })} 
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white resize-none" 
                  />
                </div>
                <button type="submit" className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold shadow-md cursor-pointer transition">
                  Save Seeker &amp; Check In
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}