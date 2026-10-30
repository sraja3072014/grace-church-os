import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Mail, Phone, Lock, 
  Edit3, Trash2, X, Check, Building2, ShieldCheck 
} from 'lucide-react';
import { getVaultData, setVaultData } from '../../../utils/vaultStore';

export default function UsersStaffTab() {
  // GraceOS 11-Core Schema-க்கு ஏற்ற நிலையான மாதிரித் தரவுகள்
  const defaultStaff = [
    { 
      id: 'STF-101', 
      name: 'Rev. Dr. S. Johnraja', 
      username: 'pastor.lead', 
      email: 'pastor@gracechurch.org', 
      phone: '+91 98765 43210', 
      role: 'Senior Pastor / Super Admin', 
      campus: 'All Campuses', 
      department: 'Pastoral Care',
      status: 'Active' 
    },
    { 
      id: 'STF-102', 
      name: 'Sister Mary', 
      username: 'mary.sundayschool', 
      email: 'sundayschool@gracechurch.org', 
      phone: '+91 94433 11223', 
      role: 'Sunday School Teacher', 
      campus: 'Headquarters', 
      department: 'Children Ministry',
      status: 'Active' 
    },
    { 
      id: 'STF-103', 
      name: 'Brother Joshua', 
      username: 'joshua.youth', 
      email: 'youth@gracechurch.org', 
      phone: '+91 91234 56789', 
      role: 'Youth Leader', 
      campus: 'Headquarters', 
      department: 'Youth Ministry',
      status: 'Active' 
    },
    { 
      id: 'STF-104', 
      name: 'Sister Deborah', 
      username: 'deborah.women', 
      email: 'women@gracechurch.org', 
      phone: '+91 98401 22334', 
      role: 'Women Fellowship Lead', 
      campus: 'Headquarters', 
      department: 'Women Ministry',
      status: 'Active' 
    },
    { 
      id: 'STF-105', 
      name: 'Brother Caleb', 
      username: 'caleb.men', 
      email: 'men@gracechurch.org', 
      phone: '+91 98401 55667', 
      role: 'Men Fellowship Lead', 
      campus: 'Headquarters', 
      department: 'Men Ministry',
      status: 'Active' 
    },
  ];

  const [users, setUsers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ 
    name: '', 
    username: '', 
    email: '', 
    phone: '', 
    role: 'Sunday School Teacher', 
    department: 'Children Ministry',
    campus: 'Headquarters', 
    password: '' 
  });

  // 1. லோக்கல் வோல்ட் 'staff' மாட்யூலில் இருந்து தரவை ஏற்றுதல்
  useEffect(() => {
    async function loadStaff() {
      const data = await getVaultData('staff', defaultStaff);
      setUsers(Array.isArray(data) && data.length > 0 ? data : defaultStaff);
    }
    loadStaff();
  }, []);

  // 2. லோக்கல் வோல்ட், லோக்கல் ஸ்டோரேஜ் மற்றும் கிளவுட் சின்க் செய்தல்
  const sync = async (data) => {
    setUsers(data);
    await setVaultData('staff', data, true);
    localStorage.setItem('graceos_vault_staff', JSON.stringify(data));
  };

  const handleOpenAdd = () => {
    setEditItem(null);
    setForm({ 
      name: '', 
      username: '', 
      email: '', 
      phone: '', 
      role: 'Sunday School Teacher', 
      department: 'Children Ministry',
      campus: 'Headquarters', 
      password: '' 
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (user) => {
    setEditItem(user);
    setForm({ ...user, password: '' });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (id === 'STF-101' || id === 1) {
      alert('முதன்மை Senior Pastor Super Admin கணக்கை நீக்க முடியாது.');
      return;
    }
    if (!window.confirm('இந்த ஊழியர்/துறை கணக்கை நீக்க விரும்புகிறீர்களா?')) return;
    await sync(users.filter(u => u.id !== id));
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (!form.name || !form.username) return;

    if (editItem) {
      await sync(users.map(u => u.id === editItem.id ? { ...form, id: editItem.id, status: editItem.status } : u));
    } else {
      const newId = `STF-${Date.now().toString().slice(-4)}`;
      await sync([...users, { ...form, id: newId, status: 'Active' }]);
    }
    setModalOpen(false);
  };

  return (
    <div className="flex flex-col gap-5 max-w-5xl select-none text-slate-100 pb-12 animate-in fade-in">
      
      {/* Top Header */}
      <div className="flex items-center justify-between p-5 rounded-2xl bg-white/[0.03] border border-cyan-500/20">
        <div>
          <h4 className="text-base font-bold text-white flex items-center gap-2">
            <Users size={18} className="text-cyan-400" />
            <span>Staff &amp; Departmental Leaders ({users.length})</span>
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            சபையின் ஊழியர்கள் மற்றும் ஞாயிறு பள்ளி, வாலிபர், பெண்கள், ஆண்கள் ஐக்கிய பொறுப்பாளர்கள் பட்டியல்.
          </p>
        </div>
        <button 
          type="button"
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 active:scale-95 transition cursor-pointer"
        >
          <UserPlus size={15} />
          <span>Add Staff Account</span>
        </button>
      </div>

      {/* Staff Table */}
      <div className="rounded-2xl border border-white/[0.08] overflow-hidden bg-slate-950/60 shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-white/[0.04] text-slate-400 border-b border-white/[0.06] font-mono text-[11px] uppercase">
            <tr>
              <th className="p-3.5">Assigned Leader</th>
              <th className="p-3.5">Role &amp; Department</th>
              <th className="p-3.5">Campus</th>
              <th className="p-3.5">Contact Details</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04] text-slate-300 font-medium">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-white/[0.02] transition">
                <td className="p-3.5 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-300 font-bold shrink-0">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-slate-100">{user.name}</p>
                    <p className="text-[10px] text-cyan-400 font-mono">@{user.username || 'staff'} ({user.id})</p>
                  </div>
                </td>
                <td className="p-3.5">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 block w-fit">
                    {user.role}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {user.department || 'General'}
                  </span>
                </td>
                <td className="p-3.5 text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <Building2 size={13} className="text-slate-500" />
                    <span>{user.campus || 'Headquarters'}</span>
                  </div>
                </td>
                <td className="p-3.5 text-slate-400">
                  <p className="text-[11px] text-slate-300 font-mono">{user.phone}</p>
                  <p className="text-[10px] text-slate-500">{user.email}</p>
                </td>
                <td className="p-3.5">
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono">
                    ● {user.status || 'Active'}
                  </span>
                </td>
                <td className="p-3.5 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button 
                      type="button"
                      onClick={() => handleOpenEdit(user)}
                      className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 flex items-center justify-center transition cursor-pointer"
                      title="Edit Account"
                    >
                      <Edit3 size={13} />
                    </button>
                    {user.id !== 'STF-101' && user.id !== 1 && (
                      <button 
                        type="button"
                        onClick={() => handleDelete(user.id)}
                        className="w-7 h-7 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 flex items-center justify-center transition cursor-pointer"
                        title="Delete Account"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl p-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Users size={16} className="text-cyan-400" />
                <span>{editItem ? 'Edit Staff Account' : 'Register New Staff'}</span>
              </h4>
              <button type="button" onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="flex flex-col gap-3 text-xs">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-slate-300">Staff Full Name *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Sister Mary"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-slate-300">Username *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="mary.sundayschool"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-slate-300">Role</label>
                  <select 
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-cyan-300 font-bold focus:outline-none focus:border-cyan-400 cursor-pointer"
                  >
                    <option value="Associate Pastor">Associate Pastor</option>
                    <option value="Administrator">Administrator</option>
                    <option value="Accountant">Accountant</option>
                    <option value="Sunday School Teacher">Sunday School Teacher</option>
                    <option value="Youth Leader">Youth Leader</option>
                    <option value="Women Fellowship Lead">Women Fellowship Lead</option>
                    <option value="Men Fellowship Lead">Men Fellowship Lead</option>
                    <option value="Media Coordinator">Media Coordinator</option>
                    <option value="Usher / Greeter">Usher / Greeter</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-slate-300">Mobile Phone *</label>
                  <input 
                    type="tel" 
                    required
                    placeholder="+91 98400 00000"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-slate-300">Campus Branch</label>
                  <input 
                    type="text" 
                    value={form.campus}
                    onChange={(e) => setForm({ ...form, campus: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-slate-300">Email Address</label>
                <input 
                  type="email" 
                  placeholder="leader@gracechurch.org"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-white/10">
                <button 
                  type="button" 
                  onClick={() => setModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 active:scale-95 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Check size={14} />
                  <span>Save Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}