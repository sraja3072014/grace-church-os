import React, { useMemo } from 'react';
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Home,
  PhoneCall,
  UserRound,
  UsersRound,
} from 'lucide-react';

export const VISITOR_PIPELINE_STAGES = [
  { id: '1ST_VISIT', label: '1st Visit', description: 'New guests', icon: UserRound, color: 'amber' },
  { id: 'LEADER_CALLED', label: 'Leader Call', description: 'Pastoral care', icon: PhoneCall, color: 'sky' },
  { id: 'HOME_VISITED', label: 'Home Visit', description: 'Scheduled / done', icon: Home, color: 'indigo' },
  { id: 'CONVERTED', label: 'Full Member', description: 'Graduated', icon: UsersRound, color: 'emerald' },
];

const LEGACY_STAGE_MAP = {
  FIRST_VISIT: '1ST_VISIT',
  new_contact: '1ST_VISIT',
  CONTACTED: 'LEADER_CALLED',
  calling_scheduled: 'LEADER_CALLED',
  PRAYER_MEET: 'HOME_VISITED',
  home_visit: 'HOME_VISITED',
  COMMITTED: 'HOME_VISITED',
  ready_for_membership: 'HOME_VISITED',
};

export function getVisitorPipelineStage(visitor) {
  if (visitor?.pipeline_stage === 'CONVERTED' || visitor?.is_converted) return 'CONVERTED';
  if (VISITOR_PIPELINE_STAGES.some((stage) => stage.id === visitor?.pipeline_stage)) return visitor.pipeline_stage;
  return LEGACY_STAGE_MAP[visitor?.stage] || LEGACY_STAGE_MAP[visitor?.followUpStage] || '1ST_VISIT';
}

const colorClasses = {
  amber: 'bg-amber-500/10 border-amber-500/25 text-amber-300',
  sky: 'bg-sky-500/10 border-sky-500/25 text-sky-300',
  indigo: 'bg-indigo-500/10 border-indigo-500/25 text-indigo-300',
  emerald: 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300',
};

export default function VisitorPipelineWidget({ visitors = [], onOpenStage, onAdvanceStage }) {
  const stageData = useMemo(() => VISITOR_PIPELINE_STAGES.map((stage) => ({
    ...stage,
    visitors: visitors.filter((visitor) => getVisitorPipelineStage(visitor) === stage.id),
  })), [visitors]);

  return (
    <section className="p-5 win11-card rounded-2xl border border-white/[0.08] space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-2.5">
        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <UsersRound className="text-rose-400" size={15} /> Visitor Pipeline Funnel
          </h4>
          <p className="text-[10px] text-slate-500 mt-1">Track each new visitor from welcome to membership.</p>
        </div>
        <button type="button" onClick={() => onOpenStage?.('ALL')} className="text-[10px] text-slate-400 hover:text-white">
          {visitors.filter((visitor) => getVisitorPipelineStage(visitor) !== 'CONVERTED').length} active care records
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {stageData.map((stage) => {
          const Icon = stage.icon;
          const latest = stage.visitors.slice(0, 3);
          return (
            <div key={stage.id} className={`rounded-2xl border p-3 ${colorClasses[stage.color]}`}>
              <button type="button" onClick={() => onOpenStage?.(stage.id)} className="w-full text-left cursor-pointer">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wide">{stage.label}</span>
                  <Icon size={15} />
                </div>
                <div className="text-2xl font-black text-white mt-2">{stage.visitors.length}</div>
                <div className="text-[10px] opacity-75">{stage.description}</div>
              </button>

              <div className="mt-3 space-y-1.5 min-h-14">
                {latest.length === 0 ? <span className="text-[10px] opacity-60">No records yet</span> : latest.map((visitor) => (
                  <div key={visitor.id || visitor.visitorId || visitor.name} className="truncate text-[10px] text-white/90">
                    {visitor.name || 'Unnamed visitor'}
                  </div>
                ))}
              </div>

              {stage.id !== 'CONVERTED' && stage.visitors[0] && (
                <button
                  type="button"
                  onClick={() => onAdvanceStage?.(stage.visitors[0], stage.id)}
                  className="mt-3 w-full rounded-xl bg-slate-950/40 px-2 py-1.5 text-[10px] font-bold text-white hover:bg-slate-950/70 flex items-center justify-center gap-1"
                >
                  {stage.id === '1ST_VISIT' ? 'Mark Leader Call Done' : stage.id === 'LEADER_CALLED' ? 'Schedule Home Visit' : 'Mark Ready for Membership'}
                  <ArrowRight size={12} />
                </button>
              )}
              {stage.id === 'CONVERTED' && <div className="mt-3 text-[10px] font-bold flex items-center gap-1"><CheckCircle2 size={12} /> Permanent members</div>}
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-2 text-[10px] text-slate-500 border-t border-white/5 pt-3">
        <CalendarDays size={13} /> Click any stage to open the visitor registry filtered to that stage.
      </div>
    </section>
  );
}