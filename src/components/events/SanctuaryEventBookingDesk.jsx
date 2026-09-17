import React, { useState, useEffect, useMemo } from 'react';
import { 
  CalendarDays, Clock, MapPin, Plus, 
  CheckCircle2, AlertTriangle, Trash2, Search, Sparkles 
} from 'lucide-react';
import { soundFX } from '../../utils/audioEngine';
import { getVaultData, setVaultData } from '../../utils/vaultStore';

export default function SanctuaryEventBookingDesk({ session }) {
  const [selectedHall, setSelectedHall] = useState('ALL');
  const [searchDate, setSearchDate] = useState('');
  const [eventsList, setEventsList] = useState([]);

  const [form, setForm] = useState({
    title: '',
    hall: 'MAIN_SANCTUARY',
    date: '',
    startTime: '06:00 PM',
    endTime: '08:00 PM',
    coordinator: '',
    phone: '',
    soundMediaNeeded: true,
    expectedAttendees: ''
  });

  useEffect(() => {
    async function loadBookings() {
      const data = await getVaultData('space_bookings', [
        {
          id: 'EVT-101',
          title: 'Special Fasting & Deliverance Assembly',
          hall: 'MAIN_SANCTUARY',
          date: '2026-09-18',
          startTime: '10:00 AM',
          endTime: '01:30 PM',
          coordinator: 'Rev. Senior Pastor',
          phone: '+91 98401 11223',
          soundMediaNeeded: true,
          expectedAttendees: 150,
          status: 'CONFIRMED'
        },
        {
          id: 'EVT-102',
          title: 'Wedding Thanksgiving Service (David & Sarah)',
          hall: 'MAIN_SANCTUARY',
          date: '2026-09-21',
          startTime: '09:30 AM',
          endTime: '12:30 PM',
          coordinator: 'Bro. David Household',
          phone: '+91 98401 55667',
          soundMediaNeeded: true,
          expectedAttendees: 300,
          status: 'CONFIRMED'
        },
        {
          id: 'EVT-103',
          title: 'Youth Worship Jam & Band Rehearsal',
          hall: 'FELLOWSHIP_HALL',
          date: '2026-09-19',
          startTime: '05:30 PM',
          endTime: '08:00 PM',
          coordinator: 'Bro. Joshua Raj (Music Director)',
          phone: '+91 98401 88990',
          soundMediaNeeded: true,
          expectedAttendees: 35,
          status: 'CONFIRMED'
        }
      ]);
      setEventsList(data);
    }
    loadBookings();
  }, []);

  const saveEvents = async (updated) => {
    setEventsList(updated);
    await setVaultData('space_bookings', updated, true);
    localStorage.setItem('graceos_church_events_db', JSON.stringify(updated));
  };

  const isClashing = useMemo(() => {
    if (!form.date || !form.hall) return false;
    return eventsList.some(
      (evt) => evt.date === form.date && evt.hall === form.hall && evt.status === 'CONFIRMED'
    );
  }, [form.date, form.hall, eventsList]);

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.date) return;

    if (isClashing) {
      const proceed = window.confirm(
        'Warning: Another confirmed church gathering is already scheduled in this facility on the same date! Do you want to proceed?'
      );
      if (!proceed) return;
    }

    soundFX?.playSuccessChime?.();
    const newEvent = {
      id: `EVT-${Date.now().toString().slice(-3)}`,
      ...form,
      title: form.title.trim(),
      expectedAttendees: Number(form.expectedAttendees) || 50,
      status: 'CONFIRMED'
    };

    const updated = [newEvent, ...eventsList];
    await saveEvents(updated);
    setForm({
      title: '',
      hall: 'MAIN_SANCTUARY',
      date: '',
      startTime: '06:00 PM',
      endTime: '08:00 PM',
      coordinator: '',
      phone: '',
      soundMediaNeeded: true,
      expectedAttendees: ''
    });
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Remove this facility booking?')) return;
    soundFX?.playClickPop?.();
    const updated = eventsList.filter((e) => e.id !== id);
    await saveEvents(updated);
  };

  const filteredEvents = eventsList.filter((e) => {
    const matchHall = selectedHall === 'ALL' || e.hall === selectedHall;
    const matchDate = !searchDate || e.date === searchDate;
    return matchHall && matchDate;
  });

  const hallLabels = {
    MAIN_SANCTUARY: 'Main Sanctuary Hall',
    FELLOWSHIP_HALL: 'Fellowship Dining Hall',
    UPPER_ROOM: 'Upper Room Prayer Chamber'
  };

  return (
    <div className="space-y-6 max-w-5xl select-none text-slate-200 animate-in fade-in pb-12">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <span>Sanctuary Scheduling &amp; Event Space Desk</span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/30">
              Clash-Free Booking
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage allocations for Main Sanctuary, Fellowship Hall, and Prayer Chambers without room collisions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={searchDate}
            onChange={(e) => setSearchDate(e.target.value)}
            className="bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-cyan-300 font-mono focus:outline-none cursor-pointer"
          />
          {searchDate && (
            <button
              type="button"
              onClick={() => setSearchDate('')}
              className="text-xs text-slate-400 hover:text-white px-2 py-1 bg-white/5 rounded-lg cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form: New Booking */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-white/10 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <Plus size={15} className="text-cyan-400" />
            <span>Book Facility Space</span>
          </h4>

          {isClashing && (
            <div className="p-3 bg-amber-500/15 border border-amber-500/30 rounded-2xl flex items-center gap-2 text-amber-300 text-xs">
              <AlertTriangle size={16} className="shrink-0" />
              <span>Collision alert: Another confirmed event is already booked for this space!</span>
            </div>
          )}

          <form onSubmit={handleCreateBooking} className="space-y-3">
            <div>
              <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">
                Event Title *
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Wedding Thanksgiving Service"
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-bold"
                required
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">
                Sanctuary Space / Facility *
              </label>
              <select
                value={form.hall}
                onChange={(e) => setForm({ ...form, hall: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-amber-300 font-bold focus:outline-none cursor-pointer"
              >
                <option value="MAIN_SANCTUARY">Main Sanctuary Hall</option>
                <option value="FELLOWSHIP_HALL">Fellowship Dining Hall</option>
                <option value="UPPER_ROOM">Upper Room Prayer Chamber</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">
                Event Date *
              </label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-cyan-300 font-mono focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">
                  Start Time
                </label>
                <input
                  type="text"
                  value={form.startTime}
                  onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                  placeholder="09:30 AM"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">
                  End Time
                </label>
                <input
                  type="text"
                  value={form.endTime}
                  onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                  placeholder="12:30 PM"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">
                  Coordinator
                </label>
                <input
                  type="text"
                  value={form.coordinator}
                  onChange={(e) => setForm({ ...form, coordinator: e.target.value })}
                  placeholder="Bro. Stephen"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">
                  Expected Attendees
                </label>
                <input
                  type="number"
                  value={form.expectedAttendees}
                  onChange={(e) => setForm({ ...form, expectedAttendees: e.target.value })}
                  placeholder="150"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-white/5 cursor-pointer text-xs text-slate-300">
              <input
                type="checkbox"
                checked={form.soundMediaNeeded}
                onChange={(e) => setForm({ ...form, soundMediaNeeded: e.target.checked })}
                className="w-4 h-4 accent-cyan-500 rounded"
              />
              <span>Audio/Visual Console &amp; Projection Required</span>
            </label>

            <button
              type="submit"
              className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs transition active:scale-95 cursor-pointer shadow-lg shadow-cyan-500/20"
            >
              Confirm Facility Booking
            </button>
          </form>
        </div>

        {/* Right Stream: Scheduled Bookings */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-2 text-xs">
            <span className="font-bold text-white uppercase tracking-wider">
              Confirmed Facility Bookings ({filteredEvents.length})
            </span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setSelectedHall('ALL')}
                className={`px-2 py-0.5 rounded-md text-[10px] cursor-pointer ${
                  selectedHall === 'ALL'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold'
                    : 'text-slate-400'
                }`}
              >
                All Facilities
              </button>
              <button
                type="button"
                onClick={() => setSelectedHall('MAIN_SANCTUARY')}
                className={`px-2 py-0.5 rounded-md text-[10px] cursor-pointer ${
                  selectedHall === 'MAIN_SANCTUARY'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold'
                    : 'text-slate-400'
                }`}
              >
                Main Sanctuary
              </button>
            </div>
          </div>

          <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
            {filteredEvents.length === 0 ? (
              <div className="p-8 text-center text-slate-500 font-mono text-xs">
                No space bookings match this filter criteria.
              </div>
            ) : (
              filteredEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="p-4 rounded-2xl bg-slate-900 border border-white/10 space-y-3 hover:border-cyan-500/20 transition shadow-lg"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-bold uppercase">
                        {hallLabels[evt.hall] || evt.hall}
                      </span>
                      <h4 className="text-sm font-black text-white mt-1">{evt.title}</h4>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Coordinator:{' '}
                        <strong className="text-slate-100">{evt.coordinator || 'Church Staff'}</strong>
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-mono text-amber-300 font-bold block">
                        {evt.expectedAttendees} Expected
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteEvent(evt.id)}
                        className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer transition mt-2 inline-block"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between text-xs font-mono text-slate-400 pt-2 border-t border-white/5 gap-2">
                    <div className="flex items-center gap-3">
                      <span className="text-cyan-300 font-bold flex items-center gap-1">
                        <CalendarDays size={12} /> {evt.date}
                      </span>
                      <span className="flex items-center gap-1 text-slate-300">
                        <Clock size={12} /> {evt.startTime} - {evt.endTime}
                      </span>
                    </div>

                    {evt.soundMediaNeeded && (
                      <span className="text-[10px] text-emerald-400 font-bold">
                        ✓ AV &amp; Media Console Assigned
                      </span>
                    )}
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