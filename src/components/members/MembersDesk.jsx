import React, { useState, useEffect, useMemo } from 'react';
import MemberIdCardModal from './MemberIdCardModal';
import ExcelDataEngineModal from '../tools/ExcelDataEngineModal';
import ProfileApprovalQueueModal from './ProfileApprovalQueueModal';
import { soundFX } from '../../utils/audioEngine';
import { getVaultData, setVaultData } from '../../utils/vaultStore';
import { 
  Users, UserPlus, Search, Layers, Plus, Trash2, Edit2, 
  Phone, Mail, MapPin, Navigation, Calendar, ShieldCheck, 
  QrCode, X, CheckCircle2, FileSpreadsheet, UserCheck,
  Droplets, Flame
} from 'lucide-react';

export default function MembersDesk({ session, registrationRequest, onRegistrationRequestHandled }) {
  // 9 சபை ஊழியத் தாலந்துகள்
  const TALENT_OPTIONS = [
    "Worship Team & Vocals",
    "Sunday School & Kids Ministry",
    "Youth Fellowship",
    "Women's Fellowship",
    "Men's Fellowship",
    "Prayer Team",
    "Instrumentalist (Keyboard / Drums / Guitar)",
    "Media, Sound & Live Broadcast",
    "Volunteer & Hospitality Desk"
  ];

  const HOUSEHOLD_ROLES = [
    { value: 'Spouse / Wife', label: 'மனைவி / கணவர் (Spouse)', suffix: 'W' },
    { value: 'Son / Daughter', label: 'பிள்ளை / குழந்தை (Child)', suffix: 'C' },
    { value: 'Father / Mother', label: 'பெற்றோர் (Dependent Parent)', suffix: 'P' },
    { value: 'Sibling', label: 'சகோதரன் / சகோதரி (Sibling)', suffix: 'S' }
  ];

  const defaultFamilies = [
    {
      familyId: 'FAM-101',
      houseId: 'FAM-101-H',
      familyName: 'Rev. Dr. S. Johnraja & Household',
      address: '12, Church Street, Koduvai',
      area: 'City Center',
      campus: session?.activeCampus || 'Headquarters',
      headMember: {
        memberId: 'FAM-101-H',
        name: 'Rev. Dr. S. Johnraja',
        roleInFamily: 'Head of Family',
        gender: 'Male',
        dob: '1984-05-15',
        age: '42',
        phone: '+91 98765 43210',
        email: 'pastor@gracechurch.org',
        bloodGroup: 'O+',
        gpsCoordinates: '11.1085, 77.3411',
        isBaptized: true,
        baptismDate: '2000-08-12',
        isAnointed: true,
        holySpiritBaptismDate: '2002-11-20',
        weddingAnniversary: '2010-06-18',
        ministryTalents: ['Worship Team & Vocals', 'Prayer Team'],
        status: 'Active'
      },
      members: []
    }
  ];

  const [families, setFamilies] = useState(defaultFamilies);
  const [isFamiliesLoaded, setIsFamiliesLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFamilyId, setExpandedFamilyId] = useState('FAM-101');
  const [toastMessage, setToastMessage] = useState('');
  const [selectedMemberForCard, setSelectedMemberForCard] = useState(null);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  // Modals Control
  const [isHeadModalOpen, setIsHeadModalOpen] = useState(false);
  const [editingFamilyId, setEditingFamilyId] = useState(null);

  // 🌟 சப்-மெம்பருக்கான முழுமையான படிவ நிலை (Dedicated Member Modal)
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [activeFamilyForNewMember, setActiveFamilyForNewMember] = useState(null);
  const [editingMemberId, setEditingMemberId] = useState(null);

  // படிவ உள்ளீடுகள் (Form States)
  const [headForm, setHeadForm] = useState({
    familyId: '',
    houseId: '',
    name: '',
    gender: 'Male',
    dob: '',
    age: '',
    phone: '',
    email: '',
    address: '',
    area: '',
    campus: session?.activeCampus || 'Headquarters',
    gpsCoordinates: '',
    bloodGroup: 'O+',
    weddingAnniversary: '',
    isBaptized: false,
    baptismDate: '',
    isAnointed: false,
    holySpiritBaptismDate: '',
    ministryTalents: []
  });

  const [memberForm, setMemberForm] = useState({
    familyId: '',
    houseId: '',
    roleInFamily: 'Spouse / Wife',
    name: '',
    gender: 'Female',
    dob: '',
    age: '',
    phone: '',
    email: '',
    bloodGroup: 'O+',
    weddingAnniversary: '',
    isBaptized: false,
    baptismDate: '',
    isAnointed: false,
    holySpiritBaptismDate: '',
    ministryTalents: []
  });

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getVaultData('members', defaultFamilies);
        if (Array.isArray(data) && data.length > 0) setFamilies(data);
      } catch (error) {
        console.error('Error loading member data:', error);
      } finally {
        setIsFamiliesLoaded(true);
      }
    }
    loadData();
  }, []);

  const syncFamilies = async (data) => {
    setFamilies(data);
    await setVaultData('members', data, true);
    localStorage.setItem('graceos_vault_members', JSON.stringify(data));
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const calculateAge = (dobString) => {
    if (!dobString) return '';
    const birthYear = new Date(dobString).getFullYear();
    const currentYear = new Date().getFullYear();
    return Math.max(0, currentYear - birthYear);
  };

  // 1. குடும்பத் தலைவர் படிவம் திறத்தல்
  const handleOpenHeadModal = (family = null) => {
    if (family) {
      setEditingFamilyId(family.familyId);
      setHeadForm({
        familyId: family.familyId,
        houseId: family.houseId || `${family.familyId}-H`,
        ...family.headMember,
        address: family.address || '',
        area: family.area || '',
        campus: family.campus || session?.activeCampus || 'Headquarters',
        ministryTalents: family.headMember?.ministryTalents || []
      });
    } else {
      const nextNum = families.length + 101;
      const newFamId = `FAM-${nextNum}`;
      setEditingFamilyId(null);
      setHeadForm({
        familyId: newFamId,
        houseId: `${newFamId}-H`,
        name: '',
        gender: 'Male',
        dob: '',
        age: '',
        phone: '',
        email: '',
        address: '',
        area: '',
        campus: session?.activeCampus || 'Headquarters',
        gpsCoordinates: '',
        bloodGroup: 'O+',
        weddingAnniversary: '',
        isBaptized: false,
        baptismDate: '',
        isAnointed: false,
        holySpiritBaptismDate: '',
        ministryTalents: []
      });
    }
    setIsHeadModalOpen(true);
  };

  useEffect(() => {
    if (!registrationRequest || !isFamiliesLoaded) return;
    handleOpenHeadModal();
    onRegistrationRequestHandled();
  }, [registrationRequest, isFamiliesLoaded]);

  // 2. 🌟 குடும்ப உறுப்பினர் (Sub-Member) முழு படிவம் திறத்தல்
  const handleOpenMemberModal = (family, memberToEdit = null) => {
    setActiveFamilyForNewMember(family);
    if (memberToEdit) {
      setEditingMemberId(memberToEdit.memberId);
      setMemberForm({
        ...memberToEdit,
        familyId: family.familyId,
        houseId: memberToEdit.memberId,
        ministryTalents: memberToEdit.ministryTalents || []
      });
    } else {
      setEditingMemberId(null);
      const subIndex = (family.members?.length || 0) + 1;
      const initialRole = subIndex === 1 ? 'Spouse / Wife' : 'Son / Daughter';
      const suffix = initialRole === 'Spouse / Wife' ? 'W' : `C${subIndex - 1}`;
      
      setMemberForm({
        familyId: family.familyId,
        houseId: `${family.familyId}-${suffix}`,
        roleInFamily: initialRole,
        name: '',
        gender: initialRole === 'Spouse / Wife' ? 'Female' : 'Male',
        dob: '',
        age: '',
        phone: family.headMember?.phone || '',
        email: '',
        bloodGroup: 'O+',
        weddingAnniversary: '',
        isBaptized: false,
        baptismDate: '',
        isAnointed: false,
        holySpiritBaptismDate: '',
        ministryTalents: []
      });
    }
    setIsMemberModalOpen(true);
  };

  // குடும்பத் தலைவர் படிவம் சேமித்தல்
  const handleSaveHead = async (e) => {
    e.preventDefault();
    if (!headForm.name.trim() || !headForm.phone.trim()) return;

    let updatedFamilies;
    if (editingFamilyId) {
      updatedFamilies = families.map(f => {
        if (f.familyId === editingFamilyId) {
          return {
            ...f,
            familyName: `${headForm.name} & Household`,
            houseId: headForm.houseId,
            address: headForm.address,
            area: headForm.area,
            campus: headForm.campus,
            gpsCoordinates: headForm.gpsCoordinates,
            headMember: {
              ...f.headMember,
              ...headForm,
              memberId: headForm.houseId,
              roleInFamily: 'Head of Family',
              status: 'Active'
            }
          };
        }
        return f;
      });
    } else {
      const newFamily = {
        familyId: headForm.familyId,
        houseId: headForm.houseId,
        familyName: `${headForm.name} & Household`,
        address: headForm.address,
        area: headForm.area,
        campus: headForm.campus,
        gpsCoordinates: headForm.gpsCoordinates,
        headMember: {
          ...headForm,
          memberId: headForm.houseId,
          roleInFamily: 'Head of Family',
          status: 'Active'
        },
        members: []
      };
      updatedFamilies = [newFamily, ...families];
      setExpandedFamilyId(newFamily.familyId);
    }

    await syncFamilies(updatedFamilies);
    showToast(editingFamilyId ? 'குடும்பத் தலைவர் விவரம் புதுப்பிக்கப்பட்டது!' : 'குடும்பத் தலைவர் பதிவு செய்யப்பட்டது!');
    setIsHeadModalOpen(false);
  };

  // 🌟 குடும்ப உறுப்பினர் படிவம் முழுமையாகச் சேமித்தல்
  const handleSaveMember = async (e) => {
    e.preventDefault();
    if (!memberForm.name.trim() || !activeFamilyForNewMember) return;

    const memberData = {
      ...memberForm,
      memberId: memberForm.houseId,
      status: 'Active',
      updatedAt: new Date().toISOString()
    };

    let updatedFamilies;
    if (editingMemberId) {
      updatedFamilies = families.map(f => {
        if (f.familyId === activeFamilyForNewMember.familyId) {
          return {
            ...f,
            members: (f.members || []).map(m => m.memberId === editingMemberId ? memberData : m)
          };
        }
        return f;
      });
    } else {
      updatedFamilies = families.map(f => {
        if (f.familyId === activeFamilyForNewMember.familyId) {
          return {
            ...f,
            members: [...(f.members || []), memberData]
          };
        }
        return f;
      });
    }

    await syncFamilies(updatedFamilies);
    showToast(`${memberData.name} குடும்பத்தில் வெற்றிகரமாகச் சேர்க்கப்பட்டார்!`);
    setIsMemberModalOpen(false);
    setExpandedFamilyId(activeFamilyForNewMember.familyId);
  };

  const filteredFamilies = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return families.filter(f => {
      const headName = f.headMember?.name?.toLowerCase() || '';
      const headPhone = f.headMember?.phone || '';
      const matchesHead = headName.includes(q) || headPhone.includes(q);
      const matchesMembers = (f.members || []).some(m => (m?.name?.toLowerCase() || '').includes(q));
      return matchesHead || matchesMembers;
    });
  }, [families, searchQuery]);

  return (
    <div className="flex flex-col gap-6 select-none text-slate-100 p-2 sm:p-4">
      
      {toastMessage && (
        <div className="fixed top-5 right-5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 backdrop-blur-md shadow-2xl z-50 animate-in fade-in">
          <CheckCircle2 size={15} />
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
            <Users size={26} className="text-cyan-400" />
            <span>சபை குடும்பங்கள் & விசுவாசிகள் பதிவேடு</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            குடும்பத் தலைவர் மற்றும் குடும்ப உறுப்பினர்கள் ஒவ்வொருவருக்கும் தனித்தனி ஆவிக்குரிய தாலந்துகள் & விவரங்கள்
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleOpenHeadModal()}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-500/20 active:scale-95 transition cursor-pointer"
        >
          <UserPlus size={15} />
          <span>+ புதிய குடும்பத் தலைவர் சேர்க்க</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/[0.08] flex items-center gap-3">
        <Search size={16} className="text-slate-400" />
        <input
          type="text"
          placeholder="குடும்பத் தலைவர் அல்லது உறுப்பினரின் பெயர், தொலைபேசியைத் தேடவும்..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
        />
      </div>

      {/* Families Directory Table */}
      <div className="rounded-2xl border border-white/[0.08] overflow-hidden bg-black/20 overflow-x-auto">
        <table className="w-full min-w-[760px] text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-white/[0.06] text-slate-400 uppercase text-[11px] bg-white/[0.04]">
              <th className="p-3.5 w-12 text-center">அடுக்கு</th>
              <th className="p-3.5">குடும்பத் தலைவர் (Head)</th>
              <th className="p-3.5">உறுப்பினர்கள்</th>
              <th className="p-3.5">தொடர்பு எண்</th>
              <th className="p-3.5">ஆவிக்குரிய நிலை & தாலந்துகள்</th>
              <th className="p-3.5 text-center">செயல்கள்</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04] text-slate-300">
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
                        className="p-2 rounded-xl border bg-white/5 border-white/10 text-cyan-400 cursor-pointer"
                      >
                        <Layers size={14} className={isExpanded ? 'rotate-90 transition-transform' : ''} />
                      </button>
                    </td>

                    <td className="p-3.5">
                      <div className="font-bold text-white text-xs flex items-center gap-1.5">
                        <span>{head.name}</span>
                        <span className="px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 text-[9px] font-bold border border-cyan-500/30 font-mono">
                          {fam.familyId}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        ID: <span className="text-cyan-400 font-bold">{head.memberId}</span> • Age: {head.age || '—'} • Blood: {head.bloodGroup}
                      </div>
                    </td>

                    <td className="p-3.5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-semibold text-slate-300">
                        <Users size={11} className="text-cyan-400" />
                        <span>1 தலைவர் + {subMembers.length} குடும்பத்தினர்</span>
                      </span>
                    </td>

                    <td className="p-3.5 font-mono">{head.phone}</td>

                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5 mb-1">
                        {head.isBaptized && (
                          <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[9px] flex items-center gap-1 font-bold">
                            <Droplets size={10} /> ஞானஸ்நானம்
                          </span>
                        )}
                        {head.isAnointed && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[9px] flex items-center gap-1 font-bold">
                            <Flame size={10} /> அபிஷேகம்
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {(head.ministryTalents || []).map((t, idx) => (
                          <span key={idx} className="px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-300 text-[9px]">
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* 🌟 குடும்ப உறுப்பினர் சேர்க்கும் நேரடி பொத்தான் */}
                        <button
                          type="button"
                          onClick={() => handleOpenMemberModal(fam)}
                          className="px-2.5 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                        >
                          <Plus size={13} />
                          <span>+ உறுப்பினர் சேர்க்க</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenHeadModal(fam)}
                          className="p-1.5 rounded-xl bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/20 cursor-pointer"
                        >
                          <Edit2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* 🌟 விரிவாக்கப்பட்ட குடும்ப உறுப்பினர்கள் பகுதி */}
                  {isExpanded && (
                    <tr className="bg-black/30 animate-in fade-in">
                      <td colSpan={6} className="p-4 pl-12">
                        <div className="p-4 rounded-2xl bg-white/[0.02] border border-cyan-500/20 space-y-3">
                          <div className="flex items-center justify-between border-b border-white/5 pb-2">
                            <h4 className="text-xs font-bold text-cyan-300 flex items-center gap-2">
                              <Users size={14} />
                              <span>{head.name} குடும்ப உறுப்பினர்கள் ({subMembers.length})</span>
                            </h4>
                            <button
                              type="button"
                              onClick={() => handleOpenMemberModal(fam)}
                              className="text-xs font-bold text-cyan-400 hover:text-white flex items-center gap-1 cursor-pointer"
                            >
                              <Plus size={13} />
                              <span>+ புதிய குடும்ப உறுப்பினர் சேர்க்க</span>
                            </button>
                          </div>

                          {subMembers.length === 0 ? (
                            <p className="text-xs text-slate-500 italic py-2">
                              குடும்ப உறுப்பினர்கள் யாரும் இன்னும் சேர்க்கப்படவில்லை. மேலே உள்ள "+ புதிய குடும்ப உறுப்பினர் சேர்க்க" பொத்தானை அழுத்தவும்.
                            </p>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {subMembers.map((member) => (
                                <div
                                  key={member.memberId}
                                  className="p-3.5 rounded-2xl bg-slate-900 border border-white/10 flex flex-col justify-between gap-3 hover:border-cyan-500/40 transition shadow-lg"
                                >
                                  <div>
                                    <div className="flex items-center justify-between">
                                      <h5 className="text-xs font-bold text-white">{member.name}</h5>
                                      <span className="px-2 py-0.5 rounded-md bg-white/5 text-cyan-300 text-[9px] font-semibold border border-white/10">
                                        {member.roleInFamily}
                                      </span>
                                    </div>
                                    <div className="text-[10px] text-slate-400 font-mono mt-1">
                                      ID: <strong className="text-cyan-400">{member.memberId}</strong> • Age: {member.age || '—'} • Blood: {member.bloodGroup}
                                    </div>
                                    {member.phone && (
                                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                        Phone: {member.phone}
                                      </div>
                                    )}

                                    {/* ஆவிக்குரிய தகுதிகள் */}
                                    <div className="flex items-center gap-1.5 mt-2">
                                      {member.isBaptized && (
                                        <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[8.5px] font-bold flex items-center gap-0.5">
                                          <Droplets size={9} /> ஞானஸ்நானம்
                                        </span>
                                      )}
                                      {member.isAnointed && (
                                        <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[8.5px] font-bold flex items-center gap-0.5">
                                          <Flame size={9} /> அபிஷேகம்
                                        </span>
                                      )}
                                    </div>

                                    {/* சபை ஊழிய தாலந்துகள் */}
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      {(member.ministryTalents || []).map((t, idx) => (
                                        <span key={idx} className="px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-300 text-[8.5px]">
                                          {t}
                                        </span>
                                      ))}
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-between border-t border-white/5 pt-2">
                                    <button
                                      type="button"
                                      onClick={() => setSelectedMemberForCard({ ...member, familyId: fam.familyId, campus: fam.campus })}
                                      className="text-cyan-400 hover:text-cyan-300 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                                    >
                                      <QrCode size={12} /> Smart ID
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleOpenMemberModal(fam, member)}
                                      className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 cursor-pointer"
                                    >
                                      <Edit2 size={12} />
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

      {/* 🌟 MODAL 1: குடும்பத் தலைவர் சேர்க்கைப் படிவம் */}
      {isHeadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in zoom-in-95 select-none overflow-y-auto">
          <div className="w-full max-w-2xl bg-slate-900 border border-white/15 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-4 max-h-[92vh] flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 shrink-0">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UserPlus size={18} className="text-cyan-400" />
                <span>{editingFamilyId ? 'குடும்பத் தலைவர் விவரங்களைத் திருத்துக' : 'புதிய குடும்பத் தலைவர் பதிவு'}</span>
              </h3>
              <button onClick={() => setIsHeadModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer"><X size={18} /></button>
            </div>

            <form onSubmit={handleSaveHead} id="head-form" className="overflow-y-auto pr-1 py-2 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">குடும்ப ஐடி *</label>
                  <input type="text" readOnly value={headForm.familyId} className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-cyan-400 font-mono font-bold" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">தலைவர் House ID</label>
                  <input type="text" readOnly value={headForm.houseId} className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-cyan-400 font-mono font-bold" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">முழுப் பெயர் *</label>
                  <input type="text" required value={headForm.name} onChange={(e) => setHeadForm({ ...headForm, name: e.target.value })} className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white font-bold" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">கைபேசி எண் *</label>
                  <input type="tel" required value={headForm.phone} onChange={(e) => setHeadForm({ ...headForm, phone: e.target.value })} className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white font-mono" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">பிறந்த தேதி</label>
                  <input type="date" value={headForm.dob} onChange={(e) => setHeadForm({ ...headForm, dob: e.target.value, age: calculateAge(e.target.value) })} className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-white" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">வயது (Auto)</label>
                  <input type="number" value={headForm.age} readOnly className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-white font-mono" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">இரத்த வகை</label>
                  <select value={headForm.bloodGroup} onChange={(e) => setHeadForm({ ...headForm, bloodGroup: e.target.value })} className="w-full bg-slate-950 border border-white/10 rounded-xl px-2 py-1.5 text-rose-400 font-bold">
                    {['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-', 'AB-'].map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">முகவரி</label>
                  <input type="text" value={headForm.address} onChange={(e) => setHeadForm({ ...headForm, address: e.target.value })} className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">பகுதி / ஏரியா</label>
                  <input type="text" value={headForm.area} onChange={(e) => setHeadForm({ ...headForm, area: e.target.value })} className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white" />
                </div>
              </div>

              {/* ஆவிக்குரிய நிலை */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className={`p-3 rounded-xl border ${headForm.isBaptized ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-slate-950 border-white/5'}`}>
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-white">
                    <input type="checkbox" checked={headForm.isBaptized} onChange={(e) => setHeadForm({ ...headForm, isBaptized: e.target.checked })} className="w-4 h-4 accent-cyan-500" />
                    <span>தண்ணீரில் ஞானஸ்நானம்?</span>
                  </label>
                  {headForm.isBaptized && (
                    <input type="date" value={headForm.baptismDate} onChange={(e) => setHeadForm({ ...headForm, baptismDate: e.target.value })} className="w-full bg-slate-950 border border-white/10 rounded-lg px-2.5 py-1 mt-2 text-white" />
                  )}
                </div>

                <div className={`p-3 rounded-xl border ${headForm.isAnointed ? 'bg-amber-500/10 border-amber-500/30' : 'bg-slate-950 border-white/5'}`}>
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-white">
                    <input type="checkbox" checked={headForm.isAnointed} onChange={(e) => setHeadForm({ ...headForm, isAnointed: e.target.checked })} className="w-4 h-4 accent-amber-500" />
                    <span>பரிசுத்த ஆவியின் அபிஷேகம்?</span>
                  </label>
                  {headForm.isAnointed && (
                    <input type="date" value={headForm.holySpiritBaptismDate} onChange={(e) => setHeadForm({ ...headForm, holySpiritBaptismDate: e.target.value })} className="w-full bg-slate-950 border border-white/10 rounded-lg px-2.5 py-1 mt-2 text-white" />
                  )}
                </div>
              </div>

              {/* தாலந்துகள் */}
              <div className="space-y-1.5 pt-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase">சபை ஊழிய தாலந்துகள்</label>
                <div className="flex flex-wrap gap-1.5">
                  {TALENT_OPTIONS.map((talent) => {
                    const sel = headForm.ministryTalents.includes(talent);
                    return (
                      <button key={talent} type="button" onClick={() => {
                        const exists = headForm.ministryTalents.includes(talent);
                        setHeadForm({ ...headForm, ministryTalents: exists ? headForm.ministryTalents.filter(t => t !== talent) : [...headForm.ministryTalents, talent] });
                      }} className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border ${sel ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'bg-slate-950 border-white/10 text-slate-400'}`}>
                        {sel ? '✓ ' : '+ '} {talent}
                      </button>
                    );
                  })}
                </div>
              </div>
            </form>

            <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
              <button type="button" onClick={() => setIsHeadModalOpen(false)} className="px-4 py-2 text-slate-400 text-xs cursor-pointer">ரத்து</button>
              <button type="submit" form="head-form" className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl text-xs font-bold cursor-pointer">
                சேமிக்க (Save Head)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🌟🌟 MODAL 2: குடும்ப உறுப்பினருக்கான பிரத்யேக முழு படிவம் (Dedicated Full Member Modal) */}
      {isMemberModalOpen && activeFamilyForNewMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in zoom-in-95 select-none overflow-y-auto">
          <div className="w-full max-w-2xl bg-slate-900 border border-cyan-500/30 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-4 max-h-[92vh] flex flex-col justify-between">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3 shrink-0">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <UserPlus size={18} className="text-cyan-400" />
                  <span>{editingMemberId ? 'உறுப்பினர் விவரங்களைத் திருத்துக' : 'புதிய குடும்ப உறுப்பினர் சேர்க்கைப் படிவம்'}</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  குடும்பம்: <strong className="text-cyan-400">{activeFamilyForNewMember.familyName}</strong> ({activeFamilyForNewMember.familyId})
                </p>
              </div>
              <button onClick={() => setIsMemberModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer"><X size={18} /></button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveMember} id="submember-form" className="overflow-y-auto pr-1 py-2 space-y-4 text-xs">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">குடும்பத்தில் உறவுமுறை (Role) *</label>
                  <select
                    value={memberForm.roleInFamily}
                    onChange={(e) => {
                      const newRole = e.target.value;
                      const suffix = newRole === 'Spouse / Wife' ? 'W' : 'C';
                      setMemberForm({
                        ...memberForm,
                        roleInFamily: newRole,
                        houseId: `${activeFamilyForNewMember.familyId}-${suffix}${Date.now().toString().slice(-2)}`
                      });
                    }}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-cyan-300 font-bold"
                  >
                    {HOUSEHOLD_ROLES.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">உறுப்பினர் House ID</label>
                  <input type="text" readOnly value={memberForm.houseId} className="w-full bg-slate-950 border border-cyan-500/30 rounded-xl px-3 py-2 text-cyan-400 font-mono font-bold" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">உறுப்பினர் பெயர் *</label>
                  <input type="text" required placeholder="எ.கா: Mary Stephen" value={memberForm.name} onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })} className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white font-bold" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">கைபேசி எண் (விருப்பத்திற்கேற்ப)</label>
                  <input type="tel" placeholder="+91 98400..." value={memberForm.phone} onChange={(e) => setMemberForm({ ...memberForm, phone: e.target.value })} className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white font-mono" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">பிறந்த தேதி</label>
                  <input type="date" value={memberForm.dob} onChange={(e) => setMemberForm({ ...memberForm, dob: e.target.value, age: calculateAge(e.target.value) })} className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-white" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">வயது (Auto)</label>
                  <input type="number" value={memberForm.age} readOnly className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-white font-mono" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">இரத்த வகை</label>
                  <select value={memberForm.bloodGroup} onChange={(e) => setMemberForm({ ...memberForm, bloodGroup: e.target.value })} className="w-full bg-slate-950 border border-white/10 rounded-xl px-2 py-1.5 text-rose-400 font-bold">
                    {['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-', 'AB-'].map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>

              {/* ஆவிக்குரிய தகுதிகள் */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className={`p-3 rounded-xl border ${memberForm.isBaptized ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-slate-950 border-white/5'}`}>
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-white">
                    <input type="checkbox" checked={memberForm.isBaptized} onChange={(e) => setMemberForm({ ...memberForm, isBaptized: e.target.checked })} className="w-4 h-4 accent-cyan-500" />
                    <span>தண்ணீரில் ஞானஸ்நானம்?</span>
                  </label>
                  {memberForm.isBaptized && (
                    <input type="date" value={memberForm.baptismDate} onChange={(e) => setMemberForm({ ...memberForm, baptismDate: e.target.value })} className="w-full bg-slate-950 border border-white/10 rounded-lg px-2.5 py-1 mt-2 text-white" />
                  )}
                </div>

                <div className={`p-3 rounded-xl border ${memberForm.isAnointed ? 'bg-amber-500/10 border-amber-500/30' : 'bg-slate-950 border-white/5'}`}>
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-white">
                    <input type="checkbox" checked={memberForm.isAnointed} onChange={(e) => setMemberForm({ ...memberForm, isAnointed: e.target.checked })} className="w-4 h-4 accent-amber-500" />
                    <span>பரிசுத்த ஆவியின் அபிஷேகம்?</span>
                  </label>
                  {memberForm.isAnointed && (
                    <input type="date" value={memberForm.holySpiritBaptismDate} onChange={(e) => setMemberForm({ ...memberForm, holySpiritBaptismDate: e.target.value })} className="w-full bg-slate-950 border border-white/10 rounded-lg px-2.5 py-1 mt-2 text-white" />
                  )}
                </div>
              </div>

              {/* 🌟 இந்த உறுப்பினருக்குரிய தனிப்பட்ட ஊழிய தாலந்துகள் */}
              <div className="space-y-1.5 pt-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase">இந்த உறுப்பினரின் சபை தாலந்துகள் & விருப்பங்கள்</label>
                <div className="flex flex-wrap gap-1.5">
                  {TALENT_OPTIONS.map((talent) => {
                    const sel = (memberForm.ministryTalents || []).includes(talent);
                    return (
                      <button key={talent} type="button" onClick={() => {
                        const exists = (memberForm.ministryTalents || []).includes(talent);
                        setMemberForm({
                          ...memberForm,
                          ministryTalents: exists 
                            ? memberForm.ministryTalents.filter(t => t !== talent) 
                            : [...(memberForm.ministryTalents || []), talent]
                        });
                      }} className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border ${sel ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'bg-slate-950 border-white/10 text-slate-400'}`}>
                        {sel ? '✓ ' : '+ '} {talent}
                      </button>
                    );
                  })}
                </div>
              </div>

            </form>

            <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
              <button type="button" onClick={() => setIsMemberModalOpen(false)} className="px-4 py-2 text-slate-400 text-xs cursor-pointer">ரத்து</button>
              <button type="submit" form="submember-form" className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl text-xs font-bold cursor-pointer">
                உறுப்பினரைச் சேர்க்க (Save Member Profile)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Smart Card Modal */}
      {selectedMemberForCard && (
        <MemberIdCardModal
          member={selectedMemberForCard}
          family={families.find(f => f.familyId === selectedMemberForCard.familyId)}
          onClose={() => setSelectedMemberForCard(null)}
        />
      )}

      <ExcelDataEngineModal isOpen={isExcelModalOpen} onClose={() => setIsExcelModalOpen(false)} />
      <ProfileApprovalQueueModal isOpen={isApprovalModalOpen} onClose={() => setIsApprovalModalOpen(false)} />
    </div>
  );
}