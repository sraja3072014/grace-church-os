import React, { useState, useMemo } from 'react';
import { 
  FileSpreadsheet, Printer, Download, ShieldCheck, 
  Calendar, CheckCircle2, TrendingUp, TrendingDown, DollarSign, Building2
} from 'lucide-react';
import { soundFX } from '../../utils/audioEngine';

export default function AnnualAuditAGMDesk({ session }) {
  const [fiscalYear, setFiscalYear] = useState('2025-2026');

  // 1. நிதி மற்றும் செலவுத் தரவுகளை எடுத்தல்
  const financialData = useMemo(() => {
    try {
      const rawIncomes = localStorage.getItem('app_finance_transactions_ledger');
      const rawExpenses = localStorage.getItem('app_expenses_ledger');
      const rawPayroll = localStorage.getItem('graceos_disbursed_payroll_ledger');
      const rawProperties = localStorage.getItem('graceos_church_properties_db');
      const rawAssets = localStorage.getItem('graceos_church_assets_db');

      const incomes = rawIncomes ? JSON.parse(rawIncomes) : [];
      const expenses = rawExpenses ? JSON.parse(rawExpenses) : [];
      const payroll = rawPayroll ? JSON.parse(rawPayroll) : [];
      const properties = rawProperties ? JSON.parse(rawProperties) : [];
      const assets = rawAssets ? JSON.parse(rawAssets) : [];

      const totalIncome = incomes.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
      const totalGeneralExpenses = expenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
      const totalPayrollExpenses = payroll.reduce((acc, curr) => acc + (Number(curr.netAmount) || 0), 0);
      const totalExpenditure = totalGeneralExpenses + totalPayrollExpenses;
      const netSurplus = totalIncome - totalExpenditure;

      // சொத்துக்களின் மொத்த மதிப்பு
      const gearValuation = assets.reduce((acc, curr) => acc + (Number(curr.cost) || 0), 0);

      return {
        totalIncome,
        totalGeneralExpenses,
        totalPayrollExpenses,
        totalExpenditure,
        netSurplus,
        gearValuation,
        propertyCount: properties.length,
        incomesCount: incomes.length,
        expensesCount: expenses.length
      };
    } catch {
      return {
        totalIncome: 0,
        totalGeneralExpenses: 0,
        totalPayrollExpenses: 0,
        totalExpenditure: 0,
        netSurplus: 0,
        gearValuation: 0,
        propertyCount: 0,
        incomesCount: 0,
        expensesCount: 0
      };
    }
  }, [fiscalYear]);

  const handlePrintAudit = () => {
    soundFX?.playClickPop?.();
    window.print();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto select-none text-slate-200 animate-in fade-in pb-12">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4 print:hidden">
        <div>
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <FileSpreadsheet className="text-emerald-400" size={24} />
            <span>AGM Annual Report & 80G Audit Balance Sheet</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            வருடாந்திர பொதுக்குழுக் கூட்டம் (AGM) மற்றும் 80G சட்டரீதியான ஆடிட்டிங் சமர்ப்பிப்பு அறிக்கை.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={fiscalYear}
            onChange={(e) => setFiscalYear(e.target.value)}
            className="bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-cyan-300 font-mono focus:outline-none cursor-pointer"
          >
            <option value="2026-2027">Financial Year 2026-2027</option>
            <option value="2025-2026">Financial Year 2025-2026</option>
            <option value="2024-2025">Financial Year 2024-2025</option>
          </select>

          <button
            type="button"
            onClick={handlePrintAudit}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 active:scale-95 transition cursor-pointer"
          >
            <Printer size={14} />
            <span>Print Audit Report</span>
          </button>
        </div>
      </div>

      {/* 🌟 Printable A4 Balance Sheet Paper */}
      <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 sm:p-10 space-y-6 shadow-2xl print:bg-white print:text-slate-950 print:border-none print:shadow-none print:p-0">
        
        {/* Audit Document Letterhead */}
        <div className="border-b-2 border-slate-700 print:border-slate-900 pb-4 flex items-start justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 print:text-slate-700 font-bold block">
              Registered Trust Under Sec 12A &amp; 80G
            </span>
            <h2 className="text-lg sm:text-2xl font-black text-white print:text-slate-950 tracking-tight mt-0.5">
              GRACE CATHEDRAL CHARITABLE TRUST
            </h2>
            <p className="text-xs text-slate-400 print:text-slate-600 mt-0.5">
              Annual Financial Statement, Income-Expenditure Balance Sheet &amp; Asset Valuation
            </p>
          </div>

          <div className="text-right font-mono text-xs">
            <span className="text-amber-400 print:text-slate-900 font-bold block">FY {fiscalYear}</span>
            <span className="text-[10px] text-slate-400 print:text-slate-500">Date: {new Date().toISOString().slice(0, 10)}</span>
          </div>
        </div>

        {/* Executive Summary Metrics */}
        <div className="grid grid-cols-3 gap-3 font-mono text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-950/80 print:bg-slate-50 border border-white/5 print:border-slate-300 space-y-1">
            <span className="text-[10px] text-slate-400 print:text-slate-600 uppercase block">மொத்த வரவு (Gross Income)</span>
            <span className="text-base font-black text-emerald-400 print:text-emerald-800">
              ₹ {financialData.totalIncome.toLocaleString()}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/80 print:bg-slate-50 border border-white/5 print:border-slate-300 space-y-1">
            <span className="text-[10px] text-slate-400 print:text-slate-600 uppercase block">மொத்த செலவு (Expenditure)</span>
            <span className="text-base font-black text-rose-400 print:text-rose-800">
              ₹ {financialData.totalExpenditure.toLocaleString()}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/80 print:bg-slate-50 border border-white/5 print:border-slate-300 space-y-1">
            <span className="text-[10px] text-slate-400 print:text-slate-600 uppercase block">கையிருப்பு உபரி (Net Surplus)</span>
            <span className="text-base font-black text-cyan-400 print:text-slate-950">
              ₹ {financialData.netSurplus.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Detailed Balance Sheet Table */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-white print:text-slate-950 uppercase tracking-wider font-mono">
            1. Income &amp; Revenue Breakdown (80G Certified)
          </h4>
          <table className="w-full text-xs font-mono border-collapse">
            <thead>
              <tr className="border-b border-white/10 print:border-slate-300 text-slate-400 print:text-slate-600 text-left">
                <th className="py-2">Revenue Category</th>
                <th className="py-2 text-right">Transactions</th>
                <th className="py-2 text-right">Total Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 print:divide-slate-200">
              <tr>
                <td className="py-2">தசமபாகம் &amp; ஆராதனை காணிக்கை (Tithes &amp; Offerings)</td>
                <td className="py-2 text-right text-slate-400">{financialData.incomesCount} Receipts</td>
                <td className="py-2 text-right text-emerald-400 print:text-slate-900 font-bold">
                  ₹ {financialData.totalIncome.toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-bold text-white print:text-slate-950 uppercase tracking-wider font-mono">
            2. Disbursements &amp; Operational Expenditures
          </h4>
          <table className="w-full text-xs font-mono border-collapse">
            <thead>
              <tr className="border-b border-white/10 print:border-slate-300 text-slate-400 print:text-slate-600 text-left">
                <th className="py-2">Expenditure Head</th>
                <th className="py-2 text-right">Total Disbursed (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 print:divide-slate-200">
              <tr>
                <td className="py-2">Pastoral Honorarium &amp; Staff Monthly Payroll</td>
                <td className="py-2 text-right text-rose-400 print:text-slate-900">
                  ₹ {financialData.totalPayrollExpenses.toLocaleString()}
                </td>
              </tr>
              <tr>
                <td className="py-2">Sanctuary Maintenance, EB, Rent &amp; Ministries</td>
                <td className="py-2 text-right text-rose-400 print:text-slate-900">
                  ₹ {financialData.totalGeneralExpenses.toLocaleString()}
                </td>
              </tr>
              <tr className="font-bold border-t border-white/10 print:border-slate-400">
                <td className="py-2 text-white print:text-slate-950">Total Outflow</td>
                <td className="py-2 text-right text-rose-400 print:text-slate-950">
                  ₹ {financialData.totalExpenditure.toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-bold text-white print:text-slate-950 uppercase tracking-wider font-mono">
            3. Capital Assets &amp; Trust Property Valuation
          </h4>
          <div className="p-3.5 rounded-2xl bg-slate-950/60 print:bg-slate-50 border border-white/5 print:border-slate-300 text-xs font-mono space-y-1">
            <div className="flex justify-between">
              <span>Sanctuary Audio/Visual Equipment Inventory:</span>
              <strong className="text-white print:text-slate-900">₹ {financialData.gearValuation.toLocaleString()}</strong>
            </div>
            <div className="flex justify-between">
              <span>Registered Land &amp; Leased Church Properties:</span>
              <strong className="text-cyan-400 print:text-slate-900">{financialData.propertyCount} Properties Tagged</strong>
            </div>
          </div>
        </div>

        {/* Auditor & Trustee Signature Strip */}
        <div className="pt-10 border-t-2 border-slate-700 print:border-slate-900 grid grid-cols-3 gap-4 text-center font-mono text-[11px] text-slate-400 print:text-slate-700">
          <div className="space-y-10">
            <div className="border-b border-dashed border-slate-600 print:border-slate-400 pb-2"></div>
            <span>Senior Pastor / Managing Trustee</span>
          </div>
          <div className="space-y-10">
            <div className="border-b border-dashed border-slate-600 print:border-slate-400 pb-2"></div>
            <span>Church Treasurer / Secretary</span>
          </div>
          <div className="space-y-10">
            <div className="border-b border-dashed border-slate-600 print:border-slate-400 pb-2"></div>
            <span>Chartered Accountant (Auditor)</span>
          </div>
        </div>

      </div>

    </div>
  );
}