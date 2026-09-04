import React, { useState, useMemo } from 'react';
import { 
  HeartHandshake, UserPlus, Phone, MapPin, Calendar, 
  CheckCircle2, Edit3, Trash2, Search, ArrowRight, 
  UserCheck, X, Sparkles, Filter
} from 'lucide-react';

export default function VisitorsDashboard({ session }) {
  const stages = [
    { id: 'new_contact', label: '1. New Seeker / 1st Visit', badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
    { id: 'calling_scheduled', label: '2. Pastoral Call & Care', badge: 'bg-sky-500/15 text-sky-300 border-sky-500/30' },
    { id: 'home_visit', label: '3. Home Visit / Cell Group', badge: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30' },
    { id: 'ready_for_membership', label: '4. Ready for Full Membership', badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' }
  ];

  const [visitors, setVisitors] = useState(() => {
    try {
      const saved = localStorage.getItem('app_visitors_database');
      return saved ? JSON.parse(saved) : [
        {
          id: 'VIS-101',
          name: 'Bro. Samuel Raj',
          phone: '+91 98401 23456',
          area: 'Anna Nagar, Chennai',
          firstVisitDate: '2026-08-30',
          serviceAttended: '1st Sunday Service (English)',
          prayerRequest: 'Job relocation and peace in family',
          broughtBy: 'Sis. Grace',
          followUpStage: 'calling_scheduled',
          assignedCaretaker: 'Elder Thomas',
          careNotes: 'Spoke over phone. Warm response, invited to cottage prayer.'
        }
      ];
    } catch {
      return [];
    }
  });

  const [activeSubTab, setActiveSubTab] = useState('pipeline');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStageFilter, setSelectedStageFilter] = useState('ALL');
  const [toastMessage, setToastMessage] = useState('');

  const [regForm, setRegForm] = useState({
    name: '',
    phone: '',
    area: '',
    serviceAttended: '1st Sunday Service (English)',
    prayerRequest: '',
    broughtBy: ''
  });

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [activeVisitor, setActiveVisitor] = useState(null);
  const [updateForm, setUpdateForm] = useState({
    nextStage: 'calling_scheduled',
    assignedCaretaker: '',
    careNotes: ''
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleRegisterVisitor = (e) => {
    e.preventDefault();
    if (!regForm.name.trim() || !regForm.phone.trim()) {
      showToast('Name and phone number are required.');
      return;
    }

    const newEntry = {
      id: `VIS-${Date.now().toString().slice(-4)}`,
      name: regForm.name,
      phone: regForm.phone,
      area: regForm.area || 'City Area',
      firstVisitDate: new Date().toISOString().split('T')[0],
      serviceAttended: regForm.serviceAttended,
      prayerRequest: regForm.prayerRequest || 'Salvation and general blessing',
      broughtBy: regForm.broughtBy || 'Self / Walk-in',
      followUpStage: 'new_contact',
      assignedCaretaker: session?.username || 'Pastoral Care Desk',
      careNotes: 'New contact logged.'
    };

    const updated = [newEntry, ...visitors];
    setVisitors(updated);
    localStorage.setItem('app_visitors_database', JSON.stringify(updated));

    setRegForm({
      name: '',
      phone: '',
      area: '',
      serviceAttended: '1st Sunday Service (English)',
      prayerRequest: '',
      broughtBy: ''
    });

    setActiveSubTab('pipeline');
    showToast(`${newEntry.name} added to pipeline!`);
  };

  const handleOpenUpdateModal = (vis) => {
    setActiveVisitor(vis);
    setUpdateForm({
      nextStage: vis.followUpStage === 'new_contact' ? 'calling_scheduled' 
               : vis.followUpStage === 'calling_scheduled' ? 'home_visit' 
               : 'ready_for_membership',
      assignedCaretaker: vis.assignedCaretaker || '',
      careNotes: vis.careNotes || ''
    });
    setIsUpdateModalOpen(true);
  };

  const handleSaveStageUpdate = (e) => {
    e.preventDefault();
    if (!activeVisitor) return;

    const updated = visitors.map(v => {
      if (v.id === activeVisitor.id) {
        return {
          ...v,
          followUpStage: updateForm.nextStage,
          assignedCaretaker: updateForm.assignedCaretaker,
          careNotes: updateForm.careNotes,
          lastUpdated: new Date().toISOString().split('T')[0]
        };
      }
      return v;
    });

    setVisitors(updated);
    localStorage.setItem('app_visitors_database', JSON.stringify(updated));
    setIsUpdateModalOpen(false);
    showToast(`Care status updated for ${activeVisitor.name}!`);
  };

  const handleConvertToMember = (vis) => {
    try {
      const savedMembers = localStorage.getItem('app_members_family_database');
      const families = savedMembers ? JSON.parse(savedMembers) : [];

      const nextNum = families.length + 101;
      const newFamily = {
        familyId: `FAM-${nextNum}`,
        familyName: `${vis.name} Household`,
        area: vis.area,
        headMember: {
          memberId: `MBR-${nextNum}`,
          name: vis.name,
          roleInFamily: 'Head of Family',
          gender: 'Male',
          phone: vis.phone,
          status: 'Active',
          campus: 'Main Cathedral'
        },
        members: []
      };

      localStorage.setItem('app_members_family_database', JSON.stringify([newFamily, ...families]));

      const updatedVisitors = visitors.filter(v => v.id !== vis.id);
      setVisitors(updatedVisitors);
      localStorage.setItem('app_visitors_database', JSON.stringify(updatedVisitors));

      showToast(`${vis.name} converted to permanent church member!`);
    } catch {
      showToast('Conversion failed.');
    }
  };

  const handleDelete = (id) => {
    const updated = visitors.filter(v => v.id !== id);
    setVisitors(updated);
    localStorage.setItem('app_visitors_database', JSON.stringify(updated));
    showToast('Record deleted.');
  };

  const filteredVisitors = useMemo(() => {
    return visitors.filter(v => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = v.name?.toLowerCase().includes(q) || v.phone?.includes(q) || v.area?.toLowerCase().includes(q);
      const matchesStage = selectedStageFilter === 'ALL' || v.followUpStage === selectedStageFilter;
      return matchesSearch && matchesStage;
    });
  }, [visitors, searchQuery, selectedStageFilter]);

  return (
    <div className="flex flex-col gap-6 select-none animate-in fade-in duration-200 pb-12">
      {toastMessage && (
        <div className="fixed top-5 right-5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 backdrop-blur-md shadow-2xl z-50 animate-in fade-in">
          <CheckCircle2 size={15} />
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <HeartHandshake className="text-rose-400" size={24} />
            <span>Visitors Desk & Soul Care Pipeline</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Log new guests, monitor follow-up touchpoints, and integrate souls into full church membership.
          </p>
        </div>

        <div className="flex items-center gap-2 p-1 rounded-xl bg-black/40 border border-white/10">
          <button
            onClick={() => setActiveSubTab('pipeline')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'pipeline' ? 'bg-rose-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles size={14} /> Pipeline Tracker ({visitors.length})
          </button>
          <button
            onClick={() => setActiveSubTab('register')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'register' ? 'bg-rose-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus size={14} /> New Guest Check-in
          </button>
        </div>
      </div>

      {activeSubTab === 'register' ? (
        <form onSubmit={handleRegisterVisitor} className="win11-card p-6 rounded-3xl max-w-2xl space-y-4">
          <div className="border-b border-white/10 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <UserPlus size={16} className="text-rose-400" />
              Visitor Entry Card
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Enter details of the first-time church visitor.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-300 font-medium">Full Name *</label>
              <input 
                type="text"
                required
                placeholder="e.g. Bro. Samuel Raj"
                value={regForm.name}
                onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:outline-none focus:border-rose-400 font-bold"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 font-medium">Phone Number *</label>
              <input 
                type="text"
                required
                placeholder="+91 98401 23456"
                value={regForm.phone}
                onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-300 font-medium">Residential Area / Suburb</label>
              <input 
                type="text"
                placeholder="e.g. Anna Nagar, Chennai"
                value={regForm.area}
                onChange={(e) => setRegForm({ ...regForm, area: e.target.value })}
                className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 font-medium">Service Attended</label>
              <select 
                value={regForm.serviceAttended}
                onChange={(e) => setRegForm({ ...regForm, serviceAttended: e.target.value })}
                className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:outline-none cursor-pointer"
              >
                <option value="1st Sunday Service (English)">1st Sunday Service (English)</option>
                <option value="2nd Sunday Service (Tamil)">2nd Sunday Service (Tamil)</option>
                <option value="Midweek Fellowship">Midweek Fellowship</option>
                <option value="Youth Revival Meet">Youth Revival Meet</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-300 font-medium">Introduced By</label>
            <input 
              type="text"
              placeholder="e.g. Sis. Grace / Self Walk-in"
              value={regForm.broughtBy}
              onChange={(e) => setRegForm({ ...regForm, broughtBy: e.target.value })}
              className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-slate-300 font-medium">Prayer Need / Request</label>
            <textarea 
              rows={2}
              placeholder="Family peace, healing, career guidance..."
              value={regForm.prayerRequest}
              onChange={(e) => setRegForm({ ...regForm, prayerRequest: e.target.value })}
              className="w-full bg-slate-950/80 border border-white/10 rounded-xl p-3 text-xs text-white mt-1 focus:outline-none resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button 
              type="button"
              onClick={() => setActiveSubTab('pipeline')}
              className="px-4 py-2.5 text-xs text-slate-400 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-rose-500 to-amber-600 hover:from-rose-400 hover:to-amber-500 text-white font-bold rounded-xl text-xs shadow-lg active:scale-98 transition flex items-center gap-2 cursor-pointer"
            >
              <UserPlus size={15} /> Save Visitor Record
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="Search by name, phone, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950/80 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-400"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              <button
                onClick={() => setSelectedStageFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  selectedStageFilter === 'ALL' ? 'bg-rose-500 text-white' : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                All ({visitors.length})
              </button>
              {stages.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelectedStageFilter(s.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    selectedStageFilter === s.id ? 'bg-rose-500 text-white' : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  {s.label.split('.')[1]}
                </button>
              ))}
            </div>
          </div>

          <div className="win11-card rounded-3xl overflow-hidden border border-white/10">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 uppercase text-[11px] font-mono bg-white/[0.02]">
                    <th className="p-3.5">Seeker Name & ID</th>
                    <th className="p-3.5">Visit Date & Service</th>
                    <th className="p-3.5">Prayer Need & Area</th>
                    <th className="p-3.5">Care Stage</th>
                    <th className="p-3.5">Assigned Leader</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredVisitors.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500 italic">
                        No visitor records found in this category.
                      </td>
                    </tr>
                  ) : (
                    filteredVisitors.map((vis) => {
                      const currentStage = stages.find(s => s.id === (vis.followUpStage || 'new_contact'));

                      return (
                        <tr key={vis.id} className="hover:bg-white/[0.02] transition">
                          <td className="p-3.5">
                            <div className="font-bold text-white text-xs">{vis.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">{vis.phone}</div>
                          </td>

                          <td className="p-3.5">
                            <div className="text-slate-200 font-medium">{vis.firstVisitDate}</div>
                            <div className="text-[10px] text-rose-400">{vis.serviceAttended}</div>
                          </td>

                          <td className="p-3.5 max-w-xs">
                            <div className="text-slate-300 italic truncate">"{vis.prayerRequest}"</div>
                            <div className="text-[10px] text-slate-500">{vis.area} • Via: {vis.broughtBy}</div>
                          </td>

                          <td className="p-3.5">
                            <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${currentStage?.badge}`}>
                              {currentStage?.label}
                            </span>
                          </td>

                          <td className="p-3.5">
                            <div className="text-slate-200 font-medium">{vis.assignedCaretaker || 'Unassigned'}</div>
                            {vis.careNotes && <div className="text-[10px] text-slate-400 truncate max-w-[140px]">{vis.careNotes}</div>}
                          </td>

                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenUpdateModal(vis)}
                                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-rose-300 border border-white/10 text-xs font-bold cursor-pointer transition flex items-center gap-1"
                              >
                                <Edit3 size={12} />
                                <span>Advance Stage</span>
                              </button>

                              {vis.followUpStage === 'ready_for_membership' && (
                                <button
                                type="button"
                                onClick={() => handleConvertToMember(vis)}
                                className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-rose-500 to-amber-600 hover:from-rose-400 hover:to-amber-500 text-white font-bold text-xs cursor-pointer shadow-md shadow-rose-500/20 active:scale-95 transition-all flex items-center gap-1"
                                >
                                <UserCheck size={12} />
                                <span>Promote Member</span>
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => handleDelete(vis.id)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {isUpdateModalOpen && activeVisitor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md p-6 rounded-3xl win11-card border border-white/20 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Edit3 className="text-rose-400" size={16} />
                  <span>Update Soul Care Touchpoint</span>
                </h3>
                <p className="text-xs text-slate-400">Visitor: <strong className="text-white">{activeVisitor.name}</strong></p>
              </div>
              <button onClick={() => setIsUpdateModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveStageUpdate} className="space-y-3.5">
              <div>
                <label className="text-xs text-slate-300 font-medium">Care Stage *</label>
                <select
                  value={updateForm.nextStage}
                  onChange={(e) => setUpdateForm({ ...updateForm, nextStage: e.target.value })}
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-rose-300 mt-1 focus:outline-none cursor-pointer font-bold"
                >
                  {stages.map(s => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium">Assigned Pastoral Shepherd</label>
                <input
                  type="text"
                  placeholder="e.g. Pastor David / Elder Timothy"
                  value={updateForm.assignedCaretaker}
                  onChange={(e) => setUpdateForm({ ...updateForm, assignedCaretaker: e.target.value })}
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium">Pastoral Care & Call Log Notes</label>
                <textarea
                  rows={3}
                  placeholder="Shared scripture, prayed for needs, invited to next cottage meeting..."
                  value={updateForm.careNotes}
                  onChange={(e) => setUpdateForm({ ...updateForm, careNotes: e.target.value })}
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl p-3 text-xs text-white mt-1 focus:outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsUpdateModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-rose-500 to-amber-600 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Save Stage Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}