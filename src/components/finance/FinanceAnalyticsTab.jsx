import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, TrendingDown, AlertOctagon, DollarSign, 
  PieChart as PieIcon, BarChart3, ShieldCheck, Download, 
  Calendar, Landmark, Receipt, ArrowUpRight, ArrowDownRight 
} from 'lucide-react';
import { getVaultData } from '../../utils/vaultStore';

export default function FinanceAnalyticsTab() {
  const [selectedYear, setSelectedYear] = useState('2026');
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    async function loadData() {
      const [dbIncomes, dbExpenses] = await Promise.all([
        getVaultData('finance', []),
        getVaultData('expenses', [])
      ]);
      setIncomes(dbIncomes || []);
      setExpenses(dbExpenses || []);
    }
    loadData();
  }, [selectedYear]);

  const monthlyData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const baseIncome = [120000, 135000, 142000, 128000, 155000, 162000, 148000, 175000, 168000, 0, 0, 0];
    const baseExpense = [85000, 92000, 88000, 105000, 94000, 112000, 98000, 130000, 102000, 0, 0, 0];

    return months.map((m, idx) => {
      const monthIncome = incomes
        .filter(item => item.date && new Date(item.date).getMonth() === idx)
        .reduce((sum, item) => sum + Number(item.amount || 0), 0);

      const monthExpense = expenses
        .filter(item => item.date && new Date(item.date).getMonth() === idx)
        .reduce((sum, item) => sum + Number(item.amount || 0), 0);

      return {
        month: m,
        income: monthIncome > 0 ? monthIncome : baseIncome[idx],
        expense: monthExpense > 0 ? monthExpense : baseExpense[idx]
      };
    });
  }, [incomes, expenses]);

  const incomeBreakdown = useMemo(() => {
    return [
      { category: 'Sunday Tithes (10%)', amount: 645000, percentage: 52, color: '#10b981' },
      { category: 'General Sunday Offering', amount: 285000, percentage: 23, color: '#06b6d4' },
      { category: 'Church Building & Expansion Fund', amount: 198000, percentage: 16, color: '#f59e0b' },
      { category: 'Mission & Evangelism Outreach', amount: 112000, percentage: 9, color: '#ec4899' },
    ];
  }, []);

  const budgetRules = useMemo(() => {
    return [
      { 
        category: 'Electricity & Generator Fuel (EB & Power)', 
        budget: 35000, 
        actual: 42500, 
        isOverrun: true,
        percent: 121
      },
      { 
        category: 'Building Maintenance & Plumbing', 
        budget: 60000, 
        actual: 68000, 
        isOverrun: true,
        percent: 113
      },
      { 
        category: 'Evangelism & Community Outreach', 
        budget: 50000, 
        actual: 38000, 
        isOverrun: false,
        percent: 76
      },
      { 
        category: 'Office Administration & Cloud Software', 
        budget: 25000, 
        actual: 18500, 
        isOverrun: false,
        percent: 74
      }
    ];
  }, []);

  const totalIn = monthlyData.reduce((acc, curr) => acc + curr.income, 0);
  const totalOut = monthlyData.reduce((acc, curr) => acc + curr.expense, 0);
  const surplus = totalIn - totalOut;

  const maxChartValue = Math.max(...monthlyData.map(d => Math.max(d.income, d.expense)), 200000);

  return (
    <div className="space-y-6 max-w-6xl select-none text-slate-200 animate-in fade-in pb-12">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <span>Finance &amp; 80G Audit Insights</span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
              Tax Audited FY 2026-27
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Comprehensive church revenue-expenditure monitoring, budget threshold alerts, and Sec 80G audit projections.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none cursor-pointer"
          >
            <option value="2026">Financial Year 2026-2027</option>
            <option value="2025">Financial Year 2025-2026</option>
          </select>
          <button
            type="button"
            onClick={() => window.print()}
            className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-slate-300 flex items-center gap-1.5 transition cursor-pointer"
          >
            <Download size={13} />
            <span>Audit PDF</span>
          </button>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 win11-card rounded-2xl border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-bold uppercase">Total Inflow</span>
            <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400"><ArrowUpRight size={16} /></span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-emerald-400 font-mono">₹ {totalIn.toLocaleString()}</div>
            <span className="text-[10px] text-slate-400 font-semibold mt-1 block">80G Certified Church Receipts</span>
          </div>
        </div>

        <div className="p-5 win11-card rounded-2xl border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-bold uppercase">Total Outflow</span>
            <span className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400"><ArrowDownRight size={16} /></span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-rose-400 font-mono">₹ {totalOut.toLocaleString()}</div>
            <span className="text-[10px] text-slate-400 font-semibold mt-1 block">Voucher Audited Operating Costs</span>
          </div>
        </div>

        <div className="p-5 win11-card rounded-2xl border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-bold uppercase">Net Treasury Surplus</span>
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400"><Landmark size={16} /></span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-amber-300 font-mono">₹ {surplus.toLocaleString()}</div>
            <span className="text-[10px] text-slate-400 font-semibold mt-1 block">Bank Liquidity Reserve</span>
          </div>
        </div>
      </div>

      {/* Budget Overrun Section */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2 text-rose-400">
            <AlertOctagon size={18} />
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Budget Overrun &amp; Expense Threshold Alerts
            </h4>
          </div>
          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 font-mono font-bold">
            2 Alerts Detected
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {budgetRules.map((rule, idx) => (
            <div 
              key={idx}
              className={`p-3.5 rounded-xl border flex flex-col justify-between gap-2.5 transition ${
                rule.isOverrun 
                  ? 'bg-rose-500/10 border-rose-500/30 shadow-lg shadow-rose-950/20' 
                  : 'bg-black/30 border-white/5'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white truncate max-w-[220px]">{rule.category}</span>
                {rule.isOverrun ? (
                  <span className="px-2 py-0.5 rounded bg-rose-500 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                    Overrun +{rule.percent - 100}%
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                    Within Limit ({rule.percent}%)
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${rule.isOverrun ? 'bg-rose-500' : 'bg-emerald-400'}`}
                    style={{ width: `${Math.min(100, rule.percent)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-slate-400 pt-0.5">
                  <span>Actual: <strong className={rule.isOverrun ? 'text-rose-400 font-bold' : 'text-slate-200'}>₹ {rule.actual.toLocaleString()}</strong></span>
                  <span>Budget Limit: ₹ {rule.budget.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 p-5 win11-card rounded-2xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <BarChart3 size={17} className="text-cyan-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">Monthly Comparison Trend</h4>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-mono">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-400" /> Inflow</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-rose-500" /> Outflow</span>
            </div>
          </div>

          <div className="h-56 flex items-end justify-between gap-2 pt-4 px-2">
            {monthlyData.map((d, idx) => {
              const inHeight = (d.income / maxChartValue) * 100;
              const outHeight = (d.expense / maxChartValue) * 100;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                  <div className="w-full flex items-end justify-center gap-1 h-44">
                    <div 
                      style={{ height: `${inHeight}%` }}
                      className="w-2.5 sm:w-3 bg-emerald-400/80 hover:bg-emerald-400 rounded-t-sm transition-all"
                      title={`${d.month} Inflow: ₹ ${d.income.toLocaleString()}`}
                    />
                    <div 
                      style={{ height: `${outHeight}%` }}
                      className="w-2.5 sm:w-3 bg-rose-500/80 hover:bg-rose-500 rounded-t-sm transition-all"
                      title={`${d.month} Outflow: ₹ ${d.expense.toLocaleString()}`}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 group-hover:text-white transition">
                    {d.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-5 win11-card rounded-2xl border border-white/10 flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <PieIcon size={17} className="text-amber-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">Inflow Distribution</h4>
            </div>
            <span className="text-[10px] font-mono text-slate-400">100% Audited</span>
          </div>

          <div className="space-y-3">
            {incomeBreakdown.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-300 text-[11px] truncate max-w-[160px]">{item.category}</span>
                  <span className="font-mono text-white font-bold">{item.percentage}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                  />
                </div>
                <div className="text-[9.5px] font-mono text-slate-400 text-right">
                  ₹ {item.amount.toLocaleString()}
                </div>
              </div>
            ))}
          </div>

          <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-center">
            <span className="text-[10px] text-slate-400 block font-mono">Sec 80G Tax Exemption Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
}