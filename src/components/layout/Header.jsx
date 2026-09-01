import React, { useState, useEffect } from 'react';
import { Bell, Flame } from 'lucide-react';

export default function Header() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-16 classic-glass-header px-6 flex items-center justify-between gap-4 shrink-0 select-none z-10 w-full">
      
      {/* Brand Title */}
      <div className="shrink-0 flex items-center gap-3">
        <div className="flex flex-col">
          <h1 className="text-sm md:text-base font-black text-white tracking-wide flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse shadow-lg shadow-orange-500/80"></span>
            GRACE CHURCH NETWORK
          </h1>
          <p className="text-[10px] text-orange-200/60 font-medium">Sunset Core System</p>
        </div>
      </div>

      {/* Ticker Notice */}
      <div className="flex-1 max-w-xl mx-2 overflow-hidden rounded-full bg-black/30 border border-orange-500/20 px-4 py-1.5 flex items-center gap-3">
        <span className="shrink-0 px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-300 text-[10px] font-semibold flex items-center gap-1.5 border border-orange-500/30">
          <Flame size={12} className="text-orange-400" /> NOTICE
        </span>
        <div className="w-full overflow-hidden whitespace-nowrap">
          <p className="inline-block animate-marquee text-xs text-orange-100/80 tracking-wide font-normal">
            Sunday Service begins at 08:30 AM • Annual General Body Meeting scheduled for next Sunday • Member Directory updated.
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4 shrink-0">
        <div className="text-right hidden sm:block border-r border-orange-500/20 pr-4">
          <p className="text-xs md:text-sm font-bold tracking-wider text-orange-100 font-mono">
            {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
          </p>
          <p className="text-[10px] text-orange-300/60 font-medium">
            {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        <div className="flex items-center gap-2.5 bg-orange-500/10 hover:bg-orange-500/20 transition p-1 pr-3 rounded-full border border-orange-500/20 cursor-pointer">
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-600 flex items-center justify-center font-bold text-[11px] text-white shadow-md shadow-orange-500/30">
            AD
          </div>
          <div className="text-left leading-tight hidden md:block">
            <p className="text-xs font-semibold text-orange-100">System Admin</p>
            <p className="text-[9px] text-amber-400 font-medium">Active</p>
          </div>
        </div>
      </div>

    </header>
  );
}