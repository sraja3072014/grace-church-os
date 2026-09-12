import React, { useState, useMemo } from 'react';
import { 
  CalendarDays, Clock, MapPin, Plus, 
  CheckCircle2, AlertTriangle, Trash2, Search, Sparkles 
} from 'lucide-react';
import { soundFX } from '../../utils/audioEngine';

export default function SanctuaryEventBookingDesk({ session }) {
  const [selectedHall, setSelectedHall] = useState('ALL');
  const [searchDate, setSearchDate] = useState('');

  // 1. நிகழ்வுகள் மற்றும் அரங்கு முன்பதிவு லெட்ஜர்
  const [eventsList, setEventsList] = useState(() => {
    try {
      const raw = localStorage.getItem('graceos_church_events_db');
      return raw ? JSON.parse(raw) : [
        {
          id: 'EVT-101',
          title: 'Special Fasting & Deliverance Prayer',
          hall: 'MAIN_SANCTUARY', // 'MAIN_SANCTUARY' | 'FELLOWSHIP_HALL' | 'UPPER_ROOM'
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
      ];
    } catch {
      return [];
    }
  });

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

  const saveEvents = (updated) => {
    setEventsList(updated);
    localStorage.setItem('graceos_church_events_db', JSON.stringify(updated));
  };

  // அரங்கு முன்பதிவு மோதல் சரிபார்ப்பு (Clash Detection)
  const isClashing = useMemo(() => {
    if (!form.date || !form.hall) return false;
    return eventsList.some(evt => 
      evt.date === form.date && 
      evt.hall === form.hall &&
      evt.status === 'CONFIRMED'
    );
  }, [form.date, form.hall, eventsList]);

  const handleCreateBooking = (e) => {
    e.preventDefault();
    if (!form.title || !form.date) return;

    if (isClashing) {
      const proceed = window.confirm('எச்சரிக்கை: இந்த தேதியில் இதே அரங்கில் ஏற்கெனவே ஒரு நிகழ்வு பதிவாகியுள்ளது! தொடர விரும்புகிறீர்களா?');
      if (!proceed) return;
    }

    soundFX?.playSuccessChime?.();

    const newEvent = {
      id: `EVT-${Date.now().toString().slice(-3)}`,
      ...form,
      expectedAttendees: Number(form.expectedAttendees) || 50,
      status: 'CONFIRMED'
    };

    saveEvents([newEvent, ...eventsList]);
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

  const handleDeleteEvent = (id) => {
    soundFX?.playClickPop?.();
    const updated = eventsList.filter(e => e.id !== id);
    saveEvents(updated);
  };

  const filteredEvents = eventsList.filter(e => {
    const matchHall = selectedHall === 'ALL' || e.hall === selectedHall;
    const matchDate = !searchDate || e.date === searchDate;
    return matchHall && matchDate;
  });

  const hallLabels = {
    MAIN_SANCTUARY: 'பிரதான ஆலயம் (Main Sanctuary)',
    FELLOWSHIP_HALL: 'ஐக்கிய கூடம் (Fellowship Dining Hall)',
    UPPER_ROOM: 'மேல்மாடி ஜெப அறை (Upper Room)'
  };

  return (
    <div className="space-y-6 max-w-5xl select-none text-slate-200 animate-in fade-in pb-12">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <span>Sanctuary Scheduling & Event Space Desk</span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/30">
              Clash-Free Booking
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            பிரதான ஆலயம், ஐக்கிய கூடம் மற்றும் ஜெப அறைகளின் விசேஷ நிகழ்வுகள், திருமணங்கள் மற்றும் கூட்டங்களுக்கான முன்பதிவு பலகை.
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
              onClick={() => setSearchDate('')}
              className="text-xs text-slate-400 hover:text-white px-2 py-1 bg-white/5 rounded-lg"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* இடதுபுறம்: புதிய முன்பதிவு படிவம் */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-white/10 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <Plus size={15} className="text-cyan-400" />
            <span>புதிய நிகழ்வு / அரங்கு முன்பதிவு</span>
          </h4>

          {isClashing && (
            <div className="p-3 bg-amber-500/15 border border-amber-500/30 rounded-2xl flex items-center gap-2 text-amber-300 text-xs">
              <AlertTriangle size={16} className="shrink-0" />
              <span>இதே தேதியில் இந்த அரங்கில் மற்றொரு நிகழ்வு ஏற்கெனவே திட்டமிடப்பட்டுள்ளது!</span>
            </div>
          )}

          <form onSubmit={handleCreateBooking} className="space-y-3">
            <div>
              <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">நிகழ்வின் தலைப்பு</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="எ.கா: சிறப்பு திருமண ஆராதனை"
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                required
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">அரங்கு / தளம் (Sanctuary Space)</label>
              <select
                value={form.hall}
                onChange={(e) => setForm({ ...form, hall: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-amber-300 font-bold focus:outline-none"
              >
                <option value="MAIN_SANCTUARY">பிரதான ஆலயம் (Main Sanctuary)</option>
                <option value="FELLOWSHIP_HALL">ஐக்கிய கூடம் (Fellowship Dining Hall)</option>
                <option value="UPPER_ROOM">மேல்மாடி ஜெப அறை (Upper Room)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">நிகழ்வு தேதி</label>
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
                <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">ஆரம்ப நேரம்</label>
                <input
                  type="text"
                  value={form.startTime}
                  onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                  placeholder="09:30 AM"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">முடிவு நேரம்</label>
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
                <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">பொறுப்பாளர்</label>
                <input
                  type="text"
                  value={form.coordinator}
                  onChange={(e) => setForm({ ...form, coordinator: e.target.value })}
                  placeholder="Bro. Stephen"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">எதிர்பார்க்கும் நபர்கள்</label>
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
              <span>Audio / Sound Console & Media புரொஜெக்ஷன் தேவை</span>
            </label>

            <button
              type="submit"
              className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs transition active:scale-95 cursor-pointer shadow-lg shadow-cyan-500/20"
            >
              அரங்கை முன்பதிவு செய்
            </button>
          </form>
        </div>

        {/* வலதுபுறம்: முன்பதிவு பட்டியல் */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-2 text-xs">
            <span className="font-bold text-white uppercase tracking-wider">
              திட்டமிடப்பட்ட கூட்டங்கள் & அரங்குகள் ({filteredEvents.length})
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setSelectedHall('ALL')}
                className={`px-2 py-0.5 rounded-md text-[10px] ${selectedHall === 'ALL' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400'}`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedHall('MAIN_SANCTUARY')}
                className={`px-2 py-0.5 rounded-md text-[10px] ${selectedHall === 'MAIN_SANCTUARY' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400'}`}
              >
                Main Hall
              </button>
            </div>
          </div>

          <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
            {filteredEvents.length === 0 ? (
              <div className="p-8 text-center text-slate-500 font-mono text-xs">
                எந்த நிகழ்வும் இந்த வடிகட்டலில் பொருந்தவில்லை.
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
                        ஒருங்கிணைப்பாளர்: <strong className="text-slate-100">{evt.coordinator || 'Church Team'}</strong>
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-mono text-amber-300 font-bold block">
                        {evt.expectedAttendees} Attendees
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
                        ✓ Audio & Media Assigned
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