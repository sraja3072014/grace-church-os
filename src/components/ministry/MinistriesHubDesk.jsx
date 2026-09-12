import React, { useState } from 'react';
import CottagePrayerDesk from './CottagePrayerDesk';
import SundayRosterDesk from './SundayRosterDesk';
import OrdinanceRegistryDesk from './OrdinanceRegistryDesk';

export default function MinistriesHubDesk({ session }) {
  const [activeSubTab, setActiveSubTab] = useState('cottage_prayer');

  const tabClass = (tab) => `px-4 py-2 rounded-xl flex items-center gap-2 transition cursor-pointer text-xs font-bold ${
    activeSubTab === tab
      ? 'bg-white/10 text-white border border-white/10'
      : 'text-slate-400 hover:text-white'
  }`;

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div>
          <h2 className="text-xl font-black text-white">Ministry Operations Hub</h2>
          <p className="text-xs text-slate-400 mt-0.5">Coordinate home prayer visits and Sunday worship assignments.</p>
        </div>

        <div className="flex items-center gap-1.5 rounded-2xl bg-slate-900 p-1 border border-white/10">
          <button
            type="button"
            onClick={() => setActiveSubTab('cottage_prayer')}
            className={tabClass('cottage_prayer')}
          >
            Cottage Prayer &amp; Home Visits
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('sunday_roster')}
            className={tabClass('sunday_roster')}
          >
            Sunday Worship Roster
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('sacred_ordinances')}
            className={tabClass('sacred_ordinances')}
          >
            Baptism &amp; Matrimony Registry
          </button>
        </div>
      </div>

      {activeSubTab === 'cottage_prayer' && <CottagePrayerDesk session={session} />}
      {activeSubTab === 'sunday_roster' && <SundayRosterDesk session={session} />}
      {activeSubTab === 'sacred_ordinances' && <OrdinanceRegistryDesk session={session} />}
    </div>
  );
}