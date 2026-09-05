import React, { useState, useMemo } from 'react';
import { 
  FileText, Download, TrendingUp, Users, 
  CalendarCheck, DollarSign, Sparkles, Filter, 
  CheckCircle2, Printer, ArrowUpRight, Search,
  HeartHandshake, PieChart, Layers, Check, Award, Eye, X, ShieldCheck
} from 'lucide-react';

export default function ReportDashboard({ session }) {
  const [activeReportTab, setActiveReportTab] = useState('attendance');
  const [dateRange, setDateRange] = useState('Current Month (MTD)');
  const [toastMessage, setToastMessage] = useState('');
  
  // Live Preview Modal State
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewDocument, setPreviewDocument] = useState(null);

  // Settings-ல் இருந்து கரன்சி சிம்பலை எடுத்தல்
  const currencySymbol = useMemo(() => {
    try {
      const cfg = JSON.parse(localStorage.getItem('graceos_locale_config') || '{}');
      return cfg.currencySymbol || '₹';
    } catch {
      return '₹';
    }
  }, []);

  // LocalStorage Data Retrieval
  const [families] = useState(() => {
    try {
      const saved = localStorage.getItem('app_members_family_database');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [visitors] = useState(() => {
    try {
      const saved = localStorage.getItem('app_visitors_database');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [incomeList] = useState(() => {
    try {
      const saved = localStorage.getItem('app_finance_transactions_ledger');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const churchName = 'Grace Cathedral Church Trust';
  const pastorName = session?.username || 'Rev. Senior Pastor';
  const branchType = 'Main Campus Sanctuary';

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleOpenPreview = (type, title) => {
    setPreviewDocument({
      type,
      title,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      refNo: `DOC-CCMS-${Date.now().toString().slice(-5)}`
    });
    setIsPreviewOpen(true);
  };

  const handleExportCSV = (reportName) => {
    showToast(`Exporting ${reportName} Data Sheet as CSV...`);
    const csvContent = "data:text/csv;charset=utf-8,Category,Metric,Value\nAttendance,Average,541\nMembers,Households,84\nGiving,Inflow,142500";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${reportName}_Report_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalFamiliesCount = families.length > 0 ? families.length : 84;
  const totalSeekers = visitors.length > 0 ? visitors.length : 24;
  const convertedMembers = visitors.filter(v => v.followUpStage === 'ready_for_membership').length || 8;
  const totalGivingAmount = incomeList.reduce((acc, curr) => acc + Number(curr.amount || 0), 0) || 142500;

  return (
    <div className="flex flex-col gap-6 select-none animate-in fade-in duration-200 pb-16 text-slate-100">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 backdrop-blur-md shadow-2xl z-50 animate-in fade-in">
          <CheckCircle2 size={15} />
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
              <Sparkles size={12} className="text-amber-400" />
              Church Audit & Certificates Studio
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <FileText className="text-amber-400" size={24} />
            <span>Reports & Executive Audits Centre</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            அதிகாரப்பூர்வ சபை தணிக்கை அறிக்கைகள், வருகைப் பதிவேடு சுருக்கம் மற்றும் சான்றிதழ் அச்சுத் தளம்.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white font-bold focus:outline-none cursor-pointer"
          >
            <option value="Current Week">Current Week</option>
            <option value="Current Month (MTD)">Current Month (MTD)</option>
            <option value="Last Quarter (Q3)">Last Quarter (Q3)</option>
            <option value="Annual Fiscal Year 2026">Annual Fiscal Year 2026</option>
          </select>

          <button
            type="button"
            onClick={() => handleExportCSV(activeReportTab.toUpperCase())}
            className="px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold shadow-lg flex items-center gap-1.5 cursor-pointer transition active:scale-95"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenPreview(activeReportTab, `${activeReportTab.toUpperCase()} STATEMENT`)}
            className="px-4 py-2 bg-gradient-to-r from-rose-500 to-amber-600 hover:from-rose-400 hover:to-amber-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-500/20 flex items-center gap-1.5 cursor-pointer transition active:scale-95"
          >
            <Eye size={14} />
            <span>Live PDF Preview</span>
          </button>
        </div>
      </div>

      {/* 5 Audit Category Selectors */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <button
          type="button"
          onClick={() => setActiveReportTab('attendance')}
          className={`p-4 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
            activeReportTab === 'attendance'
              ? 'bg-amber-500/15 border-amber-500 text-white shadow-lg'
              : 'win11-card border-white/5 text-slate-400 hover:text-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <CalendarCheck size={16} className="text-amber-400" />
            <span className="text-[10px] font-mono text-amber-400 font-bold">+12.4%</span>
          </div>
          <div className="text-xs font-bold mt-2">1. Attendance</div>
          <span className="text-[10px] text-slate-400">Service Turnout</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveReportTab('members')}
          className={`p-4 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
            activeReportTab === 'members'
              ? 'bg-sky-500/15 border-sky-500 text-white shadow-lg'
              : 'win11-card border-white/5 text-slate-400 hover:text-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <Users size={16} className="text-sky-400" />
            <span className="text-[10px] font-mono text-sky-400 font-bold">{totalFamiliesCount}</span>
          </div>
          <div className="text-xs font-bold mt-2">2. Households</div>
          <span className="text-[10px] text-slate-400">Believer Census</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveReportTab('visitors')}
          className={`p-4 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
            activeReportTab === 'visitors'
              ? 'bg-rose-500/15 border-rose-500 text-white shadow-lg'
              : 'win11-card border-white/5 text-slate-400 hover:text-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <HeartHandshake size={16} className="text-rose-400" />
            <span className="text-[10px] font-mono text-rose-400 font-bold">{totalSeekers}</span>
          </div>
          <div className="text-xs font-bold mt-2">3. Visitors</div>
          <span className="text-[10px] text-slate-400">Seeker Funnel</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveReportTab('finance')}
          className={`p-4 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
            activeReportTab === 'finance'
              ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-lg'
              : 'win11-card border-white/5 text-slate-400 hover:text-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <DollarSign size={16} className="text-emerald-400" />
            <span className="text-[10px] font-mono text-emerald-400 font-bold">{currencySymbol} {(totalGivingAmount/1000).toFixed(1)}k</span>
          </div>
          <div className="text-xs font-bold mt-2">4. Treasury</div>
          <span className="text-[10px] text-slate-400">Giving & Expenses</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveReportTab('certificates')}
          className={`p-4 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
            activeReportTab === 'certificates'
              ? 'bg-indigo-500/15 border-indigo-500 text-white shadow-lg'
              : 'win11-card border-white/5 text-slate-400 hover:text-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <Award size={16} className="text-indigo-400" />
            <span className="text-[10px] font-mono text-indigo-400 font-bold">Docs</span>
          </div>
          <div className="text-xs font-bold mt-2">5. Certificates</div>
          <span className="text-[10px] text-slate-400">Sacraments</span>
        </button>
      </div>

      {/* Dynamic Tab Details View */}
      {activeReportTab === 'attendance' && (
        <div className="space-y-4 pt-1">
          <div className="win11-card p-4 rounded-2xl border border-white/10 flex justify-between items-center text-xs">
            <span className="font-bold text-white uppercase tracking-wider">Worship Turnout & Consistency Breakdown</span>
            <span className="text-amber-400 font-mono font-bold">Lord's Day Average: 541 Attendees</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="win11-card p-5 rounded-2xl border border-white/10 space-y-1">
              <span className="text-xs text-slate-400">1st Morning Worship (Tamil)</span>
              <div className="text-2xl font-black text-white font-mono">245 Believers</div>
              <span className="text-[10px] text-emerald-400 font-bold">88% Capacity (Peak Service)</span>
            </div>
            <div className="win11-card p-5 rounded-2xl border border-white/10 space-y-1">
              <span className="text-xs text-slate-400">2nd English & Youth Service</span>
              <div className="text-2xl font-black text-white font-mono">165 Believers</div>
              <span className="text-[10px] text-sky-400 font-bold">64% Capacity</span>
            </div>
            <div className="win11-card p-5 rounded-2xl border border-white/10 space-y-1">
              <span className="text-xs text-slate-400">Sunday School & Kids Church</span>
              <div className="text-2xl font-black text-white font-mono">131 Children</div>
              <span className="text-[10px] text-indigo-400 font-bold">100% Attendance Rate</span>
            </div>
          </div>
        </div>
      )}

      {activeReportTab === 'members' && (
        <div className="space-y-4 pt-1">
          <div className="win11-card p-4 rounded-2xl border border-white/10 flex justify-between items-center text-xs">
            <span className="font-bold text-white uppercase tracking-wider">Household Demographics & Sacraments</span>
            <span className="text-sky-400 font-mono font-bold">{totalFamiliesCount} Registered Households</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="win11-card p-4 rounded-2xl border border-white/10 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Water Baptized</span>
              <div className="text-2xl font-black text-emerald-400 font-mono mt-1">210</div>
            </div>
            <div className="win11-card p-4 rounded-2xl border border-white/10 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Holy Communion</span>
              <div className="text-2xl font-black text-sky-400 font-mono mt-1">195</div>
            </div>
            <div className="win11-card p-4 rounded-2xl border border-white/10 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Youth Fellowship</span>
              <div className="text-2xl font-black text-amber-400 font-mono mt-1">68</div>
            </div>
            <div className="win11-card p-4 rounded-2xl border border-white/10 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Senior Citizens</span>
              <div className="text-2xl font-black text-indigo-400 font-mono mt-1">42</div>
            </div>
          </div>
        </div>
      )}

      {activeReportTab === 'visitors' && (
        <div className="space-y-4 pt-1">
          <div className="win11-card p-4 rounded-2xl border border-white/10 flex justify-between items-center text-xs">
            <span className="font-bold text-white uppercase tracking-wider">Soul Harvest & Follow-up Funnel</span>
            <span className="text-rose-400 font-mono font-bold">Conversion Ratio: 33.3%</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="win11-card p-5 rounded-2xl border border-white/10 space-y-1">
              <span className="text-xs text-slate-400">First-Time Seekers (MTD)</span>
              <div className="text-2xl font-black text-amber-400 font-mono">{totalSeekers} Souls</div>
            </div>
            <div className="win11-card p-5 rounded-2xl border border-white/10 space-y-1">
              <span className="text-xs text-slate-400">Home & Pastoral Visits</span>
              <div className="text-2xl font-black text-sky-400 font-mono">16 Families</div>
            </div>
            <div className="win11-card p-5 rounded-2xl border border-white/10 space-y-1">
              <span className="text-xs text-slate-400">Promoted to Full Believer</span>
              <div className="text-2xl font-black text-emerald-400 font-mono">{convertedMembers} Souls</div>
            </div>
          </div>
        </div>
      )}

      {activeReportTab === 'finance' && (
        <div className="space-y-4 pt-1">
          <div className="win11-card p-4 rounded-2xl border border-white/10 flex justify-between items-center text-xs">
            <span className="font-bold text-white uppercase tracking-wider">Kingdom Treasury & Financial Audit</span>
            <span className="text-emerald-400 font-mono font-bold">Net Inflow Tracked</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="win11-card p-5 rounded-2xl border border-emerald-500/20 space-y-1">
              <span className="text-xs text-slate-400">Total Giving Inflow</span>
              <div className="text-2xl font-black text-emerald-400 font-mono">{currencySymbol} {Number(totalGivingAmount).toLocaleString()}</div>
            </div>
            <div className="win11-card p-5 rounded-2xl border border-rose-500/20 space-y-1">
              <span className="text-xs text-slate-400">Operating Expenses</span>
              <div className="text-2xl font-black text-rose-400 font-mono">{currencySymbol} 63,000</div>
            </div>
            <div className="win11-card p-5 rounded-2xl border border-sky-500/20 space-y-1">
              <span className="text-xs text-slate-400">Building Fund Reserves</span>
              <div className="text-2xl font-black text-sky-400 font-mono">{currencySymbol} 4,12,000</div>
            </div>
          </div>
        </div>
      )}

      {activeReportTab === 'certificates' && (
        <div className="space-y-4 pt-1">
          <div className="win11-card p-4 rounded-2xl border border-white/10 flex justify-between items-center text-xs">
            <span className="font-bold text-white uppercase tracking-wider">Official Church Certificates & Attestations</span>
            <span className="text-indigo-400 font-mono font-bold">Print Ready A4 Standards</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="win11-card p-5 rounded-2xl border border-white/10 space-y-3">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs">
                <Award size={18} />
                <span>Water Baptism Certificate</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">Official sacrament certification with pastoral seal and scripture verse.</p>
              <button
                type="button"
                onClick={() => handleOpenPreview('baptism', 'WATER BAPTISM SACRAMENT CERTIFICATE')}
                className="w-full py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-bold cursor-pointer transition"
              >
                Preview & Print
              </button>
            </div>

            <div className="win11-card p-5 rounded-2xl border border-white/10 space-y-3">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
                <Award size={18} />
                <span>Child Dedication Certificate</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">Infant and child dedication blessing certificate for family records.</p>
              <button
                type="button"
                onClick={() => handleOpenPreview('dedication', 'CHILD DEDICATION BLESSING CERTIFICATE')}
                className="w-full py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold cursor-pointer transition"
              >
                Preview & Print
              </button>
            </div>

            <div className="win11-card p-5 rounded-2xl border border-white/10 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                <Award size={18} />
                <span>Pastoral Recommendation</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">Character reference and bona fide letter for employment or admissions.</p>
              <button
                type="button"
                onClick={() => handleOpenPreview('recommendation', 'OFFICIAL PASTORAL RECOMMENDATION LETTER')}
                className="w-full py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold cursor-pointer transition"
              >
                Preview & Print
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Document Preview & PDF Print Engine Modal */}
      {isPreviewOpen && previewDocument && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-2xl bg-white text-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Top Toolbar */}
            <div className="bg-slate-900 px-6 py-3.5 flex items-center justify-between text-white border-b border-white/10">
              <div className="flex items-center gap-2">
                <Printer size={16} className="text-amber-400" />
                <span className="text-xs font-bold uppercase tracking-wider">Live Document Preview & Print Hub</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-1.5 bg-gradient-to-r from-rose-500 to-amber-600 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Printer size={13} />
                  <span>Print Document</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(false)}
                  className="text-slate-400 hover:text-white cursor-pointer p-1"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* A4 Document Printable Canvas */}
            <div className="p-8 overflow-y-auto space-y-6 bg-white select-text">
              
              {/* Church Letterhead */}
              <div className="border-b-2 border-slate-900 pb-4 text-center space-y-1">
                <h2 className="text-xl font-black text-slate-900 tracking-wider uppercase">{churchName}</h2>
                <p className="text-[11px] text-slate-600 font-bold uppercase tracking-widest">{branchType} • MINISTRY OF SACRAMENTS & AUDIT</p>
                <p className="text-[10px] text-slate-500 font-mono">Ref No: {previewDocument.refNo} | Date: {previewDocument.date}</p>
              </div>

              {/* Title */}
              <div className="text-center py-2">
                <h3 className="text-sm font-black text-slate-900 tracking-wider uppercase underline underline-offset-4">
                  {previewDocument.title}
                </h3>
              </div>

              {/* Content Body Based on Type */}
              {previewDocument.type === 'attendance' && (
                <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
                  <p>This is to officially certify that the congregation attendance records for the term <strong>{dateRange}</strong> have been audited under pastoral oversight.</p>
                  <table className="w-full border-collapse border border-slate-300 text-left text-xs my-3">
                    <thead>
                      <tr className="bg-slate-100 font-bold text-slate-900">
                        <th className="border border-slate-300 p-2">Service Name</th>
                        <th className="border border-slate-300 p-2">Turnout</th>
                        <th className="border border-slate-300 p-2">Capacity</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-slate-300 p-2">1st Morning Service (Tamil)</td>
                        <td className="border border-slate-300 p-2 font-mono font-bold">245</td>
                        <td className="border border-slate-300 p-2">88%</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-2">2nd English & Youth Service</td>
                        <td className="border border-slate-300 p-2 font-mono font-bold">165</td>
                        <td className="border border-slate-300 p-2">64%</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-2">Sunday School / Children</td>
                        <td className="border border-slate-300 p-2 font-mono font-bold">131</td>
                        <td className="border border-slate-300 p-2">100%</td>
                      </tr>
                    </tbody>
                  </table>
                  <p className="font-bold">Total Average Attendance: 541 Souls per Lord's Day.</p>
                </div>
              )}

              {previewDocument.type === 'finance' && (
                <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
                  <p>Audited statement of kingdom tithes, offerings, and operational expenses for <strong>{dateRange}</strong>.</p>
                  <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Kingdom Inflow</span>
                      <strong className="text-base text-emerald-700 font-mono">{currencySymbol} {Number(totalGivingAmount).toLocaleString()}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Disbursed Expenses</span>
                      <strong className="text-base text-rose-700 font-mono">{currencySymbol} 63,000</strong>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 italic">Audited and verified by Cathedral Treasury Board.</p>
                </div>
              )}

              {previewDocument.type === 'baptism' && (
                <div className="space-y-4 text-center py-4 text-xs text-slate-700 leading-relaxed">
                  <p className="italic">"Therefore go and make disciples of all nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit." — Matthew 28:19</p>
                  <p className="pt-2">This is to certify that the believer has been publicly baptized by water immersion in confession of faith in the Lord Jesus Christ.</p>
                  <div className="my-4 p-4 border border-dashed border-slate-400 rounded-xl inline-block w-full text-slate-900 font-bold">
                    Official Cathedral Baptism Registry Entry
                  </div>
                </div>
              )}

              {/* Document Signatures & Seal */}
              <div className="pt-8 flex items-end justify-between border-t border-slate-200 text-xs">
                <div className="text-center space-y-1">
                  <div className="w-20 h-20 border-2 border-slate-900 rounded-full mx-auto flex items-center justify-center font-serif font-black text-[9px] text-slate-800 uppercase tracking-tighter">
                    Official<br/>Cathedral<br/>Seal
                  </div>
                  <span className="text-[9px] text-slate-500">Corporate Seal</span>
                </div>

                <div className="text-right space-y-1">
                  <div className="font-serif italic font-bold text-sm text-slate-900">{pastorName}</div>
                  <div className="text-[10px] font-bold uppercase text-slate-700">Senior Pastor & Presiding Elder</div>
                  <div className="text-[9px] text-slate-500 font-mono">Digitally Verified & Authorized</div>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}