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
      }
    ]);
    setLogs(auditData);
    setIsLoading(false);
  };

  useEffect(() => {
    loadAuditLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchSearch = log.action?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.details?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.actor?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchSeverity = selectedSeverity === 'ALL' || log.severity === selectedSeverity;
      return matchSearch && matchSeverity;
    });
  }, [logs, searchQuery, selectedSeverity]);

  return (
    <div className="space-y-5 max-w-5xl select-none text-slate-200 animate-in fade-in pb-12">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <ShieldAlert className="text-cyan-400" size={24} />
            <span>Master System Audit Trail & Security Ledger</span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/30">
              Immutable Disk Logs
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            நிதிப் பரிவர்த்தனைகள், விசுவாசிகள் மாற்றம் மற்றும் கணினி பாதுகாப்பு நிகழ்வுகளின் காலவரிசைப் பதிவு.
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
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-slate-900 border border-white/10 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Printer size={14} />
            <span>Print Audit Trail</span>
          </button>
        </div>
      </div>

      {/* Filter Strip */}
      <div className="p-4 bg-slate-900 rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search size={15} className="text-slate-400" />
          <input
            type="text"
            placeholder="செயல்பாடு, விவரம் அல்லது நிர்வாகி பெயர் மூலம் தேடுக..."
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
            <option value="ALL">அனைத்து நிகழ்வுகள் (All Severity)</option>
            <option value="INFO">தகவல் (INFO)</option>
            <option value="WARN">எச்சரிக்கை (WARN)</option>
            <option value="CRITICAL">முக்கியமானது (CRITICAL)</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-2xl border border-white/10 overflow-hidden bg-slate-950/60 font-mono text-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/5 text-slate-400 text-[11px] uppercase">
              <th className="p-3.5">நேரம் & தேதி</th>
              <th className="p-3.5">செயல்பாடு (Event)</th>
              <th className="p-3.5">விவரம் (Description)</th>
              <th className="p-3.5">செய்தவர் (Actor)</th>
              <th className="p-3.5 text-center">நிலை (Severity)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-slate-300">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500 font-sans text-xs">
                  தணிக்கைப் பதிவுகள் எதுவும் இல்லை.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-white/[0.02] transition">
                  <td className="p-3.5 text-slate-400 whitespace-nowrap">
                    <div className="text-white font-bold">{log.displayTime}</div>
                    <div className="text-[10px] text-slate-500">{log.date}</div>
                  </td>

                  <td className="p-3.5 font-bold text-cyan-300 whitespace-nowrap">
                    {log.action}
                  </td>

                  <td className="p-3.5 text-slate-200 font-sans text-xs max-w-xs sm:max-w-md break-words">
                    {log.details}
                  </td>

                  <td className="p-3.5 text-slate-300 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <User size={12} className="text-amber-400" />
                      <span>{log.actor}</span>
                    </div>
                  </td>

                  <td className="p-3.5 text-center whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      log.severity === 'CRITICAL'
                        ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                        : log.severity === 'WARN'
                        ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                        : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
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