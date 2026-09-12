import React, { useState, useMemo } from 'react';
import { 
  DollarSign, Users, Printer, Plus, CheckCircle2, 
  Calendar, Building, ShieldCheck, Download, Sparkles, Search 
} from 'lucide-react';
import { soundFX } from '../../utils/audioEngine';

export default function StaffPayrollDesk({ session }) {
  const [selectedMonth, setSelectedMonth] = useState('2026-09');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStaffPayslip, setSelectedStaffPayslip] = useState(null);

  // சபை ஊழியர்கள் பட்டியல்
  const [staffList, setStaffList] = useState(() => {
    try {
      const raw = localStorage.getItem('graceos_staff_payroll_db');
      return raw ? JSON.parse(raw) : [
        {
          id: 'STF-01',
          name: 'Rev. Senior Pastor',
          role: 'Presiding Pastor',
          category: 'PASTORAL', // 'PASTORAL' | 'MUSIC' | 'ADMIN' | 'SUPPORT'
          basicSalary: 45000,
          allowances: 10000, // Travel / Housing
          paymentMode: 'BANK_TRANSFER',
          accountNo: 'SB-99881122001',
          status: 'PAID', // 'PAID' | 'PENDING'
          paidDate: '2026-09-05'
        },
        {
          id: 'STF-02',
          name: 'Bro. Joshua Raj',
          role: 'Music Director & Pianist',
          category: 'MUSIC',
          basicSalary: 18000,
          allowances: 2000,
          paymentMode: 'UPI_DIRECT',
          accountNo: 'joshua@upi',
          status: 'PAID',
          paidDate: '2026-09-05'
        },
        {
          id: 'STF-03',
          name: 'Sis. Mary Stella',
          role: 'Church Admin Secretary',
          category: 'ADMIN',
          basicSalary: 20000,
          allowances: 2500,
          paymentMode: 'BANK_TRANSFER',
          accountNo: 'SB-44556677889',
          status: 'PENDING',
          paidDate: '-'
        },
        {
          id: 'STF-04',
          name: 'Bro. David Kumar',
          role: 'Campus Maintenance & Security',
          category: 'SUPPORT',
          basicSalary: 15000,
          allowances: 1500,
          paymentMode: 'CASH',
          accountNo: 'Cash in Hand',
          status: 'PAID',
          paidDate: '2026-09-06'
        }
      ];
    } catch {
      return [];
    }
  });

  const [form, setForm] = useState({
    name: '',
    role: '',
    category: 'PASTORAL',
    basicSalary: '',
    allowances: '',
    paymentMode: 'BANK_TRANSFER',
    accountNo: ''
  });

  const saveStaffList = (updated) => {
    setStaffList(updated);
    localStorage.setItem('graceos_staff_payroll_db', JSON.stringify(updated));
  };

  const handleAddStaff = (e) => {
    e.preventDefault();
    if (!form.name || !form.basicSalary) return;
    soundFX?.playSuccessChime?.();

    const newStaff = {
      id: `STF-${Date.now().toString().slice(-3)}`,
      name: form.name,
      role: form.role || 'Church Worker',
      category: form.category,
      basicSalary: Number(form.basicSalary) || 0,
      allowances: Number(form.allowances) || 0,
      paymentMode: form.paymentMode,
      accountNo: form.accountNo || 'N/A',
      status: 'PENDING',
      paidDate: '-'
    };

    saveStaffList([...staffList, newStaff]);
    setForm({ name: '', role: '', category: 'PASTORAL', basicSalary: '', allowances: '', paymentMode: 'BANK_TRANSFER', accountNo: '' });
  };

  // சம்பளம் பட்டுவாடா & நிதி லெட்ஜரில் பதிவு செய்தல்
  const handleDisburseSalary = (staff) => {
    soundFX?.playSuccessChime?.();
    const totalAmount = staff.basicSalary + staff.allowances;

    // நிதி லெட்ஜருக்கு அனுப்புதல்
    try {
      const raw = localStorage.getItem('app_finance_transactions_ledger');
      const ledger = raw ? JSON.parse(raw) : [];
      const newExpense = {
        id: `EXP-SAL-${Date.now().toString().slice(-4)}`,
        date: new Date().toISOString().slice(0, 10),
        category: `ஊழியர் சம்பளம் (${staff.name} - ${staff.role})`,
        amount: totalAmount,
        donor: 'Church Treasury (Payroll)'
      };
      localStorage.setItem('app_finance_transactions_ledger', JSON.stringify([newExpense, ...ledger]));
    } catch (e) {
      console.error(e);
    }

    const updated = staffList.map(s => 
      s.id === staff.id ? { ...s, status: 'PAID', paidDate: new Date().toISOString().slice(0, 10) } : s
    );
    saveStaffList(updated);
    alert(`₹ ${totalAmount.toLocaleString()} ஊதியம் வழங்கப்பட்டு, Finance லெட்ஜரில் பதிவு செய்யப்பட்டது!`);
  };

  // புள்ளிவிவரங்கள்
  const totalPayrollExpenditure = useMemo(() => {
    return staffList.reduce((acc, s) => acc + (s.basicSalary + s.allowances), 0);
  }, [staffList]);

  const paidPayrollAmount = useMemo(() => {
    return staffList
      .filter(s => s.status === 'PAID')
      .reduce((acc, s) => acc + (s.basicSalary + s.allowances), 0);
  }, [staffList]);

  const filteredStaff = staffList.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-5xl select-none text-slate-200 animate-in fade-in pb-12">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4 print:hidden">
        <div>
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <span>Staff Payroll & Pastoral Honorarium Hub</span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
              Disbursement Desk
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            போதகர், பாடகர்கள் மற்றும் ஊழியர்களின் சம்பளம், அலவன்ஸ் மற்றும் ஊதிய ரசீது (Payslip) மேலாண்மை.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-cyan-300 font-mono focus:outline-none cursor-pointer"
          />
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs print:hidden">
        <div className="p-4 rounded-2xl bg-slate-900 border border-white/10">
          <span className="text-[10px] text-slate-400 block uppercase">மொத்த மாத ஊதிய வரவுசெலவு</span>
          <span className="text-xl font-black text-white font-sans mt-0.5">₹ {totalPayrollExpenditure.toLocaleString()}</span>
        </div>
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
          <span className="text-[10px] text-emerald-300 block uppercase">வழங்கப்பட்ட ஊதியம் (Disbursed)</span>
          <span className="text-xl font-black text-emerald-400 mt-0.5">₹ {paidPayrollAmount.toLocaleString()}</span>
        </div>
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
          <span className="text-[10px] text-amber-300 block uppercase">நிலுவை ஊழியர்கள் (Pending)</span>
          <span className="text-xl font-black text-amber-400 mt-0.5">
            {staffList.filter(s => s.status === 'PENDING').length} Staffs
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:hidden">
        
        {/* புதிய ஊழியர் சேர்க்கை */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-white/10 space-y-4">
          <h4 className="text-xs font-bold text-white flex items-center gap-2">
            <Plus size={15} className="text-emerald-400" />
            <span>புதிய ஊழியர் / ஊதியம் சேர்த்தல்</span>
          </h4>

          <form onSubmit={handleAddStaff} className="space-y-3">
            <div>
              <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">ஊழியர் பெயர்</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Bro. Stephen Raj"
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
                required
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">பணிப் பொறுப்பு (Designation)</label>
              <input
                type="text"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                placeholder="Sound Engineer / Musician"
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">அடிப்படை ஊதியம் (₹)</label>
                <input
                  type="number"
                  value={form.basicSalary}
                  onChange={(e) => setForm({ ...form, basicSalary: e.target.value })}
                  placeholder="20000"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-400"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">படிகள் (₹ Allowances)</label>
                <input
                  type="number"
                  value={form.allowances}
                  onChange={(e) => setForm({ ...form, allowances: e.target.value })}
                  placeholder="2000"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">பிரிவு</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-2 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="PASTORAL">போதகர் (Pastoral)</option>
                  <option value="MUSIC">மியூசிக் (Music Team)</option>
                  <option value="ADMIN">நிர்வாகம் (Office/Admin)</option>
                  <option value="SUPPORT">துப்புரவு / காவலாளி</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">வழங்கும் முறை</label>
                <select
                  value={form.paymentMode}
                  onChange={(e) => setForm({ ...form, paymentMode: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-2 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="UPI_DIRECT">UPI</option>
                  <option value="CASH">Cash</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              ஊழியரைப் பதிவு செய்
            </button>
          </form>
        </div>

        {/* ஊழியர் பட்டியல் & ஊதியப் பட்டுவாடா பலகை */}
        <div className="lg:col-span-2 p-5 rounded-3xl bg-slate-900 border border-white/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="relative flex-1 max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="பெயர் அல்லது பணி தேடுக..."
                className="w-full bg-slate-950 border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-400"
              />
            </div>
            <span className="text-[11px] font-mono text-slate-400">{filteredStaff.length} Staff Members</span>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {filteredStaff.map((staff) => {
              const netPay = staff.basicSalary + staff.allowances;
              return (
                <div key={staff.id} className="p-4 rounded-2xl bg-slate-950/80 border border-white/5 space-y-3 hover:border-white/10 transition">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="text-xs font-bold text-white">{staff.name}</h5>
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400">{staff.id}</span>
                      </div>
                      <span className="text-[11px] text-cyan-300 font-mono block mt-0.5">{staff.role}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-black text-white font-mono block">₹ {netPay.toLocaleString()}</span>
                      <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border ${
                        staff.status === 'PAID' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}>
                        {staff.status === 'PAID' ? `வழங்கப்பட்டது (${staff.paidDate})` : 'நிலுவையில் (Pending)'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
                    <span className="text-[10px] text-slate-500 font-mono">
                      Basic: ₹{staff.basicSalary.toLocaleString()} • Allowance: ₹{staff.allowances.toLocaleString()} • {staff.paymentMode}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedStaffPayslip(staff)}
                        className="px-2.5 py-1 bg-white/10 hover:bg-white/15 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                      >
                        <Printer size={12} />
                        <span>Payslip</span>
                      </button>

                      {staff.status === 'PENDING' && (
                        <button
                          type="button"
                          onClick={() => handleDisburseSalary(staff)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-bold transition cursor-pointer"
                        >
                          Disburse Pay
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* 🌟 Printable A4 Payslip Modal */}
      {selectedStaffPayslip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg bg-white text-slate-900 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative font-sans">
            
            {/* Header */}
            <div className="border-b-2 border-slate-900 pb-3 text-center space-y-1">
              <h3 className="text-lg font-black uppercase tracking-wider text-slate-950">GRACE CATHEDRAL CHURCH</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">OFFICIAL STAFF SALARY & HONORARIUM VOUCHER</p>
              <p className="text-[10px] font-mono text-slate-600">Period: {selectedMonth} • Voucher Ref: PAY-{selectedStaffPayslip.id}</p>
            </div>

            {/* Employee Details Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs border-b border-slate-200 pb-3">
              <div>Staff Name: <strong className="text-slate-900">{selectedStaffPayslip.name}</strong></div>
              <div>Staff ID: <strong className="text-slate-900 font-mono">{selectedStaffPayslip.id}</strong></div>
              <div>Designation: <strong className="text-slate-900">{selectedStaffPayslip.role}</strong></div>
              <div>Pay Mode: <strong className="text-slate-900">{selectedStaffPayslip.paymentMode}</strong></div>
            </div>

            {/* Salary Breakdown Table */}
            <table className="w-full text-xs border border-slate-200">
              <thead className="bg-slate-100 font-bold text-slate-700">
                <tr>
                  <th className="p-2 text-left border-r border-slate-200">Description</th>
                  <th className="p-2 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono">
                <tr>
                  <td className="p-2 border-r border-slate-200">Basic Honorarium / Salary</td>
                  <td className="p-2 text-right">{selectedStaffPayslip.basicSalary.toLocaleString()}</td>
                </tr>
                <tr>
                  <td className="p-2 border-r border-slate-200">Ministry Travel & Housing Allowance</td>
                  <td className="p-2 text-right">{selectedStaffPayslip.allowances.toLocaleString()}</td>
                </tr>
              </tbody>
              <tfoot className="border-t-2 border-slate-900 bg-slate-50 font-bold text-xs">
                <tr>
                  <td className="p-2 text-right uppercase">Net Disbursed:</td>
                  <td className="p-2 text-right font-mono font-black text-sm">
                    ₹ {(selectedStaffPayslip.basicSalary + selectedStaffPayslip.allowances).toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>

            {/* Signature Area */}
            <div className="flex items-end justify-between pt-8 text-center text-[10px] font-bold text-slate-600">
              <div className="space-y-1">
                <div className="w-24 border-t border-slate-400 mx-auto" />
                <span>Staff Signature</span>
              </div>
              <div className="space-y-1">
                <div className="w-24 border-t border-slate-400 mx-auto" />
                <span>Treasurer / Pastor</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setSelectedStaffPayslip(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer hover:bg-slate-800"
              >
                Print Payslip
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}