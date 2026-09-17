import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldAlert, Clock, Search, Filter, 
  CheckCircle2, AlertTriangle, Info, User, Printer, RefreshCw 
} from 'lucide-react';
import { getVaultData } from '../../utils/vaultStore';
import { soundFX } from '../../utils/audioEngine';

export default function AuditTrailViewerDesk() {
  const [logs, setLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('ALL');
  const [isLoading, setIsLoading] = useState(false);

  const loadAuditLogs = async () => {
    setIsLoading(true);
    const auditData = await getVaultData('audit_logs', [
      {
        id: 'LOG-INIT-1',
        timestamp: new Date().toISOString(),
        displayTime: '10:00:15 AM',
        date: new Date().toISOString().slice(0, 10),
        action: 'SYSTEM_BOOT',
        details: 'GraceOS Dual-Tree Vault FS Mounted Successfully on Physical Drive.',
        actor: 'Senior Pastor / Root Admin',
        severity: 'INFO',
        node: 'Host Server Local Disk'
      },
      {
        id: 'LOG-INIT-2',
        timestamp: new Date().toISOString(),
        displayTime: '11:20:42 AM',
        date: new Date().toISOString().slice(0, 10),
        action: 'ROSTER_SCHEDULED',
        details: 'Lord\'s Day worship ministerial duty roster published to vault.',
        actor: 'Pastor / Worship Coordinator',
        severity: 'INFO',
        node: 'Host Server Local Disk'
      }
    ]);
    setLogs(auditData);
    setIsLoading(false);
  };

  useEffect(() => {
    loadAuditLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchSearch =
        log.action?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.details?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.actor?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchSeverity = selectedSeverity === 'ALL' || log.severity === selectedSeverity;
      return matchSearch && matchSeverity;
    });
  }, [logs, searchQuery, selectedSeverity]);

  const handlePrint = () => {
    soundFX?.playClickPop?.();
    window.print();
  };

  return (
    <div className="space-y-5 max-w-5xl select-none text-slate-200 animate-in fade-in pb-12">
      
      {/* Header (Hidden in Print) */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4 print:hidden">
        <div>
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <ShieldAlert className="text-cyan-400" size={24} />
            <span>Master System Audit Trail &amp; Security Ledger</span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/30">
              Immutable Disk Logs
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Chronological logging of financial vouchers, member mutations, and system security transactions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              soundFX?.playClickPop?.();
              loadAuditLogs();
            }}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition cursor-pointer"
            title="Refresh Logs"
          >
            <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-3.5 py-2 bg-slate-900 border border-white/10 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-md"
          >
            <Printer size={14} />
            <span>Print Audit Trail</span>
          </button>
        </div>
      </div>

      {/* Filter Strip (Hidden in Print) */}
      <div className="p-4 bg-slate-900 rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs print:hidden">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search size={15} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search by action, description, or administrator..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-white placeholder-slate-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-cyan-300 font-mono focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Severity Levels</option>
            <option value="INFO">Information (INFO)</option>
            <option value="WARN">Warning (WARN)</option>
            <option value="CRITICAL">Critical (CRITICAL)</option>
          </select>
        </div>
      </div>

      {/* Printable Sheet Wrapper */}
      <div className="rounded-2xl border border-white/10 overflow-hidden bg-slate-950/60 font-mono text-xs print:border-none print:bg-white print:text-slate-950 print:p-0">
        
        {/* Printable Header only visible on paper */}
        <div className="hidden print:block text-center border-b-2 border-slate-900 pb-4 mb-4">
          <h2 className="text-lg font-black uppercase text-slate-900 tracking-wider">
            Grace Central Cathedral Church
          </h2>
          <p className="text-xs text-slate-600 font-sans font-semibold">
            System Security &amp; Administrative Audit Ledger
          </p>
          <div className="text-[10px] text-slate-500 pt-1">
            Generated: {new Date().toLocaleString()} • Authorized Pastoral Inspection
          </div>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/5 text-slate-400 text-[11px] uppercase print:border-slate-300 print:bg-slate-100 print:text-slate-700">
              <th className="p-3.5">Timestamp</th>
              <th className="p-3.5">Action Code</th>
              <th className="p-3.5">Description</th>
              <th className="p-3.5">Actor</th>
              <th className="p-3.5 text-center">Severity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-slate-300 print:divide-slate-200 print:text-slate-900">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500 font-sans text-xs">
                  No audit trail records matched the criteria.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-white/[0.02] transition">
                  <td className="p-3.5 text-slate-400 whitespace-nowrap print:text-slate-600">
                    <div className="text-white font-bold print:text-slate-900">{log.displayTime}</div>
                    <div className="text-[10px] text-slate-500">{log.date}</div>
                  </td>

                  <td className="p-3.5 font-bold text-cyan-300 whitespace-nowrap print:text-cyan-800">
                    {log.action}
                  </td>

                  <td className="p-3.5 text-slate-200 font-sans text-xs max-w-xs sm:max-w-md break-words print:text-slate-800">
                    {log.details}
                  </td>

                  <td className="p-3.5 text-slate-300 whitespace-nowrap print:text-slate-700">
                    <div className="flex items-center gap-1.5">
                      <User size={12} className="text-amber-400 print:hidden" />
                      <span>{log.actor}</span>
                    </div>
                  </td>

                  <td className="p-3.5 text-center whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border print:border-slate-300 ${
                      log.severity === 'CRITICAL'
                        ? 'bg-rose-500/15 text-rose-300 border-rose-500/30 print:text-rose-700'
                        : log.severity === 'WARN'
                        ? 'bg-amber-500/15 text-amber-300 border-amber-500/30 print:text-amber-700'
                        : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 print:text-emerald-700'
                    }`}>
                      {log.severity}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}