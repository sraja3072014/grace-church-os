import React, { useState, useMemo } from 'react';
import { 
  Receipt, DollarSign, ArrowUpRight, Search, 
  Printer, CheckCircle2, Building2, Wallet, 
  Calendar, User, Plus, Filter, Download, Landmark
} from 'lucide-react';

export default function FinanceDesk({ session }) {
  const [toast, setToast] = useState('');
  const [activeSubTab, setActiveSubTab] = useState('entry'); // 'entry' | 'ledger'
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Load Families from LocalStorage for Auto-fill
  const [families] = useState(() => {
    try {
      const saved = localStorage.getItem('app_members_family_database');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 2. Transaction Records State
  const [transactions, setTransactions] = useState(() => {
    try {
      const saved = localStorage.getItem('graceos_finance_ledger');
      return saved ? JSON.parse(saved) : [
        {
          receiptNo: 'REC-80G-1001',
          date: new Date().toISOString().split('T')[0],
          donorName: 'Bro. John Peter',
          phone: '+91 98765 43210',
          pan: 'ABCDE1234F',
          category: 'Tithe',
          amount: 25000,
          paymentMode: 'UPI / NetBanking',
          bankAccount: 'Main Cathedral Treasury (SBI - 4401)',
          notes: 'Family monthly kingdom giving'
        },
        {
          receiptNo: 'REC-80G-1002',
          date: new Date().toISOString().split('T')[0],
          donorName: 'Sister Mary Grace',
          phone: '+91 98450 11223',
          pan: '',
          category: 'Building Fund',
          amount: 15000,
          paymentMode: 'Cash Deposit',
          bankAccount: 'North Campus Building (HDFC - 8812)',
          notes: 'Youth Hall Expansion donation'
        }
      ];
    } catch {
      return [];
    }
  });

  // Flattened Believers for Search Auto-fill
  const allDonors = useMemo(() => {
    const list = [];
    families.forEach(f => {
      if (f.headMember) {
        list.push({
          name: f.headMember.name,
          phone: f.headMember.phone || '',
          pan: f.headMember.panNo || ''
        });
      }
      (f.members || []).forEach(m => {
        list.push({
          name: m.name,
          phone: m.phone || f.headMember?.phone || '',
          pan: m.panNo || ''
        });
      });
    });
    return list;
  }, [families]);

  // Form State
  const [formData, setFormData] = useState({
    donorName: '',
    phone: '',
    pan: '',
    category: 'Tithe',
    amount: '',
    paymentMode: 'UPI / Online Transfer',
    bankAccount: 'Main Cathedral Treasury (SBI - 4401)',
    notes: ''
  });

  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const handleSelectDonor = (donor) => {
    setFormData(prev => ({
      ...prev,
      donorName: donor.name,
      phone: donor.phone,
      pan: donor.pan || prev.pan
    }));
  };

  const handleSaveTransaction = (e) => {
    e.preventDefault();
    if (!formData.donorName.trim() || !formData.amount) {
      showToast('Donor name and amount are required!');
      return;
    }

    const newReceiptNo = `REC-80G-${1000 + transactions.length + 1}`;
    const newRecord = {
      ...formData,
      amount: parseFloat(formData.amount),
      receiptNo: newReceiptNo,
      date: new Date().toISOString().split('T')[0],
      recordedBy: session?.username || 'Finance Desk Officer'
    };

    const updated = [newRecord, ...transactions];
    setTransactions(updated);
    localStorage.setItem('graceos_finance_ledger', JSON.stringify(updated));
    showToast(`Receipt ${newReceiptNo} Created Successfully!`);

    // Reset Form
    setFormData({
      donorName: '',
      phone: '',
      pan: '',
      category: 'Tithe',
      amount: '',
      paymentMode: 'UPI / Online Transfer',
      bankAccount: 'Main Cathedral Treasury (SBI - 4401)',
      notes: ''
    });
  };

  // Metrics
  const totalInflow = useMemo(() => transactions.reduce((sum, t) => sum + (t.amount || 0), 0), [transactions]);
  const titheTotal = useMemo(() => transactions.filter(t => t.category === 'Tithe').reduce((sum, t) => sum + (t.amount || 0), 0), [transactions]);
  const buildingTotal = useMemo(() => transactions.filter(t => t.category === 'Building Fund').reduce((sum, t) => sum + (t.amount || 0), 0), [transactions]);

  return (
    <div className="flex flex-col gap-6 select-none animate-in fade-in duration-200 pb-12">
      
      {toast && (
        <div className="fixed top-5 right-5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 backdrop-blur-md shadow-2xl z-50 animate-in fade-in">
          <CheckCircle2 size={15} />
          <span className="font-semibold">{toast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Receipt className="text-amber-400" size={24} />
            <span>Finance Desk & 80G Tax Auditor</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Record tithes, generate official 80G tax-exempt donation receipts, and manage branch ledgers.
          </p>
        </div>

        <div className="flex items-center gap-2 p-1 rounded-xl bg-black/40 border border-white/10">
          <button
            onClick={() => setActiveSubTab('entry')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              activeSubTab === 'entry' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Plus size={14} /> Quick Entry & Receipt
          </button>
          <button
            onClick={() => setActiveSubTab('ledger')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              activeSubTab === 'ledger' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Wallet size={14} /> Treasury Ledger ({transactions.length})
          </button>
        </div>
      </div>

      {/* Metric Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 win11-card rounded-2xl flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400">Total Recorded Kingdom Inflow</span>
          <div className="mt-3">
            <div className="text-3xl font-black text-white font-mono">₹{totalInflow.toLocaleString()}</div>
            <span className="text-[10px] text-emerald-400 font-semibold mt-1 block">Audit Synchronized</span>
          </div>
        </div>

        <div className="p-5 win11-card rounded-2xl flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400">Total Tithe & Offerings (MTD)</span>
          <div className="mt-3">
            <div className="text-3xl font-black text-amber-300 font-mono">₹{titheTotal.toLocaleString()}</div>
            <span className="text-[10px] text-slate-400 font-semibold mt-1 block">Cathedral Treasury Allocation</span>
          </div>
        </div>

        <div className="p-5 win11-card rounded-2xl flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400">Building Fund Capital</span>
          <div className="mt-3">
            <div className="text-3xl font-black text-cyan-300 font-mono">₹{buildingTotal.toLocaleString()}</div>
            <span className="text-[10px] text-slate-400 font-semibold mt-1 block">Campus Expansion Reserve</span>
          </div>
        </div>
      </div>

      {/* Main Mode View */}
      {activeSubTab === 'entry' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Form Entry */}
          <form onSubmit={handleSaveTransaction} className="lg:col-span-2 p-6 win11-card rounded-3xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Plus size={16} className="text-amber-400" />
                Issue 80G Tax Exemption Donation Receipt
              </h3>
              <span className="text-xs font-mono text-cyan-300 font-bold">Live Counter</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-300 font-medium">Donor / Believer Full Name *</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Bro. John Peter"
                  value={formData.donorName}
                  onChange={(e) => setFormData({ ...formData, donorName: e.target.value })}
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:outline-none focus:border-cyan-400 font-bold"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium">Mobile Contact Phone</label>
                <input 
                  type="text"
                  placeholder="+91 98765..."
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:outline-none font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-slate-300 font-medium">Giving Purpose / Category</label>
                <select 
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-amber-300 font-bold mt-1 focus:outline-none cursor-pointer"
                >
                  <option value="Tithe">Tithe (தசமபாகம்)</option>
                  <option value="Thanksgiving Offering">Thanksgiving Offering (ஸ்தோத்திரம்)</option>
                  <option value="Building Fund">Building Fund (கட்டிட நிதி)</option>
                  <option value="Mission & Outreach">Mission & Outreach (ஊழிய நிதி)</option>
                  <option value="Poor & Benevolence">Poor & Needy (அன்பின் காணிக்கை)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium">Contribution Amount (INR ₹) *</label>
                <input 
                  type="number"
                  required
                  placeholder="e.g. 5000"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-emerald-400 font-black font-mono mt-1 focus:outline-none focus:border-emerald-400 text-base"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium">Donor PAN No. (For 80G Exemption)</label>
                <input 
                  type="text"
                  placeholder="e.g. ABCDE1234F"
                  value={formData.pan}
                  onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono mt-1 focus:outline-none uppercase"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-300 font-medium">Payment Mode</label>
                <select 
                  value={formData.paymentMode}
                  onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white font-bold mt-1 focus:outline-none cursor-pointer"
                >
                  <option value="UPI / Online Transfer">UPI / GPay / NetBanking</option>
                  <option value="Cash Deposit">Cash Deposit (Counter)</option>
                  <option value="Cheque / DD">Cheque / Demand Draft</option>
                  <option value="Card Machine / POS">Card Machine / POS Swipe</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium">Target Bank Treasury Account</label>
                <select 
                  value={formData.bankAccount}
                  onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-cyan-300 font-bold mt-1 focus:outline-none cursor-pointer"
                >
                  <option value="Main Cathedral Treasury (SBI - 4401)">Main Cathedral Treasury (SBI - 4401)</option>
                  <option value="North Campus Building (HDFC - 8812)">North Campus Building (HDFC - 8812)</option>
                  <option value="Mission & Outreach (ICICI - 2045)">Mission & Outreach (ICICI - 2045)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-300 font-medium">Special Prayer Notes / Blessings</label>
              <input 
                type="text"
                placeholder="Family thanksgiving prayer request..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white mt-1 focus:outline-none"
              />
            </div>

            <button 
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-amber-500/20 active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer mt-4"
            >
              <CheckCircle2 size={16} />
              <span>Record Giving & Generate 80G Tax Receipt</span>
            </button>
          </form>

          {/* Donor Fast Lookup Sidebar */}
          <div className="p-6 win11-card rounded-3xl flex flex-col justify-between gap-4">
            <div className="space-y-3">
              <div className="border-b border-white/10 pb-2.5 flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <User size={15} className="text-cyan-400" />
                  Quick Believer Auto-fill
                </span>
                <span className="text-[10px] text-slate-400 font-mono">{allDonors.length} Souls</span>
              </div>

              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Filter name, phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-white/5 pr-1">
                {allDonors
                  .filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()) || d.phone.includes(searchQuery))
                  .slice(0, 8)
                  .map((d, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => handleSelectDonor(d)}
                      className="py-2.5 px-2 hover:bg-white/[0.04] rounded-xl cursor-pointer transition flex items-center justify-between"
                    >
                      <div>
                        <div className="text-xs font-bold text-white">{d.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{d.phone || 'No phone registered'}</div>
                      </div>
                      <span className="text-[9px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 font-bold border border-cyan-500/20">
                        Auto-fill
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            <p className="text-[10px] text-slate-500 text-center border-t border-white/5 pt-2">
              Syncs with Members Desk database.
            </p>
          </div>

        </div>
      ) : (
        /* Ledger Table View */
        <div className="p-6 win11-card rounded-3xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Treasury General Ledger</h3>
              <p className="text-xs text-slate-400 mt-0.5">Real-time ledger entries ready for annual audit export.</p>
            </div>
            <button 
              onClick={() => showToast('Exporting Excel / CSV Ledger...')}
              className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition"
            >
              <Download size={14} /> Export CSV
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-[11px] font-mono text-slate-400 uppercase">
                  <th className="py-2.5 px-3">Receipt No</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Donor Name</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Bank Account</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {transactions.map((t, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02] transition">
                    <td className="py-3 px-3 font-mono font-bold text-cyan-400">{t.receiptNo}</td>
                    <td className="py-3 px-3 text-slate-300">{t.date}</td>
                    <td className="py-3 px-3 font-bold text-white">
                      {t.donorName}
                      {t.pan && <span className="text-[10px] text-slate-400 block font-mono">PAN: {t.pan}</span>}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                        {t.category}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[11px] text-slate-400 truncate max-w-[180px]">{t.bankAccount}</td>
                    <td className="py-3 px-3 font-mono font-black text-emerald-400 text-sm">₹{t.amount.toLocaleString()}</td>
                    <td className="py-3 px-3 text-right">
                      <button 
                        onClick={() => setSelectedReceipt(t)}
                        className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-cyan-300 text-xs font-bold transition inline-flex items-center gap-1"
                      >
                        <Printer size={12} /> Print 80G
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 80G Printable Receipt Modal Overlay */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-slate-900 border border-white/20 shadow-2xl space-y-4 text-slate-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs font-bold font-mono text-amber-400 uppercase tracking-widest">
                Official 80G Tax Exemption Receipt
              </span>
              <button onClick={() => setSelectedReceipt(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="p-5 rounded-2xl bg-white text-slate-950 space-y-3 font-sans shadow-inner">
              <div className="text-center border-b border-slate-200 pb-2">
                <h3 className="text-base font-black tracking-tight text-slate-950 uppercase">Grace City Cathedral</h3>
                <p className="text-[10px] text-slate-600">Registered Trust No: GR-10948/2018 • 80G Unique Reg: AABTG4902RF20214</p>
                <p className="text-[9px] text-slate-500">Main Road, City Campus, Tamil Nadu, India</p>
              </div>

              <div className="flex justify-between text-xs font-mono font-bold border-b border-slate-100 pb-2">
                <span>Receipt: <strong>{selectedReceipt.receiptNo}</strong></span>
                <span>Date: <strong>{selectedReceipt.date}</strong></span>
              </div>

              <div className="text-xs space-y-1">
                <p>Received with thanks from: <strong className="text-sm font-black">{selectedReceipt.donorName}</strong></p>
                {selectedReceipt.pan && <p className="font-mono text-[11px]">Donor Income Tax PAN: <strong>{selectedReceipt.pan}</strong></p>}
                <p>On Account of: <strong className="text-amber-800">{selectedReceipt.category}</strong></p>
                <p>Payment Mode: <strong>{selectedReceipt.paymentMode}</strong> ({selectedReceipt.bankAccount})</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-100 border border-slate-300 flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-600">Sum Received:</span>
                <span className="text-xl font-black font-mono text-emerald-800">₹{selectedReceipt.amount.toLocaleString()}</span>
              </div>

              <div className="flex justify-between items-end pt-4 text-[10px] text-slate-500 border-t border-slate-200">
                <span>Certified under IT Act Sec 80G</span>
                <span className="text-right font-bold text-slate-800">Authorized Signatory / Treasurer</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button 
                onClick={() => window.print()}
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-black rounded-xl text-xs shadow-lg active:scale-98 transition flex items-center justify-center gap-2"
              >
                <Printer size={15} /> Print Official Receipt (A4 / Slip)
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}