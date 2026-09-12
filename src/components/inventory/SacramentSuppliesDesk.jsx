import React, { useState, useMemo } from 'react';
import { 
  Wine, Heart, Sparkles, Plus, Calendar, 
  CheckCircle2, User, AlertCircle, Trash2, Search 
} from 'lucide-react';
import { soundFX } from '../../utils/audioEngine';

export default function SacramentSuppliesDesk({ session }) {
  const [activeTab, setActiveTab] = useState('COMMUNION'); // 'COMMUNION' | 'SPONSORSHIPS'
  const [searchQuery, setSearchQuery] = useState('');

  // 1. திருவிருந்து பொருட்கள் இருப்பு (Communion Elements Inventory)
  const [supplies, setSupplies] = useState(() => {
    try {
      const raw = localStorage.getItem('graceos_sacrament_inventory_db');
      return raw ? JSON.parse(raw) : [
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
    } catch {
      return [];
    }
  });

  // 2. விசுவாசிகளின் பலிபீட/ஆராதனை ஸ்பான்சர்ஷிப் (Altar & Service Sponsorships)
  const [sponsorships, setSponsorships] = useState(() => {
    try {
      const raw = localStorage.getItem('graceos_altar_sponsorships_db');
      return raw ? JSON.parse(raw) : [
        {
          id: 'SPON-101',
          date: '2026-09-20',
          itemType: 'பலிபீட மலர் அலங்காரம் (Altar Flowers)',
          sponsorName: 'Bro. David Paul & Family',
          phone: '+91 98401 11223',
          occasion: 'Wedding Anniversary Thanksgiving',
          costEstimate: 2500,
          status: 'CONFIRMED'
        },
        {
          id: 'SPON-102',
          date: '2026-09-27',
          itemType: 'ஞாயிறு ஐக்கிய உணவு / அன்பு விருந்து (Fellowship Love Feast)',
          sponsorName: 'Sis. Hepzibah Stephen',
          phone: '+91 98401 88990',
          occasion: 'Child Birthday Blessing',
          costEstimate: 12000,
          status: 'CONFIRMED'
        }
      ];
    } catch {
      return [];
    }
  });

  // படிவ நிலைகள்
  const [supplyForm, setSupplyForm] = useState({
    name: '',
    stockQuantity: '',
    unit: 'Boxes',
    minRequired: 5,
    expiryDate: ''
  });

  const [sponsorForm, setSponsorForm] = useState({
    date: '',
    itemType: 'பலிபீட மலர் அலங்காரம் (Altar Flowers)',
    sponsorName: '',
    phone: '',
    occasion: '',
    costEstimate: ''
  });

  const handleAddSupply = (e) => {
    e.preventDefault();
    if (!supplyForm.name || !supplyForm.stockQuantity) return;
    soundFX?.playSuccessChime?.();

    const qty = Number(supplyForm.stockQuantity);
    const min = Number(supplyForm.minRequired) || 5;

    const newItem = {
      id: `SUP-${Date.now().toString().slice(-3)}`,
      name: supplyForm.name,
      category: 'COMMUNION',
      stockQuantity: qty,
      unit: supplyForm.unit,
      minRequired: min,
      expiryDate: supplyForm.expiryDate || 'N/A',
      status: qty <= min ? 'LOW_STOCK' : 'SUFFICIENT'
    };

    const updated = [newItem, ...supplies];
    setSupplies(updated);
    localStorage.setItem('graceos_sacrament_inventory_db', JSON.stringify(updated));
    setSupplyForm({ name: '', stockQuantity: '', unit: 'Boxes', minRequired: 5, expiryDate: '' });
  };

  const handleAddSponsorship = (e) => {
    e.preventDefault();
    if (!sponsorForm.sponsorName || !sponsorForm.date) return;
    soundFX?.playSuccessChime?.();

    const newSponsor = {
      id: `SPON-${Date.now().toString().slice(-3)}`,
      ...sponsorForm,
      costEstimate: Number(sponsorForm.costEstimate) || 0,
      status: 'CONFIRMED'
    };

    const updated = [newSponsor, ...sponsorships];
    setSponsorships(updated);
    localStorage.setItem('graceos_altar_sponsorships_db', JSON.stringify(updated));
    setSponsorForm({ date: '', itemType: 'பலிபீட மலர் அலங்காரம் (Altar Flowers)', sponsorName: '', phone: '', occasion: '', costEstimate: '' });
  };

  const handleDeleteSponsor = (id) => {
    soundFX?.playClickPop?.();
    const updated = sponsorships.filter(s => s.id !== id);
    setSponsorships(updated);
    localStorage.setItem('graceos_altar_sponsorships_db', JSON.stringify(updated));
  };

  return (
    <div className="space-y-6 max-w-5xl select-none text-slate-200 animate-in fade-in pb-12">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <span>Sacraments, Altar & Sponsorships Desk</span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono border border-rose-500/30">
              Sanctuary Supplies
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            திருவிருந்து அப்பம்/திராட்சைரசம் இருப்பு மற்றும் விசுவாசிகளின் பலிபீட மலர்/அன்புவிருந்து ஸ்பான்சர்ஷிப் விவரங்கள்.
          </p>
        </div>

        {/* Sub Tab Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-2xl border border-white/10 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('COMMUNION')}
            className={`px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'COMMUNION' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Wine size={14} />
            <span>திருவிருந்து இருப்பு (Communion Stock)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('SPONSORSHIPS')}
            className={`px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'SPONSORSHIPS' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles size={14} />
            <span>பலிபீட & விசேஷ ஸ்பான்சர்ஷிப்</span>
          </button>
        </div>
      </div>

      {/* 🌟 1. COMMUNION ELEMENTS INVENTORY TAB */}
      {activeTab === 'COMMUNION' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="p-5 rounded-3xl bg-slate-900 border border-white/10 space-y-4">
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <Plus size={15} className="text-rose-400" />
              <span>புதிய பொருள் இருப்பு சேர்த்தல்</span>
            </h4>

            <form onSubmit={handleAddSupply} className="space-y-3">
              <div>
                <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">பொருள் பெயர்</label>
                <input
                  type="text"
                  value={supplyForm.name}
                  onChange={(e) => setSupplyForm({ ...supplyForm, name: e.target.value })}
                  placeholder="எ.கா: Communion Wine"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-400"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">இருப்பு அளவு (Qty)</label>
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
                  <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">அலகு (Unit)</label>
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
                  <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">குறைந்தபட்ச இருப்பு</label>
                  <input
                    type="number"
                    value={supplyForm.minRequired}
                    onChange={(e) => setSupplyForm({ ...supplyForm, minRequired: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">காலாவதி தேதி</label>
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
                பொருளைப் பதிவேற்று
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2 text-xs font-mono">
              <span className="font-bold text-white uppercase">இருப்புப் பட்டியல் ({supplies.length})</span>
              <span className="text-slate-400">Lord's Supper Readiness</span>
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
                      குறைந்தபட்ச வரம்பு: {item.minRequired} {item.unit} • காலாவதி: {item.expiryDate}
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
                      {item.status === 'LOW_STOCK' ? '⚠️ குறைவான இருப்பு (Re-order)' : '✓ போதிய இருப்பு உள்ளது'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* 🌟 2. ALTAR & FELLOWSHIP SPONSORSHIPS TAB */}
      {activeTab === 'SPONSORSHIPS' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="p-5 rounded-3xl bg-slate-900 border border-white/10 space-y-4">
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <Plus size={15} className="text-amber-400" />
              <span>புதிய ஸ்பான்சர்ஷிப் பதிவு</span>
            </h4>

            <form onSubmit={handleAddSponsorship} className="space-y-3">
              <div>
                <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">ஸ்பான்சர் செய்யும் வகை</label>
                <select
                  value={sponsorForm.itemType}
                  onChange={(e) => setSponsorForm({ ...sponsorForm, itemType: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="பலிபீட மலர் அலங்காரம் (Altar Flowers)">பலிபீட மலர் அலங்காரம் (Altar Flowers)</option>
                  <option value="ஞாயிறு ஐக்கிய உணவு / அன்பு விருந்து (Fellowship Love Feast)">அன்பு விருந்து (Love Feast / Meals)</option>
                  <option value="திருவிருந்து அப்பம் & ரசம் (Communion Elements)">திருவிருந்து அப்பம் & ரசம் (Communion Supply)</option>
                  <option value="சண்டே ஸ்கூல் குழந்தைகள் பரிசு (Sunday School Gifts)">சண்டே ஸ்கூல் பரிசுகள்</option>
                  <option value="சிறப்பு மின்கட்டணம் / பராமரிப்பு உதவி">மின் கட்டண உதவி / பராமரிப்பு</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">ஸ்பான்சர் செய்பவர் பெயர்</label>
                <input
                  type="text"
                  value={sponsorForm.sponsorName}
                  onChange={(e) => setSponsorForm({ ...sponsorForm, sponsorName: e.target.value })}
                  placeholder="Bro. Paul & Family"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">தேதி</label>
                  <input
                    type="date"
                    value={sponsorForm.date}
                    onChange={(e) => setSponsorForm({ ...sponsorForm, date: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-2 py-2 text-xs text-amber-300 focus:outline-none font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">மதிப்பு (₹ Estimate)</label>
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
                <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">நிகழ்வு / காரணம் (Occasion)</label>
                <input
                  type="text"
                  value={sponsorForm.occasion}
                  onChange={(e) => setSponsorForm({ ...sponsorForm, occasion: e.target.value })}
                  placeholder="எ.கா: திருமண நாள் / பிறந்தநாள் ஸ்தோத்திரம்..."
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer shadow-lg shadow-amber-500/20"
              >
                ஸ்பான்சர்ஷிப்பை உறுதிசெய்
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2 text-xs font-mono">
              <span className="font-bold text-white uppercase">வரவிருக்கும் ஸ்பான்சர்ஷிப்கள் ({sponsorships.length})</span>
              <span className="text-amber-400 font-bold">Thanksgiving Giving</span>
            </div>

            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
              {sponsorships.map((spon) => (
                <div
                  key={spon.id}
                  className="p-4 rounded-2xl bg-slate-900 border border-white/5 space-y-2.5 hover:border-amber-500/20 transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-mono text-amber-300 block uppercase font-bold">
                        {spon.itemType}
                      </span>
                      <h5 className="text-sm font-bold text-white mt-0.5">{spon.sponsorName}</h5>
                      <p className="text-xs text-slate-300 mt-0.5">காரணம்: {spon.occasion || 'Thanksgiving'}</p>
                    </div>

                    <div className="text-right flex flex-col items-end">
                      <span className="text-sm font-black text-emerald-400 font-mono">
                        {spon.costEstimate ? `₹ ${spon.costEstimate.toLocaleString()}` : 'In-Kind'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteSponsor(spon.id)}
                        className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer transition mt-1"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] font-mono text-slate-400">
                    <span>தேதி: <strong className="text-white">{spon.date}</strong></span>
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