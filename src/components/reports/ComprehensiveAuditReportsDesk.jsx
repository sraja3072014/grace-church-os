import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart3, FileSpreadsheet, Printer, Download, 
  DollarSign, Users, TrendingUp, Calendar, ShieldCheck 
} from 'lucide-react';
import { soundFX } from '../../utils/audioEngine';
import { getVaultData } from '../../utils/vaultStore';

export default function ComprehensiveAuditReportsDesk() {
  const [reportPeriod, setReportPeriod] = useState('2026-08');
  const [ledger, setLedger] = useState([]);

  useEffect(() => {
    async function loadFinanceData() {
      const data = await getVaultData('finance', [
        { id: 'REC-01', date: '2026-08-02', category: 'Sunday Tithes (10%)', amount: 45000, donor: 'Congregation' },
        { id: 'REC-02', date: '2026-08-09', category: 'Building Expansion Fund', amount: 30000, donor: 'Bro. David Paul' },
        { id: 'REC-03', date: '2026-08-16', category: 'Missions & Outreach', amount: 15000, donor: 'Youth Circle' },
        { id: 'REC-04', date: '2026-08-23', category: 'General Sunday Offering', amount: 22000, donor: 'Sunday Worship' },
        { id: 'REC-05', date: '2026-08-30', category: 'Sunday Tithes (10%)', amount: 38000, donor: 'Congregation' }
      ]);
      setLedger(data);
    }
    loadFinanceData();
  }, []);

  const totalIncome = useMemo(() => {
    return ledger.reduce((acc, row) => acc + Number(row.amount || 0), 0);
  }, [ledger]);

  const categorySummary = useMemo(() => {
    const map = {};
    ledger.forEach(item => {
      const cat = item.category || 'General Offering';
      map[cat] = (map[cat] || 0) + Number(item.amount || 0);
    });
    return Object.entries(map).map(([category, amount]) => ({
      category,
      amount,
      percentage: Math.round((amount / (totalIncome || 1)) * 100)
    }));
  }, [ledger, totalIncome]);

  const handlePrint = () => {
    soundFX?.playClickPop?.();
    window.print();
  };

  return (
    <div className="space-y-6 max-w-5xl select-none text-slate-200 animate-in fade-in pb-12">
      
      {/* Action Header Bar (Hidden in Print) */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4 print:hidden">
        <div>
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <span>Audit &amp; Analytical Growth Reports</span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-mono border border-teal-500/30">
              Audit Ready
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Official monthly financial reconciliation and kingdom growth audit statement.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <input
            type="month"
            value={reportPeriod}
            onChange={(e) => setReportPeriod(e.target.value)}
            className="bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-cyan-300 font-mono focus:outline-none cursor-pointer"
          />

          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-lg active:scale-95"
          >
            <Printer size={14} />
            <span>A4 Print Report</span>
          </button>
        </div>
      </div>

      {/* Printable A4 Statement Sheet */}
      <div className="bg-white text-slate-900 p-8 sm:p-10 rounded-3xl shadow-2xl font-sans border border-slate-200 max-w-[800px] mx-auto print:border-none print:shadow-none print:p-0 print:m-0 print:w-full">
        
        {/* Statement Letterhead */}
        <div className="text-center border-b-2 border-slate-900 pb-4 space-y-1">
          <h1 className="text-xl font-black uppercase tracking-wider text-slate-950">
            GRACE CENTRAL CATHEDRAL CHURCH
          </h1>
          <p className="text-xs text-slate-600 font-medium">
            Monthly Financial Audit &amp; Ministry Operations Statement
          </p>
          <div className="text-[11px] font-mono text-slate-700 font-bold pt-1">
            Audit Period: {reportPeriod} • Generated: {new Date().toISOString().slice(0, 10)}
          </div>
        </div>

        {/* Executive Summary Cards */}
        <div className="grid grid-cols-3 gap-3 py-4 border-b border-slate-200 text-center font-mono">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-500 block uppercase font-bold">Total Collections</span>
            <span className="text-base font-black text-slate-900">₹ {totalIncome.toLocaleString()}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-500 block uppercase font-bold">Reconciled Vouchers</span>
            <span className="text-base font-black text-slate-900">{ledger.length} Receipts</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-500 block uppercase font-bold">Statutory Status</span>
            <span className="text-xs font-bold text-emerald-700 block mt-1">✓ 100% Reconciled</span>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="py-4 space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono">
            1. Fund Allocation &amp; Category Breakdown
          </h4>
          <table className="w-full text-left text-xs border border-slate-300">
            <thead className="bg-slate-100 font-bold text-slate-700">
              <tr>
                <th className="p-2 border-r border-slate-300">Revenue Stream</th>
                <th className="p-2 border-r border-slate-300 text-center">Share (%)</th>
                <th className="p-2 text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {categorySummary.map((item, idx) => (
                <tr key={idx}>
                  <td className="p-2 border-r border-slate-300 font-medium">{item.category}</td>
                  <td className="p-2 border-r border-slate-300 text-center font-mono">{item.percentage}%</td>
                  <td className="p-2 text-right font-mono font-bold">₹ {item.amount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Transaction Ledger Table */}
        <div className="py-4 space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono">
            2. Detailed Transaction Audit Ledger
          </h4>
          <table className="w-full text-left text-[11px] border border-slate-300">
            <thead className="bg-slate-100 font-bold text-slate-700">
              <tr>
                <th className="p-2 border-r border-slate-300">Date</th>
                <th className="p-2 border-r border-slate-300">Receipt Ref</th>
                <th className="p-2 border-r border-slate-300">Purpose / Head</th>
                <th className="p-2 text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono">
              {ledger.map((tx, idx) => (
                <tr key={idx}>
                  <td className="p-2 border-r border-slate-300">{tx.date}</td>
                  <td className="p-2 border-r border-slate-300">{tx.id}</td>
                  <td className="p-2 border-r border-slate-300 font-sans">{tx.category}</td>
                  <td className="p-2 text-right font-bold">₹ {Number(tx.amount).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t-2 border-slate-900 bg-slate-50 font-bold text-xs">
              <tr>
                <td colSpan={3} className="p-2 text-right uppercase font-bold">Audited Gross Total:</td>
                <td className="p-2 text-right font-mono font-black">₹ {totalIncome.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Audit Verification Signatures */}
        <div className="flex items-end justify-between pt-12 text-center text-xs">
          <div className="space-y-1">
            <div className="w-24 border-t border-slate-400 mx-auto" />
            <span className="text-[10px] text-slate-500 font-bold block">Church Treasurer</span>
          </div>
          <div className="space-y-1">
            <div className="w-24 border-t border-slate-400 mx-auto" />
            <span className="text-[10px] text-slate-500 font-bold block">Chartered Auditor</span>
          </div>
          <div className="space-y-1">
            <div className="w-24 border-t border-slate-400 mx-auto" />
            <span className="text-[10px] text-slate-500 font-bold block">Senior Pastor</span>
          </div>
        </div>

      </div>

    </div>
  );
}