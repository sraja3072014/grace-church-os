import React, { useState, useMemo } from 'react';
import { 
  Users, UserPlus, DollarSign, Home, CheckCircle2, 
  Phone, MessageSquareShare, MapPin, Search, Calendar, 
  Shield, LogOut, ArrowRight, Clock, Plus 
} from 'lucide-react';
import { soundFX } from '../../utils/audioEngine';

export default function LeaderPortalView({ userSession, onLogout }) {
  const [activeTab, setActiveTab] = useState('members'); // 'members' | 'add_member' | 'offering' | 'visits'
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState('');

  const leaderArea = userSession.area || 'Tambaram';

  // 1. Members Data (Filtered by Area)
  const [families, setFamilies] = useState(() => {
    try {
      const raw = localStorage.getItem('app_members_family_database');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const areaMembers = useMemo(() => {
    const list = [];
    families.forEach(fam => {
      // Check if member belongs to area
      if (!fam.area || fam.area.toLowerCase().includes(leaderArea.toLowerCase())) {
        if (fam.headMember) {
          list.push({ ...fam.headMember, familyName: fam.familyName, familyId: fam.familyId, area: fam.area || leaderArea });
        }
        (fam.members || []).forEach(m => {
          list.push({ ...m, familyName: fam.familyName, familyId: fam.familyId, area: fam.area || leaderArea });
        });
      }
    });

    // Sample data (fallback when area has no records)
    if (list.length === 0) {
      return [
        { memberId: 'MBR-201', name: 'Bro. Paul Selvam', phone: '+91 98401 77889', familyName: 'Selvam Household', area: leaderArea, visitedThisMonth: true },
        { memberId: 'MBR-202', name: 'Sis. Mary Stella', phone: '+91 98401 99001', familyName: 'Stella Household', area: leaderArea, visitedThisMonth: false },
        { memberId: 'MBR-203', name: 'Bro. Emmanuel Raj', phone: '+91 98401 22114', familyName: 'Emmanuel Household', area: leaderArea, visitedThisMonth: false }
      ];
    }
    return list;
  }, [families, leaderArea]);

  // New Member Form State
  const [newMemberForm, setNewMemberForm] = useState({
    name: '',
    phone: '',
    familyType: 'Family Head',
    address: ''
  });

  // Spot Offering State
  const [offeringForm, setOfferingForm] = useState({
    donorName: '',
    phone: '',
    amount: '',
    category: 'Tithe'
  });

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  // Add New Member
  const handleAddNewBeliever = (e) => {
    e.preventDefault();
    if (!newMemberForm.name) return;

    soundFX.playSuccessChime();
    const newFamily = {
      familyId: `FAM-${Date.now().toString().slice(-4)}`,
      familyName: `${newMemberForm.name} Household`,
      area: leaderArea,
      headMember: {
        memberId: `MBR-${Date.now().toString().slice(-4)}`,
        name: newMemberForm.name,
        phone: newMemberForm.phone,
        roleInFamily: newMemberForm.familyType
      },
      members: []
    };

    const updated = [newFamily, ...families];
    setFamilies(updated);
    localStorage.setItem('app_members_family_database', JSON.stringify(updated));

    showToast(`New member "${newMemberForm.name}" added successfully! ✓`);
    setNewMemberForm({ name: '', phone: '', familyType: 'Family Head', address: '' });
    setActiveTab('members');
  };

  // Record Spot Offering
  const handleRecordSpotOffering = (e) => {
    e.preventDefault();
    if (!offeringForm.amount || Number(offeringForm.amount) <= 0) return;

    soundFX.playSuccessChime();
    const ledger = JSON.parse(localStorage.getItem('app_finance_transactions_ledger') || '[]');
    const newReceipt = {
      id: `REC-LEAD-${Date.now().toString().slice(-5)}`,
      member: offeringForm.donorName || 'Spot Believer',
      contactPhone: offeringForm.phone,
      amount: Number(offeringForm.amount),
      category: offeringForm.category,
      date: new Date().toISOString().slice(0, 10),
      recordedBy: `${userSession.name} (${leaderArea})`
    };

    localStorage.setItem('app_finance_transactions_ledger', JSON.stringify([newReceipt, ...ledger]));
    showToast(`₹${offeringForm.amount} offering recorded & receipt generated! ✓`);
    setOfferingForm({ donorName: '', phone: '', amount: '', category: 'Tithe' });
  };

  const filteredMembers = areaMembers.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.phone.includes(searchQuery)
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 select-none pb-16">
      
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-4 py-2.5 rounded-xl shadow-2xl backdrop-blur-md text-xs font-bold flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{toast}</span>
        </div>
      )}

      {/* Header Bar */}
      <header className="p-4 border-b border-white/10 bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center justify-center font-black text-sm">
            <Shield size={20} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5 leading-tight">
              {userSession.name || 'Area Pastor'}
            </h4>
            <span className="text-[10px] text-cyan-400 font-mono flex items-center gap-1">
              <MapPin size={10} /> Area: {leaderArea}
            </span>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-rose-400 transition cursor-pointer"
          title="Logout"
        >
          <LogOut size={16} />
        </button>
      </header>

      {/* Main Content Area */}
      <main className="max-w-md mx-auto p-4 space-y-4">
        
        {/* Navigation Tabs */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-900 border border-white/10 rounded-2xl text-xs font-bold">
          <button
            onClick={() => setActiveTab('members')}
            className={`py-2 rounded-xl transition ${activeTab === 'members' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400'}`}
          >
            Members ({areaMembers.length})
          </button>
          <button
            onClick={() => setActiveTab('add_member')}
            className={`py-2 rounded-xl transition ${activeTab === 'add_member' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400'}`}
          >
            + Add Member
          </button>
          <button
            onClick={() => setActiveTab('offering')}
            className={`py-2 rounded-xl transition ${activeTab === 'offering' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400'}`}
          >
            Record Offering
          </button>
        </div>

        {/* 🌟 1. Tab Content: Area Members List */}
        {activeTab === 'members' && (
          <div className="space-y-3 animate-in fade-in">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
              <input
                type="text"
                placeholder="Search by name or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="space-y-2">
              {filteredMembers.map((m, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-slate-900/90 border border-white/5 flex items-center justify-between gap-3">
                  <div className="overflow-hidden">
                    <h5 className="text-xs font-bold text-white truncate">{m.name}</h5>
                    <span className="text-[10px] text-slate-400 font-mono block">{m.phone}</span>
                    <span className="text-[9px] text-cyan-400 font-semibold">{m.familyName}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <a
                      href={`tel:${m.phone}`}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300"
                    >
                      <Phone size={13} />
                    </a>
                    <a
                      href={`https://web.whatsapp.com/send?phone=${m.phone?.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    >
                      <MessageSquareShare size={13} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 🌟 2. Tab Content: Add New Member / Visitor */}
        {activeTab === 'add_member' && (
          <form onSubmit={handleAddNewBeliever} className="p-5 rounded-3xl bg-slate-900/90 border border-white/10 space-y-3.5 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <UserPlus size={16} className="text-cyan-400" /> New Member Registration
              </span>
              <span className="text-[10px] text-slate-400 font-mono">{leaderArea} Zone</span>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Bro. David Raj"
                value={newMemberForm.name}
                onChange={(e) => setNewMemberForm({ ...newMemberForm, name: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Mobile Phone (WhatsApp)</label>
              <input
                type="tel"
                required
                placeholder="9840123456"
                value={newMemberForm.phone}
                onChange={(e) => setNewMemberForm({ ...newMemberForm, phone: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Family Role</label>
              <select
                value={newMemberForm.familyType}
                onChange={(e) => setNewMemberForm({ ...newMemberForm, familyType: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                <option>Family Head</option>
                <option>Youth</option>
                <option>New Visitor</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/20 active:scale-95 transition cursor-pointer mt-2"
            >
              <Plus size={15} />
              <span>Add to Directory</span>
            </button>
          </form>
        )}

        {/* 🌟 3. Tab Content: Spot Offering Collection */}
        {activeTab === 'offering' && (
          <form onSubmit={handleRecordSpotOffering} className="p-5 rounded-3xl bg-slate-900/90 border border-white/10 space-y-3.5 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <DollarSign size={16} className="text-emerald-400" /> Visiting / Spot Offering
              </span>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Direct Ledger
              </span>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Donor Name</label>
              <input
                type="text"
                required
                placeholder="Member or visitor name"
                value={offeringForm.donorName}
                onChange={(e) => setOfferingForm({ ...offeringForm, donorName: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Mobile Phone (For Receipt)</label>
              <input
                type="tel"
                placeholder="WhatsApp number"
                value={offeringForm.phone}
                onChange={(e) => setOfferingForm({ ...offeringForm, phone: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400 font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Offering Category</label>
              <select
                value={offeringForm.category}
                onChange={(e) => setOfferingForm({ ...offeringForm, category: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400 cursor-pointer"
              >
                <option>Tithe</option>
                <option>Cottage Prayer Offering</option>
                <option>Thanksgiving Offering</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Amount (₹ Amount)</label>
              <input
                type="number"
                required
                placeholder="₹ 500"
                value={offeringForm.amount}
                onChange={(e) => setOfferingForm({ ...offeringForm, amount: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2.5 text-base font-mono font-bold text-emerald-400 focus:outline-none focus:border-emerald-400"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 active:scale-95 transition cursor-pointer mt-2"
            >
              <span>Record Offering</span>
              <ArrowRight size={14} />
            </button>
          </form>
        )}

      </main>
    </div>
  );
}