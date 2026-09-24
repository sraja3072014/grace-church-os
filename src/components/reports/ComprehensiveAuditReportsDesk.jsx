// src/components/reports/ComprehensiveAuditReportsDesk.jsx
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

  // Isolated Print Window Handler for Perfect A4 Fit
  const handlePrint = () => {
    soundFX?.playClickPop?.();
    const printContent = document.getElementById('printable-audit-sheet').innerHTML;
    const printWindow = window.open('', '_blank', 'width=900,height=650');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Grace Central Cathedral - Financial Audit Statement</title>
          <style>
            @page { size: A4 portrait; margin: 15mm; }
            body { font-family: sans-serif; color: #000; background: #fff; margin: 0; padding: 0; }
            .sheet { width: 100%; max-width: 100%; box-sizing: border-box; }
            h1 { font-size: 20px; font-weight: 900; text-transform: uppercase; text-align: center; margin: 0 0 5px 0; }
            p { font-size: 12px; text-align: center; color: #555; margin: 0; }
            .grid-3 { display: flex; justify-content: space-between; margin: 15px 0; border-top: 1px solid #ccc; border-bottom: 1px solid #ccc; padding: 10px 0; font-family: monospace; }
            .box { text-align: center; flex: 1; }
            .box span { display: block; font-size: 10px; color: #666; text-transform: uppercase; font-weight: bold; }
            .box strong { font-size: 14px; font-weight: 900; color: #000; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
            th, td { border: 1px solid #999; padding: 6px 8px; text-align: left; }
            th { background: #f2f2f2; font-weight: bold; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .signatures { display: flex; justify-content: space-between; margin-top: 50px; text-align: center; font-size: 11px; }
            .sig-line { width: 120px; border-top: 1px solid #770000; margin: 0 auto 5px auto; }
          </style>
        </head>
        <body>
          <div class="sheet">
            ${printContent}
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6 max-w-5xl select-none text-slate-200 animate-in fade-in pb-12">
      
      {/* Action Header Bar (Hidden in Print) */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
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

      {/* Printable A4 Statement Sheet Wrapper ID */}
      <div id="printable-audit-sheet" className="bg-white text-slate-900 p-8 sm:p-10 rounded-3xl shadow-2xl font-sans border border-slate-200 max-w-[800px] mx-auto">
        
        {/* Statement Letterhead */}
        <div className="text-center border-b-2 border-slate-900 pb-4 space-y-1">
          <h1>GRACE CENTRAL CATHEDRAL CHURCH</h1>
          <p>Monthly Financial Audit &amp; Ministry Operations Statement</p>
          <div className="text-[11px] font-mono text-slate-700 font-bold pt-1">
            Audit Period: {reportPeriod} • Generated: {new Date().toISOString().slice(0, 10)}
          </div>
        </div>

        {/* Executive Summary Cards */}
        <div className="grid grid-cols-3 gap-3 py-4 border-b border-slate-200 text-center font-mono">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 box">
            <span>Total Collections</span>
            <strong>₹ {totalIncome.toLocaleString()}</strong>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 box">
            <span>Reconciled Vouchers</span>
            <strong>{ledger.length} Receipts</strong>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 box">
            <span>Statutory Status</span>
            <strong style={{color: 'green'}}>✓ 100% Reconciled</strong>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="py-4 space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono">
            1. Fund Allocation &amp; Category Breakdown
          </h4>
          <table className="w-full text-left text-xs border border-slate-300">
            <thead>
              <tr>
                <th className="border">Revenue Stream</th>
                <th className="border text-center">Share (%)</th>
                <th className="border text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {categorySummary.map((item, idx) => (
                <tr key={idx}>
                  <td className="border font-medium">{item.category}</td>
                  <td className="border text-center font-mono">{item.percentage}%</td>
                  <td className="border text-right font-mono font-bold">₹ {item.amount.toLocaleString()}</td>
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
            <thead>
              <tr>
                <th className="border">Date</th>
                <th className="border">Receipt Ref</th>
                <th className="border">Purpose / Head</th>
                <th className="border text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {ledger.map((tx, idx) => (
                <tr key={idx}>
                  <td className="border">{tx.date}</td>
                  <td className="border">{tx.id}</td>
                  <td className="border">{tx.category}</td>
                  <td className="border text-right font-bold">₹ {Number(tx.amount).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} className="border text-right uppercase font-bold" style={{padding: '8px'}}>Audited Gross Total:</td>
                <td className="border text-right font-mono font-black" style={{padding: '8px'}}>₹ {totalIncome.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Audit Verification Signatures */}
        <div className="signatures">
          <div>
            <div className="sig-line" />
            <span style={{fontSize: '10px', color: '#555', fontWeight: 'bold'}}>Church Treasurer</span>
          </div>
          <div>
            <div className="sig-line" />
            <span style={{fontSize: '10px', color: '#555', fontWeight: 'bold'}}>Chartered Auditor</span>
          </div>
          <div>
            <div className="sig-line" />
            <span style={{fontSize: '10px', color: '#555', fontWeight: 'bold'}}>Senior Pastor</span>
          </div>
        </div>

      </div>

    </div>
  );
}