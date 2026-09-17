import React, { useState, useEffect } from 'react';
import { 
  Wine, Heart, Sparkles, Plus, Calendar, 
  CheckCircle2, User, AlertCircle, Trash2, Search 
} from 'lucide-react';
import { soundFX } from '../../utils/audioEngine';
import { getVaultData, setVaultData } from '../../utils/vaultStore';

export default function SacramentSuppliesDesk({ session }) {
  const [activeTab, setActiveTab] = useState('COMMUNION');
  const [supplies, setSupplies] = useState([]);
  const [sponsorships, setSponsorships] = useState([]);

  const defaultSupplies = [
    {
      id: 'SUP-01',
      name: 'Communion Grape Wine (Bottles)',
      category: 'COMMUNION',
      stockQuantity: 12,
      unit: 'Bottles (750ml)',
      minRequired: 5,
      expiryDate: '2027-01-15',
      status: 'SUFFICIENT'
    },
    {
      id: 'SUP-02',
      name: 'Unleavened Communion Wafers / Bread',
      category: 'COMMUNION',
      stockQuantity: 3,
      unit: 'Boxes (500 pcs each)',
      minRequired: 4,
      expiryDate: '2026-11-20',
      status: 'LOW_STOCK'
    },
    {
      id: 'SUP-03',
      name: 'Disposable Communion Cups',
      category: 'COMMUNION',
      stockQuantity: 1200,
      unit: 'Cups',
      minRequired: 500,
      expiryDate: 'Lifetime',
      status: 'SUFFICIENT'
    }
  ];

  const defaultSponsorships = [
    {
      id: 'SPON-101',
      date: '2026-09-20',
      itemType: 'Altar Floral Decoration',
      sponsorName: 'Bro. David Paul & Family',
      phone: '+91 98401 11223',
      occasion: 'Wedding Anniversary Thanksgiving',
      costEstimate: 2500,
      status: 'CONFIRMED'
    },
    {
      id: 'SPON-102',
      date: '2026-09-27',
      itemType: 'Sunday Fellowship Love Feast (Lunch)',
      sponsorName: 'Sis. Hepzibah Stephen',
      phone: '+91 98401 88990',
      occasion: 'Child Birthday Blessing',
      costEstimate: 12000,
      status: 'CONFIRMED'
    }
  ];

  useEffect(() => {
    async function loadSacramentData() {
      const dbSupplies = await getVaultData('sacrament_inventory', defaultSupplies);
      const dbSponsorships = await getVaultData('altar_sponsorships', defaultSponsorships);
      setSupplies(dbSupplies);
      setSponsorships(dbSponsorships);
    }
    loadSacramentData();
  }, []);

  const [supplyForm, setSupplyForm] = useState({
    name: '',
    stockQuantity: '',
    unit: 'Boxes',
    minRequired: 5,
    expiryDate: ''
  });

  const [sponsorForm, setSponsorForm] = useState({
    date: '',
    itemType: 'Altar Floral Decoration',
    sponsorName: '',
    phone: '',
    occasion: '',
    costEstimate: ''
  });

  const handleAddSupply = async (e) => {
    e.preventDefault();
    if (!supplyForm.name.trim() || !supplyForm.stockQuantity) return;
    soundFX?.playSuccessChime?.();

    const qty = Number(supplyForm.stockQuantity);
    const min = Number(supplyForm.minRequired) || 5;

    const newItem = {
      id: `SUP-${Date.now().toString().slice(-3)}`,
      name: supplyForm.name.trim(),
      category: 'COMMUNION',
      stockQuantity: qty,
      unit: supplyForm.unit,
      minRequired: min,
      expiryDate: supplyForm.expiryDate || 'N/A',
      status: qty <= min ? 'LOW_STOCK' : 'SUFFICIENT'
    };

    const updated = [newItem, ...supplies];
    setSupplies(updated);
    await setVaultData('sacrament_inventory', updated, true);
    setSupplyForm({ name: '', stockQuantity: '', unit: 'Boxes', minRequired: 5, expiryDate: '' });
  };

  const handleAddSponsorship = async (e) => {
    e.preventDefault();
    if (!sponsorForm.sponsorName.trim() || !sponsorForm.date) return;
    soundFX?.playSuccessChime?.();

    const newSponsor = {
      id: `SPON-${Date.now().toString().slice(-3)}`,
      ...sponsorForm,
      sponsorName: sponsorForm.sponsorName.trim(),
      costEstimate: Number(sponsorForm.costEstimate) || 0,
      status: 'CONFIRMED'
    };

    const updated = [newSponsor, ...sponsorships];
    setSponsorships(updated);
    await setVaultData('altar_sponsorships', updated, true);
    setSponsorForm({ date: '', itemType: 'Altar Floral Decoration', sponsorName: '', phone: '', occasion: '', costEstimate: '' });
  };

  const handleDeleteSponsor = async (id) => {
    if (!window.confirm('Delete this altar sponsorship entry?')) return;
    soundFX?.playClickPop?.();
    const updated = sponsorships.filter(s => s.id !== id);
    setSponsorships(updated);
    await setVaultData('altar_sponsorships', updated, true);
  };

  return (
    <div className="space-y-6 max-w-5xl select-none text-slate-200 animate-in fade-in pb-12">
      
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <span>Sacraments, Altar &amp; Sponsorships Desk</span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono border border-rose-500/30">
              Sanctuary Supplies
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage communion elements inventory, altar floral sponsorships, and fellowship meal contributions.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-2xl border border-white/10 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('COMMUNION')}
            className={`px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'COMMUNION' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Wine size={14} />
            <span>Communion Stock</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('SPONSORSHIPS')}
            className={`px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'SPONSORSHIPS' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles size={14} />
            <span>Altar &amp; Special Sponsorships</span>
          </button>
        </div>
      </div>

      {/* 1. COMMUNION ELEMENTS INVENTORY TAB */}
      {activeTab === 'COMMUNION' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="p-5 rounded-3xl bg-slate-900 border border-white/10 space-y-4">
            <h4 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-wider">
              <Plus size={15} className="text-rose-400" />
              <span>Add Stock Item</span>
            </h4>

            <form onSubmit={handleAddSupply} className="space-y-3">
              <div>
                <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">Item Title *</label>
                <input
                  type="text"
                  value={supplyForm.name}
                  onChange={(e) => setSupplyForm({ ...supplyForm, name: e.target.value })}
                  placeholder="e.g. Communion Grape Wine"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-400 font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">Quantity *</label>
                  <input
                    type="number"
                    value={supplyForm.stockQuantity}
                    onChange={(e) => setSupplyForm({ ...supplyForm, stockQuantity: e.target.value })}
                    placeholder="10"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-400 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">Unit</label>
                  <input
                    type="text"
                    value={supplyForm.unit}
                    onChange={(e) => setSupplyForm({ ...supplyForm, unit: e.target.value })}
                    placeholder="Bottles / Cups"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">Reorder Threshold</label>
                  <input
                    type="number"
                    value={supplyForm.minRequired}
                    onChange={(e) => setSupplyForm({ ...supplyForm, minRequired: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={supplyForm.expiryDate}
                    onChange={(e) => setSupplyForm({ ...supplyForm, expiryDate: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-2 py-2 text-xs text-rose-300 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer shadow-lg shadow-rose-600/20"
              >
                Save to Sacrament Vault
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2 text-xs font-mono">
              <span className="font-bold text-white uppercase">Inventory Stock Ledger ({supplies.length})</span>
              <span className="text-slate-400">Sacramental Readiness</span>
            </div>

            <div className="space-y-3">
              {supplies.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-between gap-3 hover:border-white/10 transition"
                >
                  <div>
                    <h5 className="text-xs font-bold text-white">{item.name}</h5>
                    <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                      Min Threshold: {item.minRequired} {item.unit} • Expiry: {item.expiryDate}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-black text-white font-mono block">
                      {item.stockQuantity} <span className="text-xs font-normal text-slate-400">{item.unit}</span>
                    </span>
                    <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border ${
                      item.status === 'LOW_STOCK'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-bold'
                        : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    }`}>
                      {item.status === 'LOW_STOCK' ? 'Low Stock Warning' : 'Sufficient Stock'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. ALTAR & FELLOWSHIP SPONSORSHIPS TAB */}
      {activeTab === 'SPONSORSHIPS' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="p-5 rounded-3xl bg-slate-900 border border-white/10 space-y-4">
            <h4 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-wider">
              <Plus size={15} className="text-amber-400" />
              <span>Record Altar Sponsorship</span>
            </h4>

            <form onSubmit={handleAddSponsorship} className="space-y-3">
              <div>
                <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">Sponsorship Purpose</label>
                <select
                  value={sponsorForm.itemType}
                  onChange={(e) => setSponsorForm({ ...sponsorForm, itemType: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                >
                  <option value="Altar Floral Decoration">Altar Floral Decoration</option>
                  <option value="Sunday Fellowship Love Feast (Lunch)">Fellowship Love Feast (Lunch)</option>
                  <option value="Communion Elements & Wine">Holy Communion Elements</option>
                  <option value="Sunday School Gifts & Prizes">Sunday School Gifts &amp; Awards</option>
                  <option value="Sanctuary Utility & Sound Support">Sanctuary Utility &amp; Power Fund</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">Sponsor Full Name *</label>
                <input
                  type="text"
                  value={sponsorForm.sponsorName}
                  onChange={(e) => setSponsorForm({ ...sponsorForm, sponsorName: e.target.value })}
                  placeholder="e.g. Bro. David Paul & Family"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">Sponsorship Date *</label>
                  <input
                    type="date"
                    value={sponsorForm.date}
                    onChange={(e) => setSponsorForm({ ...sponsorForm, date: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-2 py-2 text-xs text-amber-300 focus:outline-none font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">Cost Estimate (₹)</label>
                  <input
                    type="number"
                    value={sponsorForm.costEstimate}
                    onChange={(e) => setSponsorForm({ ...sponsorForm, costEstimate: e.target.value })}
                    placeholder="2500"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">Occasion / Thanksgiving Note</label>
                <input
                  type="text"
                  value={sponsorForm.occasion}
                  onChange={(e) => setSponsorForm({ ...sponsorForm, occasion: e.target.value })}
                  placeholder="e.g. Wedding Anniversary / Child Dedication"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer shadow-lg shadow-amber-500/20"
              >
                Confirm Sponsorship
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2 text-xs font-mono">
              <span className="font-bold text-white uppercase">Scheduled Altar Sponsorships ({sponsorships.length})</span>
              <span className="text-amber-400 font-bold">Thanksgiving Active</span>
            </div>

            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
              {sponsorships.map((spon) => (
                <div
                  key={spon.id}
                  className="p-4 rounded-2xl bg-slate-900 border border-white/5 space-y-2.5 hover:border-amber-500/20 transition shadow-lg"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-mono text-amber-300 block uppercase font-bold">
                        {spon.itemType}
                      </span>
                      <h5 className="text-sm font-bold text-white mt-0.5">{spon.sponsorName}</h5>
                      <p className="text-xs text-slate-300 mt-0.5">Occasion: {spon.occasion || 'General Altar Thanksgiving'}</p>
                    </div>

                    <div className="text-right flex flex-col items-end">
                      <span className="text-sm font-black text-emerald-400 font-mono">
                        {spon.costEstimate ? `₹ ${spon.costEstimate.toLocaleString()}` : 'In-Kind'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteSponsor(spon.id)}
                        className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer transition mt-1"
                        title="Delete sponsorship"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] font-mono text-slate-400">
                    <span>Target Date: <strong className="text-white">{spon.date}</strong></span>
                    <span className="text-emerald-400 font-bold">✓ Altar Assigned</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}