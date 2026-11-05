import React, { useMemo } from 'react';
import { AlertCircle, DollarSign, UserPlus } from 'lucide-react';
import { getVisitorPipelineStage } from './VisitorPipelineWidget';

const asArray = (value) => Array.isArray(value) ? value : [];

const careText = (request) => [
  request?.type,
  request?.category,
  request?.title,
  request?.description,
  request?.details,
  request?.priority,
  request?.status
].filter(Boolean).join(' ').toLowerCase();

const isOpenCareRequest = (request) => {
  const status = String(request?.status || request?.state || '').toLowerCase();
  return !request?.resolved
    && !request?.is_resolved
    && !request?.isResolved
    && !request?.completed
    && !['resolved', 'closed', 'complete', 'completed', 'done', 'cancelled', 'canceled'].includes(status);
};

const carePriority = (request) => {
  const text = careText(request);
  if (request?.emergency || request?.urgent || request?.isUrgent || /emergency|critical|hospitali[sz]|icu/.test(text)) return 0;
  if (/bereave|death|loss|grief/.test(text)) return 1;
  if (/overdue|pastoral|follow.?up|home[\s_-]?visit/.test(text)) return 2;
  return 3;
};

const careLabel = (request) => {
  const text = careText(request);
  if (/hospitali[sz]|icu/.test(text)) return 'Hospital';
  if (/emergency|critical/.test(text) || request?.emergency || request?.urgent || request?.isUrgent) return 'Emergency';
  if (/bereave|death|loss|grief/.test(text)) return 'Bereavement';
  if (/overdue|pastoral|follow.?up|home[\s_-]?visit/.test(text)) return 'Pastoral follow-up';
  return request?.status || 'Care follow-up';
};

function amountValue(record) {
  const amount = Number(record?.amount);
  return Number.isFinite(amount) && amount > 0 ? amount : 0;
}

function isApprovedExpense(expense) {
  const status = String(expense?.status || expense?.approval_status || '').trim().toLowerCase();
  if (!status) return true;
  return ['approved', 'paid', 'verified', 'complete', 'completed'].includes(status);
}

function branchIdentity(record) {
  const identity = record?.campus || record?.branch_id
    || record?.branchId || record?.branch || 'HQ';
  return String(identity).trim() || 'HQ';
}

export function calculateTreasury(incomeRecords = [], expenseRecords = []) {
  const branches = new Map();
  const totals = { inflow: 0, outflow: 0 };

  const addTransactions = (records, direction) => {
    asArray(records).forEach((record) => {
      if (direction === 'outflow' && !isApprovedExpense(record)) return;
      const amount = amountValue(record);
      if (!amount) return;

      const campus = branchIdentity(record);
      const branch = branches.get(campus) || { name: campus, inflow: 0, outflow: 0, balance: 0 };
      branch[direction] += amount;
      branch.balance = branch.inflow - branch.outflow;
      totals[direction] += amount;
      branches.set(campus, branch);
    });
  };

  addTransactions(incomeRecords, 'inflow');
  addTransactions(expenseRecords, 'outflow');

  const net = totals.inflow - totals.outflow;
  const branchList = Array.from(branches.values())
    .map((branch) => ({
      ...branch,
      reserveShare: Math.abs(net) > 0
        ? Math.min(100, (Math.abs(branch.balance) / Math.abs(net)) * 100)
        : 0
    }))
    .sort((a, b) => b.balance - a.balance);

  return { ...totals, net, branches: branchList };
}

export default function ExecutiveSummaryRow({
  visitors = [],
  careRequests = [],
  finance = [],
  expenses = [],
  canViewTreasury = false,
  onOpenVisitorFunnel,
  onOpenCare,
  onOpenFinance
}) {
  const visitorCounts = useMemo(() => {
    const counts = { firstVisit: 0, called: 0, visited: 0, converted: 0 };
    asArray(visitors).forEach((visitor) => {
      const stage = getVisitorPipelineStage(visitor);
      if (stage === '1ST_VISIT') counts.firstVisit += 1;
      if (stage === 'LEADER_CALLED') counts.called += 1;
      if (stage === 'HOME_VISITED') counts.visited += 1;
      if (stage === 'CONVERTED') counts.converted += 1;
    });
    return counts;
  }, [visitors]);

  const careAlerts = useMemo(() => asArray(careRequests)
    .filter(isOpenCareRequest)
    .sort((a, b) => carePriority(a) - carePriority(b)), [careRequests]);

  const treasury = useMemo(
    () => calculateTreasury(finance, expenses),
    [finance, expenses]
  );

  return (
    <section aria-label="Executive summary" className="mb-6 grid grid-cols-1 items-stretch gap-3.5 lg:grid-cols-3">
      <article className="flex h-full min-h-[190px] min-w-0 flex-col rounded-2xl border border-slate-800 bg-slate-900/80 p-3.5 backdrop-blur-md">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <span className="rounded-lg bg-sky-500/10 p-1.5 text-sky-300"><UserPlus size={14} /></span>
            <h3 className="truncate text-[11px] font-bold uppercase tracking-wider text-slate-200">Visitor Pipeline Funnel</h3>
          </div>
          <button type="button" onClick={() => onOpenVisitorFunnel?.('ALL')} className="shrink-0 text-[10px] font-semibold text-sky-300 hover:text-sky-200">Open funnel</button>
        </div>
        <div className="mt-4 grid flex-1 grid-cols-2 gap-2">
          {[
            { label: '1st Visit', count: visitorCounts.firstVisit, stage: '1ST_VISIT', color: 'text-amber-300' },
            { label: 'Called', count: visitorCounts.called, stage: 'LEADER_CALLED', color: 'text-sky-300' },
            { label: 'Visited', count: visitorCounts.visited, stage: 'HOME_VISITED', color: 'text-indigo-300' },
            { label: 'Full Member', count: visitorCounts.converted, stage: 'CONVERTED', color: 'text-emerald-300' }
          ].map((stage) => (
            <button key={stage.stage} type="button" onClick={() => onOpenVisitorFunnel?.(stage.stage)} className="flex items-center justify-between gap-2 rounded-xl border border-white/[0.06] bg-slate-950/45 px-2.5 py-2 text-left transition hover:border-white/15 hover:bg-slate-950/70">
              <span className="truncate text-[10px] font-medium text-slate-300">{stage.label}</span>
              <span className={`text-sm font-black ${stage.color}`}>{stage.count}</span>
            </button>
          ))}
        </div>
      </article>

      <article className="flex h-full min-h-[190px] min-w-0 flex-col rounded-2xl border border-slate-800 bg-slate-900/80 p-3.5 backdrop-blur-md">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-rose-500/10 p-1.5 text-rose-300"><AlertCircle size={14} /></span>
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-200">Critical Care</h3>
          </div>
          <span className="text-xs font-bold text-rose-400">{careAlerts.length} Alerts</span>
        </div>
        <div className="mt-3 flex-1 space-y-1.5 overflow-y-auto pr-1 [scrollbar-width:thin] [scrollbar-color:rgba(148,163,184,.35)_transparent]">
          {careAlerts.length === 0 ? (
            <p className="py-3 text-center text-[10px] text-slate-500">No active care alerts</p>
          ) : careAlerts.slice(0, 3).map((request, index) => {
            const name = request?.member_name
              || request?.memberName
              || request?.requester_name
              || request?.requester
              || request?.name
              || 'Pastoral follow-up';
            const priority = carePriority(request);
            return (
              <button key={request.id || `${name}-${index}`} type="button" onClick={onOpenCare} className="flex w-full min-w-0 items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-white/[0.04]">
                <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${priority === 0 ? 'bg-rose-400' : priority === 1 ? 'bg-amber-300' : 'bg-sky-300'}`} />
                <span className="min-w-0 flex-1 truncate text-xs text-slate-200">{name}</span>
                <span className="max-w-[40%] truncate text-[9px] font-semibold text-slate-500">{careLabel(request)}</span>
              </button>
            );
          })}
        </div>
      </article>

      <article className="flex h-full min-h-[190px] min-w-0 flex-col rounded-2xl border border-slate-800 bg-slate-900/80 p-3.5 backdrop-blur-md">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <span className="rounded-lg bg-emerald-500/10 p-1.5 text-emerald-300"><DollarSign size={14} /></span>
            <h3 className="truncate text-[11px] font-bold uppercase tracking-wider text-slate-200">Multi-Branch Treasury</h3>
          </div>
          {canViewTreasury && (
            <>
              <span className={`shrink-0 font-mono text-base font-bold lg:text-lg ${treasury.net >= 0 ? 'text-emerald-400' : 'text-rose-300'}`}>
                ₹{treasury.net.toLocaleString()}
              </span>
              <button type="button" onClick={onOpenFinance} className="shrink-0 text-[9px] font-semibold text-emerald-300 hover:text-emerald-200">Open ledger</button>
            </>
          )}
        </div>
        {canViewTreasury ? (
          <>
            <div className="mt-3 grid grid-cols-3 gap-1.5">
              <div className="rounded-lg bg-slate-950/50 px-2 py-1.5">
                <p className="text-[8px] uppercase text-slate-500">Total Inflow</p>
                <p className="mt-0.5 truncate font-mono text-[10px] font-bold text-emerald-300">₹{treasury.inflow.toLocaleString()}</p>
              </div>
              <div className="rounded-lg bg-slate-950/50 px-2 py-1.5">
                <p className="text-[8px] uppercase text-slate-500">Total Outflow</p>
                <p className="mt-0.5 truncate font-mono text-[10px] font-bold text-rose-300">₹{treasury.outflow.toLocaleString()}</p>
              </div>
              <div className="rounded-lg bg-slate-950/50 px-2 py-1.5">
                <p className="text-[8px] uppercase text-slate-500">Net Reserves</p>
                <p className={`mt-0.5 truncate font-mono text-[10px] font-bold ${treasury.net >= 0 ? 'text-cyan-300' : 'text-rose-300'}`}>
                  ₹{treasury.net.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="mt-2 flex-1 space-y-1.5">
              {treasury.branches.length === 0 ? (
                <p className="py-2 text-center text-[10px] text-slate-500">No treasury records available</p>
              ) : treasury.branches.slice(0, 3).map((branch) => (
                <div key={branch.name}>
                  <div className="flex items-center justify-between gap-2 text-[10px]">
                    <span className="min-w-0 truncate font-medium text-slate-300">{branch.name}</span>
                    <span className={`shrink-0 font-mono font-semibold ${branch.balance >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                      ₹{branch.balance.toLocaleString()}
                    </span>
                  </div>
                  <div className="mt-1 h-1 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className={`h-full rounded-full ${branch.balance >= 0 ? 'bg-emerald-400/80' : 'bg-rose-400/80'}`}
                      style={{ width: `${Number.isFinite(branch.reserveShare) ? branch.reserveShare : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <span className="mt-1 text-[8px] text-slate-600">Includes approved expenses; legacy vouchers without a status are treated as approved.</span>
          </>
        ) : (
          <p className="mt-4 flex-1 rounded-xl border border-white/[0.06] bg-slate-950/45 p-3 text-center text-[10px] text-slate-400">
            Treasury figures are restricted to Finance Officer and Senior Pastor roles.
          </p>
        )}
      </article>
    </section>
  );
}
