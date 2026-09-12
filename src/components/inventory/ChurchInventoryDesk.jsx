import React, { useState, useMemo } from 'react';
import { 
  Package, Wrench, AlertTriangle, CheckCircle2, 
  Plus, Search, Shield, DollarSign, Calendar, 
  Building2, FileText, KeyRound, Clock, MapPin, 
  Landmark, AlertCircle, Phone, ArrowUpRight, Heart, Gift, Utensils, Trash2, Sparkles
} from 'lucide-react';
import { soundFX } from '../../utils/audioEngine';

export default function ChurchInventoryDesk() {
  const [activeSubTab, setActiveSubTab] = useState('EQUIPMENT'); // 'EQUIPMENT' | 'PROPERTIES' | 'FELLOWSHIP_GIFTS'
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // -------------------------------------------------------------
  // 1. GEAR & EQUIPMENT STATE
  // -------------------------------------------------------------
  const [assets, setAssets] = useState(() => {
    try {
      const raw = localStorage.getItem('graceos_church_assets_db');
      return raw ? JSON.parse(raw) : [
        {
          id: 'AST-101',
          name: 'Shure Wireless Cordless Mic (Pair)',
          category: 'SOUND',
          quantity: 2,
          location: 'Main Sanctuary Stage',
          purchaseDate: '2025-03-15',
          cost: 38000,
          condition: 'EXCELLENT',
          lastService: '2026-06-10',
          warrantyTill: '2027-03-15'
        },
        {
          id: 'AST-102',
          name: 'Behringer X32 Digital Mixer',
          category: 'SOUND',
          quantity: 1,
          location: 'Sound Control Booth',
          purchaseDate: '2024-11-20',
          cost: 185000,
          condition: 'EXCELLENT',
          lastService: '2026-05-12',
          warrantyTill: '2026-11-20'
        },
        {
          id: 'AST-103',
          name: 'Epson 4K Laser Projector',
          category: 'MEDIA',
          quantity: 1,
          location: 'Central Ceiling Mount',
          purchaseDate: '2025-01-10',
          cost: 92000,
          condition: 'NEEDS_SERVICE',
          lastService: '2025-08-14',
          warrantyTill: '2027-01-10'
        }
      ];
    } catch {
      return [];
    }
  });

  const [equipmentForm, setEquipmentForm] = useState({
    name: '',
    category: 'SOUND',
    quantity: 1,
    location: '',
    cost: '',
    condition: 'EXCELLENT'
  });

  // -------------------------------------------------------------
  // 2. PROPERTY, LEASE & REAL ESTATE STATE
  // -------------------------------------------------------------
  const [properties, setProperties] = useState(() => {
    try {
      const raw = localStorage.getItem('graceos_church_properties_db');
      return raw ? JSON.parse(raw) : [
        {
          id: 'PROP-01',
          title: 'Grace Main Cathedral Sanctuary',
          ownershipType: 'OWNED', // 'OWNED' | 'RENTED' | 'TRUST_LEASE'
          location: 'Main Road Campus, Anna Nagar',
          surveyNo: 'SF-142/3A',
          pattaNo: 'PATTA-9082',
          docNo: 'DOC-812/2018 (SRO Chennai North)',
          landArea: '4,800 Sq.Ft (2.2 Grounds)',
          trustName: 'Grace Cathedral Charitable Trust',
          propertyTaxStatus: 'PAID',
          ebConsumerNo: '01-204-009-881'
        },
        {
          id: 'PROP-02',
          title: 'Grace City Youth & Fellowship Center',
          ownershipType: 'RENTED',
          location: 'Tambaram East Branch',
          landlordName: 'Mr. R. Sundaram',
          landlordPhone: '+91 98401 22998',
          monthlyRent: 35000,
          advanceDeposit: 250000,
          leaseStartDate: '2025-11-01',
          leaseExpiryDate: '2026-10-01',
          ebConsumerNo: '04-112-901-440',
          agreementDocRef: 'RENT-AGR-2025-TBM'
        }
      ];
    } catch {
      return [];
    }
  });

  const [propertyForm, setPropertyForm] = useState({
    title: '',
    ownershipType: 'RENTED',
    location: '',
    landArea: '',
    // Owned / Trust Fields
    docNo: '',
    surveyNo: '',
    pattaNo: '',
    trustName: 'Grace Cathedral Charitable Trust',
    // Rented Fields
    landlordName: '',
    landlordPhone: '',
    monthlyRent: '',
    advanceDeposit: '',
    leaseExpiryDate: '',
    ebConsumerNo: ''
  });

  // -------------------------------------------------------------
  // 3. FELLOWSHIP, GIFTS & SPONSORSHIPS STATE
  // -------------------------------------------------------------
  const [sponsorships, setSponsorships] = useState(() => {
    try {
      const raw = localStorage.getItem('graceos_fellowship_sponsorships_db');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [sponsorForm, setSponsorForm] = useState({
    cause: 'FELLOWSHIP_MEALS',
    sponsorName: '',
    phone: '',
    frequency: 'ONE_TIME',
    mode: 'IN_KIND',
    targetDate: '',
    amountEstimate: '',
    occasion: ''
  });

  // LocalStorage Helpers
  const saveAssets = (updated) => {
    setAssets(updated);
    localStorage.setItem('graceos_church_assets_db', JSON.stringify(updated));
  };

  const saveProperties = (updated) => {
    setProperties(updated);
    localStorage.setItem('graceos_church_properties_db', JSON.stringify(updated));
  };

  const saveSponsorships = (updated) => {
    setSponsorships(updated);
    localStorage.setItem('graceos_fellowship_sponsorships_db', JSON.stringify(updated));
  };

  // Add Equipment Handler
  const handleAddAsset = (e) => {
    e.preventDefault();
    if (!equipmentForm.name) return;
    soundFX?.playSuccessChime?.();

    const newItem = {
      id: `AST-${Date.now().toString().slice(-3)}`,
      name: equipmentForm.name,
      category: equipmentForm.category,
      quantity: Number(equipmentForm.quantity) || 1,
      location: equipmentForm.location || 'Sanctuary',
      purchaseDate: new Date().toISOString().slice(0, 10),
      cost: Number(equipmentForm.cost) || 0,
      condition: equipmentForm.condition,
      lastService: new Date().toISOString().slice(0, 10),
      warrantyTill: '1 Year'
    };

    saveAssets([newItem, ...assets]);
    setEquipmentForm({ name: '', category: 'SOUND', quantity: 1, location: '', cost: '', condition: 'EXCELLENT' });
  };

  // Add Property Handler
  const handleAddProperty = (e) => {
    e.preventDefault();
    if (!propertyForm.title || !propertyForm.location) return;
    soundFX?.playSuccessChime?.();

    const newProperty = {
      id: `PROP-${Date.now().toString().slice(-3)}`,
      ...propertyForm,
      monthlyRent: Number(propertyForm.monthlyRent) || 0,
      advanceDeposit: Number(propertyForm.advanceDeposit) || 0,
      propertyTaxStatus: 'PAID'
    };

    saveProperties([newProperty, ...properties]);
    setPropertyForm({
      title: '', ownershipType: 'RENTED', location: '', landArea: '',
      docNo: '', surveyNo: '', pattaNo: '', trustName: 'Grace Cathedral Charitable Trust',
      landlordName: '', landlordPhone: '', monthlyRent: '', advanceDeposit: '', leaseExpiryDate: '', ebConsumerNo: ''
    });
  };

  const handleAddSponsorship = (e) => {
    e.preventDefault();
    if (!sponsorForm.sponsorName.trim() || !sponsorForm.targetDate) return;
    soundFX?.playSuccessChime?.();

    const newSponsor = {
      id: `FSP-${Date.now().toString().slice(-3)}`,
      ...sponsorForm,
      sponsorName: sponsorForm.sponsorName.trim(),
      amountEstimate: Number(sponsorForm.amountEstimate) || 0,
      status: 'CONFIRMED'
    };

    if (newSponsor.mode === 'DIRECT_FUND' && newSponsor.amountEstimate > 0) {
      try {
        const raw = localStorage.getItem('app_finance_transactions_ledger');
        const ledger = raw ? JSON.parse(raw) : [];
        const newReceipt = {
          id: `REC-SPON-${Date.now().toString().slice(-4)}`,
          date: newSponsor.targetDate,
          category: `Sponsorship (${newSponsor.cause})`,
          amount: newSponsor.amountEstimate,
          donor: `${newSponsor.sponsorName} (${newSponsor.occasion || 'Thanksgiving'})`
        };
        localStorage.setItem('app_finance_transactions_ledger', JSON.stringify([newReceipt, ...ledger]));
      } catch (error) {
        console.error('Error auto-syncing sponsorship with Finance Desk:', error);
      }
    }

    saveSponsorships([newSponsor, ...sponsorships]);
    setSponsorForm({
      cause: 'FELLOWSHIP_MEALS', sponsorName: '', phone: '', frequency: 'ONE_TIME',
      mode: 'IN_KIND', targetDate: '', amountEstimate: '', occasion: ''
    });
  };

  const handleDeleteSponsorship = (id) => {
    soundFX?.playClickPop?.();
    saveSponsorships(sponsorships.filter((sponsorship) => sponsorship.id !== id));
  };

  // Service Log Action
  const handleLogService = (assetId) => {
    soundFX?.playClickPop?.();
    const dateToday = new Date().toISOString().slice(0, 10);
    const updated = assets.map(a => 
      a.id === assetId ? { ...a, condition: 'EXCELLENT', lastService: dateToday } : a
    );
    saveAssets(updated);
  };

  // Direct Rent Entry to Finance Ledger
  const handleRecordRentExpense = (property) => {
    soundFX?.playSuccessChime?.();
    try {
      const raw = localStorage.getItem('app_finance_transactions_ledger');
      const ledger = raw ? JSON.parse(raw) : [];
      const newVoucher = {
        id: `VOUCH-RENT-${Date.now().toString().slice(-4)}`,
        date: new Date().toISOString().slice(0, 10),
        category: `வளாக வாடகை (Rent: ${property.title})`,
        amount: property.monthlyRent,
        donor: 'Church Treasury Account'
      };
      localStorage.setItem('app_finance_transactions_ledger', JSON.stringify([newVoucher, ...ledger]));
      alert(`₹ ${property.monthlyRent.toLocaleString()} வாடகைக் கட்டணம் நிதி லெட்ஜரில் (Finance Ledger) பதியப்பட்டது!`);
    } catch {
      alert('Error updating Finance Ledger');
    }
  };

  // Valuation
  const totalGearValuation = useMemo(() => {
    return assets.reduce((sum, item) => sum + (Number(item.cost) || 0), 0);
  }, [assets]);

  const totalAdvanceDeposits = useMemo(() => {
    return properties
      .filter(p => p.ownershipType === 'RENTED')
      .reduce((sum, p) => sum + (Number(p.advanceDeposit) || 0), 0);
  }, [properties]);

  const conditionBadges = {
    EXCELLENT: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    NEEDS_SERVICE: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    REPAIRING: 'bg-rose-500/15 text-rose-300 border-rose-500/30'
  };

  const causeLabels = {
    FELLOWSHIP_MEALS: { title: 'Fellowship Meal', icon: Utensils, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
    TRUST_KIDS: { title: 'Trust Kids Gift', icon: Gift, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
    ALTAR_FLOWERS: { title: 'Altar Flowers', icon: Sparkles, color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
    BENEVOLENCE: { title: 'Benevolence Aid', icon: Heart, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' }
  };

  return (
    <div className="space-y-6 max-w-5xl select-none text-slate-200 animate-in fade-in pb-12">
      
      {/* Header & Sub-Tab Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <span>Assets, Properties & Legal Vault</span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/30">
              Audit & Registry
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            சபை வளாகங்கள், வாடகை ஒப்பந்தங்கள், டிரஸ்ட் சொத்துப் பத்திரங்கள் மற்றும் ஒலி/ஒளி உபகரணங்கள் பதிவேடு.
          </p>
        </div>

        {/* Desk Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-900 p-1 rounded-2xl border border-white/10 text-xs">
          <button
            type="button"
            onClick={() => setActiveSubTab('EQUIPMENT')}
            className={`px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition cursor-pointer ${
              activeSubTab === 'EQUIPMENT' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Package size={14} />
            <span>Gear & Sound Equipment</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('PROPERTIES')}
            className={`px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition cursor-pointer ${
              activeSubTab === 'PROPERTIES' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building2 size={14} />
            <span>Land, Lease & Trust Vault</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('FELLOWSHIP_GIFTS')}
            className={`px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition cursor-pointer ${
              activeSubTab === 'FELLOWSHIP_GIFTS' ? 'bg-rose-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Heart size={14} />
            <span>Fellowship, Gifts & Sponsorships</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'FELLOWSHIP_GIFTS' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
              <span className="text-[10px] text-amber-300 block uppercase">Fellowship Meals</span>
              <span className="text-xl font-black text-amber-400 font-sans mt-0.5">{sponsorships.filter((s) => s.cause === 'FELLOWSHIP_MEALS').length} Booked</span>
            </div>
            <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
              <span className="text-[10px] text-cyan-300 block uppercase">Trust Kids Support</span>
              <span className="text-xl font-black text-cyan-400 font-sans mt-0.5">{sponsorships.filter((s) => s.cause === 'TRUST_KIDS').length} Active</span>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-[10px] text-emerald-300 block uppercase">Contribution Mode</span>
              <span className="text-xs font-bold text-slate-200 block mt-2">In-Kind: {sponsorships.filter((s) => s.mode === 'IN_KIND').length} | Fund: {sponsorships.filter((s) => s.mode === 'DIRECT_FUND').length}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="p-5 rounded-3xl bg-slate-900 border border-white/10 space-y-4">
              <h4 className="text-xs font-bold text-white flex items-center gap-2"><Plus size={15} className="text-rose-400" /><span>Register Sponsorship</span></h4>
              <form onSubmit={handleAddSponsorship} className="space-y-3">
                <select value={sponsorForm.cause} onChange={(e) => setSponsorForm({ ...sponsorForm, cause: e.target.value })} className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-amber-300 font-bold focus:outline-none">
                  <option value="FELLOWSHIP_MEALS">Fellowship Meal</option>
                  <option value="TRUST_KIDS">Trust Kids Gift</option>
                  <option value="ALTAR_FLOWERS">Altar Flowers</option>
                  <option value="BENEVOLENCE">Benevolence Aid</option>
                </select>
                <input type="text" value={sponsorForm.sponsorName} onChange={(e) => setSponsorForm({ ...sponsorForm, sponsorName: e.target.value })} placeholder="Sponsor / family name" className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-400" required />
                <input type="text" value={sponsorForm.phone} onChange={(e) => setSponsorForm({ ...sponsorForm, phone: e.target.value })} placeholder="WhatsApp number" className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-rose-400" />
                <div className="grid grid-cols-2 gap-2">
                  <select value={sponsorForm.mode} onChange={(e) => setSponsorForm({ ...sponsorForm, mode: e.target.value })} className="bg-slate-950 border border-white/10 rounded-xl px-2 py-2 text-xs text-white focus:outline-none"><option value="IN_KIND">In-Kind</option><option value="DIRECT_FUND">Direct Fund</option></select>
                  <select value={sponsorForm.frequency} onChange={(e) => setSponsorForm({ ...sponsorForm, frequency: e.target.value })} className="bg-slate-950 border border-white/10 rounded-xl px-2 py-2 text-xs text-white focus:outline-none"><option value="ONE_TIME">One-Time</option><option value="MONTHLY_RECURRING">Monthly</option></select>
                </div>
                <div className="grid grid-cols-2 gap-2"><input type="date" value={sponsorForm.targetDate} onChange={(e) => setSponsorForm({ ...sponsorForm, targetDate: e.target.value })} className="bg-slate-950 border border-white/10 rounded-xl px-2 py-2 text-xs text-rose-300 font-mono focus:outline-none" required /><input type="number" min="0" value={sponsorForm.amountEstimate} onChange={(e) => setSponsorForm({ ...sponsorForm, amountEstimate: e.target.value })} placeholder="₹ Estimate" className="bg-slate-950 border border-white/10 rounded-xl px-2 py-2 text-xs text-white font-mono focus:outline-none" /></div>
                <input type="text" value={sponsorForm.occasion} onChange={(e) => setSponsorForm({ ...sponsorForm, occasion: e.target.value })} placeholder="Occasion / notes" className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none" />
                <button type="submit" className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer">Confirm Sponsorship</button>
              </form>
            </div>

            <div className="lg:col-span-2 space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2 text-xs font-mono"><span className="font-bold text-white uppercase">Upcoming Sponsorships ({sponsorships.length})</span><span className="text-emerald-400 font-bold">Community Active ✓</span></div>
              <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
                {sponsorships.length === 0 ? <div className="p-8 rounded-3xl bg-slate-900 border border-white/10 text-center text-xs text-slate-500">No sponsorships registered yet.</div> : sponsorships.map((sponsorship) => {
                  const meta = causeLabels[sponsorship.cause] || causeLabels.FELLOWSHIP_MEALS;
                  const Icon = meta.icon;
                  return <div key={sponsorship.id} className="p-4 rounded-3xl bg-slate-900 border border-white/10 space-y-3 hover:border-rose-500/20 transition">
                    <div className="flex items-start justify-between gap-3"><div className="flex items-start gap-3"><div className={`p-2.5 rounded-2xl border ${meta.color}`}><Icon size={18} /></div><div><span className="text-[10px] font-mono text-slate-400 block uppercase">{meta.title}</span><h5 className="text-sm font-black text-white mt-0.5">{sponsorship.sponsorName}</h5><p className="text-xs text-slate-300 mt-0.5">{sponsorship.occasion || 'Thanksgiving'}</p></div></div><span className="text-sm font-black text-emerald-400 font-mono shrink-0">{sponsorship.amountEstimate ? `₹ ${Number(sponsorship.amountEstimate).toLocaleString()}` : 'In-Kind'}</span></div>
                    <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs font-mono text-slate-400"><span className="text-rose-300 font-bold flex items-center gap-1"><Calendar size={12} /> {sponsorship.targetDate} • {sponsorship.frequency === 'MONTHLY_RECURRING' ? 'Monthly' : 'One-Time'}</span><button type="button" onClick={() => handleDeleteSponsorship(sponsorship.id)} className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer" title="Delete sponsorship"><Trash2 size={14} /></button></div>
                  </div>;
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* 🌟 TAB 1: PROPERTIES, LEASE & REAL ESTATE VAULT */}
      {/* ============================================================= */}
      {activeSubTab === 'PROPERTIES' && (
        <div className="space-y-6">
          
          {/* Executive Valuation Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
            <div className="p-4 rounded-2xl bg-slate-900 border border-white/10">
              <span className="text-[10px] text-slate-400 block uppercase">பதிவு செய்யப்பட்ட வளாகங்கள்</span>
              <span className="text-xl font-black text-white font-sans mt-0.5">{properties.length} Campuses</span>
            </div>
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
              <span className="text-[10px] text-amber-300 block uppercase">வாடகை அட்வான்ஸ் இருப்பு (Deposits)</span>
              <span className="text-xl font-black text-amber-400 mt-0.5">₹ {totalAdvanceDeposits.toLocaleString()}</span>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-[10px] text-emerald-300 block uppercase">டிரஸ்ட் சட்டப்பூர்வ நிலை</span>
              <span className="text-xs font-bold text-emerald-300 block mt-2">✓ 12A / 80G Registered Trust</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* புதிய இடம் / வாடகை ஒப்பந்தம் சேர்க்கும் படிவம் */}
            <div className="p-5 rounded-3xl bg-slate-900 border border-white/10 space-y-4">
              <h4 className="text-xs font-bold text-white flex items-center gap-2">
                <Plus size={15} className="text-amber-400" />
                <span>புதிய வளாகம் / லீஸ் பதிவு</span>
              </h4>

              <form onSubmit={handleAddProperty} className="space-y-3">
                <div>
                  <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">வளாக பெயர் (Campus / Hall)</label>
                  <input
                    type="text"
                    value={propertyForm.title}
                    onChange={(e) => setPropertyForm({ ...propertyForm, title: e.target.value })}
                    placeholder="எ.கா: Tambaram Branch Sanctuary"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">இடத்தின் உரிமை வகை (Ownership)</label>
                  <select
                    value={propertyForm.ownershipType}
                    onChange={(e) => setPropertyForm({ ...propertyForm, ownershipType: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-amber-300 font-bold focus:outline-none"
                  >
                    <option value="RENTED">வாடகை இடம் (Rented / Leased)</option>
                    <option value="OWNED">சபையின் சொந்த இடம் (Cathedral Owned)</option>
                    <option value="TRUST_LEASE">டிரஸ்ட் அறக்கட்டளை இடம் (Trust Property)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">முகவரி (Location)</label>
                  <input
                    type="text"
                    value={propertyForm.location}
                    onChange={(e) => setPropertyForm({ ...propertyForm, location: e.target.value })}
                    placeholder="எண், தெரு, பகுதி..."
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">பரப்பளவு (Land Area / Sq.Ft)</label>
                  <input
                    type="text"
                    value={propertyForm.landArea}
                    onChange={(e) => setPropertyForm({ ...propertyForm, landArea: e.target.value })}
                    placeholder="2,400 Sq.Ft"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>

                {/* 🌟 வாடகை இடமாக இருந்தால் மட்டும் தோன்றும் புலங்கள் */}
                {propertyForm.ownershipType === 'RENTED' && (
                  <div className="space-y-2.5 p-3 rounded-2xl bg-slate-950 border border-amber-500/20">
                    <span className="text-[10px] text-amber-400 font-bold uppercase block font-mono">வாடகை & அக்ரிமெண்ட் விவரங்கள்</span>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] text-slate-400 block uppercase font-mono mb-0.5">மாத வாடகை (₹)</label>
                        <input
                          type="number"
                          value={propertyForm.monthlyRent}
                          onChange={(e) => setPropertyForm({ ...propertyForm, monthlyRent: e.target.value })}
                          placeholder="25000"
                          className="w-full bg-slate-900 border border-white/10 rounded-xl p-2 text-xs text-white font-mono focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-slate-400 block uppercase font-mono mb-0.5">அட்வான்ஸ் தொகை (₹)</label>
                        <input
                          type="number"
                          value={propertyForm.advanceDeposit}
                          onChange={(e) => setPropertyForm({ ...propertyForm, advanceDeposit: e.target.value })}
                          placeholder="150000"
                          className="w-full bg-slate-900 border border-white/10 rounded-xl p-2 text-xs text-white font-mono focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] text-slate-400 block uppercase font-mono mb-0.5">உரிமையாளர் பெயர்</label>
                        <input
                          type="text"
                          value={propertyForm.landlordName}
                          onChange={(e) => setPropertyForm({ ...propertyForm, landlordName: e.target.value })}
                          placeholder="House Owner"
                          className="w-full bg-slate-900 border border-white/10 rounded-xl p-2 text-xs text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-slate-400 block uppercase font-mono mb-0.5">போன் எண்</label>
                        <input
                          type="text"
                          value={propertyForm.landlordPhone}
                          onChange={(e) => setPropertyForm({ ...propertyForm, landlordPhone: e.target.value })}
                          placeholder="+91..."
                          className="w-full bg-slate-900 border border-white/10 rounded-xl p-2 text-xs text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[9px] text-slate-400 block uppercase font-mono mb-0.5">அக்ரிமெண்ட் முடியும் தேதி (Lease Expiry)</label>
                      <input
                        type="date"
                        value={propertyForm.leaseExpiryDate}
                        onChange={(e) => setPropertyForm({ ...propertyForm, leaseExpiryDate: e.target.value })}
                        className="w-full bg-slate-900 border border-white/10 rounded-xl p-2 text-xs text-amber-300 font-mono focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* 🌟 சொந்த இடம் / டிரஸ்ட் இடமாக இருந்தால் தோன்றும் புலங்கள் */}
                {propertyForm.ownershipType !== 'RENTED' && (
                  <div className="space-y-2.5 p-3 rounded-2xl bg-slate-950 border border-cyan-500/20">
                    <span className="text-[10px] text-cyan-400 font-bold uppercase block font-mono">பத்திர & அரசு பதிவு விவரங்கள்</span>
                    
                    <div>
                      <label className="text-[9px] text-slate-400 block uppercase font-mono mb-0.5">பத்திரம் எண் & சார்பதிவகம் (Doc No)</label>
                      <input
                        type="text"
                        value={propertyForm.docNo}
                        onChange={(e) => setPropertyForm({ ...propertyForm, docNo: e.target.value })}
                        placeholder="DOC-1244/2019 (SRO...)"
                        className="w-full bg-slate-900 border border-white/10 rounded-xl p-2 text-xs text-white focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] text-slate-400 block uppercase font-mono mb-0.5">பட்டா எண் (Patta No)</label>
                        <input
                          type="text"
                          value={propertyForm.pattaNo}
                          onChange={(e) => setPropertyForm({ ...propertyForm, pattaNo: e.target.value })}
                          placeholder="PATTA-445"
                          className="w-full bg-slate-900 border border-white/10 rounded-xl p-2 text-xs text-white font-mono focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-slate-400 block uppercase font-mono mb-0.5">சர்வே எண் (Survey No)</label>
                        <input
                          type="text"
                          value={propertyForm.surveyNo}
                          onChange={(e) => setPropertyForm({ ...propertyForm, surveyNo: e.target.value })}
                          placeholder="SF 124/2"
                          className="w-full bg-slate-900 border border-white/10 rounded-xl p-2 text-xs text-white font-mono focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">மின் இணைப்பு எண் (EB Consumer No)</label>
                  <input
                    type="text"
                    value={propertyForm.ebConsumerNo}
                    onChange={(e) => setPropertyForm({ ...propertyForm, ebConsumerNo: e.target.value })}
                    placeholder="01-204-..."
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer shadow-lg shadow-amber-500/20"
                >
                  வளாகத்தை ஆவணத்தில் சேர்
                </button>
              </form>
            </div>

            {/* பதிவு செய்யப்பட்ட வளாகங்களின் விரிவான அட்டைகள் */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-2 text-xs">
                <span className="font-bold text-white uppercase tracking-wider">வளாக ஆவணங்கள் & சட்டப்பூர்வ பதிவேடு ({properties.length})</span>
              </div>

              <div className="space-y-4 max-h-[560px] overflow-y-auto pr-1">
                {properties.map((prop) => (
                  <div key={prop.id} className="p-5 rounded-3xl bg-slate-900 border border-white/10 space-y-4 shadow-xl">
                    
                    {/* Top Title & Ownership Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{prop.title}</h4>
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400">{prop.id}</span>
                        </div>
                        <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                          <MapPin size={13} className="text-rose-400" />
                          <span>{prop.location}</span>
                          {prop.landArea && <span>• ({prop.landArea})</span>}
                        </p>
                      </div>

                      <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border font-bold uppercase shrink-0 ${
                        prop.ownershipType === 'OWNED'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : prop.ownershipType === 'RENTED'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                      }`}>
                        {prop.ownershipType === 'OWNED' ? 'சொந்த இடம் (Owned)' : prop.ownershipType === 'RENTED' ? 'வாடகை வளாகம் (Leased)' : 'டிரஸ்ட் இடம் (Trust)'}
                      </span>
                    </div>

                    {/* வாடகை வளாக விவரக் கட்டம் */}
                    {prop.ownershipType === 'RENTED' && (
                      <div className="p-3.5 bg-slate-950 rounded-2xl border border-amber-500/20 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                        <div>
                          <span className="text-[10px] text-slate-500 block uppercase">மாத வாடகை</span>
                          <span className="text-sm font-black text-amber-300">₹ {prop.monthlyRent?.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block uppercase">அட்வான்ஸ் இருப்பு</span>
                          <span className="text-sm font-black text-white">₹ {prop.advanceDeposit?.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block uppercase">அக்ரிமெண்ட் முடிவு</span>
                          <span className="text-xs font-bold text-rose-300 flex items-center gap-1 mt-0.5">
                            <Clock size={12} /> {prop.leaseExpiryDate || '11 Months'}
                          </span>
                        </div>

                        {prop.landlordName && (
                          <div className="sm:col-span-3 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-sans">
                            <span className="text-slate-400">
                              உரிமையாளர்: <strong className="text-slate-200">{prop.landlordName}</strong> ({prop.landlordPhone})
                            </span>
                            
                            <button
                              type="button"
                              onClick={() => handleRecordRentExpense(prop)}
                              className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                              title="வாடகையை நிதி லெட்ஜரில் பதிவு செய்க"
                            >
                              <DollarSign size={12} />
                              <span>Log Rent Voucher</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* சொந்த இடம் / டிரஸ்ட் ஆவணக் கட்டம் */}
                    {prop.ownershipType !== 'RENTED' && (
                      <div className="p-3.5 bg-slate-950 rounded-2xl border border-cyan-500/20 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                        <div>
                          <span className="text-[10px] text-slate-500 block uppercase">பத்திரம் எண் (Registered Deed)</span>
                          <span className="text-xs font-bold text-cyan-300">{prop.docNo || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block uppercase">பட்டா & சர்வே எண்</span>
                          <span className="text-xs font-bold text-slate-200">{prop.pattaNo || 'Patta'} • {prop.surveyNo || 'Survey'}</span>
                        </div>
                        <div className="sm:col-span-2 pt-1 border-t border-white/5 flex items-center justify-between text-[10px]">
                          <span className="text-slate-400">அறக்கட்டளை: <strong className="text-white">{prop.trustName}</strong></span>
                          <span className="text-emerald-400 font-bold">✓ சொத்து வரி செலுத்தப்பட்டது</span>
                        </div>
                      </div>
                    )}

                    {/* EB & Utility Footer */}
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1 border-t border-white/5">
                      <span>மின் இணைப்பு (EB): <strong className="text-slate-200">{prop.ebConsumerNo || 'N/A'}</strong></span>
                      <span className="text-emerald-400 font-bold">Audit Verified ✓</span>
                    </div>

                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* 🌟 TAB 2: SOUND, GEAR & EQUIPMENT INVENTORY (முந்தையது) */}
      {/* ============================================================= */}
      {activeSubTab === 'EQUIPMENT' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">
              மொத்த உபகரண மதிப்பு: <strong className="text-cyan-400 text-sm">₹ {totalGearValuation.toLocaleString()}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* புதிய உபகரணம் படிவம் */}
            <div className="p-5 rounded-3xl bg-slate-900 border border-white/10 space-y-4">
              <h4 className="text-xs font-bold text-white flex items-center gap-2">
                <Plus size={15} className="text-cyan-400" />
                <span>புதிய உபகரணம் சேர்த்தல்</span>
              </h4>

              <form onSubmit={handleAddAsset} className="space-y-3">
                <div>
                  <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">உபகரண பெயர் & மாதிரி</label>
                  <input
                    type="text"
                    value={equipmentForm.name}
                    onChange={(e) => setEquipmentForm({ ...equipmentForm, name: e.target.value })}
                    placeholder="Yamaha Keyboard / Cordless Mic"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">பிரிவு</label>
                    <select
                      value={equipmentForm.category}
                      onChange={(e) => setEquipmentForm({ ...equipmentForm, category: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-2 py-2 text-xs text-white focus:outline-none"
                    >
                      <option value="SOUND">ஒலி (Sound)</option>
                      <option value="MEDIA">மீடியா (Visual)</option>
                      <option value="FACILITY">நாற்காலி / தளம்</option>
                      <option value="ELECTRICAL">மின்சாரம்</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">எண்ணிக்கை</label>
                    <input
                      type="number"
                      value={equipmentForm.quantity}
                      onChange={(e) => setEquipmentForm({ ...equipmentForm, quantity: e.target.value })}
                      min="1"
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">இடம் (Location)</label>
                    <input
                      type="text"
                      value={equipmentForm.location}
                      onChange={(e) => setEquipmentForm({ ...equipmentForm, location: e.target.value })}
                      placeholder="Stage / Booth"
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">மதிப்பு (₹ Cost)</label>
                    <input
                      type="number"
                      value={equipmentForm.cost}
                      onChange={(e) => setEquipmentForm({ ...equipmentForm, cost: e.target.value })}
                      placeholder="45000"
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer shadow-lg shadow-cyan-500/20"
                >
                  உபகரணத்தைப் பதிவு செய்
                </button>
              </form>
            </div>

            {/* உபகரணங்கள் பட்டியல் */}
            <div className="lg:col-span-2 space-y-3">
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {assets.map((asset) => (
                  <div key={asset.id} className="p-4 rounded-2xl bg-slate-900 border border-white/5 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="text-xs font-bold text-white">{asset.name}</h5>
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-slate-400">Qty: {asset.quantity}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                          {asset.id} • {asset.location} • வாங்கிய மதிப்பு: ₹ {Number(asset.cost).toLocaleString()}
                        </span>
                      </div>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border shrink-0 ${conditionBadges[asset.condition]}`}>
                        {asset.condition === 'EXCELLENT' ? 'நல்ல நிலையில்' : 'பராமரிப்பு தேவை'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-slate-400 font-mono">
                      <span>கடைசி சர்வீஸ்: <strong className="text-slate-200">{asset.lastService}</strong></span>
                      {asset.condition === 'NEEDS_SERVICE' && (
                        <button
                          type="button"
                          onClick={() => handleLogService(asset.id)}
                          className="px-3 py-1 bg-amber-500/15 text-amber-300 border border-amber-500/30 rounded-xl text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Wrench size={12} />
                          <span>சர்வீஸ் செய்யப்பட்டது</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}