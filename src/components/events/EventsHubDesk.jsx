import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { soundFX } from '../../utils/audioEngine';
import { getVaultData, setVaultData } from '../../utils/vaultStore';

const SEED_EVENTS = [
  {
    id: 'EVT-2601',
    title: 'Annual Solemn Assembly & Fasting Prayer',
    category: 'FASTING',
    date: '2026-09-18',
    time: '06:30 PM - 09:00 PM',
    venue: 'Main Sanctuary Hall',
    coordinator: 'Pastor & Prayer Team',
    status: 'UPCOMING'
  },
  {
    id: 'EVT-2602',
    title: 'Youth Revival Conference (Youth Fest 2026)',
    category: 'YOUTH',
    date: '2026-09-26',
    time: '10:00 AM - 04:00 PM',
    venue: 'Grace Fellowship Center',
    coordinator: 'Bro. Joshua Raj (Youth Leader)',
    status: 'UPCOMING'
  },
  {
    id: 'EVT-2603',
    title: 'Sacred Water Baptism Service',
    category: 'BAPTISM',
    date: '2026-10-04',
    time: '06:00 AM - 08:30 AM',
    venue: 'Campus Pool Area',
    coordinator: 'Elders Committee',
    status: 'PLANNING'
  }
];

const EMPTY_FORM = {
  title: '',
  category: 'SPECIAL',
  date: '',
  time: '',
  venue: '',
  coordinator: ''
};

const CATEGORY_BADGES = {
  FASTING: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  YOUTH: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
  SPECIAL: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  BAPTISM: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
};

export default function EventsHubDesk() {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    async function loadEvents() {
      const data = await getVaultData('events', SEED_EVENTS);
      setEvents(data);
    }
    loadEvents();
  }, []);

  const saveEvents = async (updatedList) => {
    setEvents(updatedList);
    await setVaultData('events', updatedList, true);
    localStorage.setItem('app_events_database', JSON.stringify(updatedList));
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.date) return;

    soundFX?.playSuccessChime?.();
    const newEntry = {
      id: `EVT-${Date.now().toString().slice(-4)}`,
      title: form.title.trim(),
      category: form.category,
      date: form.date,
      time: form.time.trim() || '10:00 AM',
      venue: form.venue.trim() || 'Main Sanctuary Hall',
      coordinator: form.coordinator.trim() || 'Church Administration',
      status: 'UPCOMING'
    };

    const updated = [newEntry, ...events];
    await saveEvents(updated);
    setForm(EMPTY_FORM);
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Delete this planned church event?')) return;
    soundFX?.playClickPop?.();
    const updated = events.filter((e) => e.id !== id);
    await saveEvents(updated);
  };

  return (
    <div className="space-y-6 max-w-5xl select-none text-slate-200 animate-in fade-in pb-12">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <span>Church Events &amp; Ministry Schedule</span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/30">
              Active Calendar
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Plan, coordinate, and review all upcoming church conferences, assemblies, and special services.
          </p>
        </div>
        <span className="text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1.5 rounded-xl border border-white/10">
          Planned Events: <strong className="text-cyan-400">{events.length}</strong>
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Event Booking Form */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-white/10 space-y-4">
          <h4 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-wider">
            <Plus size={15} className="text-cyan-400" />
            <span>Schedule New Event</span>
          </h4>

          <form onSubmit={handleAddEvent} className="space-y-3">
            <div>
              <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">
                Event Title *
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Youth Revival Meet"
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 font-bold"
                required
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="SPECIAL">Special Worship Service</option>
                <option value="FASTING">Solemn Assembly &amp; Fasting</option>
                <option value="YOUTH">Youth Conference</option>
                <option value="BAPTISM">Sacred Baptism Service</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">
                  Time Slot
                </label>
                <input
                  type="text"
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                  placeholder="06:30 PM"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">
                Venue Location
              </label>
              <input
                type="text"
                value={form.venue}
                onChange={(e) => setForm({ ...form, venue: e.target.value })}
                placeholder="Main Sanctuary Hall"
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">
                Presiding Coordinator
              </label>
              <input
                type="text"
                value={form.coordinator}
                onChange={(e) => setForm({ ...form, coordinator: e.target.value })}
                placeholder="Youth Team / Senior Pastor"
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer shadow-lg shadow-cyan-500/20"
            >
              Add to Events Schedule
            </button>
          </form>
        </div>

        {/* Scheduled Events Stream */}
        <div className="lg:col-span-2 space-y-3">
          {events.length === 0 ? (
            <div className="p-8 rounded-3xl bg-slate-900 border border-white/10 text-center text-xs text-slate-500 font-mono">
              No upcoming events scheduled.
            </div>
          ) : (
            events.map((event) => (
              <div
                key={event.id}
                className="p-4 rounded-3xl bg-slate-900 border border-white/10 hover:border-white/20 transition space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">{event.title}</h4>
                      <span
                        className={`text-[9px] font-mono px-2 py-0.5 rounded-full border ${
                          CATEGORY_BADGES[event.category] || CATEGORY_BADGES.SPECIAL
                        }`}
                      >
                        {event.category}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                      {event.id}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-bold">
                      {event.status}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteEvent(event.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer transition"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-300 font-mono pt-1 border-t border-white/5">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={13} className="text-amber-400" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={13} className="text-cyan-400" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin size={13} className="text-rose-400" />
                    <span className="truncate">{event.venue}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400 border-t border-white/5">
                  <span>
                    Coordinator: <strong className="text-slate-200">{event.coordinator}</strong>
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}