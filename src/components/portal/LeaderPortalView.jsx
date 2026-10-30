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

  // 1. விசுவாசிகள் தரவு (பகுதி வாரியாக வடிகட்டுதல்)
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
      // பகுதி பொருந்துகிறதா எனப் பார்த்தல்
      if (!fam.area || fam.area.toLowerCase().includes(leaderArea.toLowerCase())) {
        if (fam.headMember) {
          list.push({ ...fam.headMember, familyName: fam.familyName, familyId: fam.familyId, area: fam.area || leaderArea });
        }
        (fam.members || []).forEach(m => {
          list.push({ ...m, familyName: fam.familyName, familyId: fam.familyId, area: fam.area || leaderArea });
        });
      }
    });

    // மாதிரித் தரவு (பொருந்தும் தகவல்கள் இல்லாத போது)
    if (list.length === 0) {
      return [
        { memberId: 'MBR-201', name: 'Bro. Paul Selvam', phone: '+91 98401 77889', familyName: 'Selvam Household', area: leaderArea, visitedThisMonth: true },
        { memberId: 'MBR-202', name: 'Sis. Mary Stella', phone: '+91 98401 99001', familyName: 'Stella Household', area: leaderArea, visitedThisMonth: false },
        { memberId: 'MBR-203', name: 'Bro. Emmanuel Raj', phone: '+91 98401 22114', familyName: 'Emmanuel Household', area: leaderArea, visitedThisMonth: false }
      ];
    }
    return list;
  }, [families, leaderArea]);

  // புதிய விசுவாசி படிவ நிலை
  const [newMemberForm, setNewMemberForm] = useState({
    name: '',
    phone: '',
    familyType: 'Family Head',
    address: ''
  });

  // ஸ்பாட் காணிக்கை நிலை
  const [offeringForm, setOfferingForm] = useState({
    donorName: '',
    phone: '',
    amount: '',
    category: 'தசமபாகம் (Tithe)'
  });

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  // புதிய விசுவாசியைச் சேர்த்தல்
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

    showToast(`புதிய விசுவாசி "${newMemberForm.name}" சேர்க்கப்பட்டார்! ✓`);
    setNewMemberForm({ name: '', phone: '', familyType: 'Family Head', address: '' });
    setActiveTab('members');
  };

  // ஸ்பாட் காணிக்கை பதிவு செய்தல்
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
    showToast(`₹${offeringForm.amount} காணிக்கை பதிவு செய்யப்பட்டு ரசீது உருவானது! ✓`);
    setOfferingForm({ donorName: '', phone: '', amount: '', category: 'தசமபாகம் (Tithe)' });
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
              <MapPin size={10} /> பகுதி: {leaderArea}
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
            விசுவாசிகள் ({areaMembers.length})
          </button>
          <button
            onClick={() => setActiveTab('add_member')}
            className={`py-2 rounded-xl transition ${activeTab === 'add_member' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400'}`}
          >
            + புதியவர் சேர்ப்பு
          </button>
          <button
            onClick={() => setActiveTab('offering')}
            className={`py-2 rounded-xl transition ${activeTab === 'offering' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400'}`}
          >
            காணிக்கை பதிவு
          </button>
        </div>

        {/* 🌟 1. Tab Content: Area Members List */}
        {activeTab === 'members' && (
          <div className="space-y-3 animate-in fade-in">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
              <input
                type="text"
                placeholder="பெயர் அல்லது போன் மூலம் தேடுக..."
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
                <UserPlus size={16} className="text-cyan-400" /> புதிய விசுவாசி பதிவு
              </span>
              <span className="text-[10px] text-slate-400 font-mono">{leaderArea} Zone</span>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">முழுப் பெயர் (Full Name)</label>
              <input
                type="text"
                required
                placeholder="எ.கா. Bro. David Raj"
                value={newMemberForm.name}
                onChange={(e) => setNewMemberForm({ ...newMemberForm, name: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">மொபைல் எண் (WhatsApp)</label>
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
              <label className="text-[11px] text-slate-400 block mb-1">குடும்பப் பொறுப்பு</label>
              <select
                value={newMemberForm.familyType}
                onChange={(e) => setNewMemberForm({ ...newMemberForm, familyType: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                <option>Family Head (குடும்பத் தலைவர்)</option>
                <option>Youth (இளைஞர்)</option>
                <option>New Visitor (புதிய விருந்தினர்)</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/20 active:scale-95 transition cursor-pointer mt-2"
            >
              <Plus size={15} />
              <span>பட்டியலில் சேர்க்கவும்</span>
            </button>
          </form>
        )}

        {/* 🌟 3. Tab Content: Spot Offering Collection */}
        {activeTab === 'offering' && (
          <form onSubmit={handleRecordSpotOffering} className="p-5 rounded-3xl bg-slate-900/90 border border-white/10 space-y-3.5 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <DollarSign size={16} className="text-emerald-400" /> விசிட்டிங் / ஸ்பாட் காணிக்கை
              </span>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Direct Ledger
              </span>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">கொடுத்தவர் பெயர்</label>
              <input
                type="text"
                required
                placeholder="விசுவாசி அல்லது புதியவர் பெயர்"
                value={offeringForm.donorName}
                onChange={(e) => setOfferingForm({ ...offeringForm, donorName: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">மொபைல் எண் (ரசீது செல்ல)</label>
              <input
                type="tel"
                placeholder="WhatsApp எண்"
                value={offeringForm.phone}
                onChange={(e) => setOfferingForm({ ...offeringForm, phone: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400 font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">காணிக்கைப் பிரிவு</label>
              <select
                value={offeringForm.category}
                onChange={(e) => setOfferingForm({ ...offeringForm, category: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400 cursor-pointer"
              >
                <option>தசமபாகம் (Tithe)</option>
                <option>இல்ல சந்திப்பு காணிக்கை (Cottage Prayer)</option>
                <option>ஸ்தோத்திர காணிக்கை (Thanksgiving)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">தொகை (₹ Amount)</label>
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
              <span>காணிக்கையைப் பதிவு செய்</span>
              <ArrowRight size={14} />
            </button>
          </form>
        )}

      </main>
    </div>
  );
}