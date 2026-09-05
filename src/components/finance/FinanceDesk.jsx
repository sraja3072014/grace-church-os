import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, Wallet, Receipt, FileText, Plus,
  ArrowUpRight, ArrowDownLeft, ShieldCheck, Trash2, 
  Printer, CheckCircle2, Search, DollarSign, X
} from 'lucide-react';

export const DEFAULT_GIVING_CATEGORIES = [
  'Sunday Tithes (10%)',
  'General Sunday Offering',
  'Church Building & Expansion Fund',
  'Mission & Evangelism Outreach',
  'Thanksgiving & Special Vows',
  'Sunday School & Youth Ministry'
];

const SEED_INCOME = [
  { id: 'INC-1001', date: '2026-08-26', member: 'Bro. John Doe', panNumber: 'ABCDE1234F', category: 'Sunday Tithes (10%)', amount: 15000, mode: 'UPI / GPay' },
  { id: 'INC-1002', date: '2026-08-24', member: 'Bro. Samuel David', panNumber: 'BKZPD9921K', category: 'Church Building & Expansion Fund', amount: 25000, mode: 'Bank Transfer' },
  { id: 'INC-1003', date: '2026-08-22', member: 'Anonymous Believer', panNumber: '', category: 'General Sunday Offering', amount: 8500, mode: 'Cash' }
];

const SEED_EXPENSES = [
  { id: 'EXP-101', date: '2026-08-27', category: 'Electricity & Utility Bills', amount: 3450, paymentMode: 'Bank Transfer', notes: 'TNEB Main Hall' },
  { id: 'EXP-102', date: '2026-08-25', category: 'Sound, Media & Instruments', amount: 12000, paymentMode: 'UPI / GPay', notes: 'Wireless Mic System' }
];

export default function FinanceDesk({ session }) {
  const [activeTab, setActiveTab] = useState('income'); // 'income' | 'expenses' | 'receipts_80g'
  const [toastMessage, setToastMessage] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  // Settings-ல் இருந்து கரன்சி சிம்பலை எடுத்தல்
  const currencySymbol = useMemo(() => {
    try {
      const cfg = JSON.parse(localStorage.getItem('graceos_locale_config') || '{}');
      return cfg.currencySymbol || '₹';
    } catch {
      return '₹';
    }
  }, []);

  // Income Ledger State
  const [incomeList, setIncomeList] = useState(() => {
    try {
      const saved = localStorage.getItem('app_finance_transactions_ledger');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      localStorage.setItem('app_finance_transactions_ledger', JSON.stringify(SEED_INCOME));
      return SEED_INCOME;
    } catch {
      return SEED_INCOME;
    }
  });

  // Expenses Ledger State
  const [expensesList, setExpensesList] = useState(() => {
    try {
      const saved = localStorage.getItem('app_expenses_ledger');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      localStorage.setItem('app_expenses_ledger', JSON.stringify(SEED_EXPENSES));
      return SEED_EXPENSES;
    } catch {
      return SEED_EXPENSES;
    }
  });

  // New Income Form
  const [incomeForm, setIncomeForm] = useState({
    member: '',
    panNumber: '',
    category: DEFAULT_GIVING_CATEGORIES[0],
    amount: '',
    mode: 'UPI / GPay'
  });

  // New Expense Form
  const [expenseForm, setExpenseForm] = useState({
    category: 'Electricity & Utility Bills',
    amount: '',
    paymentMode: 'Bank Transfer',
    notes: ''
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Aggregate Calculations
  const totalIncome = incomeList.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const totalExpenses = expensesList.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const netBalance = totalIncome - totalExpenses;

  const handleAddIncome = (e) => {
    e.preventDefault();
    if (!incomeForm.amount || Number(incomeForm.amount) <= 0) return;

    const newIncome = {
      id: `INC-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().split('T')[0],
      ...incomeForm,
      amount: Number(incomeForm.amount)
    };

    const updated = [newIncome, ...incomeList];
    setIncomeList(updated);
    localStorage.setItem('app_finance_transactions_ledger', JSON.stringify(updated));
    setIncomeForm({ member: '', panNumber: '', category: DEFAULT_GIVING_CATEGORIES[0], amount: '', mode: 'UPI / GPay' });
    showToast('Tithe / Offering collection recorded successfully!');
  };

  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!expenseForm.amount || Number(expenseForm.amount) <= 0) return;

    const newExp = {
      id: `EXP-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().split('T')[0],
      ...expenseForm,
      amount: Number(expenseForm.amount)
    };

    const updated = [newExp, ...expensesList];
    setExpensesList(updated);
    localStorage.setItem('app_expenses_ledger', JSON.stringify(updated));
    setExpenseForm({ category: 'Electricity & Utility Bills', amount: '', paymentMode: 'Bank Transfer', notes: '' });
    showToast('Expense voucher added to records!');
  };

  const handleDeleteIncome = (id) => {
    const updated = incomeList.filter(item => item.id !== id);
    setIncomeList(updated);
    localStorage.setItem('app_finance_transactions_ledger', JSON.stringify(updated));
    showToast('Income receipt removed.');
  };

  const handleDeleteExpense = (id) => {
    const updated = expensesList.filter(item => item.id !== id);
    setExpensesList(updated);
    localStorage.setItem('app_expenses_ledger', JSON.stringify(updated));
    showToast('Expense record removed.');
  };

  return (
    <div className="flex flex-col gap-6 select-none animate-in fade-in duration-200 pb-16 text-slate-100">
      
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-5 right-5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 backdrop-blur-md shadow-2xl z-50 animate-in fade-in">
          <CheckCircle2 size={15} />
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Receipt className="text-emerald-400" size={24} />
            <span>Finance Desk & 80G Tax Accounting</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time tithe ledger, operational expense vouchers, and automatic 80G charitable tax exemption receipts.
          </p>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex items-center gap-1.5 p-1 bg-black/40 rounded-2xl border border-white/10 shrink-0">
          <button
            onClick={() => setActiveTab('income')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'income' ? 'bg-emerald-500 text-slate-950 shadow-md font-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp size={14} />
            <span>Income & Tithes</span>
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'expenses' ? 'bg-rose-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Receipt size={14} />
            <span>Expense Vouchers</span>
          </button>
          <button
            onClick={() => setActiveTab('receipts_80g')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'receipts_80g' ? 'bg-gradient-to-r from-rose-500 to-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText size={14} />
            <span>80G Receipt Generator</span>
          </button>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Income */}
        <div className="win11-card p-5 rounded-3xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono uppercase">Total Giving & Tithes</span>
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <ArrowDownLeft size={16} />
            </span>
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            {currencySymbol} {totalIncome.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400 block">{incomeList.length} total tithe receipts issued</span>
        </div>

        {/* Total Expenses */}
        <div className="win11-card p-5 rounded-3xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono uppercase">Total Expense Outflow</span>
            <span className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <ArrowUpRight size={16} />
            </span>
          </div>
          <div className="text-2xl font-black text-rose-400 font-mono">
            {currencySymbol} {totalExpenses.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400 block">{expensesList.length} vouchers recorded</span>
        </div>

        {/* Net Balance */}
        <div className="win11-card p-5 rounded-3xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono uppercase">Net Operating Liquidity</span>
            <span className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
              <Wallet size={16} />
            </span>
          </div>
          <div className={`text-2xl font-black font-mono ${netBalance >= 0 ? 'text-sky-400' : 'text-rose-400'}`}>
            {currencySymbol} {netBalance.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400 block">Available in bank & cash accounts</span>
        </div>
      </div>

      {/* TAB 1: INCOME & TITHES */}
      {activeTab === 'income' && (
        <div className="space-y-6">
          {/* Add Form */}
          <div className="win11-card p-6 rounded-3xl border border-white/10 space-y-4">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2 font-mono">
              <Plus size={16} />
              <span>Record New Tithe / Offering Inflow</span>
            </h3>

            <form onSubmit={handleAddIncome} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-xs text-slate-300 font-medium">Contributor Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bro. David Miller"
                  value={incomeForm.member}
                  onChange={(e) => setIncomeForm({ ...incomeForm, member: e.target.value })}
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white mt-1 focus:outline-none focus:border-emerald-500 font-bold"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium">Giving Category *</label>
                <select
                  value={incomeForm.category}
                  onChange={(e) => setIncomeForm({ ...incomeForm, category: e.target.value })}
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white mt-1 focus:outline-none cursor-pointer"
                >
                  {DEFAULT_GIVING_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium">Amount ({currencySymbol}) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="e.g. 10000"
                  value={incomeForm.amount}
                  onChange={(e) => setIncomeForm({ ...incomeForm, amount: e.target.value })}
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-emerald-400 font-mono font-bold mt-1 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium">Payment Mode</label>
                <select
                  value={incomeForm.mode}
                  onChange={(e) => setIncomeForm({ ...incomeForm, mode: e.target.value })}
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white mt-1 focus:outline-none cursor-pointer"
                >
                  <option value="UPI / GPay">UPI / GPay / QR</option>
                  <option value="Bank Transfer">Bank Transfer (NEFT)</option>
                  <option value="Cash">Cash Offering</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>

              <div className="sm:col-span-4 flex justify-between items-center pt-2">
                <input
                  type="text"
                  placeholder="PAN / Tax Identification Number (Optional for 80G Receipt)"
                  value={incomeForm.panNumber}
                  onChange={(e) => setIncomeForm({ ...incomeForm, panNumber: e.target.value.toUpperCase() })}
                  className="w-72 bg-slate-950/80 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none"
                />

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black rounded-xl shadow-lg flex items-center gap-1.5 cursor-pointer active:scale-95 transition text-xs"
                >
                  <Plus size={15} />
                  <span>Save Tithe Record</span>
                </button>
              </div>
            </form>
          </div>

          {/* Income Table */}
          <div className="win11-card rounded-3xl overflow-hidden border border-white/10">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-white/10 text-slate-400 text-[10px] uppercase font-mono bg-white/[0.02]">
                  <tr>
                    <th className="py-3 px-3.5">Receipt ID</th>
                    <th className="py-3 px-3.5">Date</th>
                    <th className="py-3 px-3.5">Contributor</th>
                    <th className="py-3 px-3.5">Category</th>
                    <th className="py-3 px-3.5">Payment Channel</th>
                    <th className="py-3 px-3.5 text-right">Amount</th>
                    <th className="py-3 px-3.5 text-center">80G / Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {incomeList.map((item) => (
                    <tr key={item.id} className="hover:bg-white/[0.02] transition">
                      <td className="py-3 px-3.5 font-mono font-bold text-amber-400">{item.id}</td>
                      <td className="py-3 px-3.5 text-slate-300 font-mono text-[11px]">{item.date}</td>
                      <td className="py-3 px-3.5 font-semibold text-white">
                        <div>{item.member}</div>
                        {item.panNumber && <div className="text-[10px] text-slate-400 font-mono">PAN: {item.panNumber}</div>}
                      </td>
                      <td className="py-3 px-3.5 text-emerald-400 font-medium">{item.category}</td>
                      <td className="py-3 px-3.5 text-slate-400 font-mono text-[11px]">{item.mode}</td>
                      <td className="py-3 px-3.5 text-right font-mono font-bold text-emerald-400">
                        + {currencySymbol} {Number(item.amount).toLocaleString()}
                      </td>
                      <td className="py-3 px-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedReceipt(item)}
                            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-300 border border-white/10 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                            title="Generate 80G Print Receipt"
                          >
                            <Printer size={12} />
                            <span>80G Receipt</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteIncome(item.id)}
                            className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: EXPENSES */}
      {activeTab === 'expenses' && (
        <div className="space-y-6">
          <div className="win11-card p-6 rounded-3xl border border-white/10 space-y-4">
            <h3 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2 font-mono">
              <Plus size={16} />
              <span>Record Church Expense Outflow Voucher</span>
            </h3>

            <form onSubmit={handleAddExpense} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-slate-300 font-medium">Expense Category *</label>
                <select
                  value={expenseForm.category}
                  onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white mt-1 focus:outline-none cursor-pointer"
                >
                  <option value="Electricity & Utility Bills">Electricity & Utility Bills</option>
                  <option value="Sound, Media & Instruments">Sound, Media & Instruments</option>
                  <option value="Pastoral Honorarium & Staff">Pastoral Honorarium & Staff</option>
                  <option value="Charity, Food & Benevolence">Charity, Food & Benevolence</option>
                  <option value="Church Building Maintenance">Church Building Maintenance</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium">Amount ({currencySymbol}) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="e.g. 4500"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-rose-400 font-mono font-bold mt-1 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium">Payment Mode</label>
                <select
                  value={expenseForm.paymentMode}
                  onChange={(e) => setExpenseForm({ ...expenseForm, paymentMode: e.target.value })}
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white mt-1 focus:outline-none cursor-pointer"
                >
                  <option value="Bank Transfer">Bank Transfer (NEFT)</option>
                  <option value="UPI / GPay">UPI / GPay</option>
                  <option value="Cash">Cash Voucher</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>

              <div className="sm:col-span-3 flex justify-between items-center gap-4 pt-1">
                <input
                  type="text"
                  placeholder="Description / Bill Invoice Notes (e.g. Hall AC repair bill)"
                  value={expenseForm.notes}
                  onChange={(e) => setExpenseForm({ ...expenseForm, notes: e.target.value })}
                  className="flex-1 bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-rose-500 to-amber-600 hover:from-rose-400 hover:to-amber-500 text-white font-bold rounded-xl shadow-lg flex items-center gap-1.5 cursor-pointer active:scale-95 transition text-xs shrink-0"
                >
                  <Plus size={15} />
                  <span>File Voucher</span>
                </button>
              </div>
            </form>
          </div>

          {/* Expenses Table */}
          <div className="win11-card rounded-3xl overflow-hidden border border-white/10">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-white/10 text-slate-400 text-[10px] uppercase font-mono bg-white/[0.02]">
                  <tr>
                    <th className="py-3 px-3.5">Voucher ID</th>
                    <th className="py-3 px-3.5">Date</th>
                    <th className="py-3 px-3.5">Category</th>
                    <th className="py-3 px-3.5">Description Notes</th>
                    <th className="py-3 px-3.5">Channel</th>
                    <th className="py-3 px-3.5 text-right">Amount</th>
                    <th className="py-3 px-3.5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {expensesList.map((item) => (
                    <tr key={item.id} className="hover:bg-white/[0.02] transition">
                      <td className="py-3 px-3.5 font-mono font-bold text-rose-400">{item.id}</td>
                      <td className="py-3 px-3.5 text-slate-300 font-mono text-[11px]">{item.date}</td>
                      <td className="py-3 px-3.5 font-semibold text-white">{item.category}</td>
                      <td className="py-3 px-3.5 text-slate-400">{item.notes || '-'}</td>
                      <td className="py-3 px-3.5 text-slate-400 font-mono text-[11px]">{item.paymentMode}</td>
                      <td className="py-3 px-3.5 text-right font-mono font-bold text-rose-400">
                        - {currencySymbol} {Number(item.amount).toLocaleString()}
                      </td>
                      <td className="py-3 px-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteExpense(item.id)}
                          className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: 80G RECEIPT GENERATOR SEARCH */}
      {activeTab === 'receipts_80g' && (
        <div className="win11-card p-6 rounded-3xl border border-white/10 space-y-4">
          <div className="border-b border-white/10 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="text-amber-400" size={18} />
              <span>Direct 80G Tax Exemption Certificate Directory</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Click any record below to print a formal 80G receipt for tax deduction purposes.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {incomeList.map((item) => (
              <div 
                key={item.id}
                onClick={() => setSelectedReceipt(item)}
                className="p-4 rounded-2xl bg-black/40 border border-white/10 hover:border-amber-500/50 cursor-pointer transition space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{item.member}</span>
                    <span className="text-[10px] font-mono text-amber-400 font-bold">{item.id}</span>
                  </div>
                  <div className="text-[11px] text-slate-400">{item.category}</div>
                  {item.panNumber && <div className="text-[10px] font-mono text-slate-500">PAN: {item.panNumber}</div>}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <span className="text-xs font-mono font-bold text-emerald-400">{currencySymbol} {Number(item.amount).toLocaleString()}</span>
                  <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                    <Printer size={12} /> View 80G
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 🌟 80G PRINTABLE MODAL POPUP */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-xl bg-white text-slate-900 rounded-3xl p-8 shadow-2xl space-y-6 relative select-text">
            
            {/* Close Button */}
            <button 
              onClick={() => setSelectedReceipt(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 cursor-pointer print:hidden"
            >
              <X size={20} />
            </button>

            {/* Receipt Letterhead */}
            <div className="text-center border-b-2 border-slate-900 pb-4 space-y-1">
              <span className="text-[10px] font-bold tracking-widest uppercase text-emerald-700 bg-emerald-100 px-3 py-0.5 rounded-full">
                80G Official Tax Exemption Donation Receipt
              </span>
              <h2 className="text-xl font-black uppercase tracking-wider text-slate-900 pt-1">
                Grace Cathedral Church Trust
              </h2>
              <p className="text-xs text-slate-600 font-medium">Registered Public Charitable Trust • IT Act Sec 80G Valid</p>
              <p className="text-[11px] font-mono text-slate-500">80G Reg No: AABTG4902RF20214 • 12A Unique ID: DEL-TRUST-2018</p>
            </div>

            {/* Receipt Particulars */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 font-medium">Receipt Voucher No:</span>
                <div className="font-mono font-bold text-slate-900">{selectedReceipt.id}</div>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Date of Receipt:</span>
                <div className="font-mono font-bold text-slate-900">{selectedReceipt.date}</div>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Donated By:</span>
                <div className="font-bold text-slate-900">{selectedReceipt.member}</div>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Donor PAN / ID:</span>
                <div className="font-mono font-bold text-slate-900">{selectedReceipt.panNumber || 'Not Quoted'}</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex justify-between items-center text-xs">
              <div>
                <span className="text-slate-500 block">Contribution Purpose</span>
                <strong className="text-slate-900 font-bold">{selectedReceipt.category}</strong>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block">Total Donated Amount</span>
                <span className="text-lg font-black font-mono text-emerald-700">
                  {currencySymbol} {Number(selectedReceipt.amount).toLocaleString()}
                </span>
              </div>
            </div>

            <p className="text-[10px] text-slate-500 text-center italic">
              "Contributions to this trust are eligible for tax deduction under Section 80G of the Income Tax Act."
            </p>

            {/* Signatures & Print */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <div className="text-center text-[10px]">
                <div className="w-24 border-b border-slate-400 mb-1"></div>
                <span>Authorized Treasurer</span>
              </div>
              <div className="text-center text-[10px]">
                <div className="w-24 border-b border-slate-400 mb-1"></div>
                <span>Senior Pastor / Trustee</span>
              </div>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer print:hidden"
              >
                <Printer size={14} />
                <span>Print Official Receipt</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}