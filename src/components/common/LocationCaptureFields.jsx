import React, { useState } from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { buildGoogleMapsNavigationUrl, parseGoogleMapsUrl, requestCurrentLocation } from '../../utils/locationUtils';

export default function LocationCaptureFields({ value, onChange, compact = false }) {
  const [error, setError] = useState('');
  const update = (patch) => onChange({ ...value, ...patch });
  const capture = async () => {
    setError('');
    try { update(await requestCurrentLocation()); }
    catch (err) { setError(err.message); }
  };
  const handleMapsUrl = (maps_url) => update({ ...parseGoogleMapsUrl(maps_url), maps_url });

  return (
    <div className={`rounded-xl border border-cyan-500/20 bg-cyan-500/5 ${compact ? 'p-3' : 'p-4'} space-y-3`}>
      <div className="flex items-center justify-between gap-2">
        <label className="text-[10px] text-cyan-200 font-bold uppercase tracking-wider flex items-center gap-1.5">
          <MapPin size={14} /> Residence GPS Location / இருப்பிட வரைபடம்
        </label>
        <button type="button" onClick={capture} className="px-2.5 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-400/30 text-cyan-200 text-[10px] font-bold flex items-center gap-1.5 cursor-pointer">
          <Navigation size={12} /> Get Current Location
        </button>
      </div>
      {error && <p className="text-[10px] text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg p-2">{error}</p>}
      <div className="grid grid-cols-2 gap-2">
        <input type="number" step="any" placeholder="Latitude" value={value.latitude || ''} onChange={(e) => update({ latitude: e.target.value, maps_url: buildGoogleMapsNavigationUrl(e.target.value, value.longitude) })} className="w-full bg-slate-950 border border-white/10 rounded-lg px-2.5 py-2 text-xs text-white" />
        <input type="number" step="any" placeholder="Longitude" value={value.longitude || ''} onChange={(e) => update({ longitude: e.target.value, maps_url: buildGoogleMapsNavigationUrl(value.latitude, e.target.value) })} className="w-full bg-slate-950 border border-white/10 rounded-lg px-2.5 py-2 text-xs text-white" />
      </div>
      <input type="url" name="maps_url" placeholder="Paste Google Maps Share URL (optional)" value={value.maps_url || ''} onChange={(e) => handleMapsUrl(e.target.value)} className="w-full bg-slate-950 border border-white/10 rounded-lg px-2.5 py-2 text-xs text-white" />
      <input type="text" name="gps_coordinates" placeholder="e.g. 11.0168, 76.9558" value={value.gps_coordinates || ''} onChange={(e) => update({ gps_coordinates: e.target.value })} className="w-full bg-slate-950 border border-white/10 rounded-lg px-2.5 py-2 text-xs text-white" />
    </div>
  );
}