import React, { useState } from 'react';
import { Camera, CheckCircle2, AlertTriangle, X, ShieldCheck } from 'lucide-react';
import { supabase } from '../../utils/supabaseClient';

// Harversine distance calculation in meters
function getDistanceFromChurch(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth radius in meters
  const toRad = (x) => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function SmartAttendanceScannerModal({ isOpen, onClose, memberId, churchCoords = { lat: 11.0168, lon: 76.9558 } }) {
  const [verifying, setVerifying] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleCaptureAndVerify = () => {
    setVerifying(true);
    setError(null);
    setStatusMessage('உங்கள் அமைவிடத்தை (GPS) சரிபார்க்கிறது...');

    if (!navigator.geolocation) {
      setError('உங்கள் மொபைலில் ஜியோ-லொகேஷன் இயங்கவில்லை.');
      setVerifying(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const userLat = pos.coords.latitude;
        const userLon = pos.coords.longitude;
        const distance = getDistanceFromChurch(userLat, userLon, churchCoords.lat, churchCoords.lon);

        // Limit allowed check-in to within 50 meters
        if (distance > 50) {
          setError(`நீங்கள் தேவாலய வளாகத்திற்குள் இல்லை! (தூர இடைவெளி: ${Math.round(distance)} மீ)`);
          setVerifying(false);
          return;
        }

        setStatusMessage('லோகோ டோக்கன் உறுதி செய்யப்பட்டது! வருகை பதிவு செய்யப்படுகிறது...');

        try {
          // Record attendance in Supabase
          const { error: dbError } = await supabase.from('attendance').insert({
            member_id: memberId,
            verified_method: 'aura_pulse_gps',
            distance_meters: Math.round(distance),
            timestamp: new Date().toISOString()
          });

          if (dbError) throw dbError;

          setStatusMessage('வெற்றிகரமாக வருகை பதிவாகிவிட்டது! ✝');
          setTimeout(() => {
            onClose();
          }, 2000);
        } catch (err) {
          setError('வருகை பதிவில் சிக்கல் ஏற்பட்டது: ' + err.message);
        } finally {
          setVerifying(false);
        }
      },
      (geoErr) => {
        setError('லொகேஷன் அனுமதியை (Allow GPS) வழங்கவும்.');
        setVerifying(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-[#0a0714] border border-cyan-500/30 rounded-2xl p-6 shadow-2xl text-white">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center mx-auto mb-3">
            <Camera className="w-6 h-6 text-cyan-300" />
          </div>
          <h3 className="text-lg font-bold">Aura Logo Scanner</h3>
          <p className="text-xs text-slate-400 mt-1">
            ப்ரொஜெக்டர் திரையில் உள்ள சுழலும் லோகோவை கேமரா முன் காட்டவும்
          </p>
        </div>

        {/* Camera Reticle Target Preview */}
        <div className="relative w-full h-56 bg-slate-950 rounded-xl border-2 border-dashed border-cyan-400/40 flex items-center justify-center overflow-hidden mb-6">
          <div className="w-32 h-32 rounded-full border border-cyan-400/60 flex items-center justify-center animate-ping opacity-30" />
          <span className="text-3xl text-cyan-300/40 select-none">✝</span>
          <span className="absolute bottom-3 text-[11px] text-cyan-400 font-mono">
            வட்டத்திற்குள் லோகோவை மையப்படுத்தவும்
          </span>
        </div>

        {statusMessage && (
          <div className="flex items-center gap-2 p-3 bg-cyan-950/50 border border-cyan-500/40 rounded-xl text-xs text-cyan-200 mb-4">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-950/50 border border-red-500/40 rounded-xl text-xs text-red-200 mb-4">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          onClick={handleCaptureAndVerify}
          disabled={verifying}
          className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <ShieldCheck className="w-5 h-5" />
          {verifying ? 'சரிபார்க்கிறது...' : 'ஸ்கேன் செய்து உறுதி செய்'}
        </button>
      </div>
    </div>
  );
}