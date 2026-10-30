import React, { useState, useRef } from 'react';
import { 
  CreditCard, CheckCircle2, User, Calendar, 
  Download, QrCode, HeartHandshake, Upload, 
  Lock, ArrowRight, ShieldCheck, Printer, LogOut,
  MapPin, Navigation, ExternalLink
} from 'lucide-react';
import { soundFX } from '../../utils/audioEngine';
import MemberSponsorshipPledge from './MemberSponsorshipPledge';

export default function MemberPortalView({ userSession, onLogout }) {
  const [activeTab, setActiveTab] = useState('offering'); // 'offering' | 'profile' | 'prayer' | 'sponsorships'
  const [toast, setToast] = useState('');
  const fileInputRef = useRef(null);

  // Profile & Location States
  const [profileData, setProfileData] = useState({
    name: userSession.member?.name || 'Believer Name',
    dob: userSession.member?.dob || '1995-05-15',
    education: userSession.member?.education || 'B.Tech / IT Professional',
    phone: userSession.phone || '',
    address: userSession.family?.address || '',
    mapLink: userSession.family?.mapLink || '',
    photo: userSession.member?.photo || null
  });

  // குடும்ப உறுப்பினர்கள் பட்டியல் (லோக்கல் ஸ்டோரேஜில் இருந்து நேரடி மேப்பிங்)
  const [familyMembers] = useState(() => {
    try {
      const raw = localStorage.getItem('app_members_family_database');
      const list = raw ? JSON.parse(raw) : [];
      const myFam = list.find(f => 
        f.familyId === userSession.family?.familyId || 
        f.headMember?.phone === userSession.phone
      );
      return myFam?.members || [];
    } catch {
      return [];
    }
  });

  // Check-in Token State
  const [checkinToken, setCheckinToken] = useState(null);

  // Online Offering State
  const [offeringType, setOfferingType] = useState('தசமபாகம் (Tithe)');
  const [amount, setAmount] = useState('');
  const [downloadableReceipt, setDownloadableReceipt] = useState(null);

  // Prayer Request State
  const [prayerText, setPrayerText] = useState('');
  const [isPrivatePrayer, setIsPrivatePrayer] = useState(true);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  // 1. சுய செக்-இன் டோக்கன் உருவாக்கம்
  const handleSelfCheckin = () => {
    soundFX.playSuccessChime();
    const tokenNum = Math.floor(100 + Math.random() * 900);
    setCheckinToken({
      number: `#${tokenNum}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      hall: 'Main Sanctuary - Hall A'
    });
    showToast('ஆராதனை வருகை வெற்றிகரமாகப் பதிவானது! ✓');
  };

  // 2. காணிக்கை செலுத்தி ரசீது பெறுதல்
  const handlePayOffering = (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;

    soundFX.playSuccessChime();
    const newReceipt = {
      id: `REC-${Date.now().toString().slice(-6)}`,
      donor: profileData.name,
      amount: Number(amount),
      category: offeringType,
      date: new Date().toISOString().slice(0, 10),
      txnId: `UPI-REF-${Math.floor(10000000 + Math.random() * 90000000)}`
    };

    setDownloadableReceipt(newReceipt);
    showToast('காணிக்கை பதிவு செய்யப்பட்டது! ரசீது தயாராக உள்ளது. ✓');
    setAmount('');
  };

  // 3. போட்டோ அப்லோட்
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileData(prev => ({ ...prev, photo: reader.result }));
      soundFX.playClickPop();
      showToast('சுயவிவர புகைப்படம் மாற்றப்பட்டது! ✓');
    };
    reader.readAsDataURL(file);
  };

  // 4. ஜிபிஎஸ் இருப்பிடத்தைப் பெறுதல்
  const handleCaptureLocation = () => {
    soundFX?.playClickPop?.();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const generatedUrl = `https://maps.google.com/?q=${pos.coords.latitude},${pos.coords.longitude}`;
          setProfileData(prev => ({ ...prev, mapLink: generatedUrl }));
          soundFX?.playSuccessChime?.();
          showToast('தற்போதைய வீட்டின் ஜிபிஎஸ் இருப்பிடம் பெறப்பட்டது! ✓');
        },
        () => {
          showToast('இருப்பிடத்தை எடுக்க முடியவில்லை. மேப் லிங்கை நேரடியாக ஒட்டவும்.');
        }
      );
    } else {
      showToast('இந்த பிரவுசரில் Geolocation வசதி இல்லை.');
    }
  };

  // 5. சுயவிவர மாற்றக் கோரிக்கையை போதகர் ஒப்புதலுக்கு அனுப்புதல்
  const handleRequestProfileUpdate = () => {
    soundFX?.playSuccessChime?.();

    const newRequest = {
      requestId: `REQ-${Date.now().toString().slice(-6)}`,
      memberId: userSession.member?.memberId,
      memberName: profileData.name,
      phone: profileData.phone,
      requestedAt: new Date().toISOString().slice(0, 10),
      oldValue: `DOB: ${userSession.member?.dob || 'N/A'}, Address: ${userSession.family?.address || 'N/A'}`,
      newValue: `DOB: ${profileData.dob}, Address: ${profileData.address || 'N/A'}, GPS: ${profileData.mapLink ? 'Attached' : 'None'}`,
      updatedFields: {
        dob: profileData.dob,
        education: profileData.education,
        photo: profileData.photo,
        address: profileData.address,
        mapLink: profileData.mapLink
      }
    };

    const existing = JSON.parse(localStorage.getItem('graceos_pending_profile_updates') || '[]');
    localStorage.setItem('graceos_pending_profile_updates', JSON.stringify([newRequest, ...existing]));

    showToast('சுயவிவரம் மற்றும் இருப்பிட மாற்றக் கோரிக்கை போதகருக்கு அனுப்பப்பட்டது! ⏳');
  };

  // 6. ஜெப விண்ணப்பம் சேமிப்பு
  const handleSubmitPrayer = (e) => {
    e.preventDefault();
    if (!prayerText) return;

    soundFX.playSuccessChime();
    const existingPrayers = JSON.parse(localStorage.getItem('app_prayer_requests_db') || '[]');
    const newEntry = {
      id: Date.now(),
      seekerName: profileData.name,
      contactPhone: profileData.phone,
      request: prayerText,
      isUrgent: isPrivatePrayer,
      priority: isPrivatePrayer ? 'Pastoral Confidential' : 'General',
      date: new Date().toISOString().slice(0, 10)
    };
    localStorage.setItem('app_prayer_requests_db', JSON.stringify([newEntry, ...existingPrayers]));
    setPrayerText('');
    showToast('ஜெபக் குறிப்பு போதகரின் பார்வைக்கு அனுப்பப்பட்டது! 🕊️');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 select-none pb-16">
      
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-4 py-2.5 rounded-xl shadow-2xl backdrop-blur-md text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={16} />
          <span>{toast}</span>
        </div>
      )}

      {/* Header Bar */}
      <header className="p-4 border-b border-white/10 bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/40 overflow-hidden flex items-center justify-center text-amber-400 font-bold">
            {profileData.photo ? (
              <img src={profileData.photo} alt="User" className="w-full h-full object-cover" />
            ) : (
              <User size={20} />
            )}
          </div>
          <div>
            <h4 className="text-sm font-bold text-white leading-tight">{profileData.name}</h4>
            <span className="text-[10px] text-slate-400 font-mono">{userSession.family?.familyName || 'Grace Congregation'}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-rose-400 transition cursor-pointer"
          title="Logout"
        >
          <LogOut size={16} />
        </button>
      </header>

      {/* Main Container */}
      <main className="max-w-md mx-auto p-4 space-y-5">
        
        {/* Instant Sunday Service Check-in Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-transparent border border-amber-500/30 flex items-center justify-between gap-3 shadow-lg">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">Sunday Service Check-in</span>
            <div className="text-xs text-slate-300 mt-0.5">ஆராதனை மண்டபத்திற்குள் வந்ததும் உறுதிப்படுத்தவும்</div>
          </div>

          {checkinToken ? (
            <div className="text-right">
              <span className="text-xl font-black font-mono text-emerald-400 block">{checkinToken.number}</span>
              <span className="text-[9px] font-mono text-slate-400">{checkinToken.time}</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleSelfCheckin}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition cursor-pointer"
            >
              <CheckCircle2 size={14} />
              <span>செக்-இன்</span>
            </button>
          )}
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 p-1 bg-slate-900 border border-white/10 rounded-2xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('offering')}
            className={`py-2 rounded-xl transition cursor-pointer ${activeTab === 'offering' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400'}`}
          >
            காணிக்கை & 80G
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`py-2 rounded-xl transition cursor-pointer ${activeTab === 'profile' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400'}`}
          >
            சுயவிவரம் & இல்லம்
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('prayer')}
            className={`py-2 rounded-xl transition cursor-pointer ${activeTab === 'prayer' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400'}`}
          >
            ஜெப விண்ணப்பம்
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sponsorships')}
            className={`py-2 rounded-xl transition cursor-pointer ${activeTab === 'sponsorships' ? 'bg-rose-500 text-white shadow-md' : 'text-slate-400'}`}
          >
            Sponsorships
          </button>
        </div>

        {/* 1. Tab Content: Online Offering & 80G Download */}
        {activeTab === 'offering' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="p-5 rounded-3xl bg-slate-900/90 border border-white/10 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <CreditCard size={16} className="text-amber-400" />
                  ஆன்லைன் காணிக்கை (UPI Direct)
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  80G Exemption
                </span>
              </div>

              <form onSubmit={handlePayOffering} className="space-y-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">காணிக்கைப் பிரிவு</label>
                  <select
                    value={offeringType}
                    onChange={(e) => setOfferingType(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    <option>தசமபாகம் (Tithe)</option>
                    <option>ஸ்தோத்திர காணிக்கை (Thanksgiving)</option>
                    <option>கட்டிட நிதி (Building Fund)</option>
                    <option>மிஷன் & நற்செய்தி (Missions)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">தொகை (₹ Amount)</label>
                  <input
                    type="number"
                    required
                    placeholder="₹ 1000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2.5 text-base font-mono font-bold text-amber-300 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition cursor-pointer"
                >
                  <QrCode size={16} />
                  <span>UPI மூலம் செலுத்தி ரசீது பெறுக</span>
                </button>
              </form>
            </div>

            {/* 80G Receipt Card */}
            {downloadableReceipt && (
              <div className="p-4 rounded-2xl bg-white text-slate-900 shadow-2xl space-y-3 animate-in zoom-in-95">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700">Official 80G Tax Receipt</span>
                  <span className="text-[10px] font-mono text-slate-500">{downloadableReceipt.id}</span>
                </div>
                <div className="text-xs space-y-1 font-medium">
                  <div>பெயர்: <strong>{downloadableReceipt.donor}</strong></div>
                  <div>பிரிவு: <strong>{downloadableReceipt.category}</strong></div>
                  <div className="text-base font-black text-emerald-800 font-mono pt-1">₹ {downloadableReceipt.amount.toLocaleString()}</div>
                  <div className="text-[9px] text-slate-400 font-mono">{downloadableReceipt.txnId} • {downloadableReceipt.date}</div>
                </div>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Printer size={13} />
                  <span>ரசீதை பிரிண்ட் / PDF செய்க</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* 2. Tab Content: Self-Service Profile & Location Desk */}
        {activeTab === 'profile' && (
          <div className="p-5 rounded-3xl bg-slate-900/90 border border-white/10 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <User size={16} className="text-amber-400" />
                சுயவிவரம் & இல்ல விவரங்கள்
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {userSession.family?.familyId || 'FAM-101'}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                {profileData.photo ? (
                  <img src={profileData.photo} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <User size={28} className="text-slate-600" />
                )}
              </div>
              <div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Upload size={13} />
                  <span>புகைப்படம் மாற்று</span>
                </button>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">முழுப் பெயர்</label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">பிறந்த தேதி</label>
                  <input
                    type="date"
                    value={profileData.dob}
                    onChange={(e) => setProfileData({ ...profileData, dob: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">படிப்பு / தொழில்</label>
                  <input
                    type="text"
                    value={profileData.education}
                    onChange={(e) => setProfileData({ ...profileData, education: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* வீட்டு முகவரி மற்றும் கூகுள் மேப்ஸ் இணைப்பு */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <label className="text-[11px] text-slate-300 font-semibold flex items-center gap-1">
                  <MapPin size={12} className="text-rose-400" />
                  <span>வீட்டு முகவரி & கூகுள் மேப் இருப்பிடம்</span>
                </label>
                
                <input
                  type="text"
                  placeholder="கதவு எண், தெரு, பகுதி..."
                  value={profileData.address}
                  onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="url"
                      placeholder="https://maps.google.com/?q=..."
                      value={profileData.mapLink}
                      onChange={(e) => setProfileData({ ...profileData, mapLink: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-[11px] text-cyan-300 font-mono focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleCaptureLocation}
                    className="px-3 py-2 bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-bold flex items-center gap-1 transition shrink-0 cursor-pointer active:scale-95"
                    title="வீட்டிலிருந்து ஜிபிஎஸ்-ஐப் பெறுக"
                  >
                    <Navigation size={12} />
                    <span>Pin GPS</span>
                  </button>
                </div>

                {profileData.mapLink && (
                  <a
                    href={profileData.mapLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1 pt-0.5"
                  >
                    <ExternalLink size={10} />
                    <span>கூகுள் மேப்பில் சோதனை செய்து பார்க்க (Test Link)</span>
                  </a>
                )}
              </div>

              {/* குடும்ப உறுப்பினர்கள் பட்டியல் பார்வை */}
              <div className="space-y-2 pt-3 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-300">குடும்ப உறுப்பினர்கள் ({familyMembers.length})</span>
                  <span className="text-[9px] text-slate-500 font-mono">Church Directory</span>
                </div>

                <div className="space-y-1.5">
                  {familyMembers.length === 0 ? (
                    <div className="p-2 text-[11px] text-slate-500 font-mono text-center">
                      கூடுதல் உறுப்பினர்கள் பதிவு செய்யப்படவில்லை.
                    </div>
                  ) : (
                    familyMembers.map((m, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 flex items-center justify-between text-xs">
                        <span className="text-white font-medium">{m.name}</span>
                        <span className="text-[10px] text-cyan-400 font-mono">{m.roleInFamily}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handleRequestProfileUpdate}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs mt-3 cursor-pointer shadow-lg shadow-amber-500/20 active:scale-95 transition"
              >
                விவரங்களை போதகர் ஒப்புதலுக்கு அனுப்பு
              </button>
            </div>
          </div>
        )}

        {/* 3. Tab Content: Confidential Prayer Burdens */}
        {activeTab === 'prayer' && (
          <form onSubmit={handleSubmitPrayer} className="p-5 rounded-3xl bg-slate-900/90 border border-white/10 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <HeartHandshake size={16} className="text-rose-400" />
                ஜெபக் குறிப்பு சமர்ப்பித்தல்
              </span>
              <span className="text-[10px] text-amber-400 flex items-center gap-1">
                <Lock size={10} /> போதகரின் பார்வைக்கு மட்டும்
              </span>
            </div>

            <textarea
              required
              rows={4}
              placeholder="உங்கள் ஜெபத் தேவைகளை இங்கு பதிவிடவும்..."
              value={prayerText}
              onChange={(e) => setPrayerText(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-400 resize-none leading-relaxed"
            />

            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={isPrivatePrayer}
                onChange={(e) => setIsPrivatePrayer(e.target.checked)}
                className="w-4 h-4 accent-amber-500 rounded"
              />
              <span>இதை ரகசிய ஜெபமாக (Pastoral Confidential) வைக்கவும்</span>
            </label>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-500 to-amber-600 hover:from-rose-400 text-white font-bold text-xs shadow-lg shadow-rose-500/20 active:scale-95 transition cursor-pointer"
            >
              போதகருக்கு ஜெபக் குறிப்பை அனுப்புக
            </button>
          </form>
        )}

        {/* 4. Tab Content: Sponsorships & Love Feast */}
        {activeTab === 'sponsorships' && <MemberSponsorshipPledge userSession={userSession} />}

      </main>
    </div>
  );
}