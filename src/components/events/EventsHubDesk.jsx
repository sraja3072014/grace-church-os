import React, { useState } from 'react';
import {
  Calendar, Clock, MapPin, Plus
} from 'lucide-react';
import { soundFX } from '../../utils/audioEngine';

const SEED_EVENTS = [
  {
    id: 'EVT-2601',
    title: 'ஆண்டின் சிறப்பு உபவாச ஜெபக் கூடுகை',
    category: 'FASTING',
    date: '2026-09-18',
    time: '06:30 PM - 09:00 PM',
    venue: 'Main Sanctuary Hall',
    coordinator: 'Pastor & Prayer Team',
    status: 'UPCOMING'
  },
  {
    id: 'EVT-2602',
    title: 'இளைஞர் எழுப்புதல் மாநாடு (Youth Fest 2026)',
    category: 'YOUTH',
    date: '2026-09-26',
    time: '10:00 AM - 04:00 PM',
    venue: 'Grace Fellowship Center',
    coordinator: 'Bro. Joshua Raj (Youth Leader)',
    status: 'UPCOMING'
  },
  {
    id: 'EVT-2603',
    title: 'பரிசுத்த ஞானஸ்நான ஆராதனை (Baptism Service)',
    category: 'BAPTISM',
    date: '2026-10-04',
    time: '06:00 AM - 08:30 AM',
    venue: 'Campus Pool Area',
    coordinator: 'Elders Committee',
    status: 'PLANNING'
  }
];

const EMPTY_FORM = {
  title: '', category: 'SPECIAL', date: '', time: '', venue: '', coordinator: ''
};

const CATEGORY_BADGES = {
  FASTING: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  YOUTH: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
  SPECIAL: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  BAPTISM: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
};

export default function EventsHubDesk() {
  const [events, setEvents] = useState(() => {
    try {
      const saved = localStorage.getItem('app_events_database');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      localStorage.setItem('app_events_database', JSON.stringify(SEED_EVENTS));
      return SEED_EVENTS;
    } catch {
      return SEED_EVENTS;
    }
  });
  const [form, setForm] = useState(EMPTY_FORM);

  const saveEvents = (updatedList) => {
    setEvents(updatedList);
    localStorage.setItem('app_events_database', JSON.stringify(updatedList));
  };

  const handleAddEvent = (event) => {
    event.preventDefault();
    if (!form.title.trim() || !form.date) return;

    soundFX.playSuccessChime();
    saveEvents([
      {
        id: `EVT-${Date.now().toString().slice(-4)}`,
        title: form.title.trim(),
        category: form.category,
        date: form.date,
        time: form.time || '10:00 AM',
        venue: form.venue || 'Main Hall',
        coordinator: form.coordinator || 'Church Administration',
        status: 'UPCOMING'
      },
      ...events
    ]);
    setForm(EMPTY_FORM);
  };

  return (
    <div className="space-y-6 max-w-5xl select-none text-slate-200 animate-in fade-in pb-12">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <span>Church Events & Ministry Schedule</span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/30">Active Calendar</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">சபையின் விசேஷ கூட்டங்கள், மாநாடுகள் மற்றும் ஆராதனை நிகழ்வுகளைத் திட்டமிடும் தளம்.</p>
        </div>
        <span className="text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1.5 rounded-xl border border-white/10">
          Planned Events: <strong className="text-cyan-400">{events.length}</strong>
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="p-5 rounded-3xl bg-slate-900 border border-white/10 space-y-4">
          <h4 className="text-xs font-bold text-white flex items-center gap-2"><Plus size={15} className="text-cyan-400" /><span>புதிய நிகழ்வைத் திட்டமிடுதல்</span></h4>
          <form onSubmit={handleAddEvent} className="space-y-3">
            <div>
              <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">நிகழ்வின் தலைப்பு</label>
              <input type="text" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="எ.கா: உபவாச ஜெபம்" className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400" required />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">பிரிவு (Category)</label>
              <select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400">
                <option value="SPECIAL">விசேஷ ஆராதனை (Special Service)</option>
                <option value="FASTING">உபவாச ஜெபம் (Fasting Prayer)</option>
                <option value="YOUTH">இளைஞர் கூடுகை (Youth Meet)</option>
                <option value="BAPTISM">ஞானஸ்நானம் (Baptism)</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">தேதி</label>
                <input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400" required />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">நேரம்</label>
                <input type="text" value={form.time} onChange={(event) => setForm({ ...form, time: event.target.value })} placeholder="06:30 PM" className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400" />
              </div>
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">இடம் (Venue)</label>
              <input type="text" value={form.venue} onChange={(event) => setForm({ ...form, venue: event.target.value })} placeholder="Main Sanctuary" className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400" />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">பொறுப்பாளர் (Coordinator)</label>
              <input type="text" value={form.coordinator} onChange={(event) => setForm({ ...form, coordinator: event.target.value })} placeholder="Youth Team / Pastor" className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400" />
            </div>
            <button type="submit" className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer shadow-lg shadow-cyan-500/20">நிகழ்வை அட்டவணைப்படுத்து</button>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-3">
          {events.length === 0 ? (
            <div className="p-8 rounded-3xl bg-slate-900 border border-white/10 text-center text-xs text-slate-500">No events scheduled yet.</div>
          ) : events.map((event) => (
            <div key={event.id} className="p-4 rounded-3xl bg-slate-900 border border-white/10 hover:border-white/20 transition space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white">{event.title}</h4>
                    <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border ${CATEGORY_BADGES[event.category] || CATEGORY_BADGES.SPECIAL}`}>{event.category}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono block mt-0.5">{event.id}</span>
                </div>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-bold">{event.status}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-300 font-mono pt-1 border-t border-white/5">
                <div className="flex items-center gap-1.5"><Calendar size={13} className="text-amber-400" /><span>{event.date}</span></div>
                <div className="flex items-center gap-1.5"><Clock size={13} className="text-cyan-400" /><span>{event.time}</span></div>
                <div className="flex items-center gap-1.5"><MapPin size={13} className="text-rose-400" /><span className="truncate">{event.venue}</span></div>
              </div>
              <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400 border-t border-white/5"><span>பொறுப்பாளர்: <strong className="text-slate-200">{event.coordinator}</strong></span></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}