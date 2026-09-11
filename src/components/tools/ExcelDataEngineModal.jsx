import React, { useState } from 'react';
import { 
  FileSpreadsheet, Upload, Download, CheckCircle2, 
  AlertCircle, X, FileText, Database, ShieldAlert 
} from 'lucide-react';
import { soundFX } from '../../utils/audioEngine';

export default function ExcelDataEngineModal({ isOpen, onClose, onRefreshData }) {
  const [importStats, setImportStats] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  // 1. மாதிரி CSV படிவத்தை பதிவிறக்குதல் (Sample Template)
  const downloadSampleTemplate = () => {
    soundFX.playClickPop();
    const headers = "Name,Phone,RoleInFamily,FamilyName,Area,DOB,Education\n";
    const sampleRows = 
      "Pastor David,+919840112233,Head,David Household,Tambaram,1980-05-12,M.Div\n" +
      "Esther David,+919840112234,Wife,David Household,Tambaram,1984-08-20,B.Ed\n" +
      "Joshua David,+919840112235,Child,David Household,Tambaram,2010-11-04,Student";
    
    const blob = new Blob([headers + sampleRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'GraceOS_Believers_Template.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  // 2. CSV கோப்பைப் படித்து லோக்கல் ஸ்டோரேஜில் ஏற்றுதல்
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setErrorMessage('');
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const lines = text.split(/\r\n|\n/).filter(line => line.trim() !== '');
        
        if (lines.length <= 1) {
          setErrorMessage('கோப்பில் தரவுகள் எதுவும் இல்லை.');
          return;
        }

        const currentFamilies = JSON.parse(localStorage.getItem('app_members_family_database') || '[]');
        let importedMembersCount = 0;
        let importedFamiliesCount = 0;

        // Skip header row
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
          if (cols.length < 2 || !cols[0]) continue;

          const [name, phone, role, familyName, area, dob, education] = cols;
          const assignedFamilyName = familyName || `${name} Household`;

          // குடும்பம் ஏற்கனவே உள்ளதா என சரிபார்த்தல்
          let existingFam = currentFamilies.find(f => f.familyName.toLowerCase() === assignedFamilyName.toLowerCase());

          const memberObj = {
            memberId: `MBR-${Math.floor(1000 + Math.random() * 9000)}`,
            name: name,
            phone: phone || '',
            roleInFamily: role || 'Member',
            dob: dob || '',
            education: education || ''
          };

          if (!existingFam) {
            existingFam = {
              familyId: `FAM-${Math.floor(100 + Math.random() * 900)}`,
              familyName: assignedFamilyName,
              area: area || 'Main City',
              headMember: role?.toLowerCase() === 'head' ? memberObj : null,
              members: role?.toLowerCase() === 'head' ? [] : [memberObj]
            };
            currentFamilies.push(existingFam);
            importedFamiliesCount++;
          } else {
            if (role?.toLowerCase() === 'head' && !existingFam.headMember) {
              existingFam.headMember = memberObj;
            } else {
              existingFam.members.push(memberObj);
            }
          }
          importedMembersCount++;
        }

        localStorage.setItem('app_members_family_database', JSON.stringify(currentFamilies));
        soundFX.playSuccessChime();
        setImportStats({ members: importedMembersCount, families: importedFamiliesCount });
        if (onRefreshData) onRefreshData();
      } catch (err) {
        setErrorMessage('CSV கோப்பைப் படிப்பதில் பிழை ஏற்பட்டது. படிவ அமைப்பைச் சரிபார்க்கவும்.');
      }
    };

    reader.readAsText(file);
  };

  // 3. விசுவாசிகள் பட்டியலை CSV ஆக எக்ஸ்போர்ட் செய்தல்
  const exportMembersCSV = () => {
    soundFX.playClickPop();
    const families = JSON.parse(localStorage.getItem('app_members_family_database') || '[]');
    let csv = "MemberID,Name,Phone,FamilyName,Role,Area,DOB\n";

    families.forEach(f => {
      if (f.headMember) {
        csv += `${f.headMember.memberId || ''},"${f.headMember.name}","${f.headMember.phone || ''}","${f.familyName}",Head,"${f.area || ''}","${f.headMember.dob || ''}"\n`;
      }
      (f.members || []).forEach(m => {
        csv += `${m.memberId || ''},"${m.name}","${m.phone || ''}","${f.familyName}","${m.roleInFamily || 'Member'}","${f.area || ''}","${m.dob || ''}"\n`;
      });
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `GraceOS_Members_Export_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // 4. 80G வரவு-செலவு லெட்ஜரை எக்ஸ்போர்ட் செய்தல்
  const exportFinanceCSV = () => {
    soundFX.playClickPop();
    const ledger = JSON.parse(localStorage.getItem('app_finance_transactions_ledger') || '[]');
    let csv = "ReceiptID,DonorName,Category,Amount,Date,RecordedBy\n";

    ledger.forEach(item => {
      csv += `"${item.id}","${item.member || item.donor}","${item.category}",${item.amount},"${item.date}","${item.recordedBy || 'Admin'}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `GraceOS_80G_Finance_Audit_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-xl bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <FileSpreadsheet size={22} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Excel / CSV Data Management Hub</h3>
              <p className="text-[11px] text-slate-400">மொத்த தரவு பதிவேற்றம் மற்றும் தணிக்கை ஏற்றுமதி பலகை</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white cursor-pointer">
            <X size={20} />
          </button>
        </div>

        {/* Import Section */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Upload size={15} className="text-cyan-400" />
              எக்செல் / CSV விசுவாசிகள் பதிவேற்றம் (Bulk Import)
            </span>
            <button
              onClick={downloadSampleTemplate}
              className="text-[10px] font-mono text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Download size={11} />
              மாதிரி CSV படிவம்
            </button>
          </div>

          <label className="border-2 border-dashed border-white/10 hover:border-cyan-500/40 rounded-2xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer transition bg-white/[0.01]">
            <FileSpreadsheet size={28} className="text-slate-500" />
            <span className="text-xs text-slate-300 font-medium">உங்கள் .csv அல்லது .xlsx கோப்பை இங்கு கிளிக் செய்து தேர்ந்தெடுக்கவும்</span>
            <span className="text-[10px] text-slate-500 font-mono">UTF-8 Encoded CSV Supported</span>
            <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
          </label>

          {importStats && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 size={15} />
              <span>வெற்றி! {importStats.members} விசுவாசிகள் மற்றும் {importStats.families} குடும்பங்கள் சேர்க்கப்பட்டன. ✓</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle size={15} />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Export Section */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            <Download size={15} className="text-amber-400" />
            தரவு ஏற்றுமதி (Instant CSV Exports)
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={exportMembersCSV}
              className="p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-left transition flex items-center justify-between group cursor-pointer"
            >
              <div>
                <h5 className="text-xs font-bold text-white group-hover:text-amber-300">விசுவாசிகள் பட்டியல்</h5>
                <span className="text-[10px] text-slate-400">முழு குடும்ப மரம் & போன் எண்கள்</span>
              </div>
              <Download size={16} className="text-slate-400 group-hover:text-white" />
            </button>

            <button
              onClick={exportFinanceCSV}
              className="p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-left transition flex items-center justify-between group cursor-pointer"
            >
              <div>
                <h5 className="text-xs font-bold text-white group-hover:text-emerald-300">80G தணிக்கை லெட்ஜர்</h5>
                <span className="text-[10px] text-slate-400">காணிக்கை & தசமபாக ரசீது பதிவுகள்</span>
              </div>
              <Download size={16} className="text-slate-400 group-hover:text-white" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}