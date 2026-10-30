import React, { useRef } from 'react';
import { X, Printer, QrCode, ShieldCheck, Church, Phone, MapPin } from 'lucide-react';
import { soundFX } from '../../utils/audioEngine';

export default function MemberIdCardModal({ member, family, onClose }) {
  if (!member) return null;

  const cardRef = useRef(null);
  const churchData = JSON.parse(localStorage.getItem('graceos_main_church') || '{}');
  const churchName = churchData.churchName || 'Grace Cathedral Church';
  const campus = member.campus || churchData.activeCampus || 'Main Sanctuary';

  // QR Code data format: Fast parsing JSON string
  const qrPayload = JSON.stringify({
    id: member.memberId || member.uniqueId,
    name: member.name,
    fam: family?.familyId || 'FAM-101',
    ph: member.phone || family?.headMember?.phone || ''
  });

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrPayload)}`;

  const handlePrintCard = () => {
    soundFX.playClickPop();
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in select-none">
      <div className="w-full max-w-lg p-6 rounded-3xl bg-slate-900 border border-white/20 shadow-2xl space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3 print:hidden">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              <QrCode size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Smart PVC Member ID Card</h3>
              <p className="text-[10px] text-slate-400">Standard CR80 Credit/PVC Dimensions (85.6mm × 53.98mm)</p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* 🌟 CR80 PVC Card Canvas (Optimized for Screen & Physical Printer) */}
        <div className="flex justify-center p-2">
          <div 
            ref={cardRef}
            style={{ width: '85.6mm', height: '53.98mm' }}
            className="rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 border border-amber-500/40 p-3.5 flex flex-col justify-between shadow-2xl relative overflow-hidden text-slate-100 print:m-0 print:border-slate-800"
          >
            {/* Hologram/Watermark Glow */}
            <div className="absolute -right-8 -bottom-8 w-28 h-28 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />

            {/* Card Header */}
            <div className="flex items-center justify-between border-b border-white/15 pb-1.5">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0">
                  <Church size={13} />
                </div>
                <div>
                  <h4 className="text-[11px] font-black uppercase tracking-wider text-amber-400 leading-tight">
                    {churchName}
                  </h4>
                  <span className="text-[7.5px] text-slate-300 font-mono tracking-tight block">
                    {campus}
                  </span>
                </div>
              </div>
              <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                ACTIVE
              </span>
            </div>

            {/* Card Body: Member Info + Dynamic QR */}
            <div className="flex items-center justify-between gap-2 py-1">
              <div className="space-y-1 overflow-hidden">
                <div>
                  <span className="text-[7px] uppercase font-bold text-slate-400 block">Believer Full Name</span>
                  <h5 className="text-[13px] font-black text-white truncate leading-tight">
                    {member.name}
                  </h5>
                </div>

                <div className="flex items-center gap-2 text-[8px] font-mono">
                  <span className="text-cyan-300 font-bold">{member.memberId || 'MBR-0101'}</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-amber-300 font-bold">{family?.familyId || 'FAM-101'}</span>
                </div>

                <div className="text-[8px] text-slate-300 flex items-center gap-1 truncate pt-0.5">
                  <Phone size={9} className="text-emerald-400 shrink-0" />
                  <span>{member.phone || family?.headMember?.phone || 'No phone'}</span>
                </div>
              </div>

              {/* Instant Attendance QR */}
              <div className="bg-white p-1 rounded-xl shadow-md shrink-0 border border-slate-300 flex flex-col items-center">
                <img 
                  src={qrUrl} 
                  alt="Member Check-in QR"
                  className="w-14 h-14 object-contain"
                />
                <span className="text-[6.5px] text-slate-800 font-black tracking-widest mt-0.5 uppercase">
                  FAST SCAN
                </span>
              </div>
            </div>

            {/* Card Footer */}
            <div className="flex items-center justify-between border-t border-white/10 pt-1 text-[7px] text-slate-400 font-mono">
              <span>GraceOS Digital Trust</span>
              <span className="flex items-center gap-1 text-emerald-400">
                <ShieldCheck size={9} /> Verified Congregation
              </span>
            </div>
          </div>
        </div>

        {/* Modal Action Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10 print:hidden">
          <span className="text-[11px] text-slate-400">
            Print ready for Thermal PVC or Glossy Badge paper.
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-slate-400 hover:text-white cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handlePrintCard}
              className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 active:scale-95 transition cursor-pointer"
            >
              <Printer size={15} />
              <span>Print PVC Badge</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}