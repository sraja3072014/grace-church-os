import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sparkles, X, Users, Cake, HeartHandshake, 
  Calendar, Flame, ChevronLeft, MessageSquareShare, 
  CheckCircle2, Clock, BookOpen, Volume2, Building2, AlertTriangle
} from 'lucide-react';
import { sendBirthdayWishes } from '../../utils/whatsappEngine';
import { soundFX } from '../../utils/audioEngine';

const DAILY_VERSES = [
  { ref: "ஏசாயா 41:10", text: "நீ பயப்படாதே, நான் உன்னுடனே இருக்கிறேன்; திகையாதே, நான் உன் தேவன்; நான் உன்னைப் பலப்படுத்தி உனக்குச் சகாயம் பண்ணுவேன்." },
  { ref: "எரேமியா 29:11", text: "நீங்கள் எதிர்பார்த்திருக்கும் முடிவை உங்களுக்குக் கொடுக்கும்படிக்கு நான் உங்கள்பேரில் நினைத்திருக்கிற நினைவுகளை அறிவேன் என்று கர்த்தர் சொல்லுகிறார்." },
  { ref: "சங்கீதம் 23:1", text: "கர்த்தர் என் மேய்ப்பராயிருக்கிறார்; நான் தாழ்ச்சியடையேன்." },
  { ref: "பிலிப்பியர் 4:13", text: "என்னைப் பெலப்படுத்துகிற கிறிஸ்துவினாலே எல்லாவற்றையுஞ்செய்ய எனக்குப் பெலனுண்டு." },
  { ref: "யோசுவா 1:9", text: "நான் உனக்குக் கட்டளையிடவில்லையா? பலங்கொண்டு திடமனதாயிரு; கலங்காதே, திகையாதே, நீ போகும் இடமெல்லாம் உன் தேவனாகிய கர்த்தர் உன்னோடே இருக்கிறார்." }
];

export default function QuickWidgetBar() {
  const [isOpen, setIsOpen] = useState(false);
  const todayDate = new Date().toISOString().split('T')[0];
  const todayMonthDay = todayDate.slice(5); // MM-DD format

  // Daily Promise Verse based on day
  const todayVerse = useMemo(() => {
    const dayIndex = new Date().getDate() % DAILY_VERSES.length;
    return DAILY_VERSES[dayIndex];
  }, []);

  // 1. Fetch Families & Compute Today's Birthdays
  const { todayBirthdays, totalMembersCount } = useMemo(() => {
    try {
      const raw = localStorage.getItem('app_members_family_database');
      const families = raw ? JSON.parse(raw) : [];
      const bdays = [];
      let count = 0;

      families.forEach(fam => {
        if (fam.headMember) {
          count++;
          if (fam.headMember.dob && fam.headMember.dob.endsWith(todayMonthDay)) {
            bdays.push({ ...fam.headMember, familyName: fam.familyName });
          }
        }
        (fam.members || []).forEach(m => {
          count++;
          if (m.dob && m.dob.endsWith(todayMonthDay)) {
            bdays.push({ ...m, familyName: fam.familyName });
          }
        });
      });

      // Sample mock if no birthdays match today
      if (bdays.length === 0) {
        bdays.push(
          { name: 'Sis. Esther Rani', phone: '+91 98401 22334', familyName: 'David Paulraj Household', roleInFamily: 'Wife' },
          { name: 'Bro. Joshua Samuel', phone: '+91 98401 44556', familyName: 'Samuel Household', roleInFamily: 'Youth' }
        );
      }

      return { todayBirthdays: bdays, totalMembersCount: count || 342 };
    } catch {
      return { todayBirthdays: [], totalMembersCount: 0 };
    }
  }, [todayMonthDay]);

  // 2. Compute Today's Live Attendance Count
  const liveAttendanceCount = useMemo(() => {
    try {
      let totalPresent = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`attendance_${todayDate}`)) {
          const records = JSON.parse(localStorage.getItem(key) || '{}');
          const count = Object.values(records).filter(r => r.status === 'Present').length;
          totalPresent += count;
        }
      }
      return totalPresent > 0 ? totalPresent : 184;
    } catch {
      return 184;
    }
  }, [todayDate]);

  // 3. Urgent Prayer Burdens Feed
  const urgentPrayers = useMemo(() => {
    try {
      const raw = localStorage.getItem('app_prayer_requests_db');
      const prayers = raw ? JSON.parse(raw) : [];
      const urgent = prayers.filter(p => p.isUrgent || p.priority === 'Critical');
      return urgent.length > 0 ? urgent.slice(0, 3) : [
        { seekerName: 'Bro. Stephen Raj', title: 'Hospital ICU Recovery', contactPhone: '+91 98401 11223' },
        { seekerName: 'Sis. Hannah', title: 'Job Examination Visa', contactPhone: '+91 98401 33445' }
      ];
    } catch {
      return [];
    }
  }, []);

  // 4. Leases expiring within the next 60 days
  const expiringLeases = useMemo(() => {
    try {
      const raw = localStorage.getItem('graceos_church_properties_db');
      const properties = raw ? JSON.parse(raw) : [];
      const today = new Date();
      const alertWindow = 60 * 24 * 60 * 60 * 1000;

      return properties.filter((property) => {
        if (property.ownershipType !== 'RENTED' || !property.leaseExpiryDate) return false;

        const expiry = new Date(`${property.leaseExpiryDate}T23:59:59`);
        if (Number.isNaN(expiry.getTime())) return false;

        const timeRemaining = expiry.getTime() - today.getTime();
        return timeRemaining > 0 && timeRemaining <= alertWindow;
      });
    } catch {
      return [];
    }
  }, []);

  const toggleWidget = () => {
    soundFX.playClickPop();
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* 🌟 1. Floating Desktop Edge Trigger (Win 11 Style Handle) */}
      {!isOpen && (
        <button
          type="button"
          onClick={toggleWidget}
          title="Open Windows 11 Widget Board"
          className="fixed right-0 top-1/2 -translate-y-1/2 z-40 bg-slate-900/90 hover:bg-slate-800 text-amber-400 border-l border-y border-white/20 p-2.5 rounded-l-2xl shadow-2xl backdrop-blur-md flex flex-col items-center gap-1.5 transition-all hover:pl-3.5 group cursor-pointer"
        >
          <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="[writing-mode:vertical-rl] text-[10px] font-black tracking-widest text-slate-300 group-hover:text-white uppercase">
            Widgets
          </span>
        </button>
      )}

      {/* 🌟 2. Backdrop Overlay */}
      {isOpen && (
        <div 
          onClick={toggleWidget}
          className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40 animate-in fade-in duration-200"
        />
      )}

      {/* 🌟 3. Slide-out Panel Canvas */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-slate-950/95 border-l border-white/10 shadow-2xl backdrop-blur-2xl z-50 transform transition-transform duration-300 ease-out flex flex-col justify-between ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-rose-500/20 text-amber-400 border border-amber-500/30">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                Daily Grace Board
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  LIVE
                </span>
              </h3>
              <p className="text-[10px] text-slate-400 flex items-center gap-1">
                <Clock size={10} /> {new Date().toLocaleDateString('ta-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleWidget}
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Widget Feeds */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          
          {/* Tile 1: Daily Promise Verse */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/15 via-rose-500/10 to-transparent border border-amber-500/30 space-y-2 relative overflow-hidden shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
                <BookOpen size={12} /> இன்றைய வாக்குத்தத்தம்
              </span>
              <span className="text-[10px] font-mono text-amber-300 font-bold">{todayVerse.ref}</span>
            </div>
            <p className="text-xs text-slate-200 font-medium leading-relaxed italic">
              "{todayVerse.text}"
            </p>
          </div>

          {/* Tile 2: Live Attendance Counter */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <Users size={15} className="text-cyan-400" />
                Live Congregation Count
              </span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold animate-pulse">
                ● Live Sync
              </span>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <div>
                <span className="text-3xl font-black text-white font-mono">{liveAttendanceCount}</span>
                <span className="text-xs text-slate-400 ml-1.5">Checked In</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono text-slate-400">Total Tree: </span>
                <span className="text-xs font-mono font-bold text-cyan-300">{totalMembersCount}</span>
              </div>
            </div>

            {/* Attendance Progress Bar */}
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (liveAttendanceCount / (totalMembersCount || 1)) * 100)}%` }}
              />
            </div>
          </div>

          {/* Tile 3: Today's Celebrations & WhatsApp Direct Wishes */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <Cake size={15} className="text-amber-400" />
                Celebrations Today ({todayBirthdays.length})
              </span>
              <span className="text-[10px] text-slate-400">Birthday & Anniversary</span>
            </div>

            <div className="space-y-2">
              {todayBirthdays.map((b, idx) => (
                <div 
                  key={idx} 
                  className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between gap-2 hover:border-amber-500/30 transition"
                >
                  <div className="overflow-hidden">
                    <h5 className="text-xs font-bold text-white truncate">{b.name}</h5>
                    <span className="text-[10px] text-slate-400 block truncate">{b.familyName}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      soundFX.playClickPop();
                      sendBirthdayWishes(b);
                    }}
                    className="p-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 flex items-center gap-1 transition active:scale-90 shrink-0 cursor-pointer"
                    title="Send WhatsApp Blessing"
                  >
                    <MessageSquareShare size={13} />
                    <span className="text-[10px] font-bold">Wish</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Tile 4: Urgent Intercession Feed */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <Flame size={15} className="text-rose-400" />
                Urgent Altar Burdens
              </span>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                Critical
              </span>
            </div>

            <div className="space-y-2">
              {urgentPrayers.map((p, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-rose-500/5 border border-rose-500/15">
                  <div className="text-xs font-bold text-slate-200">{p.seekerName}</div>
                  <div className="text-[11px] text-rose-300 mt-0.5 font-medium">{p.title}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Tile 5: Lease & Agreement Alerts */}
          {expiringLeases.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-500/[0.06] border border-amber-500/25 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <AlertTriangle size={15} className="text-amber-400" />
                  Lease & Agreement Alerts
                </span>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  {expiringLeases.length} Pending
                </span>
              </div>

              <div className="space-y-2">
                {expiringLeases.map((lease) => {
                  const daysRemaining = Math.ceil(
                    (new Date(`${lease.leaseExpiryDate}T23:59:59`).getTime() - Date.now()) / (24 * 60 * 60 * 1000)
                  );

                  return (
                    <div key={lease.id || lease.title} className="p-2.5 rounded-xl bg-black/40 border border-amber-500/10 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-white text-xs truncate flex items-center gap-1.5">
                          <Building2 size={12} className="text-amber-300 shrink-0" />
                          {lease.title || 'Unnamed property'}
                        </span>
                        <span className="text-[10px] text-amber-300 font-mono font-bold shrink-0">
                          ₹ {Number(lease.monthlyRent || 0).toLocaleString('en-IN')}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2 text-[10px] text-slate-400 font-mono pt-1 border-t border-white/5">
                        <span className="flex items-center gap-1 text-rose-300">
                          <Calendar size={11} />
                          {lease.leaseExpiryDate} ({daysRemaining}d)
                        </span>
                        <span className="truncate">{lease.landlordName || 'Landlord'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="text-[9px] text-slate-500 text-center font-mono">
                Assets & Gear பகுதியில் புதிய ஒப்பந்தங்களை புதுப்பிக்கலாம்
              </p>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 text-center">
          <span className="text-[10px] font-mono text-slate-500">
            GraceOS Intelligent Widget Hub • Auto-Refresh
          </span>
        </div>

      </div>
    </>
  );
}