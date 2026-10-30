import React, { useState } from 'react';
import { Wrench, Plus, CheckCircle2, AlertTriangle, Trash2, X, Clock } from 'lucide-react';

export default function ServiceRequestsTab() {
  const [tickets, setTickets] = useState(() => {
    const local = localStorage.getItem('graceos_hardware_tickets');
    return local ? JSON.parse(local) : [
      { id: 1, item: 'Sanctuary Main Projector Lamp', location: 'Main Hall', priority: 'High', status: 'Pending Repair', requester: 'Media Lead' },
      { id: 2, item: 'Wireless Vocal Mic 3 (Sennheiser)', location: 'Altar Stage', priority: 'Medium', status: 'In Progress', requester: 'Worship Pastor' },
      { id: 3, item: 'Air Conditioner Unit #2', location: 'Balcony Left', priority: 'Low', status: 'Resolved', requester: 'Facility Admin' },
    ];
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ item: '', location: '', priority: 'Medium', status: 'Pending Repair', requester: 'Staff' });

  const sync = (data) => {
    setTickets(data);
    localStorage.setItem('graceos_hardware_tickets', JSON.stringify(data));
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!form.item) return;
    sync([...tickets, { ...form, id: Date.now() }]);
    setModalOpen(false);
  };

  const handleDelete = (id) => {
    sync(tickets.filter(t => t.id !== id));
  };

  return (
    <div className="flex flex-col gap-5 max-w-5xl select-none">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-white">Sanctuary Hardware & Service Requests ({tickets.length})</h4>
          <p className="text-xs text-slate-400">Track audio mixer, stage lights, instruments, and facility repair requests.</p>
        </div>
        <button 
          onClick={() => {
            setForm({ item: '', location: '', priority: 'Medium', status: 'Pending Repair', requester: 'Staff' });
            setModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 active:scale-95 transition"
        >
          <Plus size={15} /> Raise Service Request
        </button>
      </div>

      <div className="rounded-2xl border border-white/[0.08] overflow-hidden bg-black/20">
        <table className="w-full text-left text-xs">
          <thead className="bg-white/[0.04] text-slate-400 border-b border-white/[0.06]">
            <tr>
              <th className="p-3.5">Hardware / Equipment</th>
              <th className="p-3.5">Location</th>
              <th className="p-3.5">Priority</th>
              <th className="p-3.5">Reported By</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04] text-slate-300 font-medium">
            {tickets.map((t) => (
              <tr key={t.id} className="hover:bg-white/[0.02]">
                <td className="p-3.5 font-bold text-slate-100 flex items-center gap-2">
                  <Wrench size={14} className="text-cyan-400" />
                  <span>{t.item}</span>
                </td>
                <td className="p-3.5 text-slate-300">{t.location}</td>
                <td className="p-3.5">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    t.priority === 'High' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {t.priority}
                  </span>
                </td>
                <td className="p-3.5 text-slate-400">{t.requester}</td>
                <td className="p-3.5">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                    t.status === 'Resolved' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                  }`}>
                    {t.status}
                  </span>
                </td>
                <td className="p-3.5 text-right">
                  <button 
                    onClick={() => handleDelete(t.id)}
                    className="w-7 h-7 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 inline-flex items-center justify-center transition"
                  >
                    <Trash2 size={13} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl p-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Wrench size={16} className="text-cyan-400" />
                New Maintenance Request
              </h4>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white"><X size={16} /></button>
            </div>
            <form onSubmit={handleAdd} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-slate-300">Equipment Description</label>
                <input required type="text" placeholder="e.g. Stage Monitor Speaker #2" value={form.item} onChange={(e) => setForm({ ...form, item: e.target.value })} className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-slate-300">Location</label>
                  <input type="text" placeholder="Main Altar" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-slate-300">Priority Level</label>
                  <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400">
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-white/10">
                <button type="button" onClick={() => setModalOpen(false)} className="px-3.5 py-1.5 rounded-xl bg-white/5 text-xs text-slate-300">Cancel</button>
                <button type="submit" className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-xs font-bold text-slate-950">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}