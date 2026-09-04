import React, { useState, useEffect } from 'react';
import { 
  HeartHandshake, Plus, Phone, CheckCircle2, 
  Sparkles, Search, ShieldAlert, Check, X, Flame
} from 'lucide-react';

const SEED_PRAYERS = [
  {
    id: 'PR-101',
    seekerName: 'Bro. David Miller',
    phone: '+91 98765 11002',
    category: 'Healing / Hospital Emergency',
    urgency: 'Critical',
    requestText: 'Admitted in ICU for severe viral infection. Please pray for miraculous recovery.',
    assignedPastor: 'Pastor John & Intercession Team A',
    status: 'Praying Now',
    date: '2026-08-20'
  },
  {
    id: 'PR-102',
    seekerName: 'Sister Sarah Jenkins',
    phone: '+91 98765 11001',
    category: 'Family & Deliverance',
    urgency: 'Normal',
    requestText: 'Prayer for child’s higher education admission and family peace.',
    assignedPastor: 'Elder Stephen',
    status: 'Pending',
    date: '2026-08-19'
  },
  {
    id: 'PR-103',
    seekerName: 'Bro. Joshua Raj',
    phone: '+91 98765 44321',
    category: 'Job & Business Breakthrough',
    urgency: 'Normal',
    requestText: 'Prayed for job interview in an MNC company.',
    assignedPastor: 'Intercession Team B',
    status: 'Answered',
    date: '2026-08-15'
  }
];

export default function PrayerWall({ session }) {
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // 🌟 பாதுகாப்பான டேட்டா லோடிங்: காலியாக இருந்தால் தானாகவே சீட் டேட்டாவை லோட் செய்யும்
  const [prayers, setPrayers] = useState(() => {
    try {
      const saved = localStorage.getItem('app_prayer_requests_db');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
      localStorage.setItem('app_prayer_requests_db', JSON.stringify(SEED_PRAYERS));
      return SEED_PRAYERS;
    } catch {
      return SEED_PRAYERS;
    }
  });

  const [prayerForm, setPrayerForm] = useState({
    seekerName: '',
    phone: '',
    category: 'Healing / Hospital Emergency',
    urgency: 'Normal',
    requestText: '',
    assignedPastor: 'General Intercession Team'
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleSavePrayer = (e) => {
    e.preventDefault();
    if (!prayerForm.seekerName.trim() || !prayerForm.requestText.trim()) return;

    const newEntry = {
      id: `PR-${Date.now().toString().slice(-4)}`,
      ...prayerForm,
      status: prayerForm.urgency === 'Critical' ? 'Praying Now' : 'Pending',
      date: new Date().toISOString().split('T')[0]
    };

    const updated = [newEntry, ...prayers];
    setPrayers(updated);
    localStorage.setItem('app_prayer_requests_db', JSON.stringify(updated));
    setIsModalOpen(false);
    setPrayerForm({
      seekerName: '',
      phone: '',
      category: 'Healing / Hospital Emergency',
      urgency: 'Normal',
      requestText: '',
      assignedPastor: 'General Intercession Team'
    });
    showToast('Prayer request placed on the altar!');
  };

  const handleUpdateStatus = (id, nextStatus) => {
    const updated = prayers.map(p => {
      if (p.id === id) {
        return { ...p, status: nextStatus };
      }
      return p;
    });
    setPrayers(updated);
    localStorage.setItem('app_prayer_requests_db', JSON.stringify(updated));
    showToast(`Prayer status updated to "${nextStatus}"`);
  };

  // பில்டர் லாஜிக்
  const filteredPrayers = prayers.filter(p => {
    const matchesFilter = 
      activeFilter === 'ALL' ? true :
      activeFilter === 'EMERGENCY' ? p.urgency === 'Critical' :
      activeFilter === 'PENDING' ? p.status === 'Pending' :
      activeFilter === 'PRAYING' ? p.status === 'Praying Now' :
      p.status === 'Answered';

    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      (p.seekerName || '').toLowerCase().includes(q) || 
      (p.requestText || '').toLowerCase().includes(q) ||
      (p.category || '').toLowerCase().includes(q);

    return matchesFilter && matchesSearch;
  });

  const emergencyCount = prayers.filter(p => p.urgency === 'Critical' && p.status !== 'Answered').length;
  const answeredCount = prayers.filter(p => p.status === 'Answered').length;

  return (
    <div className="flex flex-col gap-6 select-none animate-in fade-in duration-200 pb-16 text-slate-100">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 backdrop-blur-md shadow-2xl z-50 animate-in fade-in">
          <CheckCircle2 size={15} />
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
              <Flame size={12} className="text-rose-400 animate-pulse" />
              Intercession & Altar Power
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <HeartHandshake className="text-rose-400" size={24} />
            <span>Church Prayer Altar & Intercession Wall</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Log intercession burdens, manage hospital emergencies, and celebrate answered prayers.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 bg-gradient-to-r from-rose-500 to-amber-600 hover:from-rose-400 hover:to-amber-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-500/20 flex items-center gap-2 cursor-pointer active:scale-98 transition shrink-0"
        >
          <Plus size={15} />
          <span>Submit Prayer Request</span>
        </button>
      </div>

      {/* 4 Status Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div 
          onClick={() => setActiveFilter('ALL')}
          className={`p-4 rounded-2xl cursor-pointer transition border bg-slate-900/60 ${
            activeFilter === 'ALL' ? 'border-cyan-400 bg-cyan-500/10' : 'border-white/10 hover:border-white/20'
          }`}
        >
          <span className="text-[10px] font-bold text-slate-400 uppercase">Total Requests</span>
          <div className="text-2xl font-black text-white font-mono mt-1">{prayers.length}</div>
        </div>

        <div 
          onClick={() => setActiveFilter('EMERGENCY')}
          className={`p-4 rounded-2xl cursor-pointer transition border bg-slate-900/60 ${
            activeFilter === 'EMERGENCY' ? 'border-rose-400 bg-rose-500/15' : 'border-rose-500/20 hover:border-rose-500/40'
          }`}
        >
          <span className="text-[10px] font-bold text-rose-400 uppercase flex items-center gap-1">
            <ShieldAlert size={12} /> Emergency Altar
          </span>
          <div className="text-2xl font-black text-rose-400 font-mono mt-1">{emergencyCount}</div>
        </div>

        <div 
          onClick={() => setActiveFilter('PRAYING')}
          className={`p-4 rounded-2xl cursor-pointer transition border bg-slate-900/60 ${
            activeFilter === 'PRAYING' ? 'border-sky-400 bg-sky-500/10' : 'border-white/10 hover:border-white/20'
          }`}
        >
          <span className="text-[10px] font-bold text-sky-400 uppercase">Under Intercession</span>
          <div className="text-2xl font-black text-sky-400 font-mono mt-1">
            {prayers.filter(p => p.status === 'Praying Now').length}
          </div>
        </div>

        <div 
          onClick={() => setActiveFilter('ANSWERED')}
          className={`p-4 rounded-2xl cursor-pointer transition border bg-slate-900/60 ${
            activeFilter === 'ANSWERED' ? 'border-emerald-400 bg-emerald-500/10' : 'border-white/10 hover:border-white/20'
          }`}
        >
          <span className="text-[10px] font-bold text-emerald-400 uppercase">Answered Prayers</span>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-1">{answeredCount}</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input
            type="text"
            placeholder="Search by seeker, burden, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950/80 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-400"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['ALL', 'EMERGENCY', 'PENDING', 'PRAYING', 'ANSWERED'].map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                activeFilter === f ? 'bg-rose-500 text-white shadow-md' : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Prayer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
        {filteredPrayers.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-500 text-xs italic bg-slate-900/40 border border-white/5 rounded-2xl">
            No prayer burdens found under this category.
          </div>
        ) : (
          filteredPrayers.map((item) => {
            const isUrgent = item.urgency === 'Critical';
            const isAnswered = item.status === 'Answered';

            return (
              <div 
                key={item.id} 
                className={`p-5 rounded-3xl bg-slate-900/80 backdrop-blur-xl border flex flex-col justify-between space-y-4 transition ${
                  isUrgent ? 'border-rose-500/50 shadow-lg shadow-rose-500/10' : 'border-white/10 hover:border-white/20'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-0.5 rounded-md border text-[10px] font-bold ${
                      isUrgent ? 'bg-rose-500/20 text-rose-300 border-rose-500/30 animate-pulse' : 'bg-white/5 text-slate-300 border-white/10'
                    }`}>
                      {item.category}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isAnswered ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' :
                      item.status === 'Praying Now' ? 'bg-sky-500/15 text-sky-300 border-sky-500/30' :
                      'bg-amber-500/15 text-amber-300 border-amber-500/30'
                    }`}>
                      {item.status}
                    </span>
                  </div>

                  <div>
                    <div className="text-xs font-bold text-white flex items-center justify-between">
                      <span>{item.seekerName}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{item.phone}</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-2 italic bg-slate-950/70 p-3 rounded-2xl border border-white/5 leading-relaxed">
                      "{item.requestText}"
                    </p>
                  </div>

                  <div className="space-y-1 text-[11px] text-slate-400 pt-2 border-t border-white/5">
                    <div className="flex items-center justify-between">
                      <span>Intercessor:</span>
                      <strong className="text-amber-400 font-semibold">{item.assignedPastor}</strong>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span>Logged: {item.date}</span>
                      <span>{item.id}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2">
                  {item.status !== 'Praying Now' && item.status !== 'Answered' && (
                    <button
                      onClick={() => handleUpdateStatus(item.id, 'Praying Now')}
                      className="flex-1 py-1.5 bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/30 rounded-xl text-xs font-bold transition cursor-pointer text-center"
                    >
                      Praying Now
                    </button>
                  )}

                  {item.status !== 'Answered' && (
                    <button
                      onClick={() => handleUpdateStatus(item.id, 'Answered')}
                      className="flex-1 py-1.5 bg-gradient-to-r from-rose-500 to-amber-600 hover:from-rose-400 hover:to-amber-500 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-500/20 active:scale-95 transition-all cursor-pointer text-center"
                    >
                      Mark Answered ✓
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-[#0e1322] border border-white/20 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Flame className="text-rose-400" size={16} />
                <span>Submit Prayer Burden to Altar</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSavePrayer} className="space-y-3.5">
              <div>
                <label className="text-xs text-slate-300 font-medium">Seeker / Believer Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sister Mercy"
                  value={prayerForm.seekerName}
                  onChange={(e) => setPrayerForm({ ...prayerForm, seekerName: e.target.value })}
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:outline-none focus:border-rose-400 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 font-medium">Contact Phone</label>
                  <input
                    type="text"
                    placeholder="+91 98765..."
                    value={prayerForm.phone}
                    onChange={(e) => setPrayerForm({ ...prayerForm, phone: e.target.value })}
                    className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-medium">Urgency Level</label>
                  <select
                    value={prayerForm.urgency}
                    onChange={(e) => setPrayerForm({ ...prayerForm, urgency: e.target.value })}
                    className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:outline-none cursor-pointer font-bold"
                  >
                    <option value="Normal">Normal Request</option>
                    <option value="Critical">Critical Hospital / ICU Emergency</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 font-medium">Category</label>
                  <select
                    value={prayerForm.category}
                    onChange={(e) => setPrayerForm({ ...prayerForm, category: e.target.value })}
                    className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:outline-none cursor-pointer font-bold"
                  >
                    <option value="Healing / Hospital Emergency">Healing & Medical Care</option>
                    <option value="Family & Deliverance">Family Peace & Deliverance</option>
                    <option value="Job & Business Breakthrough">Job & Business Growth</option>
                    <option value="Salvation of Loved Ones">Salvation & Spiritual Life</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-medium">Assigned Intercessors</label>
                  <input
                    type="text"
                    placeholder="e.g. Pastor John / Intercession Team"
                    value={prayerForm.assignedPastor}
                    onChange={(e) => setPrayerForm({ ...prayerForm, assignedPastor: e.target.value })}
                    className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium">Prayer Request Description *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detail the prayer burden..."
                  value={prayerForm.requestText}
                  onChange={(e) => setPrayerForm({ ...prayerForm, requestText: e.target.value })}
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl p-3 text-xs text-white mt-1 focus:outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-rose-500 to-amber-600 text-white rounded-xl text-xs font-bold cursor-pointer shadow-lg shadow-rose-500/20"
                >
                  Place on Prayer Altar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}