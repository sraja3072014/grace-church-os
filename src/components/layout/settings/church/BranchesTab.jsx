import React, { useState } from 'react';
import { GitBranch, Plus, MapPin, Phone, UserCheck } from 'lucide-react';

export default function BranchesTab() {
  const [branches] = useState([
    { id: 1, name: 'Grace City Church (Main Campus)', code: 'GCC-MAIN', pastor: 'Senior Pastor', location: 'City Center', members: 1850 },
    { id: 2, name: 'Grace North Campus', code: 'GCC-NORTH', pastor: 'Pastor David', location: 'North Extension', members: 540 },
    { id: 3, name: 'Grace East Chapel', code: 'GCC-EAST', pastor: 'Pastor Timothy', location: 'East Bypass', members: 450 },
  ]);

  return (
    <div className="flex flex-col gap-5 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-white">Active Church Branches</h4>
          <p className="text-xs text-slate-400">Manage multi-campus network data and pastoral leadership.</p>
        </div>
        <button className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/30 text-xs font-bold transition active:scale-95">
          <Plus size={15} /> Add New Branch
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {branches.map(branch => (
          <div key={branch.id} className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex flex-col justify-between gap-4 hover:border-cyan-500/30 transition">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 text-[10px] font-mono font-bold border border-cyan-500/20">
                  {branch.code}
                </span>
                <span className="text-[11px] text-slate-400 font-semibold">{branch.members} Members</span>
              </div>
              <h5 className="text-sm font-bold text-slate-100">{branch.name}</h5>
              
              <div className="flex flex-col gap-1 text-[11px] text-slate-400 mt-1">
                <span className="flex items-center gap-1.5"><UserCheck size={13} className="text-indigo-400" /> {branch.pastor}</span>
                <span className="flex items-center gap-1.5"><MapPin size={13} className="text-rose-400" /> {branch.location}</span>
              </div>
            </div>

            <button className="w-full py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 text-xs font-medium transition">
              Edit Branch Config
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}