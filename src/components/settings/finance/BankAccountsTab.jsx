import React, { useState } from 'react';
import { CreditCard, Plus, QrCode, Trash2, Edit3, X, Check, Building, Wallet } from 'lucide-react';

export default function BankAccountsTab() {
  const [accounts, setAccounts] = useState(() => {
    const local = localStorage.getItem('graceos_bank_accounts');
    return local ? JSON.parse(local) : [
      { id: 1, bankName: 'State Bank of India', accNumber: '39482019482', ifsc: 'SBIN0001234', branch: 'Koduvai Main', upiId: 'gracechurch@sbi', type: 'Primary Current A/C', balance: '₹ 14,82,500' },
      { id: 2, bankName: 'HDFC Bank', accNumber: '5020003928194', ifsc: 'HDFC0004567', branch: 'City Branch', upiId: 'gracecity@hdfcbank', type: 'Building Fund A/C', balance: '₹ 28,40,000' },
      { id: 3, bankName: 'Petty Cash Vault', accNumber: 'CASH-DESK-01', ifsc: 'N/A', branch: 'Main Office', upiId: 'N/A', type: 'Office Cash Vault', balance: '₹ 45,000' }
    ];
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ bankName: '', accNumber: '', ifsc: '', branch: '', upiId: '', type: 'Primary Current A/C', balance: '₹ 0' });

  const sync = (data) => {
    setAccounts(data);
    localStorage.setItem('graceos_bank_accounts', JSON.stringify(data));
  };

  const handleOpenAdd = () => {
    setEditItem(null);
    setForm({ bankName: '', accNumber: '', ifsc: '', branch: '', upiId: '', type: 'Primary Current A/C', balance: '₹ 0' });
    setModalOpen(true);
  };

  const handleOpenEdit = (acc) => {
    setEditItem(acc);
    setForm(acc);
    setModalOpen(true);
  };

  const handleDelete = (id) => {
    if (accounts.length === 1) {
      alert('At least one primary account must remain configured.');
      return;
    }
    sync(accounts.filter(a => a.id !== id));
  };

  const handleSaveAccount = (e) => {
    e.preventDefault();
    if (!form.bankName || !form.accNumber) return;

    if (editItem) {
      sync(accounts.map(a => a.id === editItem.id ? { ...form, id: editItem.id } : a));
    } else {
      sync([...accounts, { ...form, id: Date.now() }]);
    }
    setModalOpen(false);
  };

  return (
    <div className="flex flex-col gap-5 max-w-5xl select-none">
      
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-white">Configured Bank Accounts & Treasury ({accounts.length})</h4>
          <p className="text-xs text-slate-400">Manage church bank ledgers, UPI merchant endpoints, and emergency cash vaults.</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 active:scale-95 transition"
        >
          <Plus size={15} /> Add Bank / Vault
        </button>
      </div>

      {/* Accounts Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map(acc => (
          <div key={acc.id} className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex flex-col justify-between gap-4 hover:border-cyan-500/30 transition">
            <div className="flex flex-col gap-2.5">
              
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                  {acc.type}
                </span>
                <span className="text-xs font-mono font-bold text-emerald-400">{acc.balance}</span>
              </div>

              <div>
                <h5 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                  {acc.type.includes('Cash') ? <Wallet size={15} className="text-amber-400" /> : <Building size={15} className="text-indigo-400" />}
                  <span>{acc.bankName}</span>
                </h5>
                <p className="text-xs text-slate-400 font-mono mt-0.5">A/C: {acc.accNumber}</p>
              </div>

              <div className="flex flex-col gap-1 text-[11px] text-slate-400 border-t border-white/5 pt-2">
                <span className="flex items-center justify-between">
                  <span>IFSC:</span>
                  <span className="text-slate-200 font-mono">{acc.ifsc}</span>
                </span>
                <span className="flex items-center justify-between">
                  <span>UPI ID:</span>
                  <span className="text-cyan-400 font-mono">{acc.upiId}</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-white/5">
              <button 
                onClick={() => handleOpenEdit(acc)}
                className="flex-1 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 text-xs font-medium transition flex items-center justify-center gap-1.5"
              >
                <Edit3 size={13} /> Edit
              </button>
              <button 
                onClick={() => handleDelete(acc.id)}
                className="w-8 h-8 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 flex items-center justify-center transition"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Bank Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl p-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <CreditCard size={16} className="text-cyan-400" />
                {editItem ? 'Edit Account Ledger' : 'Add Bank Account / Cash Vault'}
              </h4>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveAccount} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-slate-300">Bank / Vault Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. State Bank of India"
                  value={form.bankName}
                  onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-slate-300">Account / Vault ID</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Account Number"
                    value={form.accNumber}
                    onChange={(e) => setForm({ ...form, accNumber: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-slate-300">Account Type</label>
                  <select 
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option>Primary Current A/C</option>
                    <option>Building Fund A/C</option>
                    <option>Charity / Mission A/C</option>
                    <option>Office Cash Vault</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-slate-300">IFSC Code</label>
                  <input 
                    type="text" 
                    placeholder="SBIN0001234"
                    value={form.ifsc}
                    onChange={(e) => setForm({ ...form, ifsc: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-slate-300">Opening Balance</label>
                  <input 
                    type="text" 
                    placeholder="₹ 0"
                    value={form.balance}
                    onChange={(e) => setForm({ ...form, balance: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-slate-300">UPI ID (VPA)</label>
                <input 
                  type="text" 
                  placeholder="gracechurch@upi"
                  value={form.upiId}
                  onChange={(e) => setForm({ ...form, upiId: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
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
                  <Check size={14} /> Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}