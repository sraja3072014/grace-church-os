import React, { useState, useEffect, useMemo } from 'react';
import { 
  UserPlus, MessageSquare, PhoneCall, CheckCircle2, 
  Clock, Heart, UserCheck, ArrowRight, Sparkles 
} from 'lucide-react';
import { soundFX } from '../../utils/audioEngine';
import { getVaultData, setVaultData } from '../../utils/vaultStore';

export default function VisitorsFunnelDesk() {
  const [visitors, setVisitors] = useState([]);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    area: '',
    invitedBy: '',
    notes: ''
  });

  useEffect(() => {
    async function loadVisitors() {
      const data = await getVaultData('visitors', [
        {
          id: 'VIS-2601',
          name: 'Bro. Daniel Raj',
          phone: '+91 98401 66778',
          area: 'Tambaram',
          invitedBy: 'Bro. David Paul',
          stage: 'FIRST_VISIT',
          visitDate: '2026-09-06',
          notes: 'Looking for youth fellowship'
        },
        {
          id: 'VIS-2602',
          name: 'Sis. Mercy Priya',
          phone: '+91 98401 99887',
          area: 'Velachery',
          invitedBy: 'Sister Hepzibah',
          stage: 'CONTACTED',
          visitDate: '2026-08-30',
          notes: 'Requested prayer for family peace'
        }
      ]);
      setVisitors(data);
    }
    loadVisitors();
  }, []);

  const saveVisitors = async (updatedList) => {
    setVisitors(updatedList);
    await setVaultData('visitors', updatedList, true);
    localStorage.setItem('graceos_visitors_database', JSON.stringify(updatedList));
  };

  const handleAddVisitor = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) return;

    soundFX?.playSuccessChime?.();
    const newVisitor = {
      id: `VIS-${Date.now().toString().slice(-4)}`,
      name: form.name.trim(),
      phone: form.phone.trim(),
      area: form.area.trim() || 'General City',
      invitedBy: form.invitedBy.trim() || 'Self Walk-in',
      stage: 'FIRST_VISIT',
      visitDate: new Date().toISOString().slice(0, 10),
      notes: form.notes.trim()
    };

    const updated = [newVisitor, ...visitors];
    await saveVisitors(updated);
    setForm({ name: '', phone: '', area: '', invitedBy: '', notes: '' });
  };

  const handleAdvanceStage = async (visitorId) => {
    soundFX?.playClickPop?.();
    const stages = ['FIRST_VISIT', 'CONTACTED', 'PRAYER_MEET', 'COMMITTED'];
    const updated = visitors.map(v => {
      if (v.id === visitorId) {
        const currIdx = stages.indexOf(v.stage || 'FIRST_VISIT');
        const nextStage = currIdx < stages.length - 1 ? stages[currIdx + 1] : v.stage;
        return { ...v, stage: nextStage };
      }
      return v;
    });
    await saveVisitors(updated);
  };

  const handleSendWelcome = (visitor) => {
    soundFX?.playClickPop?.();
    const cleanPhone = visitor.phone.replace(/[^0-9]/g, '');
    const formatted = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

    const message = 
`🕊️ *Welcome to Grace Cathedral Church!* 🕊️\nDear ${visitor.name},\nThank you for worshipping the Lord with us today! We are overjoyed to have you in our fellowship.\n\n_"The Lord bless you and keep you; the Lord make His face shine on you."_\n\nIf you have any prayer requests or need pastoral guidance, feel free to reply to this message.\n\nWith Love,\n*Pastoral Team & Congregation*`;

    window.open(`https://web.whatsapp.com/send?phone=${formatted}&text=${encodeURIComponent(message)}`, '_blank');
  };

  const stageLabels = {
    FIRST_VISIT: { label: '1st Visit (New Seeker)', color: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
    CONTACTED: { label: 'Contacted (Pastoral Call)', color: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' },
    PRAYER_MEET: { label: 'Cottage Prayer / Cell Group', color: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30' },
    COMMITTED: { label: 'Committed Church Member', color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' }
  };

  return (
    <div className="space-y-6 max-w-5xl select-none text-slate-200 animate-in fade-in pb-12">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <span>Visitors Follow-up & Assimilation Funnel</span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
              Vault Active
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Track first-time guests through care touchpoints and assimilate them into committed members.
          </p>
        </div>

        <span className="text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1.5 rounded-xl border border-white/10">
          Total Registered: <strong className="text-emerald-400">{visitors.length}</strong>
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Register Guest */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-white/10 space-y-4">
          <h4 className="text-xs font-bold text-white flex items-center gap-2">
            <UserPlus size={15} className="text-amber-400" />
            <span>Fast Visitor Intake</span>
          </h4>

          <form onSubmit={handleAddVisitor} className="space-y-3">
            <div>
              <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">Full Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Bro. Samuel Paul"
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400"
                required
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">Mobile Phone *</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+91 98401 00000"
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400 font-mono"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">Area / Locality</label>
                <input
                  type="text"
                  value={form.area}
                  onChange={(e) => setForm({ ...form, area: e.target.value })}
                  placeholder="Tambaram"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">Invited By</label>
                <input
                  type="text"
                  value={form.invitedBy}
                  onChange={(e) => setForm({ ...form, invitedBy: e.target.value })}
                  placeholder="David"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">Prayer Request / Care Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Family peace, healing, job search..."
                rows={2}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer shadow-lg shadow-amber-500/20"
            >
              Record Guest Profile
            </button>
          </form>
        </div>

        {/* Right: Assimilation Pipeline Stream */}
        <div className="lg:col-span-2 p-5 rounded-3xl bg-slate-900 border border-white/10 space-y-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <Clock size={15} className="text-cyan-400" />
              <span>Care Pathway Status</span>
            </h4>
          </div>

          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
            {visitors.map((visitor) => (
              <div
                key={visitor.id}
                className="p-4 rounded-2xl bg-slate-950/80 border border-white/5 space-y-3 hover:border-white/10 transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h5 className="text-xs font-bold text-white">{visitor.name}</h5>
                      <span className="text-[9px] font-mono text-slate-400">({visitor.id})</span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                      {visitor.phone} • {visitor.area} (Brought by: {visitor.invitedBy})
                    </p>
                    {visitor.notes && (
                      <p className="text-[10px] text-amber-300/80 italic mt-1">
                        "{visitor.notes}"
                      </p>
                    )}
                  </div>

                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border shrink-0 ${stageLabels[visitor.stage || 'FIRST_VISIT']?.color}`}>
                    {stageLabels[visitor.stage || 'FIRST_VISIT']?.label}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSendWelcome(visitor)}
                      className="px-2.5 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 rounded-xl text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                    >
                      <MessageSquare size={12} />
                      <span>Send Welcome WA</span>
                    </button>

                    <a
                      href={`tel:${visitor.phone}`}
                      className="p-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-xl transition cursor-pointer"
                      title="Direct Phone Call"
                    >
                      <PhoneCall size={12} />
                    </a>
                  </div>

                  {visitor.stage !== 'COMMITTED' && (
                    <button
                      type="button"
                      onClick={() => handleAdvanceStage(visitor.id)}
                      className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                    >
                      <span>Advance Stage</span>
                      <ArrowRight size={12} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}