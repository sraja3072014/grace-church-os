import React, { useState, useEffect, useMemo } from 'react';
import { 
  Award, Heart, Droplets, Plus, Search, Printer, 
  Trash2, CheckCircle2, Calendar, UserCheck, ShieldCheck 
} from 'lucide-react';
import { soundFX } from '../../utils/audioEngine';
import { getVaultData, setVaultData } from '../../utils/vaultStore';
import { logAuditEvent } from '../../utils/auditLogger';

export default function OrdinanceRegistryDesk({ session }) {
  const [activeTab, setActiveTab] = useState('BAPTISM'); // 'BAPTISM' | 'MATRIMONY'
  const [toast, setToast] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [printableCertificate, setPrintableCertificate] = useState(null);

  const [baptisms, setBaptisms] = useState([]);
  const [marriages, setMarriages] = useState([]);

  // படிவ நிலைகள்
  const [baptismForm, setBaptismForm] = useState({
    candidateName: '',
    dob: '',
    parentName: '',
    baptismDate: new Date().toISOString().slice(0, 10),
    ministerName: 'Rev. Stephen Victor',
    campus: session?.activeCampus || 'Headquarters',
    witnessName: ''
  });

  const [matrimonyForm, setMatrimonyForm] = useState({
    groomName: '',
    brideName: '',
    marriageDate: new Date().toISOString().slice(0, 10),
    ministerName: 'Rev. Stephen Victor',
    venue: 'Grace Central Cathedral Main Sanctuary',
    groomParents: '',
    brideParents: '',
    witnessOne: '',
    witnessTwo: ''
  });

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  // 🌟 லோக்கல் ஹார்ட் டிஸ்க் வால்ட்டிலிருந்து தரவுகளை ஏற்றுதல் (/database/ordinances.json)
  useEffect(() => {
    async function loadOrdinances() {
      const stored = await getVaultData('ordinances', { baptisms: [], marriages: [] });
      setBaptisms(stored.baptisms || [
        {
          id: 'BAP-2026-01',
          regNo: 'GCC/BAP/2026/042',
          candidateName: 'Joshua Stephen',
          dob: '2008-04-12',
          parentName: 'Stephen Victor',
          baptismDate: '2026-08-15',
          ministerName: 'Rev. Stephen Victor',
          campus: 'Headquarters',
          witnessName: 'Elder Paul Raj'
        }
      ]);
      setMarriages(stored.marriages || [
        {
          id: 'MAT-2026-01',
          regNo: 'GCC/MAT/2026/018',
          groomName: 'Bro. David Paul',
          brideName: 'Sis. Rachel Grace',
          marriageDate: '2026-05-20',
          ministerName: 'Rev. Stephen Victor',
          venue: 'Main Sanctuary',
          groomParents: 'Mr. & Mrs. Paul Raj',
          brideParents: 'Mr. & Mrs. Samuel',
          witnessOne: 'Bro. Joshua Raj',
          witnessTwo: 'Elder Victor'
        }
      ]);
    }
    loadOrdinances();
  }, []);

  const syncOrdinances = async (newBaptisms, newMarriages) => {
    setBaptisms(newBaptisms);
    setMarriages(newMarriages);
    await setVaultData('ordinances', { baptisms: newBaptisms, marriages: newMarriages }, true);
  };

  // புதிய ஞானஸ்நானப் பதிவு
  const handleSaveBaptism = async (e) => {
    e.preventDefault();
    if (!baptismForm.candidateName) return;
    soundFX?.playSuccessChime?.();

    const newRecord = {
      id: `BAP-${Date.now().toString().slice(-4)}`,
      regNo: `GCC/BAP/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`,
      ...baptismForm
    };

    const updated = [newRecord, ...baptisms];
    await syncOrdinances(updated, marriages);
    await logAuditEvent('BAPTISM_REGISTERED', `${newRecord.candidateName} - ஞானஸ்நானப் பதிவு செய்யப்பட்டது.`, session?.username);

    setBaptismForm({
      candidateName: '',
      dob: '',
      parentName: '',
      baptismDate: new Date().toISOString().slice(0, 10),
      ministerName: 'Rev. Stephen Victor',
      campus: session?.activeCampus || 'Headquarters',
      witnessName: ''
    });
    showToast('ஞானஸ்நானப் பதிவு லோக்கல் டிஸ்கில் சேமிக்கப்பட்டது! ✓');
  };

  // புதிய திருமணப் பதிவு
  const handleSaveMatrimony = async (e) => {
    e.preventDefault();
    if (!matrimonyForm.groomName || !matrimonyForm.brideName) return;
    soundFX?.playSuccessChime?.();

    const newRecord = {
      id: `MAT-${Date.now().toString().slice(-4)}`,
      regNo: `GCC/MAT/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`,
      ...matrimonyForm
    };

    const updated = [newRecord, ...marriages];
    await syncOrdinances(baptisms, updated);
    await logAuditEvent('MATRIMONY_REGISTERED', `${newRecord.groomName} & ${newRecord.brideName} - திருமணப் பதிவு செய்யப்பட்டது.`, session?.username);

    setMatrimonyForm({
      groomName: '',
      brideName: '',
      marriageDate: new Date().toISOString().slice(0, 10),
      ministerName: 'Rev. Stephen Victor',
      venue: 'Grace Central Cathedral Main Sanctuary',
      groomParents: '',
      brideParents: '',
      witnessOne: '',
      witnessTwo: ''
    });
    showToast('திருமணப் பதிவு லோக்கல் டிஸ்கில் சேமிக்கப்பட்டது! ✓');
  };

  const filteredBaptisms = useMemo(() => {
    return baptisms.filter(b => 
      b.candidateName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.regNo?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [baptisms, searchQuery]);

  const filteredMarriages = useMemo(() => {
    return marriages.filter(m => 
      m.groomName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.brideName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.regNo?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [marriages, searchQuery]);

  return (
    <div className="space-y-6 max-w-5xl select-none text-slate-200 animate-in fade-in pb-12">
      
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-4 py-2.5 rounded-xl shadow-2xl backdrop-blur-md text-xs font-bold flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{toast}</span>
        </div>
      )}

      {/* Header & Sub-Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4 print:hidden">
        <div>
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <Award className="text-cyan-400" size={24} />
            <span>Holy Baptism & Matrimony Sacred Registry Desk</span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/30">
              Sacred Ordinances
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            சபையின் ஞானஸ்நானம் மற்றும் திருமணப் பதிவுகள், மற்றும் சான்றிதழ் அச்சிடும் பலகை.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-2xl border border-white/10 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('BAPTISM')}
            className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'BAPTISM' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Droplets size={14} />
            <span>ஞானஸ்நானப் பதிவேடு ({baptisms.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('MATRIMONY')}
            className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'MATRIMONY' ? 'bg-rose-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Heart size={14} />
            <span>திருமணப் பதிவேடு ({marriages.length})</span>
          </button>
        </div>
      </div>

      {/* 🌟 1. BAPTISM REGISTRY */}
      {activeTab === 'BAPTISM' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:hidden">
          
          <div className="p-5 rounded-3xl bg-slate-900 border border-white/10 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Plus size={15} className="text-cyan-400" />
              <span>புதிய ஞானஸ்நானப் பதிவு</span>
            </h4>

            <form onSubmit={handleSaveBaptism} className="space-y-3">
              <div>
                <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">ஞானஸ்நானம் பெற்றவர் பெயர்</label>
                <input
                  type="text"
                  value={baptismForm.candidateName}
                  onChange={(e) => setBaptismForm({ ...baptismForm, candidateName: e.target.value })}
                  placeholder="முழு பெயர்..."
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">பிறந்த தேதி</label>
                  <input
                    type="date"
                    value={baptismForm.dob}
                    onChange={(e) => setBaptismForm({ ...baptismForm, dob: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-2 py-2 text-xs text-white focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">ஞானஸ்நான நாள்</label>
                  <input
                    type="date"
                    value={baptismForm.baptismDate}
                    onChange={(e) => setBaptismForm({ ...baptismForm, baptismDate: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-2 py-2 text-xs text-cyan-300 font-bold focus:outline-none font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">பெற்றோர் / பாதுகாவலர் பெயர்</label>
                <input
                  type="text"
                  value={baptismForm.parentName}
                  onChange={(e) => setBaptismForm({ ...baptismForm, parentName: e.target.value })}
                  placeholder="தந்தை / தாய் பெயர்..."
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">ஞானஸ்நானம் கொடுத்த போதகர்</label>
                <input
                  type="text"
                  value={baptismForm.ministerName}
                  onChange={(e) => setBaptismForm({ ...baptismForm, ministerName: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer shadow-lg shadow-cyan-500/20"
              >
                பதிவேட்டில் பதிவு செய்
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="relative flex-1 max-w-xs">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="பெயர் அல்லது பதிவு எண் தேடுக..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none"
                />
              </div>
              <span className="text-xs font-mono text-slate-400">{filteredBaptisms.length} நபர்கள்</span>
            </div>

            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {filteredBaptisms.map((rec) => (
                <div
                  key={rec.id}
                  className="p-4 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-between gap-3 hover:border-cyan-500/30 transition"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h5 className="text-xs font-bold text-white">{rec.candidateName}</h5>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-cyan-300">
                        {rec.regNo}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                      நாள்: {rec.baptismDate} • போதகர்: {rec.ministerName}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setPrintableCertificate({ type: 'BAPTISM', data: rec })}
                    className="px-3 py-1.5 bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition"
                  >
                    <Printer size={12} />
                    <span>சான்றிதழ்</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* 🌟 2. MATRIMONY REGISTRY */}
      {activeTab === 'MATRIMONY' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:hidden">
          
          <div className="p-5 rounded-3xl bg-slate-900 border border-white/10 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Plus size={15} className="text-rose-400" />
              <span>புதிய திருமணப் பதிவு</span>
            </h4>

            <form onSubmit={handleSaveMatrimony} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">மணமகன் (Groom)</label>
                  <input
                    type="text"
                    value={matrimonyForm.groomName}
                    onChange={(e) => setMatrimonyForm({ ...matrimonyForm, groomName: e.target.value })}
                    placeholder="மணமகன் பெயர்..."
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">மணமகள் (Bride)</label>
                  <input
                    type="text"
                    value={matrimonyForm.brideName}
                    onChange={(e) => setMatrimonyForm({ ...matrimonyForm, brideName: e.target.value })}
                    placeholder="மணமகள் பெயர்..."
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">திருமண நாள்</label>
                <input
                  type="date"
                  value={matrimonyForm.marriageDate}
                  onChange={(e) => setMatrimonyForm({ ...matrimonyForm, marriageDate: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-rose-300 font-bold focus:outline-none font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block uppercase font-mono mb-1">நடத்திய போதகர்</label>
                <input
                  type="text"
                  value={matrimonyForm.ministerName}
                  onChange={(e) => setMatrimonyForm({ ...matrimonyForm, ministerName: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer shadow-lg shadow-rose-500/20"
              >
                திருமணத்தை ஆவணப்படுத்து
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 space-y-3">
            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {filteredMarriages.map((rec) => (
                <div
                  key={rec.id}
                  className="p-4 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-between gap-3 hover:border-rose-500/30 transition"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h5 className="text-xs font-bold text-white">{rec.groomName} & {rec.brideName}</h5>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-rose-300">
                        {rec.regNo}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                      நாள்: {rec.marriageDate} • போதகர்: {rec.ministerName}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setPrintableCertificate({ type: 'MATRIMONY', data: rec })}
                    className="px-3 py-1.5 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition"
                  >
                    <Printer size={12} />
                    <span>சான்றிதழ்</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* 🌟 A4 PRINTABLE CERTIFICATE MODAL */}
      {printableCertificate && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white text-slate-950 p-8 rounded-3xl shadow-2xl space-y-6 border-8 border-slate-100 print:m-0 print:border-none">
            
            <div className="text-center space-y-1 border-b-2 border-slate-800 pb-4">
              <span className="text-xs font-mono font-bold tracking-widest text-cyan-800 uppercase">
                Grace Central Cathedral Church
              </span>
              <h2 className="text-2xl font-black uppercase tracking-tight">
                {printableCertificate.type === 'BAPTISM' ? 'Certificate of Holy Baptism' : 'Certificate of Holy Matrimony'}
              </h2>
              <span className="text-[11px] font-mono text-slate-500 block">
                Reg No: {printableCertificate.data.regNo}
              </span>
            </div>

            {printableCertificate.type === 'BAPTISM' ? (
              <div className="space-y-4 text-xs font-serif leading-relaxed text-center py-4">
                <p>
                  This is to certify that <strong className="text-base font-sans underline">{printableCertificate.data.candidateName}</strong>, 
                  son/daughter of <strong className="font-sans">{printableCertificate.data.parentName || 'Parents'}</strong>,
                </p>
                <p>
                  was baptized in the Name of the <strong>Father, the Son, and the Holy Spirit</strong> on{' '}
                  <strong className="font-sans">{printableCertificate.data.baptismDate}</strong> at Grace Central Cathedral.
                </p>
              </div>
            ) : (
              <div className="space-y-4 text-xs font-serif leading-relaxed text-center py-4">
                <p>
                  This is to solemnly certify that <strong className="text-base font-sans underline">{printableCertificate.data.groomName}</strong> and{' '}
                  <strong className="text-base font-sans underline">{printableCertificate.data.brideName}</strong>
                </p>
                <p>
                  were united in <strong>Holy Matrimony</strong> according to the Ordinance of God and the Church on{' '}
                  <strong className="font-sans">{printableCertificate.data.marriageDate}</strong>.
                </p>
              </div>
            )}

            <div className="pt-10 grid grid-cols-2 gap-8 text-center text-xs font-mono border-t border-slate-300">
              <div className="border-t border-dashed border-slate-400 pt-2">
                <span>Ministering Pastor</span>
              </div>
              <div className="border-t border-dashed border-slate-400 pt-2">
                <span>Church Seal & Secretary</span>
              </div>
            </div>

            <div className="flex gap-2 pt-4 print:hidden">
              <button
                type="button"
                onClick={() => setPrintableCertificate(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-lg"
              >
                <Printer size={14} />
                <span>Print Official Certificate</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}