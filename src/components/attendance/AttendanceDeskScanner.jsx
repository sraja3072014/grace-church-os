import React, { useState, useEffect, useRef } from 'react';
import { 
  QrCode, CheckCircle2, UserCheck, AlertCircle, 
  Search, Users, Sparkles, Volume2, Shield, Camera 
} from 'lucide-react';
import { soundFX } from '../../utils/audioEngine';
import CameraQRScannerModal from './CameraQRScannerModal';

export default function AttendanceDeskScanner() {
  const [manualInput, setManualInput] = useState('');
  const [recentScans, setRecentScans] = useState([]);
  const [lastScannedMember, setLastScannedMember] = useState(null);
  const [todayStats, setTodayStats] = useState({ total: 0, men: 0, women: 0, youth: 0 });
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const inputRef = useRef(null);

  const todayDate = new Date().toISOString().slice(0, 10);

  // லோக்கல் ஸ்டோரேஜில் இருந்து விசுவாசிகள் பட்டியல்
  const families = JSON.parse(localStorage.getItem('app_members_family_database') || '[]');

  // ஸ்கேனரை எப்போதும் ஆக்டிவாக வைத்திருக்க தானியங்கி ஃபோகஸ்
  useEffect(() => {
    inputRef.current?.focus();
  }, [recentScans]);

  const processScan = (decodedText) => {
    const query = decodedText.trim();
    if (!query) return;

    // Member ID, Token அல்லது Phone மூலம் விசுவாசியைத் தேடுதல்
    let found = null;
    let foundFamily = null;

    for (const fam of families) {
      if (
        fam.headMember?.memberId?.toLowerCase() === query.toLowerCase() ||
        fam.headMember?.phone?.replace(/[^0-9]/g, '').endsWith(query.replace(/[^0-9]/g, ''))
      ) {
        found = fam.headMember;
        foundFamily = fam;
        break;
      }

      const match = (fam.members || []).find(
        m => m.memberId?.toLowerCase() === query.toLowerCase() ||
             m.phone?.replace(/[^0-9]/g, '').endsWith(query.replace(/[^0-9]/g, ''))
      );

      if (match) {
        found = match;
        foundFamily = fam;
        break;
      }
    }

    // பொருந்தும் உறுப்பினர் இல்லாதபோது டெமோ ஸ்கேன்
    if (!found) {
      found = {
        name: `Believer (${query})`,
        memberId: query.startsWith('MBR') ? query : `MBR-${Math.floor(1000 + Math.random() * 9000)}`,
        roleInFamily: 'Member'
      };
      foundFamily = { familyName: 'Visiting Congregation', area: 'General' };
    }

    // வருகைப் பதிவு செய்தல்
    const scanRecord = {
      id: Date.now(),
      memberId: found.memberId,
      name: found.name,
      family: foundFamily.familyName,
      area: foundFamily.area || 'Main City',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      status: 'Present'
    };

    soundFX?.playSuccessChime?.();
    setLastScannedMember(scanRecord);
    setRecentScans(prev => [scanRecord, ...prev.slice(0, 19)]); // கடைசி 20 பதிவுகள்
    setTodayStats(prev => ({
      ...prev,
      total: prev.total + 1
    }));

    // வருகை லெட்ஜரில் லோக்கல் சேமிப்பு
    const attendanceDb = JSON.parse(localStorage.getItem('graceos_attendance_ledger') || '[]');
    localStorage.setItem('graceos_attendance_ledger', JSON.stringify([scanRecord, ...attendanceDb]));

    setManualInput('');
  };

  const handleScanSubmit = (e) => {
    e.preventDefault();
    processScan(manualInput);
  };

  const handleCameraScan = (decodedText) => {
    processScan(decodedText);
    setIsCameraOpen(false);
  };

  return (
    <div className="space-y-6 max-w-5xl select-none text-slate-200 animate-in fade-in pb-12">
      
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <span>Sunday Service Rapid Attendance Desk</span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
              Auto-Scanner Ready
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            USB பார்கோடு ஸ்கேனர், QR டோக்கன் அல்லது Member ID மூலம் உடனடி ஆராதனை வருகைப் பதிவு.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-right">
            <span className="text-[10px] text-slate-400 block font-mono">இன்றைய வருகை</span>
            <span className="text-base font-black text-emerald-400 font-mono">{todayStats.total} பேர்</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* இடதுபுறம்: ஸ்கேனர் இன்புட் & கடைசியாக ஸ்கேன் செய்யப்பட்ட அட்டை */}
        <div className="lg:col-span-1 space-y-4">
          
          {/* Scanner Input Box */}
          <form onSubmit={handleScanSubmit} className="p-4 rounded-2xl bg-slate-900 border border-white/10 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-white flex items-center gap-1.5">
                <QrCode size={15} className="text-amber-400" />
                <span>QR / Barcode Check-in</span>
              </label>
              <button
                type="button"
                onClick={() => setIsCameraOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Camera size={14} />
                <span>Open Webcam</span>
              </button>
            </div>

            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="ID அட்டை அல்லது டோக்கனை ஸ்கேன் செய்க..."
                className="w-full bg-slate-950 border border-amber-500/40 rounded-xl px-3 py-2.5 text-xs text-amber-300 font-mono focus:outline-none focus:border-amber-400 shadow-inner"
              />
            </div>
            <p className="text-[10px] text-slate-500">
              💡 பார்கோடு ஸ்கேனர் தானாகவே என்டர் அடித்து பதிவை உறுதி செய்யும்.
            </p>
          </form>

          {/* Last Scanned Member Spot Card */}
          {lastScannedMember && (
            <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-500/20 via-slate-900 to-slate-900 border border-emerald-500/40 shadow-2xl space-y-3 animate-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 size={13} /> வருகை பதிவானது
                </span>
                <span className="text-[10px] font-mono text-slate-400">{lastScannedMember.time}</span>
              </div>

              <div>
                <h4 className="text-base font-black text-white">{lastScannedMember.name}</h4>
                <p className="text-xs text-slate-300 font-mono mt-0.5">{lastScannedMember.memberId}</p>
                <p className="text-[11px] text-amber-300/80 mt-1">{lastScannedMember.family} • {lastScannedMember.area}</p>
              </div>
            </div>
          )}

        </div>

        {/* வலதுபுறம்: இன்றைய நேரலை வருகைப் பட்டியல் (Live Check-in Stream) */}
        <div className="lg:col-span-2 p-5 rounded-3xl bg-slate-900/90 border border-white/10 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <h5 className="text-xs font-bold text-white flex items-center gap-2">
                <Users size={15} className="text-cyan-400" />
                <span>நேரலை வருகைப் பட்டியல் (Live Check-ins)</span>
              </h5>
              <span className="text-[10px] font-mono text-slate-400">கடைசி 20 பதிவுகள்</span>
            </div>

            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {recentScans.length === 0 ? (
                <div className="text-center py-12 text-slate-500 space-y-1">
                  <QrCode size={30} className="mx-auto opacity-30" />
                  <p className="text-xs">இன்னும் வருகைப் பதிவுகள் தொடங்கவில்லை.</p>
                </div>
              ) : (
                recentScans.map((scan) => (
                  <div 
                    key={scan.id} 
                    className="p-3 rounded-2xl bg-slate-950/80 border border-white/5 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0 font-black text-xs">
                        ✓
                      </div>
                      <div className="overflow-hidden">
                        <h6 className="text-xs font-bold text-white truncate">{scan.name}</h6>
                        <span className="text-[10px] text-slate-400 font-mono block truncate">
                          {scan.memberId} • {scan.family}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-mono font-bold text-emerald-400 block">{scan.time}</span>
                      <span className="text-[9px] text-slate-500">{scan.area}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

      <CameraQRScannerModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onScanSuccess={handleCameraScan}
      />

    </div>
  );
}