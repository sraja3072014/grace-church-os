// src/components/ministry/AreaCottageVisitDesk.jsx
// ============================================================
// Area-Wise Cluster / Circuit Pastoral Visit & Cottage Prayer Desk
// ============================================================

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Home, MapPin, Navigation, Calendar, 
  CheckCircle2, Clock, Users, Search, Phone, 
  Plus, Trash2, Shield, Sparkles, Check, 
  X, Filter, ChevronRight, AlertCircle, Compass, 
  FileText, ExternalLink, RefreshCw, BarChart3, UserCheck
} from 'lucide-react';
import { soundFX } from '../../utils/audioEngine';
import { getVaultData } from '../../utils/vaultStore';
import { 
  fetchAreaCircuits, 
  saveAreaCircuit, 
  updateCircuitFamilyStatus, 
  deleteAreaCircuit, 
  calculateCoverage 
} from '../../utils/cottageCircuitService';

export default function AreaCottageVisitDesk({ session }) {
  const [circuits, setCircuits] = useState([]);
  const [families, setFamilies] = useState([]);
  const [selectedAreaTab, setSelectedAreaTab] = useState('ALL');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [activeView, setActiveView] = useState('EXECUTION'); // 'EXECUTION' | 'SCHEDULE' | 'HISTORY'
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Scheduling Form State
  const [newCircuitForm, setNewCircuitForm] = useState({
    scheduled_date: new Date().toISOString().slice(0, 10),
    time_slot: '07:00 PM',
    area_name: '',
    host_family_id: '',
    assigned_leader: session?.username || 'Senior Pastor',
    summary_notes: '',
    includedFamilyIds: [] // IDs of families selected to visit
  });

  // Load families and circuits
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [dbFamilies, dbCircuits] = await Promise.all([
          getVaultData('members', []),
          fetchAreaCircuits()
        ]);
        setFamilies(Array.isArray(dbFamilies) ? dbFamilies : []);
        setCircuits(Array.isArray(dbCircuits) ? dbCircuits : []);
      } catch (err) {
        console.error('[AreaCottageVisitDesk] Load error:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Distinct Area List dynamically generated from members' `area`
  const dynamicAreas = useMemo(() => {
    const counts = {};
    families.forEach(f => {
      const area = (f.area || '').trim();
      if (area) {
        counts[area] = (counts[area] || 0) + 1;
      }
    });

    // Provide default areas if database is sparse
    if (Object.keys(counts).length === 0) {
      counts['Koduvai'] = 4;
      counts['Tiruppur - PN Road'] = 6;
      counts['Avinashi Road'] = 3;
      counts['City Center'] = 2;
    }

    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [families]);

  // When area changes in the new circuit form, auto-select all families belonging to that area
  const areaFamilies = useMemo(() => {
    if (!newCircuitForm.area_name) return [];
    return families.filter(f => (f.area || '').trim().toLowerCase() === newCircuitForm.area_name.trim().toLowerCase());
  }, [families, newCircuitForm.area_name]);

  const handleAreaSelectChange = (area) => {
    const matchingFamilies = families.filter(f => (f.area || '').trim().toLowerCase() === area.trim().toLowerCase());
    setNewCircuitForm(prev => ({
      ...prev,
      area_name: area,
      host_family_id: matchingFamilies[0]?.familyId || '',
      includedFamilyIds: matchingFamilies.map(f => f.familyId)
    }));
  };

  // Toggle family inclusion in the new circuit checklist
  const toggleIncludeFamily = (familyId) => {
    setNewCircuitForm(prev => {
      const exists = prev.includedFamilyIds.includes(familyId);
      return {
        ...prev,
        includedFamilyIds: exists 
          ? prev.includedFamilyIds.filter(id => id !== familyId)
          : [...prev.includedFamilyIds, familyId]
      };
    });
  };

  // Create new Area Circuit
  const handleCreateCircuit = async (e) => {
    e.preventDefault();
    if (!newCircuitForm.area_name) {
      alert('Please select an Area / Zone for this circuit.');
      return;
    }
    if (newCircuitForm.includedFamilyIds.length === 0) {
      alert('Please include at least one family in this circuit itinerary.');
      return;
    }

    soundFX?.playSuccessChime?.();

    const hostFamily = families.find(f => f.familyId === newCircuitForm.host_family_id);

    // Build target family checklist records
    const targetFamilies = families
      .filter(f => newCircuitForm.includedFamilyIds.includes(f.familyId))
      .map(f => ({
        family_id: f.familyId,
        family_name: f.familyName || `${f.headMember?.name || 'Believer'} Household`,
        head_name: f.headMember?.name || f.familyName || 'Family Head',
        phone: f.headMember?.phone || f.phone || '',
        address: f.address || f.headMember?.address || 'Address pending',
        maps_url: f.maps_url || f.headMember?.maps_url || f.mapLink || '',
        latitude: f.latitude || f.headMember?.latitude || null,
        longitude: f.longitude || f.headMember?.longitude || null,
        status: 'SCHEDULED',
        prayer_notes: '',
        visited_at: null,
        is_host: f.familyId === newCircuitForm.host_family_id
      }));

    const circuitPayload = {
      scheduled_date: newCircuitForm.scheduled_date,
      time_slot: newCircuitForm.time_slot,
      area_name: newCircuitForm.area_name,
      host_family_id: newCircuitForm.host_family_id || (targetFamilies[0]?.family_id || ''),
      host_family_name: hostFamily?.familyName || targetFamilies[0]?.family_name || 'Host Household',
      assigned_leader: newCircuitForm.assigned_leader || 'Senior Pastor',
      summary_notes: newCircuitForm.summary_notes,
      target_family_ids: targetFamilies,
      status: 'IN_PROGRESS'
    };

    const saved = await saveAreaCircuit(circuitPayload);
    setCircuits(prev => [saved, ...prev.filter(c => c.id !== saved.id)]);
    showToast(`✓ Area Circuit for ${newCircuitForm.area_name} (${targetFamilies.length} Families) scheduled!`);
    
    // Switch to Execution View to immediately view the route
    setActiveView('EXECUTION');
    setSelectedDate(newCircuitForm.scheduled_date);
    setSelectedAreaTab(newCircuitForm.area_name);
  };

  // Toggle family status in active circuit
  const handleToggleFamilyStatus = async (circuitId, familyId, targetStatus) => {
    soundFX?.playClickPop?.();
    const updated = await updateCircuitFamilyStatus({
      circuitId,
      familyId,
      status: targetStatus,
      leaderName: session?.username || 'Senior Pastor'
    });

    if (updated) {
      setCircuits(prev => prev.map(c => c.id === circuitId ? updated : c));
      if (targetStatus === 'VISITED') {
        soundFX?.playSuccessChime?.();
        showToast('✓ Family marked as Visited & logged to Pastoral History!');
      } else if (targetStatus === 'ABSENT') {
        showToast('Marked as Absent / Skipped.');
      } else {
        showToast('Status reset to Scheduled.');
      }
    }
  };

  // Save quick prayer note
  const handleSavePrayerNote = async (circuitId, familyId, note) => {
    const targetCircuit = circuits.find(c => c.id === circuitId);
    if (!targetCircuit) return;
    const targetFam = (targetCircuit.target_family_ids || []).find(f => f.family_id === familyId);
    if (!targetFam) return;

    await updateCircuitFamilyStatus({
      circuitId,
      familyId,
      status: targetFam.status,
      prayerNotes: note,
      visitedAt: targetFam.visited_at,
      leaderName: targetCircuit.assigned_leader
    });

    setCircuits(prev => prev.map(c => {
      if (c.id === circuitId) {
        return {
          ...c,
          target_family_ids: c.target_family_ids.map(f => f.family_id === familyId ? { ...f, prayer_notes: note } : f)
        };
      }
      return c;
    }));
    showToast('Prayer request saved.');
  };

  // Delete circuit
  const handleDeleteCircuit = async (circuitId) => {
    if (!window.confirm('Delete this entire area circuit itinerary?')) return;
    soundFX?.playClickPop?.();
    await deleteAreaCircuit(circuitId);
    setCircuits(prev => prev.filter(c => c.id !== circuitId));
    showToast('Circuit itinerary deleted.');
  };

  // Filtered circuits based on Date and Area Tab
  const filteredCircuits = useMemo(() => {
    return circuits.filter(c => {
      const matchDate = !selectedDate || c.scheduled_date === selectedDate;
      const matchArea = selectedAreaTab === 'ALL' || (c.area_name || '').toLowerCase() === selectedAreaTab.toLowerCase();
      const matchSearch = !searchQuery 
        || (c.area_name || '').toLowerCase().includes(searchQuery.toLowerCase())
        || (c.assigned_leader || '').toLowerCase().includes(searchQuery.toLowerCase())
        || (c.target_family_ids || []).some(f => (f.family_name || '').toLowerCase().includes(searchQuery.toLowerCase()) || (f.head_name || '').toLowerCase().includes(searchQuery.toLowerCase()));
      return matchDate && matchArea && matchSearch;
    });
  }, [circuits, selectedDate, selectedAreaTab, searchQuery]);

  // Overall Coverage metric for current view
  const overallCoverage = useMemo(() => {
    let totalTarget = 0;
    let totalVisited = 0;
    filteredCircuits.forEach(c => {
      (c.target_family_ids || []).forEach(f => {
        totalTarget += 1;
        if (f.status === 'VISITED') totalVisited += 1;
      });
    });
    const percentage = totalTarget > 0 ? Math.round((totalVisited / totalTarget) * 100) : 0;
    return { totalTarget, totalVisited, percentage };
  }, [filteredCircuits]);

  // Helper for Google Maps URL
  const getMapsUrl = (family) => {
    if (family.maps_url) return family.maps_url;
    if (family.latitude && family.longitude) {
      return `https://www.google.com/maps/dir/?api=1&destination=${family.latitude},${family.longitude}`;
    }
    const query = [family.address, family.area_name || family.area].filter(Boolean).join(', ');
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query || family.family_name || 'Church Member')}`;
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto select-none text-slate-200 animate-in fade-in duration-200 pb-16">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs px-4 py-2.5 rounded-2xl flex items-center gap-2 backdrop-blur-md shadow-2xl z-50 animate-in fade-in">
          <CheckCircle2 size={16} className="text-cyan-400" />
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* 🌟 1. Top Header & Operational Mode Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/10">
              <Compass size={22} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <span>Area-Wise Pastoral Circuit &amp; Cottage Visit Desk</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Territory-based family cluster visitations, pastoral coverage tracking &amp; Google Maps GPS dispatch.
              </p>
            </div>
          </div>
        </div>

        {/* View Switcher Chips */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900 border border-white/10">
          <button
            type="button"
            onClick={() => setActiveView('EXECUTION')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
              activeView === 'EXECUTION'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Navigation size={14} />
            <span>Active Circuit Route</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveView('SCHEDULE');
              if (dynamicAreas.length > 0 && !newCircuitForm.area_name) {
                handleAreaSelectChange(dynamicAreas[0].name);
              }
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
              activeView === 'SCHEDULE'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Plus size={14} />
            <span>+ Schedule Area Circuit</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('HISTORY')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
              activeView === 'HISTORY'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText size={14} />
            <span>Coverage Logs</span>
          </button>
        </div>
      </div>

      {/* 🌟 2. Quick Filter Bar: Date & Dynamic Area Badges */}
      <div className="p-4 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-md space-y-3 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Quick Date Selector */}
          <div className="flex items-center gap-2">
            <Calendar size={15} className="text-cyan-400" />
            <span className="text-xs font-bold text-slate-300">Visit Date:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-cyan-300 font-mono font-bold focus:outline-none focus:border-cyan-400 cursor-pointer"
            />
            {selectedDate && (
              <button
                type="button"
                onClick={() => setSelectedDate('')}
                className="text-[10px] text-slate-400 hover:text-white underline cursor-pointer"
              >
                Clear Date
              </button>
            )}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
            <input
              type="text"
              placeholder="Search family, area, or leader..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        {/* Dynamic Area Grouping Badges Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-white/5">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-1">
            <MapPin size={12} className="text-rose-400" /> Territory:
          </span>

          <button
            type="button"
            onClick={() => setSelectedAreaTab('ALL')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              selectedAreaTab === 'ALL'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            <span>All Areas</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-black/30">
              {circuits.length}
            </span>
          </button>

          {dynamicAreas.map((area) => (
            <button
              key={area.name}
              type="button"
              onClick={() => setSelectedAreaTab(area.name)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                selectedAreaTab === area.name
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 font-black'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              <span>{area.name}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-black/30">
                {area.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 🌟 3. Coverage Analytics Header Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 rounded-3xl bg-slate-900 border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Territory Coverage</span>
            <div className="text-2xl font-black text-cyan-400 font-mono mt-0.5">
              {overallCoverage.percentage}%
            </div>
            <span className="text-[10px] text-slate-400">
              {overallCoverage.totalVisited} of {overallCoverage.totalTarget} Families Covered
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-300">
            <BarChart3 size={24} />
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-slate-900 border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Circuits Scheduled</span>
            <div className="text-2xl font-black text-white font-mono mt-0.5">
              {filteredCircuits.length}
            </div>
            <span className="text-[10px] text-slate-400">Area Cluster Routes</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-300">
            <Compass size={24} />
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-slate-900 border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Registered Households</span>
            <div className="text-2xl font-black text-emerald-400 font-mono mt-0.5">
              {families.length}
            </div>
            <span className="text-[10px] text-slate-400">Total Church Congregation</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-300">
            <Home size={24} />
          </div>
        </div>
      </div>

      {/* 🌟 4. VIEW: SCHEDULE NEW AREA CIRCUIT */}
      {activeView === 'SCHEDULE' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-white/10 space-y-6 shadow-2xl animate-in fade-in">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus size={18} className="text-cyan-400" />
                <span>Schedule New Area-Wise Cluster Visit</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Select an area to auto-populate all member families into a circuit itinerary checklist.
              </p>
            </div>
          </div>

          <form onSubmit={handleCreateCircuit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* 1. Date */}
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1.5">
                  Scheduled Date *
                </label>
                <input
                  type="date"
                  required
                  value={newCircuitForm.scheduled_date}
                  onChange={(e) => setNewCircuitForm({ ...newCircuitForm, scheduled_date: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* 2. Time Slot */}
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1.5">
                  Time Slot *
                </label>
                <input
                  type="text"
                  required
                  placeholder="07:00 PM"
                  value={newCircuitForm.time_slot}
                  onChange={(e) => setNewCircuitForm({ ...newCircuitForm, time_slot: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* 3. Area / Zone Dropdown */}
              <div>
                <label className="text-[10px] text-cyan-400 uppercase font-mono font-bold block mb-1.5">
                  Area / Zone Territory *
                </label>
                <select
                  required
                  value={newCircuitForm.area_name}
                  onChange={(e) => handleAreaSelectChange(e.target.value)}
                  className="w-full bg-slate-950 border border-cyan-500/40 rounded-xl px-3 py-2 text-xs text-cyan-300 font-bold focus:outline-none focus:border-cyan-400 cursor-pointer"
                >
                  <option value="">-- Choose Territory / Area --</option>
                  {dynamicAreas.map((a) => (
                    <option key={a.name} value={a.name}>
                      {a.name} ({a.count} Registered Families)
                    </option>
                  ))}
                </select>
              </div>

              {/* 4. Assigned Shepherd / Minister */}
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1.5">
                  Assigned Minister / Leader
                </label>
                <input
                  type="text"
                  placeholder="Senior Pastor / Leader Name"
                  value={newCircuitForm.assigned_leader}
                  onChange={(e) => setNewCircuitForm({ ...newCircuitForm, assigned_leader: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            {/* Central Host Household Selection */}
            {newCircuitForm.area_name && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-950/70 border border-white/5">
                <div>
                  <label className="text-[10px] text-amber-300 uppercase font-mono font-bold block mb-1.5 flex items-center gap-1.5">
                    <Home size={13} />
                    <span>Central Cottage Host Household (Main Gathering Point)</span>
                  </label>
                  <select
                    value={newCircuitForm.host_family_id}
                    onChange={(e) => setNewCircuitForm({ ...newCircuitForm, host_family_id: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    <option value="">-- Select Host Family in {newCircuitForm.area_name} --</option>
                    {areaFamilies.map((fam) => (
                      <option key={fam.familyId} value={fam.familyId}>
                        {fam.familyName} (Head: {fam.headMember?.name || fam.familyName})
                      </option>
                    ))}
                    {/* Fallback to other families if host is outside area */}
                    {families
                      .filter(f => (f.area || '').toLowerCase() !== newCircuitForm.area_name.toLowerCase())
                      .map(fam => (
                        <option key={fam.familyId} value={fam.familyId}>
                          {fam.familyName} ({fam.area || 'Other Area'})
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1.5">
                    Pastoral Target / Circuit Notes
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Focus on sick prayer, family blessing & youth guidance"
                    value={newCircuitForm.summary_notes}
                    onChange={(e) => setNewCircuitForm({ ...newCircuitForm, summary_notes: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>
            )}

            {/* Dynamic Family Checklist Preview */}
            {newCircuitForm.area_name && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Users size={14} className="text-cyan-400" />
                    <span>
                      Dynamic Area Checklist for "{newCircuitForm.area_name}" ({areaFamilies.length} Households)
                    </span>
                  </h4>
                  <span className="text-[11px] font-mono text-cyan-300">
                    {newCircuitForm.includedFamilyIds.length} Selected to Visit
                  </span>
                </div>

                {areaFamilies.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-slate-950 border border-white/5 text-center text-xs text-slate-500 font-mono">
                    No church families registered specifically under "{newCircuitForm.area_name}". You can still create the circuit.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
                    {areaFamilies.map((fam) => {
                      const isIncluded = newCircuitForm.includedFamilyIds.includes(fam.familyId);
                      const isHost = fam.familyId === newCircuitForm.host_family_id;
                      return (
                        <div
                          key={fam.familyId}
                          onClick={() => toggleIncludeFamily(fam.familyId)}
                          className={`p-3 rounded-2xl border transition cursor-pointer flex items-start gap-3 ${
                            isIncluded
                              ? 'bg-slate-950 border-cyan-500/40 shadow-md'
                              : 'bg-slate-950/40 border-white/5 opacity-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isIncluded}
                            onChange={() => {}} // handled by parent div
                            className="mt-1 accent-cyan-400 cursor-pointer"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white truncate">
                                {fam.familyName}
                              </span>
                              {isHost && (
                                <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                                  Main Host
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              Head: <strong className="text-slate-300">{fam.headMember?.name || fam.familyName}</strong> • ID: {fam.familyId}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate mt-0.5">
                              📍 {fam.address || 'Address not listed'}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setActiveView('EXECUTION')}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-cyan-500/20 transition active:scale-95 cursor-pointer flex items-center gap-2"
              >
                <CheckCircle2 size={15} />
                <span>Save &amp; Generate Area Circuit Route</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 🌟 5. VIEW: ACTIVE CIRCUIT ROUTE & EXECUTION */}
      {activeView === 'EXECUTION' && (
        <div className="space-y-6">
          {filteredCircuits.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-slate-900 border border-white/10 space-y-3">
              <Compass size={36} className="mx-auto text-slate-600" />
              <h4 className="text-base font-bold text-white">No Pastoral Circuits Scheduled</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                No active area visitation circuits found for the selected date or area filter.
              </p>
              <button
                type="button"
                onClick={() => {
                  setActiveView('SCHEDULE');
                  if (dynamicAreas.length > 0 && !newCircuitForm.area_name) {
                    handleAreaSelectChange(dynamicAreas[0].name);
                  }
                }}
                className="mt-2 px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-xl text-xs transition cursor-pointer"
              >
                + Schedule Territory Visit Now
              </button>
            </div>
          ) : (
            filteredCircuits.map((circuit) => {
              const targets = circuit.target_family_ids || [];
              const visitedCount = targets.filter(f => f.status === 'VISITED').length;
              const coverage = calculateCoverage(targets);

              return (
                <div
                  key={circuit.id}
                  className="p-5 rounded-3xl bg-slate-900 border border-white/10 space-y-5 shadow-2xl backdrop-blur-md"
                >
                  {/* Circuit Header Strip */}
                  <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-black text-white flex items-center gap-1.5">
                          <MapPin size={16} className="text-cyan-400" />
                          <span>{circuit.area_name} Pastoral Circuit</span>
                        </span>
                        <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
                          {circuit.time_slot || '07:00 PM'}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          Date: {circuit.scheduled_date}
                        </span>
                      </div>

                      <div className="text-xs text-slate-300 mt-1.5 flex flex-wrap items-center gap-3">
                        <span>
                          🏠 Main Cottage Gathering: <strong className="text-amber-300">{circuit.host_family_name || 'Central Residence'}</strong>
                        </span>
                        <span>•</span>
                        <span>
                          Shepherd: <strong className="text-slate-200">{circuit.assigned_leader || 'Senior Pastor'}</strong>
                        </span>
                      </div>

                      {circuit.summary_notes && (
                        <p className="text-[11px] text-slate-400 mt-1 italic">
                          Target: {circuit.summary_notes}
                        </p>
                      )}
                    </div>

                    {/* Circuit Coverage Widget & Actions */}
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <span className="text-xs font-mono font-bold text-white">
                            {visitedCount} / {targets.length} Visited
                          </span>
                          <span className={`text-xs font-mono font-black px-2 py-0.5 rounded-lg ${
                            coverage === 100 
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                              : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                          }`}>
                            {coverage}% Coverage
                          </span>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-36 h-2 rounded-full bg-slate-950 border border-white/5 overflow-hidden mt-1.5 ml-auto">
                          <div 
                            className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-300"
                            style={{ width: `${coverage}%` }}
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteCircuit(circuit.id)}
                        className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-white/5 transition cursor-pointer"
                        title="Delete Circuit"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Dynamic Family Checklist Cards (Mobile-first responsive) */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <Users size={14} className="text-cyan-400" />
                      <span>Territory Household Itinerary Checklist ({targets.length} Homes)</span>
                    </h4>

                    <div className="grid grid-cols-1 gap-3">
                      {targets.map((fam) => {
                        const isVisited = fam.status === 'VISITED';
                        const isAbsent = fam.status === 'ABSENT';
                        const mapsUrl = getMapsUrl(fam);

                        return (
                          <div
                            key={fam.family_id}
                            className={`p-4 rounded-2xl border transition space-y-3 ${
                              isVisited
                                ? 'bg-slate-950/70 border-emerald-500/30 shadow-lg shadow-emerald-500/5'
                                : isAbsent
                                ? 'bg-slate-950/40 border-rose-500/20 opacity-75'
                                : 'bg-slate-950 border-white/10 hover:border-cyan-500/30'
                            }`}
                          >
                            {/* Card Row Top: Details & Quick Actions */}
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <h5 className="text-sm font-bold text-white">
                                    {fam.family_name || fam.head_name}
                                  </h5>
                                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10">
                                    {fam.family_id}
                                  </span>
                                  {fam.is_host && (
                                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                                      <Home size={10} /> Main Host Home
                                    </span>
                                  )}
                                  {isVisited && (
                                    <span className="text-[10px] font-mono font-bold text-emerald-400 flex items-center gap-1">
                                      <CheckCircle2 size={12} /> Visited at {fam.visited_at || 'Recorded'}
                                    </span>
                                  )}
                                </div>

                                <p className="text-xs text-slate-300 mt-1 flex items-center gap-1.5">
                                  <MapPin size={12} className="text-rose-400 shrink-0" />
                                  <span>{fam.address || 'Address pending'}</span>
                                </p>
                              </div>

                              {/* Action Buttons: Call & Navigate */}
                              <div className="flex flex-wrap items-center gap-2">
                                {fam.phone ? (
                                  <a
                                    href={`tel:${fam.phone}`}
                                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white border border-white/10 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition active:scale-95"
                                  >
                                    <Phone size={12} className="text-emerald-400" />
                                    <span>Call ({fam.phone})</span>
                                  </a>
                                ) : (
                                  <span className="text-[10px] text-slate-500 font-mono">No phone</span>
                                )}

                                <a
                                  href={mapsUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition active:scale-95"
                                >
                                  <Navigation size={12} />
                                  <span>Navigate (Google Maps)</span>
                                  <ExternalLink size={10} />
                                </a>
                              </div>
                            </div>

                            {/* Status Selector Strip */}
                            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/5">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[11px] text-slate-400 font-mono mr-1">Pastoral Status:</span>
                                
                                <button
                                  type="button"
                                  onClick={() => handleToggleFamilyStatus(circuit.id, fam.family_id, 'SCHEDULED')}
                                  className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                                    fam.status === 'SCHEDULED'
                                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                      : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
                                  }`}
                                >
                                  [ Scheduled ]
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleToggleFamilyStatus(circuit.id, fam.family_id, 'VISITED')}
                                  className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                                    fam.status === 'VISITED'
                                      ? 'bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/20'
                                      : 'bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/20'
                                  }`}
                                >
                                  <Check size={12} />
                                  <span>[ Visited ✓ ]</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleToggleFamilyStatus(circuit.id, fam.family_id, 'ABSENT')}
                                  className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                                    fam.status === 'ABSENT'
                                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                      : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
                                  }`}
                                >
                                  [ Absent / Skipped ]
                                </button>
                              </div>

                              {/* Quick Note / Prayer Request Field */}
                              <div className="flex-1 min-w-[240px] max-w-md">
                                <input
                                  type="text"
                                  placeholder="Pastoral Prayer Request / Visit Note..."
                                  defaultValue={fam.prayer_notes || ''}
                                  onBlur={(e) => handleSavePrayerNote(circuit.id, fam.family_id, e.target.value)}
                                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 🌟 6. VIEW: COVERAGE LOGS & PASTORAL HISTORY */}
      {activeView === 'HISTORY' && (
        <div className="p-5 rounded-3xl bg-slate-900 border border-white/10 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileText size={18} className="text-cyan-400" />
                <span>Pastoral Circuit Coverage Archive &amp; Logs</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Complete record of pastoral visitation touches, timestamps, and prayer requests.
              </p>
            </div>
          </div>

          <div className="divide-y divide-white/5">
            {circuits.map((circuit) => {
              const targets = circuit.target_family_ids || [];
              const visited = targets.filter(f => f.status === 'VISITED');
              const coverage = calculateCoverage(targets);

              return (
                <div key={circuit.id} className="py-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-white">{circuit.area_name}</span>
                      <span className="text-[10px] font-mono text-cyan-300 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                        {circuit.scheduled_date}
                      </span>
                      <span className="text-slate-400 font-mono">Leader: {circuit.assigned_leader}</span>
                    </div>

                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-emerald-400 font-bold">{visited.length} / {targets.length} Covered</span>
                      <span className="text-slate-400 font-bold">({coverage}%)</span>
                    </div>
                  </div>

                  {/* Visited family pill listing */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {targets.map((fam) => (
                      <div
                        key={fam.family_id}
                        className={`text-[11px] px-2.5 py-1 rounded-xl border flex items-center gap-1.5 ${
                          fam.status === 'VISITED'
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                            : fam.status === 'ABSENT'
                            ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                            : 'bg-white/5 border-white/10 text-slate-400'
                        }`}
                      >
                        <span>{fam.family_name || fam.head_name}</span>
                        {fam.status === 'VISITED' && <Check size={10} />}
                        {fam.prayer_notes && (
                          <span className="text-[9px] text-slate-400 italic">
                            ("{fam.prayer_notes}")
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}

