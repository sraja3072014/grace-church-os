import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, UserPlus, Search, Layers, Plus, Trash2, Edit2, 
  Phone, Mail, MapPin, Heart, Sparkles, Calendar, ShieldCheck, 
  QrCode, X, CheckCircle2, AlertCircle, HeartHandshake, Printer
} from 'lucide-react';

export default function MembersDesk({ session }) {
  // 1. Initial State Data & Safe LocalStorage Hydration
  const defaultFamilies = [
    {
      familyId: 'FAM-101',
      familyName: 'Stephen Victor & Household',
      address: '12, New Housing Unit, Koduvai',
      area: 'City Center',
      campus: session?.activeCampus || 'Headquarters',
      headMember: {
        memberId: 'GCC-MBR-1001',
        name: 'Stephen Victor',
        roleInFamily: 'Head of Family',
        gender: 'Male',
        dob: '1984-06-15',
        phone: '+91 98765 43210',
        email: 'stephen.v@gmail.com',
        bloodGroup: 'O+',
        baptismDate: '2016-04-12',
        holySpiritBaptism: true,
        weddingAnniversary: '2010-09-18',
        emergencyContact: 'Paul Raj (+91 98765 00001)',
        ministryTalents: ['Worship Team & Vocals', 'Intercessory Prayer Team'],
        status: 'Active'
      },
      members: [
        {
          memberId: 'GCC-MBR-1002',
          name: 'Mary Stephen',
          roleInFamily: 'Spouse / Wife',
          gender: 'Female',
          dob: '1988-08-22',
          phone: '+91 98765 43211',
          bloodGroup: 'A+',
          baptismDate: '2018-04-10',
          holySpiritBaptism: true,
          ministryTalents: ['Sunday School & Kids Ministry'],
          status: 'Active'
        },
        {
          memberId: 'GCC-MBR-1003',
          name: 'Joshua Stephen',
          roleInFamily: 'Son / Daughter',
          gender: 'Male',
          dob: '2015-09-22',
          phone: '',
          bloodGroup: 'O+',
          baptismDate: '',
          holySpiritBaptism: false,
          ministryTalents: [],
          status: 'Sunday School'
        }
      ]
    }
  ];

  const defaultTalents = [
    'Worship Team & Vocals',
    'Instrumentalist (Keyboard / Drums / Guitar)',
    'Sunday School & Kids Ministry',
    'Media, Sound & Live Broadcast',
    'Intercessory Prayer Team',
    'Ushering & Hospitality Desk'
  ];

  const [families, setFamilies] = useState(() => {
    try {
      const saved = localStorage.getItem('app_members_family_database');
      return saved ? JSON.parse(saved) : defaultFamilies;
    } catch {
      return defaultFamilies;
    }
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFamilyId, setExpandedFamilyId] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [idCardMember, setIdCardMember] = useState(null);

  // Modals State
  const [isHeadModalOpen, setIsHeadModalOpen] = useState(false);
  const [editingFamilyId, setEditingFamilyId] = useState(null);
  const [registrationMembers, setRegistrationMembers] = useState([]);

  const [isSubMemberModalOpen, setIsSubMemberModalOpen] = useState(false);
  const [targetFamilyForSubMember, setTargetFamilyForSubMember] = useState(null);

  // Form State
  const [headForm, setHeadForm] = useState({
    name: '',
    gender: 'Male',
    dob: '',
    phone: '',
    email: '',
    address: '',
    area: '',
    campus: session?.activeCampus || 'Headquarters',
    bloodGroup: 'O+',
    weddingAnniversary: '',
    baptismDate: '',
    holySpiritBaptism: false,
    emergencyContact: '',
    ministryTalents: []
  });

  const [subMemberForm, setSubMemberForm] = useState({
    name: '',
    roleInFamily: 'Son / Daughter',
    gender: 'Female',
    dob: '',
    phone: '',
    bloodGroup: 'O+',
    baptismDate: '',
    holySpiritBaptism: false,
    ministryTalents: []
  });

  const syncFamilies = (data) => {
    setFamilies(data);
    localStorage.setItem('app_members_family_database', JSON.stringify(data));
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Open Head Modal (Create / Edit)
  const handleOpenHeadModal = (family = null) => {
    if (family) {
      setEditingFamilyId(family.familyId);
      setRegistrationMembers(family.members || []);
      setHeadForm({
        ...family.headMember,
        address: family.address || '',
        area: family.area || '',
        campus: family.campus || session?.activeCampus || 'Headquarters',
        ministryTalents: family.headMember?.ministryTalents || []
      });
    } else {
      setEditingFamilyId(null);
      setRegistrationMembers([]);
      setHeadForm({
        name: '',
        gender: 'Male',
        dob: '',
        phone: '',
        email: '',
        address: '',
        area: '',
        campus: session?.activeCampus || 'Headquarters',
        bloodGroup: 'O+',
        weddingAnniversary: '',
        baptismDate: '',
        holySpiritBaptism: false,
        emergencyContact: '',
        ministryTalents: []
      });
    }
    setIsHeadModalOpen(true);
  };

  const handleAddRegistrationMember = () => {
    setRegistrationMembers([
      ...registrationMembers,
      { name: '', roleInFamily: 'Son / Daughter', phone: '', gender: 'Female', bloodGroup: 'A+' }
    ]);
  };

  const handleUpdateRegistrationMember = (idx, field, value) => {
    const updated = [...registrationMembers];
    updated[idx] = { ...updated[idx], [field]: value };
    setRegistrationMembers(updated);
  };

  const handleRemoveRegistrationMember = (idx) => {
    setRegistrationMembers(registrationMembers.filter((_, memberIdx) => memberIdx !== idx));
  };

  // Save Family Head & Unit
  const handleSaveHead = (e) => {
    e.preventDefault();
    if (!headForm.name.trim() || !headForm.phone.trim()) return;

    let updatedFamilies;
    if (editingFamilyId) {
      updatedFamilies = families.map(f => {
        if (f.familyId === editingFamilyId) {
          return {
            ...f,
            familyName: `${headForm.name} & Household`,
            address: headForm.address,
            area: headForm.area,
            campus: headForm.campus,
            headMember: { ...f.headMember, ...headForm },
            members: registrationMembers
          };
        }
        return f;
      });
      showToast('Family record updated successfully!');
    } else {
      const nextIdNum = families.length + 101;
      const newFamily = {
        familyId: `FAM-${nextIdNum}`,
        familyName: `${headForm.name} & Household`,
        address: headForm.address,
        area: headForm.area,
        campus: headForm.campus,
        headMember: {
          ...headForm,
          memberId: `GCC-MBR-1${nextIdNum}`,
          roleInFamily: 'Head of Family',
          status: 'Active'
        },
        members: registrationMembers.map((m, mIdx) => ({
          ...m,
          memberId: `GCC-MBR-${nextIdNum}0${mIdx + 1}`,
          status: 'Active'
        }))
      };
      updatedFamilies = [newFamily, ...families];
      showToast('New Believer Household registered!');
    }

    syncFamilies(updatedFamilies);
    setIsHeadModalOpen(false);
  };

  // Sub-Member Handlers
  const handleOpenAddSubMember = (family) => {
    setTargetFamilyForSubMember(family);
    setSubMemberForm({
      name: '',
      roleInFamily: 'Son / Daughter',
      gender: 'Female',
      dob: '',
      phone: '',
      bloodGroup: 'O+',
      baptismDate: '',
      holySpiritBaptism: false,
      ministryTalents: []
    });
    setIsSubMemberModalOpen(true);
  };

  const handleSaveSubMember = (e) => {
    e.preventDefault();
    if (!subMemberForm.name.trim() || !targetFamilyForSubMember) return;

    const newSubMember = {
      ...subMemberForm,
      memberId: `GCC-MBR-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'Active'
    };

    const updatedFamilies = families.map(f => {
      if (f.familyId === targetFamilyForSubMember.familyId) {
        return {
          ...f,
          members: [...(f.members || []), newSubMember]
        };
      }
      return f;
    });

    syncFamilies(updatedFamilies);
    setExpandedFamilyId(targetFamilyForSubMember.familyId);
    setIsSubMemberModalOpen(false);
    showToast(`Added ${newSubMember.name} to family tree!`);
  };

  const handleDeleteFamily = (familyId) => {
    if (window.confirm("Are you sure you want to remove this family record?")) {
      const updated = families.filter(f => f.familyId !== familyId);
      syncFamilies(updated);
      showToast('Family record deleted.');
    }
  };

  const handleDeleteSubMember = (familyId, memberId) => {
    if (window.confirm("Remove member from family?")) {
      const updated = families.map(f => {
        if (f.familyId === familyId) {
          return {
            ...f,
            members: (f.members || []).filter(m => m.memberId !== memberId)
          };
        }
        return f;
      });
      syncFamilies(updated);
      showToast('Member removed from family unit.');
    }
  };

  // Filter Logic
  const filteredFamilies = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return families.filter(f => {
      const headName = f.headMember?.name?.toLowerCase() || '';
      const headPhone = f.headMember?.phone || '';
      const headId = f.headMember?.memberId?.toLowerCase() || '';
      const matchesHead = headName.includes(q) || headPhone.includes(q) || headId.includes(q);
      const matchesMembers = (f.members || []).some(m => (m?.name?.toLowerCase() || '').includes(q) || (m?.phone || '').includes(q));
      const matchesLocation = (f.area?.toLowerCase() || '').includes(q) || (f.address?.toLowerCase() || '').includes(q);
      return matchesHead || matchesMembers || matchesLocation;
    });
  }, [families, searchQuery]);

  const totalBelieversCount = useMemo(() => {
    return families.reduce((acc, f) => acc + 1 + (f.members?.length || 0), 0);
  }, [families]);

  return (
    <div className="flex flex-col gap-6 select-none animate-in fade-in duration-200">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 backdrop-blur-md shadow-2xl z-50 animate-in fade-in">
          <CheckCircle2 size={15} />
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
            <Users size={26} className="text-cyan-400" />
            <span>Church Believers & Family Directory</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage household head profiles, expanded family trees, ministry talents, and digital badges.
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleOpenHeadModal()}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-500/20 active:scale-95 transition"
        >
          <UserPlus size={15} />
          <span>+ Register New Family</span>
        </button>
      </div>

      {/* Search & Metric Strip */}
      <div className="p-4 win11-card rounded-2xl border border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
          <Search size={16} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search by Believer Name, Phone, Member ID, or Area..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none font-medium"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs">
            <span className="text-slate-400 font-medium">Families: </span>
            <strong className="text-cyan-400 font-mono">{families.length}</strong>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs">
            <span className="text-slate-400 font-medium">Total Souls: </span>
            <strong className="text-emerald-400 font-mono">{totalBelieversCount}</strong>
          </div>
        </div>
      </div>

      {/* Directory Table */}
      <div className="rounded-2xl border border-white/[0.08] overflow-hidden bg-black/20 overflow-x-auto">
        <table className="w-full min-w-[760px] text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-white/[0.06] text-slate-400 uppercase text-[11px] bg-white/[0.04]">
              <th className="p-3.5 w-12 text-center">Tree</th>
              <th className="p-3.5">Family Head Identity</th>
              <th className="p-3.5">Household Unit</th>
              <th className="p-3.5">Contact Line</th>
              <th className="p-3.5">Campus / Area</th>
              <th className="p-3.5">Talents & Ministry</th>
              <th className="p-3.5 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04] text-slate-300 font-medium">
            {filteredFamilies.map((fam) => {
              const isExpanded = expandedFamilyId === fam.familyId;
              const head = fam.headMember || {};
              const subMembers = fam.members || [];

              return (
                <React.Fragment key={fam.familyId}>
                  <tr className={`transition-colors ${isExpanded ? 'bg-white/[0.04]' : 'hover:bg-white/[0.02]'}`}>
                    <td className="p-3.5 text-center">
                      <button
                        type="button"
                        onClick={() => setExpandedFamilyId(isExpanded ? null : fam.familyId)}
                        className={`p-2 rounded-xl border transition ${
                          isExpanded 
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' 
                            : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                        }`}
                        title="Expand Family Tree"
                      >
                        <Layers size={14} className={isExpanded ? 'rotate-90 transition-transform' : ''} />
                      </button>
                    </td>

                    <td className="p-3.5">
                      <div className="font-bold text-white text-xs flex items-center gap-1.5">
                        <span>{head.name}</span>
                        <span className="px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 text-[9px] font-bold border border-cyan-500/30">
                          Head
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        ID: <span className="text-cyan-400">{head.memberId}</span> • Blood: {head.bloodGroup}
                      </div>
                    </td>

                    <td className="p-3.5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-semibold text-slate-300">
                        <Users size={11} className="text-cyan-400" />
                        <span>1 Head + {subMembers.length} Members</span>
                      </span>
                    </td>

                    <td className="p-3.5">
                      <div className="font-mono text-slate-200">{head.phone}</div>
                      {head.email && <div className="text-[10px] text-slate-500 truncate max-w-[130px]">{head.email}</div>}
                    </td>

                    <td className="p-3.5 text-slate-300 text-xs">
                      <div className="font-semibold text-cyan-300">{fam.campus}</div>
                      {fam.area && (
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                          <MapPin size={11} className="text-rose-400 shrink-0" />
                          <span className="truncate max-w-[140px]">{fam.area}</span>
                        </div>
                      )}
                    </td>

                    <td className="p-3.5">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {head.ministryTalents && head.ministryTalents.length > 0 ? (
                          head.ministryTalents.map((t, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded-md bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-[9px]">
                              {t}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-500 text-[10px]">No talents tagged</span>
                        )}
                      </div>
                    </td>

                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setIdCardMember({ ...head, campus: fam.campus })}
                          className="p-1.5 rounded-xl bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 border border-cyan-500/20 transition"
                          title="Print Digital Pass"
                        >
                          <QrCode size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenAddSubMember(fam)}
                          className="px-2 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-[10px] font-bold"
                          title="Add Member"
                        >
                          + Member
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenHeadModal(fam)}
                          className="p-1.5 rounded-xl bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/20"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteFamily(fam.familyId)}
                          className="p-1.5 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* EXPANDED SUB-TREE */}
                  {isExpanded && (
                    <tr className="bg-black/30 animate-in fade-in">
                      <td colSpan={7} className="p-4 pl-12">
                        <div className="p-4 rounded-2xl bg-white/[0.02] border border-cyan-500/20 space-y-3">
                          <div className="flex items-center justify-between border-b border-white/5 pb-2">
                            <h4 className="text-xs font-bold text-cyan-300 flex items-center gap-2">
                              <Users size={14} />
                              <span>Household Members of {head.name} ({subMembers.length})</span>
                            </h4>
                            <button
                              type="button"
                              onClick={() => handleOpenAddSubMember(fam)}
                              className="text-xs font-bold text-cyan-400 hover:text-white flex items-center gap-1"
                            >
                              <Plus size={13} />
                              <span>Add Sub-Member</span>
                            </button>
                          </div>

                          {subMembers.length === 0 ? (
                            <p className="text-xs text-slate-500 italic py-1">
                              No additional family members registered. Click "+ Sub-Member" to add spouse or children.
                            </p>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {subMembers.map((member) => (
                                <div
                                  key={member.memberId}
                                  className="p-3.5 rounded-xl bg-slate-900/80 border border-white/10 flex items-start justify-between gap-2 hover:border-cyan-500/30 transition"
                                >
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <h5 className="text-xs font-bold text-white">{member.name}</h5>
                                      <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[9px] text-cyan-300 font-semibold">
                                        {member.roleInFamily}
                                      </span>
                                    </div>
                                    <div className="text-[10px] text-slate-400 font-mono">
                                      ID: {member.memberId} • Blood: {member.bloodGroup || 'N/A'}
                                    </div>
                                    {member.phone && (
                                      <div className="text-[10px] text-slate-400 font-mono">
                                        Phone: {member.phone}
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => setIdCardMember({ ...member, campus: fam.campus })}
                                      className="p-1 rounded-lg bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20"
                                      title="Print Pass"
                                    >
                                      <QrCode size={12} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteSubMember(fam.familyId, member.memberId)}
                                      className="p-1 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 🌟 MODAL 1: REGISTER / EDIT FAMILY HEAD */}
      {isHeadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in zoom-in-95">
          <div className="w-full max-w-2xl bg-slate-900 border border-white/15 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[88vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UserPlus className="text-cyan-400" size={18} />
                <span>{editingFamilyId ? 'Edit Believer Household' : 'Register New Believer Household'}</span>
              </h3>
              <button onClick={() => setIsHeadModalOpen(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveHead} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                  <label className="text-slate-300 font-semibold">Head of Family Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Stephen Victor"
                    value={headForm.name}
                    onChange={(e) => setHeadForm({ ...headForm, name: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white mt-1 focus:outline-none focus:border-cyan-400 font-bold"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold">Primary Mobile Phone *</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98765 43210"
                    value={headForm.phone}
                    onChange={(e) => setHeadForm({ ...headForm, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white mt-1 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold">Email Address</label>
                  <input
                    type="email"
                    placeholder="member@gmail.com"
                    value={headForm.email}
                    onChange={(e) => setHeadForm({ ...headForm, email: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white mt-1 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold">Area / Locality</label>
                  <input
                    type="text"
                    placeholder="e.g. City Center, Koduvai"
                    value={headForm.area}
                    onChange={(e) => setHeadForm({ ...headForm, area: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white mt-1 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold">Blood Group</label>
                  <select
                    value={headForm.bloodGroup}
                    onChange={(e) => setHeadForm({ ...headForm, bloodGroup: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white mt-1 focus:outline-none"
                  >
                    {['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-', 'AB-'].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="text-slate-300 font-semibold">Street Address</label>
                  <input
                    type="text"
                    placeholder="12, Cathedral Road"
                    value={headForm.address}
                    onChange={(e) => setHeadForm({ ...headForm, address: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white mt-1 focus:outline-none"
                  />
                </div>
              </div>

              {/* Household Bundle Members */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-3">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                    Household Family Bundle ({registrationMembers.length})
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddRegistrationMember}
                    className="px-3 py-1.5 rounded-xl bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 hover:bg-cyan-500/20 font-bold flex items-center gap-1 text-[11px]"
                  >
                    <Plus size={13} />
                    <span>Add Member</span>
                  </button>
                </div>

                {registrationMembers.map((member, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-300">Member #{idx + 1}</span>
                      <button type="button" onClick={() => handleRemoveRegistrationMember(idx)} className="text-rose-400">
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        required
                        placeholder="Full Name"
                        value={member.name}
                        onChange={(e) => handleUpdateRegistrationMember(idx, 'name', e.target.value)}
                        className="bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-white text-xs focus:outline-none"
                      />
                      <select
                        value={member.roleInFamily}
                        onChange={(e) => handleUpdateRegistrationMember(idx, 'roleInFamily', e.target.value)}
                        className="bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-white text-xs focus:outline-none"
                      >
                        <option value="Spouse / Wife">Spouse / Wife</option>
                        <option value="Son / Daughter">Son / Daughter</option>
                        <option value="Father / Mother">Father / Mother</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Phone (Optional)"
                        value={member.phone}
                        onChange={(e) => handleUpdateRegistrationMember(idx, 'phone', e.target.value)}
                        className="bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-white text-xs focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Ministry Talents */}
              <div className="space-y-2">
                <label className="text-xs text-slate-300 font-semibold block">Ministry Talents & Placement</label>
                <div className="grid grid-cols-2 gap-2 p-2.5 bg-black/40 rounded-xl border border-white/5 max-h-32 overflow-y-auto">
                  {defaultTalents.map((t, idx) => {
                    const isSelected = (headForm.ministryTalents || []).includes(t);
                    return (
                      <label key={idx} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {
                            const updated = isSelected 
                              ? (headForm.ministryTalents || []).filter(x => x !== t)
                              : [...(headForm.ministryTalents || []), t];
                            setHeadForm({ ...headForm, ministryTalents: updated });
                          }}
                          className="w-3.5 h-3.5 accent-cyan-500 rounded"
                        />
                        <span className="truncate">{t}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-white/10">
                <button type="button" onClick={() => setIsHeadModalOpen(false)} className="px-4 py-2 text-xs text-slate-400 hover:text-white">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-500/20 active:scale-95 transition">
                  {editingFamilyId ? 'Update Household Record' : 'Save Believer Household'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🌟 MODAL 2: ADD SUB-FAMILY MEMBER */}
      {isSubMemberModalOpen && targetFamilyForSubMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in zoom-in-95">
          <div className="w-full max-w-md bg-slate-900 border border-white/15 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Plus className="text-cyan-400" size={18} />
                  Add Family Member
                </h3>
                <p className="text-[11px] text-slate-400">
                  Adding to: <strong className="text-cyan-400">{targetFamilyForSubMember.familyName}</strong>
                </p>
              </div>
              <button onClick={() => setIsSubMemberModalOpen(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveSubMember} className="space-y-3.5 text-xs">
              <div>
                <label className="text-xs text-slate-300 font-semibold">Member Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mary Stephen"
                  value={subMemberForm.name}
                  onChange={(e) => setSubMemberForm({ ...subMemberForm, name: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white mt-1 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 font-semibold">Relationship to Head</label>
                  <select
                    value={subMemberForm.roleInFamily}
                    onChange={(e) => setSubMemberForm({ ...subMemberForm, roleInFamily: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white mt-1 focus:outline-none"
                  >
                    <option value="Spouse / Wife">Spouse / Wife</option>
                    <option value="Son / Daughter">Son / Daughter</option>
                    <option value="Father / Mother">Father / Mother</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-semibold">Blood Group</label>
                  <select
                    value={subMemberForm.bloodGroup}
                    onChange={(e) => setSubMemberForm({ ...subMemberForm, bloodGroup: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white mt-1 focus:outline-none"
                  >
                    {['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-', 'AB-'].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold">Mobile Phone (Optional)</label>
                <input
                  type="text"
                  placeholder="+91 98765 00000"
                  value={subMemberForm.phone}
                  onChange={(e) => setSubMemberForm({ ...subMemberForm, phone: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white mt-1 focus:outline-none font-mono"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-white/10">
                <button type="button" onClick={() => setIsSubMemberModalOpen(false)} className="px-4 py-2 text-xs text-slate-400 hover:text-white">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl text-xs font-bold transition">
                  Add to Family
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🌟 MODAL 3: DIGITAL ID CARD / PRINTABLE BADGE */}
      {idCardMember && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm flex flex-col gap-4 animate-in zoom-in-95">
            <div className="p-6 rounded-3xl bg-gradient-to-b from-slate-900 via-[#0b1320] to-[#07050d] border border-cyan-500/40 shadow-2xl flex flex-col items-center text-center gap-4 relative overflow-hidden">
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-black tracking-widest text-cyan-400 uppercase">Grace City Church Network</span>
                <h3 className="text-sm font-black text-white mt-0.5">OFFICIAL MEMBERSHIP PASS</h3>
              </div>

              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center text-white font-black text-2xl shadow-xl border-2 border-white/20">
                {idCardMember.name.charAt(0)}
              </div>

              <div>
                <h4 className="text-base font-black text-white">{idCardMember.name}</h4>
                <p className="text-xs font-mono text-cyan-300 font-bold mt-0.5">{idCardMember.memberId}</p>
                <p className="text-[11px] text-slate-400 mt-1">{idCardMember.campus}</p>
              </div>

              <div className="p-2.5 rounded-2xl bg-white shadow-xl flex items-center justify-center">
                <QrCode size={110} className="text-slate-950" />
              </div>

              <div className="flex items-center justify-between w-full text-[10px] font-mono text-slate-400 border-t border-white/10 pt-2">
                <span>Blood: <strong className="text-white">{idCardMember.bloodGroup || 'O+'}</strong></span>
                <span>Valid: <strong className="text-emerald-400">2026-2027</strong></span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIdCardMember(null)}
                className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-slate-200 transition"
              >
                Close
              </button>
              <button 
                onClick={() => { window.print(); }}
                className="flex-1 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-xs font-bold text-slate-950 flex items-center justify-center gap-1.5 transition shadow-lg shadow-cyan-500/20"
              >
                <Printer size={14} /> Print Badge
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}