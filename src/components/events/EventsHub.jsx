import React, { useState } from 'react';
import EventsHubDesk from './EventsHubDesk';
import ServiceRosterDesk from './ServiceRosterDesk';
import SanctuaryEventBookingDesk from './SanctuaryEventBookingDesk';

export default function EventsHub({ session }) {
  const [activeSubTab, setActiveSubTab] = useState('events');

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-black/30 rounded-2xl border border-white/10 w-fit">
        <button
          type="button"
          onClick={() => setActiveSubTab('events')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeSubTab === 'events'
              ? 'bg-cyan-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Church Events
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('roster')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeSubTab === 'roster'
              ? 'bg-emerald-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Sunday Service Roster
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('space_booking')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeSubTab === 'space_booking'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Facility &amp; Sanctuary Scheduler
        </button>
      </div>

      {activeSubTab === 'events' && <EventsHubDesk />}
      {activeSubTab === 'roster' && <ServiceRosterDesk session={session} />}
      {activeSubTab === 'space_booking' && <SanctuaryEventBookingDesk session={session} />}
    </div>
  );
}