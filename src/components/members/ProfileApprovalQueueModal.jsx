import React, { useState, useEffect } from 'react';
import { 
  UserCheck, Check, X, Clock, AlertCircle, 
  ArrowRight, Shield, RefreshCw, MapPin, ExternalLink, Navigation
} from 'lucide-react';
import { soundFX } from '../../utils/audioEngine';
import { getVaultData, setVaultData } from '../../utils/vaultStore';

export default function ProfileApprovalQueueModal({ isOpen, onClose, onUpdated }) {
  const [pendingRequests, setPendingRequests] = useState([]);

  const loadRequests = () => {
    try {
      const raw = localStorage.getItem('graceos_pending_profile_updates');
      const list = raw ? JSON.parse(raw) : [];
      setPendingRequests(list);
    } catch {
      setPendingRequests([]);
    }
  };

  useEffect(() => {
    if (isOpen) loadRequests();
  }, [isOpen]);

  // கோரிக்கையை ஏற்றுக்கொண்டு குடும்பம் & உறுப்பினர் டேட்டாபேஸில் புதுப்பித்தல்
  const handleApprove = async (req) => {
    soundFX?.playSuccessChime?.();
    const legacyFamilies = JSON.parse(localStorage.getItem('app_members_family_database') || '[]');
    const families = await getVaultData('members', legacyFamilies);

    let updated = false;
    const modifiedFamilies = families.map(fam => {
      const isHeadMatch = fam.headMember && (
        fam.headMember.memberId === req.memberId || fam.headMember.phone === req.phone
      );

      if (isHeadMatch) {
        fam.headMember = {
          ...fam.headMember,
          ...req.updatedFields,
          mapLink: req.updatedFields?.mapLink || fam.headMember.mapLink
        };
        if (req.updatedFields?.address) fam.address = req.updatedFields.address;
        if (req.updatedFields?.mapLink) fam.mapLink = req.updatedFields.mapLink;
        updated = true;
      }
      if (fam.members) {
        fam.members = fam.members.map(m => {
          if (m.memberId === req.memberId || m.phone === req.phone) {
            updated = true;
            return { ...m, ...req.updatedFields };
          }
          return m;
        });
      }
      return fam;
    });

    if (updated) {
      await setVaultData('members', modifiedFamilies, true);
      // Keep legacy consumers compatible until they migrate to the vault.
      localStorage.setItem('app_members_family_database', JSON.stringify(modifiedFamilies));
    }

    // க்யூவிலிருந்து நீக்குதல்
    const remaining = pendingRequests.filter(r => r.requestId !== req.requestId);
    localStorage.setItem('graceos_pending_profile_updates', JSON.stringify(remaining));
    setPendingRequests(remaining);

    if (onUpdated) onUpdated();
  };

  // கோரிக்கையை நிராகரித்தல்
  const handleReject = (reqId) => {
    soundFX?.playClickPop?.();
    const remaining = pendingRequests.filter(r => r.requestId !== reqId);
    localStorage.setItem('graceos_pending_profile_updates', JSON.stringify(remaining));
    setPendingRequests(remaining);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-2xl bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <UserCheck size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Member Profile Update Approvals</h3>
              <p className="text-[11px] text-slate-400">விசுவாசிகள் சமர்ப்பித்த சுயவிவர மாற்றங்களுக்கான ஒப்புதல் பலகை</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {/* Requests List */}
        <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
          {pendingRequests.length === 0 ? (
            <div className="text-center py-10 text-slate-500 space-y-2">
              <Clock size={28} className="mx-auto opacity-40" />
              <p className="text-xs">நிலுவையில் உள்ள சுயவிவர மாற்றங்கள் எதுவும் இல்லை.</p>
            </div>
          ) : (
            pendingRequests.map((req) => (
              <div 
                key={req.requestId} 
                className="p-4 rounded-2xl bg-slate-950 border border-white/5 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-2">
                      <span>{req.memberName}</span>
                      {req.updatedFields?.mapLink && (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[9px] font-mono flex items-center gap-1 font-bold">
                          <MapPin size={9} /> GPS Attached
                        </span>
                      )}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono">{req.memberId || req.phone}</span>
                  </div>
                  <span className="text-[10px] text-amber-400 font-mono bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    {req.requestedAt}
                  </span>
                </div>

                {/* Changes Comparison Grid */}
                <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-900/60 p-2.5 rounded-xl border border-white/5">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-mono">Original</span>
                    <div className="text-slate-300 font-medium">{req.oldValue || '—'}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-400 block uppercase font-mono">New Requested</span>
                    <div className="text-white font-bold">{req.newValue}</div>
                  </div>
                </div>

                {req.updatedFields?.mapLink && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
                    <span className="text-emerald-300 font-medium flex items-center gap-1.5">
                      <Navigation size={13} className="text-emerald-400 shrink-0" />
                      <span>விசுவாசி அனுப்பிய கூகுள் மேப் இருப்பிடம்:</span>
                    </span>
                    <a
                      href={req.updatedFields.mapLink}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition"
                    >
                      <ExternalLink size={11} />
                      <span>View on Google Maps</span>
                    </a>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleReject(req.requestId)}
                    className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                  >
                    <X size={13} />
                    <span>நிராகரி (Reject)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApprove(req)}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 shadow-md transition cursor-pointer active:scale-95"
                  >
                    <Check size={13} />
                    <span>ஏற்றுக்கொள் (Approve)</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}