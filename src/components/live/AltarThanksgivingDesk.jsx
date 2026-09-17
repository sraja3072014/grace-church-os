import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sparkles, Printer, Calendar, Heart, 
  Utensils, Gift, MessageSquare, CheckCircle2, Share2 
} from 'lucide-react';
import { soundFX } from '../../utils/audioEngine';
import { getVaultData } from '../../utils/vaultStore';

export default function AltarThanksgivingDesk({ session }) {
  const [targetSunday, setTargetSunday] = useState(() => {
    return new Date().toISOString().slice(0, 10);
  });
  const [allSponsorships, setAllSponsorships] = useState([]);

  useEffect(() => {
    async function loadSponsorships() {
      const data = await getVaultData('sponsorships', [
        {
          id: 'SPON-101',
          sponsorName: 'Bro. Stephen Victor & Family',
          occasion: 'Wedding Anniversary & Child Birthday Thanksgiving',
          cause: 'FELLOWSHIP_MEALS',
          mode: 'IN_KIND',
          targetDate: new Date().toISOString().slice(0, 10),
          phone: '+91 98765 43210'
        },
        {
          id: 'SPON-102',
          sponsorName: 'Sis. Mary Stella',
          occasion: 'Complete Medical Recovery & Restoration Praise',
          cause: 'ALTAR_FLOWERS',
          mode: 'CHURCH_OFFERING',
          targetDate: new Date().toISOString().slice(0, 10),
          phone: '+91 98401 22334'
        }
      ]);
      setAllSponsorships(data);
    }
    loadSponsorships();
  }, []);

  const thanksgivingItems = useMemo(() => {
    return allSponsorships.filter(
      (item) => item.targetDate === targetSunday || !targetSunday
    );
  }, [allSponsorships, targetSunday]);

  const handleShareToPastor = () => {
    soundFX?.playClickPop?.();
    let text = `🕊️ *GRACE CATHEDRAL - SUNDAY ALTAR THANKSGIVING LIST*\n`;
    text += `📅 *Lord's Day Date:* ${targetSunday}\n`;
    text += `━━━━━━━━━━━━━━━━━━━━\n\n`;

    if (thanksgivingItems.length === 0) {
      text += `No special thanksgiving petitions or altar sponsorships recorded for this date.\n`;
    } else {
      thanksgivingItems.forEach((item, index) => {
        text += `${index + 1}. *${item.sponsorName}*\n`;
        text += `   • Reason: ${item.occasion || 'General Altar Thanksgiving'}\n`;
        text += `   • Category: ${
          item.cause === 'FELLOWSHIP_MEALS'
            ? 'Fellowship Love Feast'
            : item.cause === 'TRUST_KIDS'
            ? 'Orphanage Child Care Aid'
            : 'Sanctuary Floral Decoration'
        }\n`;
        text += `   • Offering Mode: ${
          item.mode === 'IN_KIND' ? 'In-Kind Provision' : 'Direct Church Treasury Offering'
        }\n\n`;
      });
    }

    text += `━━━━━━━━━━━━━━━━━━━━\n`;
    text += `_Submitted for Senior Pastor's Pulpit Blessing & Altar Prayer._`;

    window.open(`https://web.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto select-none text-slate-200 animate-in fade-in pb-12">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4 print:hidden">
        <div>
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <span>Altar Thanksgiving &amp; Sponsorship Reading Slip</span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono border border-rose-500/30">
              Podium Prompt
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Congregational thanksgiving offerings and fellowship sponsorships for pastoral pulpit announcements.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <input
            type="date"
            value={targetSunday}
            onChange={(e) => setTargetSunday(e.target.value)}
            className="bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-amber-300 font-mono focus:outline-none cursor-pointer"
          />

          <button
            type="button"
            onClick={handleShareToPastor}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-lg active:scale-95"
          >
            <Share2 size={13} />
            <span>Share to Pastor</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="px-3.5 py-1.5 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Printer size={13} />
            <span>Print Slip</span>
          </button>
        </div>
      </div>

      {/* Printable Podium Sheet */}
      <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl print:bg-white print:text-slate-950 print:border-none print:shadow-none">
        
        {/* Title Header */}
        <div className="border-b-2 border-amber-500/40 print:border-slate-900 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-black text-white print:text-slate-950 uppercase tracking-wide">
              Grace Central Cathedral - Altar Announcements
            </h2>
            <p className="text-xs text-amber-400 print:text-slate-700 font-semibold">
              Special Altar Thanksgiving Offerings &amp; Fellowship Sponsorships
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-300 print:text-slate-800 bg-slate-950 print:bg-slate-100 px-3 py-1 rounded-xl border border-white/10">
            Date: {targetSunday}
          </span>
        </div>

        {/* List of Thanksgiving Families */}
        {thanksgivingItems.length === 0 ? (
          <div className="p-8 text-center text-slate-500 print:text-slate-400 font-mono text-xs">
            No special thanksgiving offerings or love feast sponsorships recorded for this date.
          </div>
        ) : (
          <div className="space-y-4">
            {thanksgivingItems.map((item, idx) => (
              <div 
                key={item.id}
                className="p-4 rounded-2xl bg-slate-950/70 print:bg-slate-50 border border-white/5 print:border-slate-300 space-y-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 print:bg-slate-200 print:text-slate-900 text-xs font-bold flex items-center justify-center font-mono shrink-0">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="text-sm font-black text-white print:text-slate-950">{item.sponsorName}</h4>
                      <p className="text-xs font-semibold text-amber-400 print:text-amber-800 mt-0.5">
                        {item.occasion || 'Family Thanksgiving & Praise'}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full border border-white/10 print:border-slate-400 text-slate-300 print:text-slate-800 uppercase font-bold shrink-0">
                    {item.cause === 'FELLOWSHIP_MEALS'
                      ? 'Love Feast'
                      : item.cause === 'TRUST_KIDS'
                      ? 'Child Care Aid'
                      : 'Altar Flowers'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 print:text-slate-600 pt-2 border-t border-white/5 print:border-slate-200">
                  <span>
                    Provision Mode:{' '}
                    <strong className="text-slate-200 print:text-slate-900">
                      {item.mode === 'IN_KIND' ? 'In-Kind Food & Provisions' : 'Paid to Church Account'}
                    </strong>
                  </span>
                  {item.phone && <span>Contact: {item.phone}</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pulpit Scriptural Benediction */}
        <div className="pt-6 border-t border-white/10 print:border-slate-300 text-center space-y-1">
          <p className="text-xs font-bold text-slate-300 print:text-slate-800 italic">
            &ldquo;God loves a cheerful giver.&rdquo; — 2 Corinthians 9:7
          </p>
          <span className="text-[10px] text-slate-500 print:text-slate-600 font-mono block">
            Certified &amp; Verified by Church Administration Office
          </span>
        </div>

      </div>

    </div>
  );
}