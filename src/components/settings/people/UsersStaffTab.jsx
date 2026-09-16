import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Shield, Mail, Phone, Lock, Edit3, Trash2, X, Check, Building2 } from 'lucide-react';
import { getVaultData, setVaultData } from '../../../utils/vaultStore';

export default function UsersStaffTab() {
  const defaultStaff = [
    { id: 1, name: 'Senior Pastor', username: 'pastor.lead', email: 'pastor@gracechurch.org', phone: '+91 98765 43210', role: 'Senior Pastor / Super Admin', campus: 'All Campuses', status: 'Active' },
    { id: 2, name: 'Sister Mary', username: 'mary.sundayschool', email: 'sundayschool@gracechurch.org', phone: '+91 94433 11223', role: 'Sunday School Teacher', campus: 'Headquarters', status: 'Active' },
    { id: 3, name: 'Brother Joshua', username: 'joshua.youth', email: 'youth@gracechurch.org', phone: '+91 91234 56789', role: 'Youth Leader', campus: 'Headquarters', status: 'Active' },
    { id: 4, name: 'Sister Deborah', username: 'deborah.women', email: 'women@gracechurch.org', phone: '+91 98401 22334', role: 'Women Fellowship Lead', campus: 'Headquarters', status: 'Active' },
    { id: 5, name: 'Brother Caleb', username: 'caleb.men', email: 'men@gracechurch.org', phone: '+91 98401 55667', role: 'Men Fellowship Lead', campus: 'Headquarters', status: 'Active' },
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
    campus: 'Headquarters', 
    password: '' 
  });

  useEffect(() => {
    async function loadStaff() {
      const data = await getVaultData('staff_users', defaultStaff);
      setUsers(data);
    }
    loadStaff();
  }, []);

  const sync = async (data) => {
    setUsers(data);
    await setVaultData('staff_users', data, true);
    localStorage.setItem('graceos_staff_users', JSON.stringify(data));
  };

  const handleOpenAdd = () => {
    setEditItem(null);
    setForm({ name: '', username: '', email: '', phone: '', role: 'Sunday School Teacher', campus: 'Headquarters', password: '' });
    setModalOpen(true);
  };

  const handleOpenEdit = (user) => {
    setEditItem(user);
    setForm({ ...user, password: '' });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (id === 1) {
      alert('The primary Senior Pastor Super Admin account cannot be removed.');
      return;
    }
    if (!window.confirm('Delete this departmental account?')) return;
    await sync(users.filter(u => u.id !== id));
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (!form.name || !form.username) return;

    if (editItem) {
      await sync(users.map(u => u.id === editItem.id ? { ...form, id: editItem.id, status: editItem.status } : u));
    } else {
      await sync([...users, { ...form, id: Date.now(), status: 'Active' }]);
    }
    setModalOpen(false);
  };

  return (
    <div className="flex flex-col gap-5 max-w-5xl select-none text-slate-100 pb-12">
      
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-white">Departmental &amp; Staff Accounts ({users.length})</h4>
          <p className="text-xs text-slate-400 mt-0.5">Configure access accounts for Sunday School, Youth, Women, and Men Fellowships.</p>
        </div>
        <button 
          type="button"
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 active:scale-95 transition cursor-pointer"
        >
          <UserPlus size={15} />
          <span>Add Department Account</span>
        </button>
      </div>

      {/* Staff Table */}
      <div className="rounded-2xl border border-white/[0.08] overflow-hidden bg-slate-950/60 shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-white/[0.04] text-slate-400 border-b border-white/[0.06] font-mono text-[11px] uppercase">
            <tr>
              <th className="p-3.5">Assigned Leader</th>
              <th className="p-3.5">Department / Role</th>
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
                    <p className="text-[10px] text-cyan-400 font-mono">@{user.username}</p>
                  </div>
                </td>
                <td className="p-3.5">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                    {user.role}
                  </span>
                </td>
                <td className="p-3.5 text-slate-300 flex items-center gap-1.5">
                  <Building2 size={13} className="text-slate-500" />
                  <span>{user.campus}</span>
                </td>
                <td className="p-3.5 text-slate-400">
                  <p className="text-[11px] text-slate-300 font-mono">{user.phone}</p>
                  <p className="text-[10px] text-slate-500">{user.email}</p>
                </td>
                <td className="p-3.5">
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono">
                    ● {user.status}
                  </span>
                </td>
                <td className="p-3.5 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button 
                      type="button"
                      onClick={() => handleOpenEdit(user)}
                      className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 flex items-center justify-center transition cursor-pointer"
                    >
                      <Edit3 size={13} />
                    </button>
                    {user.id !== 1 && (
                      <button 
                        type="button"
                        onClick={() => handleDelete(user.id)}
                        className="w-7 h-7 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 flex items-center justify-center transition cursor-pointer"
                        title="Delete User"
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
                <span>{editItem ? 'Edit Department Account' : 'Register Department Lead'}</span>
              </h4>
              <button type="button" onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="flex flex-col gap-3 text-xs">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-slate-300">Leader Full Name *</label>
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
                  <label className="text-[11px] font-semibold text-slate-300">Department / Role</label>
                  <select 
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-cyan-300 font-bold focus:outline-none focus:border-cyan-400 cursor-pointer"
                  >
                    <option value="Sunday School Teacher">Sunday School Teacher</option>
                    <option value="Youth Leader">Youth Leader</option>
                    <option value="Women Fellowship Lead">Women Fellowship Lead</option>
                    <option value="Men Fellowship Lead">Men Fellowship Lead</option>
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