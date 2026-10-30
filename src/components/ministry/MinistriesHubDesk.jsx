import React, { useState, useEffect, useMemo } from 'react';
import { 
  Home, Users, Calendar, Award, Sparkles, 
  Baby, Flame, Heart, Shield, Phone, Plus, 
  CheckCircle2, MessageSquare, KeyRound, Printer, UserCheck
} from 'lucide-react';
import { soundFX } from '../../utils/audioEngine';
import { getVaultData, setVaultData } from '../../utils/vaultStore';
import CottagePrayerDesk from './CottagePrayerDesk';
import SundayRosterDesk from './SundayRosterDesk';
import OrdinanceRegistryDesk from './OrdinanceRegistryDesk';
import MinistryAttendanceHub from './MinistryAttendanceHub';

export default function MinistriesHubDesk({ session }) {
  const [activeMainTab, setActiveMainTab] = useState('cottage_prayer');

  // Sub-Department State (Moved from Fellowships Ministries Desk)
  const [activeFellowshipTab, setActiveFellowshipTab] = useState('SUNDAY_SCHOOL');
  const [kidsList, setKidsList] = useState([]);
  const [youthList, setYouthList] = useState([]);
  const [womenList, setWomenList] = useState([]);
  const [menList, setMenList] = useState([]);

  // Load physical disk vault data for departmental fellowships
  useEffect(() => {
    async function loadDepartmentalData() {
      const [dbKids, dbYouth, dbWomen, dbMen] = await Promise.all([
        getVaultData('sundayschool_kids', [
          {
            id: 'KID-101',
            name: 'Sharon David',
            age: 7,
            classGroup: 'Primary (Age 6-8)',
            parentName: 'Bro. David Paul',
            parentPhone: '+91 98401 22334',
            pickupPassToken: 'PASS-8841',
            status: 'CHECKED_IN',
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
        ]),
        getVaultData('youth_fellowship', [
          { id: 'YTH-01', name: 'Bro. Joshua Raj', phone: '+91 98401 11223', role: 'Youth Leader', talent: 'Keyboard / Worship', attendanceRate: '94%' },
          { id: 'YTH-02', name: 'Sis. Blessy Grace', phone: '+91 98401 44556', role: 'Member', talent: 'Media & Live Projection', attendanceRate: '88%' },
          { id: 'YTH-03', name: 'Bro. Timothy Paul', phone: '+91 98401 77889', role: 'Member', talent: 'Sound Engineering / Drums', attendanceRate: '90%' }
        ]),
        getVaultData('women_fellowship', [
          { id: 'WMN-01', name: 'Sis. Hepzibah Stephen', phone: '+91 98401 88990', role: 'President', ministryTask: 'Fasting Prayer Coordinator' },
          { id: 'WMN-02', name: 'Sis. Esther Rani', phone: '+91 98401 99001', role: 'Coordinator', ministryTask: 'Sunday Hospitality & Care' }
        ]),
        getVaultData('men_fellowship', [
          { id: 'MEN-01', name: 'Bro. Samuel Raj', phone: '+91 98401 33445', role: 'Coordinator', ministryTask: 'Early Morning Intercession & Protocol' },
          { id: 'MEN-02', name: 'Bro. Andrew Selvam', phone: '+91 98401 66778', role: 'Security Lead', ministryTask: 'Campus Safety & Logistics' }
        ])
      ]);

      setKidsList(dbKids);
      setYouthList(dbYouth);
      setWomenList(dbWomen);
      setMenList(dbMen);
    }
    loadDepartmentalData();
  }, []);

  // Child Security Pass Checkout Routine
  const handleChildPickup = async (kidId) => {
    soundFX?.playClickPop?.();
    const token = window.prompt('Enter Parent Pickup Pass Token (e.g. PASS-8841):');
    if (!token) return;

    const targetKid = kidsList.find(k => k.id === kidId);
    if (targetKid && targetKid.pickupPassToken.toLowerCase() === token.trim().toLowerCase()) {
      soundFX?.playSuccessChime?.();
      const updated = kidsList.map(k => k.id === kidId ? { ...k, status: 'PICKED_UP' } : k);
      setKidsList(updated);
      await setVaultData('sundayschool_kids', updated, true);
      alert(`Security check verified! ${targetKid.name} has been safely released to the parents.`);
    } else {
      alert('Security Verification Failed: Invalid pickup token! Child cannot be released.');
    }
  };

  // WhatsApp Departmental Announcement Dispatcher
  const handleSendNotice = (phone, title, memberName) => {
    soundFX?.playClickPop?.();
    const clean = phone.replace(/[^0-9]/g, '');
    const finalPhone = clean.length === 10 ? `91${clean}` : clean;
    const msg = 
`🕊️ *${title} Meeting Notice* 🕊️
Dear ${memberName},
You are warmly invited to attend our upcoming departmental fellowship gathering.

📍 *Location:* Main Church Campus
⏰ *Time:* Commences promptly as scheduled

With Love,
*Grace Cathedral Ministry Team*`;

    window.open(`https://web.whatsapp.com/send?phone=${finalPhone}&text=${encodeURIComponent(msg)}`, '_blank');
  };

  const navTabs = [
    { id: 'cottage_prayer', label: 'Cottage Prayer Visits', icon: Home },
    { id: 'departmental_fellowships', label: 'Fellowships & Sunday School', icon: Users },
    { id: 'ministry_attendance', label: 'Fellowship Attendance', icon: UserCheck },
    { id: 'sunday_roster', label: 'Sunday Worship Roster', icon: Calendar },
    { id: 'sacred_ordinances', label: 'Baptism & Matrimony', icon: Award }
  ];

  return (
    <div className="space-y-6 select-none animate-in fade-in duration-200 pb-12">
      
      {/* 🌟 Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
            <Sparkles className="text-cyan-400" size={24} />
            <span>Ministry Operations &amp; Liturgy Hub</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Coordinate cottage prayer schedules, departmental fellowships, worship rosters, and holy ordinances.
          </p>
        </div>

        {/* Top Sub-Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-2xl bg-slate-900 p-1.5 border border-white/10">
          {navTabs.map((item) => {
            const Icon = item.icon;
            const isActive = activeMainTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveMainTab(item.id)}
                className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition cursor-pointer text-xs font-bold ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={14} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 🌟 1. Cottage Prayer Visits Tab */}
      {activeMainTab === 'cottage_prayer' && <CottagePrayerDesk session={session} />}

      {/* 🌟 2. Departmental Fellowships Tab (Moved and Integrated Code) */}
      {activeMainTab === 'departmental_fellowships' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-2 bg-slate-900 p-1 rounded-2xl border border-white/10 text-xs">
            <button
              type="button"
              onClick={() => setActiveFellowshipTab('SUNDAY_SCHOOL')}
              className={`px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition cursor-pointer ${
                activeFellowshipTab === 'SUNDAY_SCHOOL' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Baby size={14} />
              <span>Sunday School ({kidsList.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveFellowshipTab('YOUTH')}
              className={`px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition cursor-pointer ${
                activeFellowshipTab === 'YOUTH' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Flame size={14} />
              <span>Youth Fellowship ({youthList.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveFellowshipTab('WOMEN')}
              className={`px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition cursor-pointer ${
                activeFellowshipTab === 'WOMEN' ? 'bg-rose-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Heart size={14} />
              <span>Women's Fellowship ({womenList.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveFellowshipTab('MEN')}
              className={`px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition cursor-pointer ${
                activeFellowshipTab === 'MEN' ? 'bg-indigo-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Shield size={14} />
              <span>Men's Fellowship ({menList.length})</span>
            </button>
          </div>

          {/* Sunday School Sub-View */}
          {activeFellowshipTab === 'SUNDAY_SCHOOL' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-amber-300 flex items-center gap-2">
                    <Shield size={16} />
                    <span>Sunday School Child Security Pass Protocol</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Children are dismissed only after validating the parent's pickup pass token.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-white bg-slate-950 px-3 py-1.5 rounded-xl border border-white/10">
                  Total Enrolled: {kidsList.length} Children
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {kidsList.map((kid) => (
                  <div key={kid.id} className="p-4 rounded-2xl bg-slate-900 border border-white/10 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h5 className="text-sm font-bold text-white">{kid.name}</h5>
                        <span className="text-[10px] text-slate-400 font-mono block">{kid.classGroup} • Teacher: {kid.teacher}</span>
                      </div>
                      <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                        kid.status === 'CHECKED_IN' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      }`}>
                        {kid.status === 'CHECKED_IN' ? 'In Classroom' : 'Released to Parent'}
                      </span>
                    </div>
                    <div className="p-2.5 bg-slate-950 rounded-xl border border-white/5 flex items-center justify-between text-xs font-mono">
                      <span>Parent: <strong className="text-slate-300">{kid.parentName}</strong></span>
                      <span className="text-amber-400 font-bold">Pass: {kid.pickupPassToken}</span>
                    </div>
                    {kid.status === 'CHECKED_IN' ? (
                      <button
                        type="button"
                        onClick={() => handleChildPickup(kid.id)}
                        className="w-full py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <KeyRound size={13} />
                        <span>Verify Pass &amp; Release Child</span>
                      </button>
                    ) : (
                      <div className="w-full py-2 text-center text-emerald-400 font-mono text-[11px] font-bold bg-emerald-500/5 rounded-xl border border-emerald-500/20">
                        ✓ Child Safely Picked Up
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Youth Sub-View */}
          {activeFellowshipTab === 'YOUTH' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {youthList.map((y) => (
                <div key={y.id} className="p-4 rounded-2xl bg-slate-900 border border-white/10 space-y-3">
                  <div className="flex items-start justify-between">
                    <h5 className="text-xs font-bold text-white">{y.name}</h5>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">{y.attendanceRate}</span>
                  </div>
                  <p className="text-[11px] text-amber-300 bg-slate-950 p-2 rounded-xl border border-white/5 font-mono">{y.talent}</p>
                  <button
                    type="button"
                    onClick={() => handleSendNotice(y.phone, 'Youth Fellowship', y.name)}
                    className="w-full py-1.5 bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <MessageSquare size={12} />
                    <span>Send WhatsApp Notice</span>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Women Sub-View */}
          {activeFellowshipTab === 'WOMEN' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {womenList.map((w) => (
                <div key={w.id} className="p-4 rounded-2xl bg-slate-900 border border-white/10 space-y-3">
                  <h5 className="text-xs font-bold text-white">{w.name} ({w.role})</h5>
                  <p className="text-[11px] text-slate-300 bg-slate-950 p-2 rounded-xl border border-white/5">{w.ministryTask}</p>
                  <button
                    type="button"
                    onClick={() => handleSendNotice(w.phone, "Women's Ministry", w.name)}
                    className="w-full py-1.5 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <MessageSquare size={12} />
                    <span>Send WhatsApp Notice</span>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Men Sub-View */}
          {activeFellowshipTab === 'MEN' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {menList.map((m) => (
                <div key={m.id} className="p-4 rounded-2xl bg-slate-900 border border-white/10 space-y-3">
                  <h5 className="text-xs font-bold text-white">{m.name} ({m.role})</h5>
                  <p className="text-[11px] text-slate-300 bg-slate-950 p-2 rounded-xl border border-white/5">{m.ministryTask}</p>
                  <button
                    type="button"
                    onClick={() => handleSendNotice(m.phone, "Men's Fellowship", m.name)}
                    className="w-full py-1.5 bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <MessageSquare size={12} />
                    <span>Send WhatsApp Notice</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 🌟 3. Fellowship Attendance Hub Tab */}
      {activeMainTab === 'ministry_attendance' && <MinistryAttendanceHub session={session} />}

      {/* 🌟 4. Sunday Worship Roster Tab */}
      {activeMainTab === 'sunday_roster' && <SundayRosterDesk session={session} />}

      {/* 🌟 5. Baptism & Matrimony Tab */}
      {activeMainTab === 'sacred_ordinances' && <OrdinanceRegistryDesk session={session} />}

    </div>
  );
}