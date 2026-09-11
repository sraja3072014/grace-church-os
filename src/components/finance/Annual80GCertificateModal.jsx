import React, { useState, useMemo } from 'react';
import { 
  FileCheck2, Printer, Download, X, 
  Building2, Calendar, ShieldCheck, Search 
} from 'lucide-react';
import { soundFX } from '../../utils/audioEngine';

export default function Annual80GCertificateModal({ isOpen, onClose }) {
  const [financialYear, setFinancialYear] = useState('2026-2027');
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [searchMember, setSearchMember] = useState('');

  // சபை விவரங்கள்
  const church = useMemo(() => {
    try {
      const raw = localStorage.getItem('graceos_main_church');
      return raw ? JSON.parse(raw) : {
        churchName: 'Grace City Church',
        address: 'No. 12, Cathedral Road, Chennai - 600086',
        trustRegNo: 'TR/CH/2012/8892',
        panNumber: 'AAATG1234F',
        it80GOrder: 'CIT(E)/CHN/80G/2021-22/A/1042',
        authorizedSignatory: 'Senior Pastor / Chief Trustee'
      };
    } catch {
      return {};
    }
  }, []);

  // விசுவாசிகள் பட்டியல்
  const members = useMemo(() => {
    try {
      const raw = localStorage.getItem('app_members_family_database');
      const families = raw ? JSON.parse(raw) : [];
      const list = [];
      families.forEach(f => {
        if (f.headMember) {
          list.push({ ...f.headMember, familyName: f.familyName, area: f.area });
        }
        (f.members || []).forEach(m => {
          list.push({ ...m, familyName: f.familyName, area: f.area });
        });
      });
      return list.length > 0 ? list : [
        { memberId: 'MBR-1001', name: 'Bro. David Paul', phone: '+91 98401 11223', panNumber: 'ABCDE1234F', address: 'Plot 42, Anna Nagar West, Chennai' },
        { memberId: 'MBR-1002', name: 'Dr. Sarah Jenkins', phone: '+91 98401 55667', panNumber: 'FGHIJ5678K', address: 'No. 8, Church Street, Tambaram' }
      ];
    } catch {
      return [];
    }
  }, []);

  // நிதி லெட்ஜர் தரவு
  const ledger = useMemo(() => {
    try {
      const raw = localStorage.getItem('app_finance_transactions_ledger');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }, []);

  // தேர்ந்தெடுக்கப்பட்ட விசுவாசி
  const activeDonor = useMemo(() => {
    return members.find(m => m.memberId === selectedMemberId) || members[0];
  }, [members, selectedMemberId]);

  // விசுவாசியின் ஆண்டு மொத்த நன்கொடைகள்
  const donorContributions = useMemo(() => {
    if (!activeDonor) return [];
    const matched = ledger.filter(item => 
      item.member?.toLowerCase() === activeDonor.name?.toLowerCase() ||
      item.contactPhone === activeDonor.phone
    );

    // மாதிரித் தரவு (லைவ் டேட்டா இல்லாத போது)
    if (matched.length === 0) {
      return [
        { date: '2026-04-12', category: 'தசமபாகம் (Tithe)', receiptNo: 'REC-2604-012', amount: 15000 },
        { date: '2026-06-07', category: 'கட்டிட நிதி (Building Fund)', receiptNo: 'REC-2606-045', amount: 25000 },
        { date: '2026-08-15', category: 'நற்செய்தி பணி (Missions)', receiptNo: 'REC-2608-089', amount: 10000 },
        { date: '2026-11-22', category: 'தசமபாகம் (Tithe)', receiptNo: 'REC-2611-132', amount: 15000 }
      ];
    }
    return matched;
  }, [ledger, activeDonor]);

  const totalAmount = donorContributions.reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const handlePrint = () => {
    soundFX?.playClickPop?.();
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none overflow-y-auto">
      <div className="w-full max-w-4xl bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl space-y-5 my-8">
        
        {/* Modal Controls Bar (பிரிண்ட் ஆகாது) */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4 print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <FileCheck2 size={22} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Annual 80G Tax Exemption Certificate</h3>
              <p className="text-[11px] text-slate-400">Section 80G of the Income Tax Act, 1961</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* விசுவாசியைத் தேர்ந்தெடுக்கும் டிராப்டவுன் */}
            <select
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              className="bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-amber-300 font-bold focus:outline-none cursor-pointer"
            >
              {members.map(m => (
                <option key={m.memberId} value={m.memberId}>
                  {m.name} ({m.memberId})
                </option>
              ))}
            </select>

            <select
              value={financialYear}
              onChange={(e) => setFinancialYear(e.target.value)}
              className="bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none cursor-pointer"
            >
              <option value="2026-2027">FY 2026-2027 (AY 2027-28)</option>
              <option value="2025-2026">FY 2025-2026 (AY 2026-27)</option>
            </select>

            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-lg active:scale-95"
            >
              <Printer size={14} />
              <span>A4 Print / Save PDF</span>
            </button>

            <button 
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* 🌟 Official A4 Printable Certificate Preview Sheet */}
        <div className="bg-white text-slate-900 p-8 sm:p-12 rounded-2xl shadow-xl font-serif max-w-[794px] mx-auto border border-slate-200 print:border-none print:shadow-none print:p-0 print:m-0">
          
          {/* Header & Trust Info */}
          <div className="text-center border-b-2 border-slate-900 pb-4 space-y-1">
            <h1 className="text-2xl font-black uppercase tracking-wider text-slate-950">
              {church.churchName || 'GRACE CITY CHURCH'}
            </h1>
            <p className="text-xs text-slate-600 font-sans">
              {church.address || 'No. 12, Cathedral Road, Chennai - 600086'}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-[10.5px] font-mono text-slate-700 pt-1 font-semibold">
              <span>PAN: <strong>{church.panNumber || 'AAATG1234F'}</strong></span>
              <span>•</span>
              <span>Trust Reg: <strong>{church.trustRegNo || 'TR/CH/2012/8892'}</strong></span>
              <span>•</span>
              <span>80G Reg: <strong>{church.it80GOrder || 'CIT(E)/CHN/80G/2021-22/A/1042'}</strong></span>
            </div>
          </div>

          {/* Certificate Title */}
          <div className="text-center py-5">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-800 underline decoration-slate-400 underline-offset-4">
              Consolidated Certificate of Donation for Tax Exemption
            </h2>
            <span className="text-[11px] font-sans text-slate-500 font-medium block mt-1">
              (Under Section 80G(5)(vi) of the Income Tax Act, 1961)
            </span>
          </div>

          {/* Donor & Year Meta */}
          <div className="grid grid-cols-2 gap-4 text-xs font-sans pb-4 border-b border-slate-200">
            <div className="space-y-1">
              <div>Donor Name: <strong className="text-slate-950 uppercase">{activeDonor?.name}</strong></div>
              <div>Donor Member ID: <span className="font-mono">{activeDonor?.memberId}</span></div>
              <div>PAN Number: <strong className="font-mono">{activeDonor?.panNumber || 'NOT PROVIDED'}</strong></div>
              <div className="text-slate-600 text-[11px]">{activeDonor?.address || activeDonor?.area || 'Tamil Nadu, India'}</div>
            </div>

            <div className="text-right space-y-1">
              <div>Certificate No: <strong className="font-mono">80G-FY26-{activeDonor?.memberId?.replace(/[^0-9]/g, '') || '101'}</strong></div>
              <div>Financial Year: <strong>{financialYear}</strong></div>
              <div>Assessment Year: <strong>2027-2028</strong></div>
              <div>Date of Issue: <span className="font-mono">{new Date().toISOString().slice(0, 10)}</span></div>
            </div>
          </div>

          {/* Donation Records Ledger Table */}
          <div className="py-4">
            <table className="w-full text-left text-xs font-sans border border-slate-300">
              <thead className="bg-slate-100 text-slate-700 border-b border-slate-300 font-bold">
                <tr>
                  <th className="p-2 border-r border-slate-300">Date</th>
                  <th className="p-2 border-r border-slate-300">Receipt Ref</th>
                  <th className="p-2 border-r border-slate-300">Donation Category</th>
                  <th className="p-2 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {donorContributions.map((row, idx) => (
                  <tr key={idx}>
                    <td className="p-2 font-mono border-r border-slate-300">{row.date}</td>
                    <td className="p-2 font-mono border-r border-slate-300">{row.receiptNo || `REC-0${idx + 1}`}</td>
                    <td className="p-2 border-r border-slate-300">{row.category}</td>
                    <td className="p-2 text-right font-mono font-semibold">₹ {Number(row.amount).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t-2 border-slate-900 bg-slate-50 font-bold">
                <tr>
                  <td colSpan={3} className="p-2 text-right uppercase tracking-wider text-slate-800">
                    Total Donated Amount in {financialYear}:
                  </td>
                  <td className="p-2 text-right font-mono text-sm text-slate-950">
                    ₹ {totalAmount.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Statutory Declaration */}
          <p className="text-[10px] font-sans text-slate-600 leading-relaxed italic pt-2">
            This is to certify that the above mentioned sum of <strong>₹ {totalAmount.toLocaleString()}</strong> has been received by the Trust/Society as voluntary contributions towards religious and charitable objectives. This donation is eligible for deduction under Section 80G of the Income Tax Act, 1961.
          </p>

          {/* Signatures & Seal Section */}
          <div className="flex items-end justify-between pt-12 text-center text-xs font-sans">
            <div className="space-y-1">
              <div className="w-24 h-24 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center text-[10px] text-slate-400 mx-auto uppercase">
                Official Seal
              </div>
              <div className="text-[10px] text-slate-500 font-semibold">Trust Seal</div>
            </div>

            <div className="space-y-1">
              <div className="h-10 flex items-end justify-center font-serif italic text-base text-slate-800">
                Pastor. J. David
              </div>
              <div className="border-t border-slate-400 pt-1 font-bold text-slate-900">
                Authorized Signatory
              </div>
              <div className="text-[10px] text-slate-500">{church.authorizedSignatory || 'Senior Pastor / Chief Trustee'}</div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}