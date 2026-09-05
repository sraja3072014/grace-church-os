import React, { useState, useMemo } from 'react';
import { 
  Calendar, Plus, Clock, MapPin, 
  Sparkles, CheckCircle2, Mic, X, Search, Users
} from 'lucide-react';

const SEED_EVENTS = [
  {
    id: 'EVT-201',
    title: 'Annual Youth Revival Camp 2026',
    category: 'Youth',
    date: '2026-09-15',
    time: '09:00 AM - 05:00 PM',
    venue: 'Main Cathedral Auditorium',
    speaker: 'Rev. David Paul (Guest Speaker)',
    expectedAttendance: 250,
    registeredCount: 184,
    status: 'Upcoming',
    description: 'A special full-day spiritual revival and career guidance summit for young adults.'
  },
  {
    id: 'EVT-202',
    title: 'Water Baptism & Dedication Service',
    category: 'Baptism',
    date: '2026-09-30',
    time: '06:00 AM - 08:30 AM',
    venue: 'Bethesda Prayer Pool Campus',
    speaker: 'Senior Pastor',
    expectedAttendance: 120,
    registeredCount: 95,
    status: 'Upcoming',
    description: 'Baptism service followed by holy communion and breakfast fellowship.'
  }
];

export default function EventsHub({ session }) {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // 🌟 பாதுகாப்பான டேட்டா லோடிங்: காலியாக இருந்தால் டீஃபால்ட் டேட்டா லோட் ஆகும்
  const [events, setEvents] = useState(() => {
    try {
      const saved = localStorage.getItem('app_events_database');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
      localStorage.setItem('app_events_database', JSON.stringify(SEED_EVENTS));
      return SEED_EVENTS;
    } catch {
      return SEED_EVENTS;
    }
  });

  const [eventForm, setEventForm] = useState({
    title: '',
    category: 'Special Service',
    date: '',
    time: '',
    venue: '',
    speaker: '',
    expectedAttendance: '',
    description: ''
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleSaveEvent = (e) => {
    e.preventDefault();
    if (!eventForm.title.trim() || !eventForm.date) return;

    const newEvent = {
      id: `EVT-${Date.now().toString().slice(-4)}`,
      ...eventForm,
      expectedAttendance: Number(eventForm.expectedAttendance) || 50,
      registeredCount: 0,
      status: 'Upcoming'
    };

    const updated = [newEvent, ...events];
    setEvents(updated);
    localStorage.setItem('app_events_database', JSON.stringify(updated));
    setIsCreateModalOpen(false);
    setEventForm({
      title: '',
      category: 'Special Service',
      date: '',
      time: '',
      venue: '',
      speaker: '',
      expectedAttendance: '',
      description: ''
    });
    showToast('New event scheduled successfully!');
  };

  const categories = ['ALL', 'Special Service', 'Youth', 'Kids', 'Baptism', 'Prayer'];

  const filteredEvents = useMemo(() => {
    return (events || []).filter(evt => {
      const matchesCategory = selectedCategory === 'ALL' || evt.category === selectedCategory;
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        (evt.title || '').toLowerCase().includes(q) || 
        (evt.venue || '').toLowerCase().includes(q) ||
        (evt.speaker || '').toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [events, selectedCategory, searchQuery]);

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
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
              <Sparkles size={12} className="text-amber-400" />
              Ministry Schedule & Calendar
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Calendar className="text-amber-400" size={24} />
            <span>Events & Special Gatherings Hub</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Plan special worship conventions, youth retreats, water baptism dates, and monitor registrations.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-5 py-2.5 bg-gradient-to-r from-rose-500 to-amber-600 hover:from-rose-400 hover:to-amber-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-500/20 flex items-center gap-2 cursor-pointer active:scale-98 transition shrink-0"
        >
          <Plus size={15} />
          <span>Schedule New Event</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input
            type="text"
            placeholder="Search by event, speaker, or venue..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950/80 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                selectedCategory === cat ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Events Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
        {filteredEvents.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-500 text-xs italic bg-slate-900/40 border border-white/5 rounded-2xl">
            No events scheduled under this filter.
          </div>
        ) : (
          filteredEvents.map((evt) => {
            const isCompleted = evt.status === 'Completed';
            const progressPercent = evt.expectedAttendance > 0 
              ? Math.min(100, Math.round((evt.registeredCount / evt.expectedAttendance) * 100)) 
              : 0;

            return (
              <div 
                key={evt.id} 
                className="p-5 rounded-3xl win11-card border border-white/10 hover:border-amber-500/40 transition flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-bold uppercase">
                      {evt.category}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isCompleted ? 'bg-slate-800 text-slate-400 border-white/10' : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    }`}>
                      {evt.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-white text-sm">{evt.title}</h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">{evt.description}</p>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-white/5 font-medium">
                    <div className="flex items-center gap-2">
                      <Clock size={13} className="text-amber-400" />
                      <span>{evt.date} • {evt.time || 'All Day'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={13} className="text-rose-400" />
                      <span className="truncate">{evt.venue || 'Main Campus'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mic size={13} className="text-sky-400" />
                      <span className="truncate">{evt.speaker || 'Pastoral Team'}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-white/5">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Users size={12} /> Expected RSVPs
                    </span>
                    <span className="text-white font-mono font-bold">{evt.registeredCount} / {evt.expectedAttendance}</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden p-0.5 border border-white/5">
                    <div 
                      className="bg-gradient-to-r from-amber-500 to-rose-500 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Schedule Event Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg p-6 rounded-3xl win11-card border border-white/20 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Calendar className="text-amber-400" size={16} />
                <span>Schedule New Church Event</span>
              </h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-3.5">
              <div>
                <label className="text-xs text-slate-300 font-medium">Event Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Annual Youth Revival Convention"
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:outline-none focus:border-amber-400 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 font-medium">Category</label>
                  <select
                    value={eventForm.category}
                    onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}
                    className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:outline-none cursor-pointer font-bold"
                  >
                    <option value="Special Service">Special Service</option>
                    <option value="Youth">Youth Ministry</option>
                    <option value="Kids">Kids / VBS</option>
                    <option value="Baptism">Water Baptism</option>
                    <option value="Prayer">Fasting & Night Vigil</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-300 font-medium">Event Date *</label>
                  <input
                    type="date"
                    required
                    value={eventForm.date}
                    onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                    className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 font-medium">Timing (e.g. 06:00 PM)</label>
                  <input
                    type="text"
                    placeholder="06:00 PM - 09:00 PM"
                    value={eventForm.time}
                    onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                    className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 font-medium">Expected Headcount</label>
                  <input
                    type="number"
                    placeholder="250"
                    value={eventForm.expectedAttendance}
                    onChange={(e) => setEventForm({ ...eventForm, expectedAttendance: e.target.value })}
                    className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium">Venue / Campus Location</label>
                <input
                  type="text"
                  placeholder="e.g. Main Cathedral Sanctuary"
                  value={eventForm.venue}
                  onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })}
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium">Main Minister / Guest Speaker</label>
                <input
                  type="text"
                  placeholder="e.g. Senior Pastor & Pastoral Team"
                  value={eventForm.speaker}
                  onChange={(e) => setEventForm({ ...eventForm, speaker: e.target.value })}
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-rose-500 to-amber-600 text-white rounded-xl text-xs font-bold cursor-pointer shadow-lg shadow-rose-500/20"
                >
                  Publish Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}