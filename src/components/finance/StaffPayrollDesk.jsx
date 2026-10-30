import React, { useState, useEffect, useMemo } from 'react';
import { 
  DollarSign, Users, Printer, Plus, CheckCircle2, 
  Calendar, Building, ShieldCheck, Download, Sparkles, Search 
} from 'lucide-react';
import { soundFX } from '../../utils/audioEngine';
import { getVaultData, setVaultData } from '../../utils/vaultStore';

export default function StaffPayrollDesk({ session }) {
  const [selectedMonth, setSelectedMonth] = useState('2026-09');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStaffPayslip, setSelectedStaffPayslip] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const [staffList, setStaffList] = useState([]);
  const [payrollLedger, setPayrollLedger] = useState([]);

  useEffect(() => {
    async function loadPayrollData() {
      const [dbStaff, dbPayroll] = await Promise.all([
        getVaultData('staff_payroll', [
          {
            id: 'STF-01',
            name: 'Rev. J. Stephen Victor',
            role: 'Senior Presiding Pastor',
            category: 'PASTORAL',
            basicSalary: 45000,
            allowances: 10000,
            deductions: 0,
            paymentMode: 'BANK_TRANSFER',
            accountNo: 'SB-99881122001',
            status: 'PAID',
            paidDate: '2026-09-05'
          },
          {
            id: 'STF-02',
            name: 'Bro. Joshua Raj',
            role: 'Music Director & Band Lead',
            category: 'MUSIC',
            basicSalary: 18000,
            allowances: 2000,
            deductions: 0,
            paymentMode: 'UPI_DIRECT',
            accountNo: 'joshua@upi',
            status: 'PAID',
            paidDate: '2026-09-05'
          },
          {
            id: 'STF-03',
            name: 'Sis. Mary Stella',
            role: 'Church Administration Secretary',
            category: 'ADMIN',
            basicSalary: 20000,
            allowances: 2500,
            deductions: 0,
            paymentMode: 'BANK_TRANSFER',
            accountNo: 'SB-44556677889',
            status: 'PENDING',
            paidDate: '-'
          },
          {
            id: 'STF-04',
            name: 'Bro. David Kumar',
            role: 'Sanctuary Facilities & Security',
            category: 'SUPPORT',
            basicSalary: 15000,
            allowances: 1500,
            deductions: 0,
            paymentMode: 'CASH',
            accountNo: 'Cash Disbursement',
            status: 'PAID',
            paidDate: '2026-09-06'
          }
        ]),
        getVaultData('disbursed_payroll', [])
      ]);

      setStaffList(dbStaff || []);
      setPayrollLedger(dbPayroll || []);
    }
    loadPayrollData();
  }, []);

  const [form, setForm] = useState({
    name: '',
    role: '',
    category: 'PASTORAL',
    basicSalary: '',
    allowances: '',
    deductions: '',
    paymentMode: 'BANK_TRANSFER',
    accountNo: ''
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.basicSalary) return;
    soundFX?.playSuccessChime?.();

    const newStaff = {
      id: `STF-${Date.now().toString().slice(-3)}`,
      name: form.name.trim(),
      role: form.role.trim() || 'Church Worker',
      category: form.category,
      basicSalary: Number(form.basicSalary) || 0,
      allowances: Number(form.allowances) || 0,
      deductions: Number(form.deductions) || 0,
      paymentMode: form.paymentMode,
      accountNo: form.accountNo.trim() || 'N/A',
      status: 'PENDING',
      paidDate: '-'
    };

    const updated = [...staffList, newStaff];
    setStaffList(updated);
    await setVaultData('staff_payroll', updated, true);
    setForm({ name: '', role: '', category: 'PASTORAL', basicSalary: '', allowances: '', deductions: '', paymentMode: 'BANK_TRANSFER', accountNo: '' });
    showToast('New staff member added to payroll registry.');
  };

  const handleDisburseSalary = async (staff) => {
    soundFX?.playSuccessChime?.();
    const netAmount = staff.basicSalary + staff.allowances - (staff.deductions || 0);
    const paidDate = new Date().toISOString().slice(0, 10);

    const payrollEntry = {
      id: `PAY-${selectedMonth}-${staff.id}`,
      month: selectedMonth,
      staffId: staff.id,
      staffName: staff.name,
      role: staff.role,
      basicSalary: staff.basicSalary,
      allowances: staff.allowances,
      deductions: staff.deductions || 0,
      netAmount,
      paidDate,
      paymentMode: staff.paymentMode,
      accountNo: staff.accountNo,
      status: 'PAID'
    };

    const updatedPayroll = [
      payrollEntry,
      ...payrollLedger.filter((entry) => !(entry.month === selectedMonth && entry.staffId === staff.id))
    ];
    setPayrollLedger(updatedPayroll);
    await setVaultData('disbursed_payroll', updatedPayroll, true);

    const updatedStaff = staffList.map(s => 
      s.id === staff.id ? { ...s, status: 'PAID', paidDate } : s
    );
    setStaffList(updatedStaff);
    await setVaultData('staff_payroll', updatedStaff, true);

    const currentExpenses = await getVaultData('expenses', []);
    const newExpense = {
      id: `EXP-SAL-${Date.now().toString().slice(-4)}`,
      date: paidDate,
      category: 'Pastoral Honorarium & Staff',
      amount: netAmount,
      paymentMode: staff.paymentMode,
      notes: `Staff Salary: ${staff.name} (${staff.role})`
    };
    await setVaultData('expenses', [newExpense, ...currentExpenses], true);

    showToast(`Salary disbursement of ₹ ${netAmount.toLocaleString()} recorded to ledger.`);
  };

  const totalPayrollExpenditure = useMemo(() => {
    return staffList.reduce((acc, s) => acc + s.basicSalary + s.allowances - (s.deductions || 0), 0);
  }, [staffList]);

  const monthlyPayout = useMemo(() => {
    return payrollLedger
      .filter((entry) => entry.month === selectedMonth)
      .reduce((total, entry) => total + Number(entry.netAmount || 0), 0);
  }, [payrollLedger, selectedMonth]);

  const filteredStaff = staffList.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-5xl select-none text-slate-200 animate-in fade-in pb-12">
      {toastMessage && (
        <div className="fixed top-5 right-5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 backdrop-blur-md shadow-2xl z-50 animate-in fade-in">
          <CheckCircle2 size={15} />
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4 print:hidden">
        <div>
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <span>Staff Payroll &amp; Pastoral Honorarium Hub</span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
              Disbursement Desk
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Administer monthly compensation, travel allowances, and printable salary vouchers for pastoral and support teams.
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
          <span className="text-[10px] text-slate-400 block uppercase">Monthly Payroll Commitment</span>
          <span className="text-xl font-black text-white font-sans mt-0.5">₹ {totalPayrollExpenditure.toLocaleString()}</span>
        </div>
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
          <span className="text-[10px] text-emerald-300 block uppercase">Disbursed This Month</span>
          <span className="text-xl font-black text-emerald-400 mt-0.5">₹ {monthlyPayout.toLocaleString()}</span>
        </div>
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
          <span className="text-[10px] text-amber-300 block uppercase">Pending Disbursements</span>
          <span className="text-xl font-black text-amber-400 mt-0.5">
            {staffList.filter(s => !payrollLedger.some((entry) => entry.month === selectedMonth && entry.staffId === s.id)).length} Staff
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:hidden">
        {/* New Staff Form */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-white/10 space-y-4">
          <h4 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-wider">
            <Plus size={15} className="text-emerald-400" />
            <span>Add Payroll Beneficiary</span>
          </h4>

          <form onSubmit={handleAddStaff} className="space-y-3">
            <div>
              <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">Full Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Bro. Stephen Raj"
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400 font-bold"
                required
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">Ministry Designation *</label>
              <input
                type="text"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                placeholder="e.g. Sound Engineer / Pianist"
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">Basic Honorarium (₹) *</label>
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
                <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">Allowances (₹)</label>
                <input
                  type="number"
                  value={form.allowances}
                  onChange={(e) => setForm({ ...form, allowances: e.target.value })}
                  placeholder="2000"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">Deductions (₹)</label>
              <input
                type="number"
                min="0"
                value={form.deductions}
                onChange={(e) => setForm({ ...form, deductions: e.target.value })}
                placeholder="0"
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-2 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="PASTORAL">Pastoral Staff</option>
                  <option value="MUSIC">Music &amp; Worship</option>
                  <option value="ADMIN">Office Administration</option>
                  <option value="SUPPORT">Custodial &amp; Logistics</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">Payment Method</label>
                <select
                  value={form.paymentMode}
                  onChange={(e) => setForm({ ...form, paymentMode: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-2 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="UPI_DIRECT">UPI / GPay</option>
                  <option value="CASH">Cash Voucher</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              Add to Payroll
            </button>
          </form>
        </div>

        {/* Staff List & Payout Stream */}
        <div className="lg:col-span-2 p-5 rounded-3xl bg-slate-900 border border-white/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="relative flex-1 max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search staff name or role..."
                className="w-full bg-slate-950 border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-400"
              />
            </div>
            <span className="text-[11px] font-mono text-slate-400">{filteredStaff.length} Beneficiaries</span>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {filteredStaff.map((staff) => {
              const paidRecord = payrollLedger.find((entry) => entry.month === selectedMonth && entry.staffId === staff.id);
              const isPaid = Boolean(paidRecord);
              const netPay = staff.basicSalary + staff.allowances - (staff.deductions || 0);
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
                        isPaid ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}>
                        {isPaid ? `Disbursed (${paidRecord.paidDate})` : 'Pending Disbursement'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
                    <span className="text-[10px] text-slate-500 font-mono">
                      Basic: ₹{staff.basicSalary.toLocaleString()} • Allowances: ₹{staff.allowances.toLocaleString()} • {staff.paymentMode}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedStaffPayslip(paidRecord || staff)}
                        className="px-2.5 py-1 bg-white/10 hover:bg-white/15 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                      >
                        <Printer size={12} />
                        <span>Payslip</span>
                      </button>

                      {!isPaid && (
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

      {/* Printable Payslip Modal */}
      {selectedStaffPayslip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg bg-white text-slate-900 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative font-sans">
            <div className="border-b-2 border-slate-900 pb-3 text-center space-y-1">
              <h3 className="text-lg font-black uppercase tracking-wider text-slate-950">GRACE CATHEDRAL CHURCH</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">OFFICIAL SALARY &amp; HONORARIUM DISBURSEMENT VOUCHER</p>
              <p className="text-[10px] font-mono text-slate-600">Period: {selectedMonth} • Voucher Ref: PAY-{selectedStaffPayslip.id || selectedStaffPayslip.staffId}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs border-b border-slate-200 pb-3">
              <div>Staff Name: <strong className="text-slate-900">{selectedStaffPayslip.staffName || selectedStaffPayslip.name}</strong></div>
              <div>Staff ID: <strong className="text-slate-900 font-mono">{selectedStaffPayslip.staffId || selectedStaffPayslip.id}</strong></div>
              <div>Designation: <strong className="text-slate-900">{selectedStaffPayslip.role}</strong></div>
              <div>Payment Mode: <strong className="text-slate-900">{selectedStaffPayslip.paymentMode}</strong></div>
            </div>

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
                  <td className="p-2 text-right">{(selectedStaffPayslip.basicSalary || 0).toLocaleString()}</td>
                </tr>
                <tr>
                  <td className="p-2 border-r border-slate-200">Ministry Travel &amp; Housing Allowances</td>
                  <td className="p-2 text-right">{(selectedStaffPayslip.allowances || 0).toLocaleString()}</td>
                </tr>
                <tr>
                  <td className="p-2 border-r border-slate-200">Authorized Deductions</td>
                  <td className="p-2 text-right">- {(selectedStaffPayslip.deductions || 0).toLocaleString()}</td>
                </tr>
              </tbody>
              <tfoot className="border-t-2 border-slate-900 bg-slate-50 font-bold text-xs">
                <tr>
                  <td className="p-2 text-right uppercase">Net Amount Disbursed:</td>
                  <td className="p-2 text-right font-mono font-black text-sm">
                    ₹ {(selectedStaffPayslip.netAmount || (selectedStaffPayslip.basicSalary + selectedStaffPayslip.allowances - (selectedStaffPayslip.deductions || 0))).toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>

            <div className="flex items-end justify-between pt-8 text-center text-[10px] font-bold text-slate-600">
              <div className="space-y-1">
                <div className="w-24 border-t border-slate-400 mx-auto" />
                <span>Staff Signature</span>
              </div>
              <div className="space-y-1">
                <div className="w-24 border-t border-slate-400 mx-auto" />
                <span>Treasurer / Senior Pastor</span>
              </div>
            </div>

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