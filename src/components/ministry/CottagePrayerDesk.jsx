import React, { useState, useMemo } from 'react';
import { 
  Home, MapPin, Navigation, Calendar, 
  CheckCircle2, Clock, Users, Search, Phone, ExternalLink, Plus, Trash2
} from 'lucide-react';
import { soundFX } from '../../utils/audioEngine';

export default function CottagePrayerDesk({ session }) {
  const [selectedArea, setSelectedArea] = useState('ALL');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));

  // 1. விசுவாசிகள் டேட்டாபேஸிலிருந்து முகவரி மற்றும் ஜிபிஎஸ் மேப் விவரங்களை எடுத்தல்
  const families = useMemo(() => {
    try {
      const raw = localStorage.getItem('app_members_family_database');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }, []);

  // அனைத்து பகுதிகளின் பட்டியல் (Unique Areas)
  const areasList = useMemo(() => {
    const set = new Set();
    families.forEach(f => {
      if (f.area) set.add(f.area);
    });
    return Array.from(set);
  }, [families]);

  // 2. திட்டமிடப்பட்ட குடும்ப ஜெபப் பட்டியல் (Cottage Prayer Schedule)
  const [visitationList, setVisitationList] = useState(() => {
    try {
      const raw = localStorage.getItem('graceos_cottage_prayer_db');
      return raw ? JSON.parse(raw) : [
        {
          id: 'CP-101',
          date: '2026-09-18',
          timeSlot: '06:30 PM',
          familyId: 'FAM-101',
          familyName: 'Stephen Victor Household',
          area: 'City Center',
          address: '12, New Housing Unit, Koduvai',
          phone: '+91 98765 43210',
          mapLink: 'https://maps.google.com/?q=10.9822,77.3411',
          leadPastor: 'Senior Pastor',
          status: 'SCHEDULED' // 'SCHEDULED' | 'COMPLETED'
        }
      ];
    } catch {
      return [];
    }
  });

  const [scheduleForm, setScheduleForm] = useState({
    familyId: '',
    timeSlot: '07:00 PM',
    leadPastor: session?.username || 'Senior Pastor'
  });

  const saveVisitations = (updated) => {
    setVisitationList(updated);
    localStorage.setItem('graceos_cottage_prayer_db', JSON.stringify(updated));
  };

  const handleAddVisit = (e) => {
    e.preventDefault();
    if (!scheduleForm.familyId) return;

    const targetFamily = families.find(f => f.familyId === scheduleForm.familyId);
    if (!targetFamily) return;

    soundFX?.playSuccessChime?.();

    const newVisit = {
      id: `CP-${Date.now().toString().slice(-3)}`,
      date: selectedDate,
      timeSlot: scheduleForm.timeSlot,
      familyId: targetFamily.familyId,
      familyName: targetFamily.familyName,
      area: targetFamily.area || 'General',
      address: targetFamily.address || 'Address not listed',
      phone: targetFamily.headMember?.phone || 'No phone',
      mapLink: targetFamily.mapLink || targetFamily.headMember?.mapLink || '',
      leadPastor: scheduleForm.leadPastor,
      status: 'SCHEDULED'
    };

    saveVisitations([newVisit, ...visitationList]);
    setScheduleForm({ familyId: '', timeSlot: '07:00 PM', leadPastor: scheduleForm.leadPastor });
  };

  const markVisitCompleted = (id) => {
    soundFX?.playClickPop?.();
    const updated = visitationList.map(v => v.id === id ? { ...v, status: 'COMPLETED' } : v);
    saveVisitations(updated);
  };

  const handleDeleteVisit = (id) => {
    soundFX?.playClickPop?.();
    const updated = visitationList.filter(v => v.id !== id);
    saveVisitations(updated);
  };

  // தேர்ந்தெடுக்கப்பட்ட தேதி மற்றும் பகுதிக்குரிய பட்டியல்
  const filteredVisits = visitationList.filter(v => {
    const matchDate = v.date === selectedDate;
    const matchArea = selectedArea === 'ALL' || v.area === selectedArea;
    return matchDate && matchArea;
  });

  return (
    <div className="space-y-6 max-w-5xl select-none text-slate-200 animate-in fade-in pb-12">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <span>Pastoral Cottage Prayer & Visitation Desk</span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
              GPS Routed
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            வாராந்திர விசுவாசிகள் இல்ல ஜெபக்கூடுகை மற்றும் கூகுள் மேப் வழித்தட மேலாண்மை பலகை.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-amber-300 font-mono focus:outline-none cursor-pointer"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* இடதுபுறம்: புதிய ஜெப சந்திப்பு முன்பதிவு */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-white/10 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <Plus size={15} className="text-emerald-400" />
            <span>இல்ல ஜெபத்தை திட்டமிடுக</span>
          </h4>

          <form onSubmit={handleAddVisit} className="space-y-3">
            <div>
              <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">விசுவாசி குடும்பம்</label>
              <select
                value={scheduleForm.familyId}
                onChange={(e) => setScheduleForm({ ...scheduleForm, familyId: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400 cursor-pointer"
                required
              >
                <option value="">-- குடும்பத்தைத் தேர்ந்தெடுக்கவும் --</option>
                {families.map((fam) => (
                  <option key={fam.familyId} value={fam.familyId}>
                    {fam.familyName} ({fam.area || 'Main Area'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">ஜெப நேரம்</label>
              <input
                type="text"
                value={scheduleForm.timeSlot}
                onChange={(e) => setScheduleForm({ ...scheduleForm, timeSlot: e.target.value })}
                placeholder="07:00 PM"
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-400"
                required
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">தலைமை போதகர் / ஊழியர்</label>
              <input
                type="text"
                value={scheduleForm.leadPastor}
                onChange={(e) => setScheduleForm({ ...scheduleForm, leadPastor: e.target.value })}
                placeholder="Pastor / Elder name"
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition active:scale-95 cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              அட்டவணையில் சேர்
            </button>
          </form>
        </div>

        {/* வலதுபுறம்: அன்றைய தின குடும்ப சந்திப்பு வழித்தடம் */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-2 text-xs">
            <span className="font-bold text-white uppercase tracking-wider">
              {selectedDate} இல்ல ஜெப அட்டவணை ({filteredVisits.length})
            </span>
            
            {/* பகுதி வாரியான வடிகட்டல் */}
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="bg-slate-950 border border-white/10 rounded-lg px-2 py-1 text-[11px] text-cyan-300 font-mono focus:outline-none"
            >
              <option value="ALL">அனைத்து பகுதிகள்</option>
              {areasList.map((a, idx) => (
                <option key={idx} value={a}>{a}</option>
              ))}
            </select>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {filteredVisits.length === 0 ? (
              <div className="p-8 text-center text-slate-500 font-mono text-xs">
                இந்த தேதியில் குடும்ப ஜெபங்கள் எதுவும் திட்டமிடப்படவில்லை.
              </div>
            ) : (
              filteredVisits.map((visit) => (
                <div
                  key={visit.id}
                  className={`p-4 rounded-3xl border transition space-y-3 ${
                    visit.status === 'COMPLETED' 
                      ? 'bg-slate-950/60 border-white/5 opacity-70'
                      : 'bg-slate-900 border-white/10 hover:border-emerald-500/30 shadow-xl'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black text-white">{visit.familyName}</h4>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-amber-300 border border-white/10">
                          {visit.timeSlot}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5 flex items-center gap-1.5">
                        <MapPin size={12} className="text-rose-400 shrink-0" />
                        <span>{visit.address} ({visit.area})</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleDeleteVisit(visit.id)}
                        className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer transition"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* தொடர்பு மற்றும் கூகுள் மேப்ஸ் வழித்தட வழிகாட்டல் */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5 text-xs font-mono">
                    <span className="text-slate-400">
                      பொறுப்பாளர்: <strong className="text-slate-200">{visit.leadPastor}</strong>
                    </span>

                    <div className="flex items-center gap-2">
                      {visit.mapLink ? (
                        <a
                          href={visit.mapLink}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 rounded-xl text-[11px] font-bold flex items-center gap-1 cursor-pointer transition"
                        >
                          <Navigation size={11} />
                          <span>Google Maps Navigate</span>
                        </a>
                      ) : (
                        <span className="text-[10px] text-slate-500 italic">No GPS attached</span>
                      )}

                      {visit.status === 'SCHEDULED' && (
                        <button
                          type="button"
                          onClick={() => markVisitCompleted(visit.id)}
                          className="px-3 py-1 bg-white/10 hover:bg-white/15 text-white rounded-xl text-[11px] font-bold flex items-center gap-1 cursor-pointer transition"
                        >
                          <CheckCircle2 size={12} />
                          <span>ஜெபம் முடிந்தது</span>
                        </button>
                      )}
                    </div>
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