import React from 'react';
import { ExternalLink, MapPin } from 'lucide-react';
import { buildGoogleMapsNavigationUrl, hasCoordinates } from '../../utils/locationUtils';

export default function LocationNavigationButton({ location, onTagLocation }) {
  const url = location?.maps_url || buildGoogleMapsNavigationUrl(location?.latitude, location?.longitude);
  if (hasCoordinates(location) || url) {
    return <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-[10px] font-bold hover:bg-emerald-500/25"><MapPin size={12} /> Navigate (Google Maps) <ExternalLink size={10} /></a>;
  }
  return <button type="button" onClick={onTagLocation} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-400 text-[10px] font-bold hover:text-cyan-300"><MapPin size={12} /> No GPS Tagged · + Tag Location</button>;
}