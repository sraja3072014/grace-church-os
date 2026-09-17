import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, Clock, Users, Mic2, Sparkles, 
  Printer, Plus, Trash2, CheckCircle2, Share2, Music, Video, UserCheck 
} from 'lucide-react';
import { soundFX } from '../../utils/audioEngine';
import { getVaultData, setVaultData } from '../../utils/vaultStore';
import { logAuditEvent } from '../../utils/auditLogger';

export default function SundayRosterDesk({ session }) {
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + ((7 - d.getDay()) % 7 || 7));
    return d.toISOString().slice(0, 10);
  });

  const [rosters, setRosters] = useState([]);
  const [toast, setToast] = useState('');

  const [rosterForm, setRosterForm] = useState({
    serviceType: '1st Morning Divine Service (06:30 AM)',
    preacher: 'Rev. Stephen Victor (Senior Pastor)',
    worshipLead: 'Bro. Joshua Raj & Team',
    scriptureReading: 'Mary Stephen',
    offeringPrayer: 'Bro. David Paul',
    soundTech: 'Bro. Samuel',
    mediaTech: 'Bro. Alex (Live Stream)',
    usherLead: 'Elder Paul Raj'
  });

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  useEffect(() => {
    async function loadRosters() {
      const stored = await getVaultData('rosters', [
        {
          id: 'ROS-2026-09-13-S1',
          date: '2026-09-13',
          serviceType: '1st Morning Divine Service (06:30 AM)',
          preacher: 'Rev. Stephen Victor',
          worshipLead: 'Bro. Joshua Raj & Youth Band',
          scriptureReading: 'Sis. Mary Stephen (Psalm 91)',
          offeringPrayer: 'Elder Paul Raj',
          soundTech: 'Bro. Samuel',
          mediaTech: 'Bro. Alex',
          usherLead: 'Deacon Victor Team'
        }
      ]);
      setRosters(stored);
    }
    loadRosters();
  }, []);

  const handleSaveRoster = async (e) => {
    e.preventDefault();
    soundFX?.playSuccessChime?.();

    const newEntry = {
      id: `ROS-${selectedDate}-${Date.now().toString().slice(-3)}`,
      date: selectedDate,
      ...rosterForm
    };

    const updated = [newEntry, ...rosters.filter(r => !(r.date === selectedDate && r.serviceType === rosterForm.serviceType))];
    setRosters(updated);
    await setVaultData('rosters', updated, true);
    await logAuditEvent('ROSTER_SCHEDULED', `${selectedDate} worship roster updated.`, session?.username);

    showToast('Worship assignment roster saved to physical disk.');
  };

  const handleDeleteRoster = async (id) => {
    if (!window.confirm('Remove this service roster entry?')) return;
    soundFX?.playClickPop?.();
    const updated = rosters.filter(r => r.id !== id);
    setRosters(updated);
    await setVaultData('rosters', updated, true);
    showToast('Roster entry deleted.');
  };

  const dayRosters = useMemo(() => {
    return rosters.filter(r => r.date === selectedDate);
  }, [rosters, selectedDate]);

  return (
    <div className="space-y-6 max-w-5xl select-none text-slate-200 animate-in fade-in pb-12">
      
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-4 py-2.5 rounded-xl shadow-2xl backdrop-blur-md text-xs font-bold flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4 print:hidden">
        <div>
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <Calendar className="text-amber-400" size={24} />
            <span>Sunday Worship Liturgy &amp; Ministry Roster Desk</span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono border border-amber-500/30">
              Order of Worship
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Coordinate ministerial appointments, pulpit speakers, worship leaders, and technical crews.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-amber-300 font-mono focus:outline-none cursor-pointer"
          />
          <button
            type="button"
            onClick={() => window.print()}
            className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 border border-white/10 transition cursor-pointer"
          >
            <Printer size={14} />
            <span>Print Bulletin</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Form: Schedule Service */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-white/10 space-y-4 print:hidden">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <Plus size={15} className="text-amber-400" />
            <span>Schedule Worship Service</span>
          </h4>

          <form onSubmit={handleSaveRoster} className="space-y-3">
            <div>
              <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">Service Time Slot *</label>
              <select
                value={rosterForm.serviceType}
                onChange={(e) => setRosterForm({ ...rosterForm, serviceType: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-amber-300 font-bold focus:outline-none"
              >
                <option>1st Morning Divine Service (06:30 AM)</option>
                <option>2nd Congregational Worship Service (09:00 AM)</option>
                <option>3rd English Contemporary Service (11:30 AM)</option>
                <option>Evening Youth &amp; Revival Service (06:00 PM)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">Pulpit Preacher *</label>
              <input
                type="text"
                value={rosterForm.preacher}
                onChange={(e) => setRosterForm({ ...rosterForm, preacher: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-bold"
                required
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">Worship Team &amp; Band Lead</label>
              <input
                type="text"
                value={rosterForm.worshipLead}
                onChange={(e) => setRosterForm({ ...rosterForm, worshipLead: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">Scripture Reading</label>
                <input
                  type="text"
                  value={rosterForm.scriptureReading}
                  onChange={(e) => setRosterForm({ ...rosterForm, scriptureReading: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">Offertory Prayer</label>
                <input
                  type="text"
                  value={rosterForm.offeringPrayer}
                  onChange={(e) => setRosterForm({ ...rosterForm, offeringPrayer: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">FOH Sound Engineer</label>
                <input
                  type="text"
                  value={rosterForm.soundTech}
                  onChange={(e) => setRosterForm({ ...rosterForm, soundTech: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">Live Broadcast &amp; Media</label>
                <input
                  type="text"
                  value={rosterForm.mediaTech}
                  onChange={(e) => setRosterForm({ ...rosterForm, mediaTech: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">Ushering &amp; Protocol Lead</label>
              <input
                type="text"
                value={rosterForm.usherLead}
                onChange={(e) => setRosterForm({ ...rosterForm, usherLead: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer shadow-lg shadow-amber-500/20"
            >
              Save Service Roster
            </button>
          </form>
        </div>

        {/* Right Bulletin: Printable Roster Card */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-2 text-xs font-mono print:hidden">
            <span className="font-bold text-white uppercase tracking-wider">
              {selectedDate} Service Orders ({dayRosters.length})
            </span>
            <span className="text-amber-400 font-bold">Worship Liturgy Ready</span>
          </div>

          <div className="space-y-4">
            {dayRosters.length === 0 ? (
              <div className="p-8 rounded-3xl bg-slate-900 border border-white/10 text-center text-xs text-slate-500 font-mono">
                No worship rosters scheduled for this date.
              </div>
            ) : (
              dayRosters.map((roster) => (
                <div
                  key={roster.id}
                  className="p-6 rounded-3xl bg-slate-900 border border-white/10 space-y-5 shadow-2xl print:bg-white print:text-slate-950 print:border-none print:p-0"
                >
                  <div className="flex items-start justify-between border-b border-white/10 print:border-slate-300 pb-3">
                    <div>
                      <span className="text-[10px] font-mono text-amber-400 print:text-slate-700 uppercase tracking-widest font-bold block">
                        Sunday Worship Order &amp; Ministry Roster
                      </span>
                      <h4 className="text-base font-black text-white print:text-slate-950 mt-0.5">
                        {roster.serviceType}
                      </h4>
                      <span className="text-xs text-slate-400 print:text-slate-600 font-mono">
                        Date: {roster.date} • Grace Central Cathedral
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteRoster(roster.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer print:hidden transition"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                    <div className="p-3 rounded-2xl bg-slate-950 print:bg-slate-50 border border-white/5 print:border-slate-200">
                      <span className="text-[10px] text-slate-400 print:text-slate-600 uppercase block">Pulpit Preacher</span>
                      <strong className="text-sm text-white print:text-slate-950 mt-0.5 block">{roster.preacher}</strong>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-950 print:bg-slate-50 border border-white/5 print:border-slate-200">
                      <span className="text-[10px] text-slate-400 print:text-slate-600 uppercase block">Worship Team &amp; Band</span>
                      <strong className="text-sm text-cyan-300 print:text-slate-950 mt-0.5 block">{roster.worshipLead}</strong>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-950 print:bg-slate-50 border border-white/5 print:border-slate-200">
                      <span className="text-[10px] text-slate-400 print:text-slate-600 uppercase block">Scripture Reading</span>
                      <span className="text-slate-200 print:text-slate-800 font-bold block mt-0.5">{roster.scriptureReading}</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-950 print:bg-slate-50 border border-white/5 print:border-slate-200">
                      <span className="text-[10px] text-slate-400 print:text-slate-600 uppercase block">Offertory Prayer</span>
                      <span className="text-slate-200 print:text-slate-800 font-bold block mt-0.5">{roster.offeringPrayer}</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-950 print:bg-slate-50 border border-white/5 print:border-slate-200">
                      <span className="text-[10px] text-slate-400 print:text-slate-600 uppercase block">FOH Sound Engineer</span>
                      <span className="text-slate-200 print:text-slate-800 font-bold block mt-0.5">{roster.soundTech}</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-950 print:bg-slate-50 border border-white/5 print:border-slate-200">
                      <span className="text-[10px] text-slate-400 print:text-slate-600 uppercase block">Broadcast &amp; Live Stream</span>
                      <span className="text-slate-200 print:text-slate-800 font-bold block mt-0.5">{roster.mediaTech}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/5 print:bg-slate-100 border border-white/5 print:border-slate-300 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400 print:text-slate-700">Ushering Protocol &amp; Hospitality:</span>
                    <strong className="text-white print:text-slate-950">{roster.usherLead}</strong>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}