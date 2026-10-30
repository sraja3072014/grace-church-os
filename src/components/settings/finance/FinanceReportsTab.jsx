import React, { useState } from 'react';
import { BarChart3, Download, FileSpreadsheet, Calendar, CheckCircle2, FileText, ArrowUpRight } from 'lucide-react';

export default function FinanceReportsTab() {
  const [toast, setToast] = useState('');
  const [exportType, setExportType] = useState('summary');
  const [dateRange, setDateRange] = useState('This Financial Year (2026-2027)');

  const reportPresets = [
    { id: 'summary', title: 'Comprehensive Income & Expense Statement', format: 'PDF & Excel', desc: 'Summary of all tithes, offerings, vouchers, and departmental overheads.' },
    { id: '80g_ledger', title: 'Annual 80G Tax Exemption Donor Ledger', format: 'Excel (CSV)', desc: 'PAN-tagged giving donor database ready for income tax portal filing.' },
    { id: 'campus_breakdown', title: 'Multi-Campus Revenue & Transfer Log', format: 'PDF', desc: 'Net collections broken down across all church branches and campuses.' },
    { id: 'petty_cash', title: 'Petty Cash & Emergency Vault Vouchers', format: 'PDF', desc: 'Daily signed expense receipts and physical cash disbursements.' }
  ];

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleExport = (report) => {
    const reportData = JSON.stringify({
      reportTitle: report.title,
      dateRange: dateRange,
      generatedOn: new Date().toISOString(),
      organization: localStorage.getItem('graceos_main_church') || 'Grace City Church',
      status: "Audited & Verified"
    }, null, 2);

    const blob = new Blob([reportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${report.id}_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Generated and exported: ${report.title}`);
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl relative select-none">
      {/* Toast Alert */}
      {toast && (
        <div className="absolute -top-3 right-0 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-2 backdrop-blur-md animate-in fade-in z-20">
          <CheckCircle2 size={14} />
          <span>{toast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
            <BarChart3 size={24} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              Financial Audit & Statutory Exports
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono">Audit Ready</span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">Generate compliant chartered accountant audit files, 80G returns, and ledger statements.</p>
          </div>
        </div>
      </div>

      {/* Date Range Selection Bar */}
      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Calendar size={15} className="text-amber-400" />
          <span className="text-xs font-semibold text-slate-200">Export Period:</span>
        </div>
        <select 
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="bg-slate-950/60 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-cyan-300 font-medium focus:outline-none focus:border-cyan-400"
        >
          <option>This Financial Year (2026-2027)</option>
          <option>Previous Financial Year (2025-2026)</option>
          <option>Current Quarter (Q2 2026)</option>
          <option>Last 30 Days</option>
        </select>
      </div>

      {/* Reports Export Ledger */}
      <div className="flex flex-col gap-3">
        <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300">Available Financial Statements</h5>
        
        <div className="grid grid-cols-1 gap-3">
          {reportPresets.map((report) => (
            <div 
              key={report.id}
              className="p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06] flex items-center justify-between gap-4 transition"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 shrink-0">
                  {report.format.includes('Excel') ? <FileSpreadsheet size={18} className="text-emerald-400" /> : <FileText size={18} className="text-cyan-400" />}
                </div>
                <div>
                  <h6 className="text-xs font-bold text-white">{report.title}</h6>
                  <p className="text-[11px] text-slate-400 mt-0.5">{report.desc}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2.5 py-1 rounded-md border border-white/10 hidden sm:inline-block">
                  {report.format}
                </span>
                <button 
                  onClick={() => handleExport(report)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-xs font-semibold active:scale-95 transition"
                >
                  <Download size={13} />
                  <span>Download</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}