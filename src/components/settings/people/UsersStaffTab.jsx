import React, { useState } from 'react';
import { Users, UserPlus, Shield, Mail, Phone, Lock, Edit3, Trash2, X, Check, Building2 } from 'lucide-react';

export default function UsersStaffTab() {
  const [users, setUsers] = useState(() => {
    const local = localStorage.getItem('graceos_staff_users');
    return local ? JSON.parse(local) : [
      { id: 1, name: 'Senior Pastor', username: 'pastor.lead', email: 'pastor@gracechurch.org', phone: '+91 98765 43210', role: 'Super Admin', campus: 'All Campuses', status: 'Active' },
      { id: 2, name: 'Brother David', username: 'david.admin', email: 'david@gracechurch.org', phone: '+91 94433 11223', role: 'Campus Admin', campus: 'Grace North Campus', status: 'Active' },
      { id: 3, name: 'Sister Sarah', username: 'sarah.fin', email: 'finance@gracechurch.org', phone: '+91 91234 56789', role: 'Finance Officer', campus: 'Headquarters', status: 'Active' },
    ];
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: '', username: '', email: '', phone: '', role: 'Campus Admin', campus: 'Headquarters', password: '' });

  const sync = (data) => {
    setUsers(data);
    localStorage.setItem('graceos_staff_users', JSON.stringify(data));
  };

  const handleOpenAdd = () => {
    setEditItem(null);
    setForm({ name: '', username: '', email: '', phone: '', role: 'Campus Admin', campus: 'Headquarters', password: '' });
    setModalOpen(true);
  };

  const handleOpenEdit = (user) => {
    setEditItem(user);
    setForm({ ...user, password: '' });
    setModalOpen(true);
  };

  const handleDelete = (id) => {
    if (id === 1) {
      alert('The primary Super Admin profile cannot be removed.');
      return;
    }
    sync(users.filter(u => u.id !== id));
  };

  const handleSaveUser = (e) => {
    e.preventDefault();
    if (!form.name || !form.username) return;

    if (editItem) {
      sync(users.map(u => u.id === editItem.id ? { ...form, id: editItem.id, status: editItem.status } : u));
    } else {
      sync([...users, { ...form, id: Date.now(), status: 'Active' }]);
    }
    setModalOpen(false);
  };

  return (
    <div className="flex flex-col gap-5 max-w-5xl select-none">
      
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-white">Staff Credentials & Users ({users.length})</h4>
          <p className="text-xs text-slate-400">Configure role-based access accounts for pastors, administrators, and coordinators.</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 active:scale-95 transition"
        >
          <UserPlus size={15} /> Add New User
        </button>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl border border-white/[0.08] overflow-hidden bg-black/20">
        <table className="w-full text-left text-xs">
          <thead className="bg-white/[0.04] text-slate-400 border-b border-white/[0.06]">
            <tr>
              <th className="p-3.5">Staff Member</th>
              <th className="p-3.5">Assigned Role</th>
              <th className="p-3.5">Designated Campus</th>
              <th className="p-3.5">Contact Details</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04] text-slate-300 font-medium">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-white/[0.02] transition">
                <td className="p-3.5 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-bold shrink-0">
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
                  <p className="text-[11px] text-slate-300">{user.phone}</p>
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
                      onClick={() => handleOpenEdit(user)}
                      className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 flex items-center justify-center transition"
                    >
                      <Edit3 size={13} />
                    </button>
                    {user.id !== 1 && (
                      <button 
                        onClick={() => handleDelete(user.id)}
                        className="w-7 h-7 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 flex items-center justify-center transition"
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

      {/* Add / Edit User Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl p-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Users size={16} className="text-cyan-400" />
                {editItem ? 'Edit Staff Account' : 'Register New Staff User'}
              </h4>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-slate-300">Full Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Pastor John"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-slate-300">Username</label>
                  <input 
                    type="text" 
                    required
                    placeholder="john.pastor"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-slate-300">Access Role</label>
                  <select 
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option>Super Admin</option>
                    <option>Campus Admin</option>
                    <option>Finance Officer</option>
                    <option>Volunteer Lead</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-slate-300">Phone</label>
                  <input 
                    type="text" 
                    placeholder="+91 98765 00000"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-slate-300">Campus Node</label>
                  <input 
                    type="text" 
                    placeholder="Headquarters"
                    value={form.campus}
                    onChange={(e) => setForm({ ...form, campus: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-slate-300">Email Address</label>
                <input 
                  type="email" 
                  placeholder="staff@gracechurch.org"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-white/10">
                <button 
                  type="button" 
                  onClick={() => setModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-slate-300 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-xs font-bold text-slate-950 transition flex items-center gap-1.5 shadow-lg shadow-cyan-500/20"
                >
                  <Check size={14} /> Save Staff User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}