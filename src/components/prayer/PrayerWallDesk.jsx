import React, { useState, useEffect } from 'react';
import { 
  HeartHandshake, Sparkles, CheckCircle2, 
  Clock, ShieldAlert, Share2, Plus, MessageSquare, X 
} from 'lucide-react';
import { soundFX } from '../../utils/audioEngine';
import { getVaultData, setVaultData } from '../../utils/vaultStore';

export default function PrayerWallDesk() {
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'PENDING' | 'ANSWERED'
  const [prayers, setPrayers] = useState([]);
  const [activeTestimonyModalId, setActiveTestimonyModalId] = useState(null);
  const [testimonyText, setTestimonyText] = useState('');

  const [newPrayer, setNewPrayer] = useState({
    requester: '',
    category: 'HEALING',
    request: '',
    isPrivate: false
  });

  // Load from local physical disk vault (/database/prayers.json)
  useEffect(() => {
    async function loadPrayers() {
      const data = await getVaultData('prayers', [
        {
          id: 'PR-2601',
          requester: 'Sis. Mary Stella',
          category: 'HEALING',
          request: 'Pray for favorable clinical biopsy results and complete bodily restoration.',
          isPrivate: false,
          date: '2026-09-08',
          status: 'PENDING',
          praiseReport: ''
        },
        {
          id: 'PR-2602',
          requester: 'Bro. Joshua Raj',
          category: 'JOB',
          request: 'Praying for divine favor in the final round of an MNC technical interview.',
          isPrivate: false,
          date: '2026-09-02',
          status: 'ANSWERED',
          praiseReport: 'Praise the Lord! Received the official employment offer with senior placement.'
        }
      ]);
      setPrayers(data);
    }
    loadPrayers();
  }, []);

  const savePrayers = async (list) => {
    setPrayers(list);
    await setVaultData('prayers', list, true);
    localStorage.setItem('graceos_prayer_wall_db', JSON.stringify(list));
  };

  const handleAddPrayer = async (e) => {
    e.preventDefault();
    if (!newPrayer.request.trim() || !newPrayer.requester.trim()) return;

    soundFX?.playSuccessChime?.();
    const item = {
      id: `PR-${Date.now().toString().slice(-4)}`,
      requester: newPrayer.requester.trim(),
      category: newPrayer.category,
      request: newPrayer.request.trim(),
      isPrivate: newPrayer.isPrivate,
      date: new Date().toISOString().slice(0, 10),
      status: 'PENDING',
      praiseReport: ''
    };

    const updated = [item, ...prayers];
    await savePrayers(updated);
    setNewPrayer({ requester: '', category: 'HEALING', request: '', isPrivate: false });
  };

  const handleOpenTestimonyModal = (id) => {
    soundFX?.playClickPop?.();
    setActiveTestimonyModalId(id);
    setTestimonyText('');
  };

  const handleSaveTestimony = async (e) => {
    e.preventDefault();
    if (!activeTestimonyModalId) return;

    soundFX?.playSuccessChime?.();
    const updated = prayers.map((p) =>
      p.id === activeTestimonyModalId
        ? {
            ...p,
            status: 'ANSWERED',
            praiseReport: testimonyText.trim() || 'Answered by the grace of God!'
          }
        : p
    );

    await savePrayers(updated);
    setActiveTestimonyModalId(null);
    setTestimonyText('');
  };

  const filteredPrayers = prayers.filter((p) => {
    if (filter === 'PENDING') return p.status === 'PENDING';
    if (filter === 'ANSWERED') return p.status === 'ANSWERED';
    return true;
  });

  const categoryColors = {
    HEALING: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    JOB: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    FAMILY: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    SPIRITUAL: 'bg-purple-500/15 text-purple-300 border-purple-500/30'
  };

  return (
    <div className="space-y-6 max-w-5xl select-none text-slate-200 animate-in fade-in pb-12">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <span>Intercessory Prayer Wall &amp; Testimonies</span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono border border-rose-500/30">
              Prayer Desk
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Collect intercessory petitions, coordinate pastoral prayer points, and document answered praises.
          </p>
        </div>

        {/* Filter Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-2xl border border-white/10 text-xs font-bold">
          <button
            type="button"
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
              filter === 'ALL' ? 'bg-rose-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            All Requests ({prayers.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('PENDING')}
            className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
              filter === 'PENDING' ? 'bg-rose-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            In Intercession
          </button>
          <button
            type="button"
            onClick={() => setFilter('ANSWERED')}
            className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
              filter === 'ANSWERED' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Answered Testimonies
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* New Prayer Form */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-white/10 space-y-4">
          <h4 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-wider">
            <Plus size={15} className="text-rose-400" />
            <span>Submit Prayer Petition</span>
          </h4>

          <form onSubmit={handleAddPrayer} className="space-y-3">
            <div>
              <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">Requester Full Name *</label>
              <input
                type="text"
                value={newPrayer.requester}
                onChange={(e) => setNewPrayer({ ...newPrayer, requester: e.target.value })}
                placeholder="e.g. Bro. Samuel Paul"
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-rose-400 font-bold"
                required
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">Category</label>
              <select
                value={newPrayer.category}
                onChange={(e) => setNewPrayer({ ...newPrayer, category: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-400 cursor-pointer"
              >
                <option value="HEALING">Physical Healing &amp; Health</option>
                <option value="JOB">Employment &amp; Business Direction</option>
                <option value="FAMILY">Family Peace &amp; Reconciliation</option>
                <option value="SPIRITUAL">Spiritual Renewal &amp; Deliverance</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">Prayer Need *</label>
              <textarea
                value={newPrayer.request}
                onChange={(e) => setNewPrayer({ ...newPrayer, request: e.target.value })}
                placeholder="Describe the petition for the intercessory team..."
                rows={3}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-rose-400 resize-none leading-relaxed"
                required
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
              <input
                type="checkbox"
                checked={newPrayer.isPrivate}
                onChange={(e) => setNewPrayer({ ...newPrayer, isPrivate: e.target.checked })}
                className="rounded border-white/20 bg-slate-950 text-rose-500 focus:ring-0 cursor-pointer"
              />
              <span>Confidential (Pastoral Team Only)</span>
            </label>

            <button
              type="submit"
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer shadow-lg shadow-rose-500/20"
            >
              Post to Prayer Wall
            </button>
          </form>
        </div>

        {/* Prayer Cards Stream */}
        <div className="lg:col-span-2 space-y-3">
          {filteredPrayers.length === 0 ? (
            <div className="p-12 text-center text-slate-500 bg-slate-900/60 rounded-3xl border border-white/5 space-y-2">
              <HeartHandshake size={32} className="mx-auto opacity-30" />
              <p className="text-xs">No prayer requests recorded in this section.</p>
            </div>
          ) : (
            filteredPrayers.map((item) => (
              <div
                key={item.id}
                className={`p-5 rounded-3xl border transition space-y-3 ${
                  item.status === 'ANSWERED'
                    ? 'bg-emerald-950/20 border-emerald-500/30'
                    : 'bg-slate-900 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-white">{item.requester}</h4>
                      <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border ${categoryColors[item.category]}`}>
                        {item.category}
                      </span>
                      {item.isPrivate && (
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                          Confidential
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono block mt-0.5">Submitted: {item.date}</span>
                  </div>

                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                    item.status === 'ANSWERED' 
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                      : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                  }`}>
                    {item.status === 'ANSWERED' ? '✓ Answered' : '⏳ In Intercession'}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {item.request}
                </p>

                {/* Praise Report / Testimony Box */}
                {item.praiseReport && (
                  <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs space-y-1">
                    <span className="font-bold flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                      <Sparkles size={13} /> Praise Report / Answer to Prayer:
                    </span>
                    <p className="text-[11px] leading-relaxed italic">{item.praiseReport}</p>
                  </div>
                )}

                {/* Status Update Trigger */}
                {item.status === 'PENDING' && (
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => handleOpenTestimonyModal(item.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <CheckCircle2 size={13} />
                      <span>Mark as Answered</span>
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

      </div>

      {/* Structured Testimony Submission Modal */}
      {activeTestimonyModalId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-white/20 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="text-emerald-400" size={18} />
                <h4 className="text-sm font-bold text-white">Record Answered Testimony</h4>
              </div>
              <button
                type="button"
                onClick={() => setActiveTestimonyModalId(null)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveTestimony} className="space-y-3">
              <div>
                <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">
                  Testimony / Praise Note
                </label>
                <textarea
                  required
                  rows={3}
                  value={testimonyText}
                  onChange={(e) => setTestimonyText(e.target.value)}
                  placeholder="Share how God answered this petition..."
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-400 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTestimonyModalId(null)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  Save Testimony
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}