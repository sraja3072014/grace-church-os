// src/components/media/LiveStreamMediaDesk.jsx
import React, { useState } from 'react';
import { 
  Video, Radio, Settings, Play, CheckCircle2, 
  ExternalLink, Tv
} from 'lucide-react';
import { soundFX } from '../../utils/audioEngine';

export default function LiveStreamMediaDesk() {
  const [streamConfig, setStreamConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('graceos_youtube_social_config');
      if (saved) return JSON.parse(saved);
    } catch (e) { console.error(e); }
    return {
      platform: 'youtube',
      channelName: 'Grace Central Cathedral TV',
      youtubeStreamId: 'dQw4w9WgXcQ',
      rtmpUrl: 'rtmp://a.rtmp.youtube.com/live2',
      streamKey: 'live_983742918347_ccms_local',
      enableChatEmbed: true
    };
  });

  const [isLiveActive, setIsLiveActive] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    soundFX?.playClickPop?.();
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleSaveConfig = (e) => {
    e.preventDefault();
    localStorage.setItem('graceos_youtube_social_config', JSON.stringify(streamConfig));
    showToast('YouTube & Social Media Settings Saved Locally!');
  };

  const handleToggleLive = () => {
    soundFX?.playSuccessChime?.();
    setIsLiveActive(!isLiveActive);
    showToast(isLiveActive ? 'Live Stream Session Ended' : 'Live Broadcast Connected to YouTube Stream!');
  };

  return (
    <div className="w-full h-full min-h-[600px] space-y-6 select-none text-slate-100 animate-in fade-in duration-200 pb-12">
      
      {toast && (
        <div className="fixed top-5 right-5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 backdrop-blur-md shadow-2xl z-50">
          <CheckCircle2 size={15} />
          <span className="font-semibold">{toast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <span>Live Stream &amp; YouTube Media Desk</span>
            <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono border font-bold ${
              isLiveActive ? 'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse' : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}>
              {isLiveActive ? '● YOUTUBE LIVE ACTIVE' : 'OFFLINE'}
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Zero-Cloud Media Policy: All heavy video/audio streaming is routed directly via YouTube &amp; Local Desktop Vaults.
          </p>
        </div>

        <button
          type="button"
          onClick={handleToggleLive}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg transition cursor-pointer active:scale-95 ${
            isLiveActive 
              ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/20' 
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
          }`}
        >
          <Radio size={15} className={isLiveActive ? 'animate-spin' : ''} />
          <span>{isLiveActive ? 'Disconnect YouTube Stream' : 'Connect YouTube Live'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: YouTube & Social Configuration Form */}
        <form onSubmit={handleSaveConfig} className="lg:col-span-1 p-5 rounded-3xl bg-slate-900 border border-white/10 space-y-4 shadow-xl">
          <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
            <Video size={16} className="text-rose-500" />
            <span>YouTube &amp; Social Media Config Hub</span>
          </h4>

          <div className="space-y-3">
            <div>
              <label className="text-[11px] text-slate-400 font-bold block mb-1">Broadcasting Platform</label>
              <select
                value={streamConfig.platform}
                onChange={(e) => setStreamConfig({ ...streamConfig, platform: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none cursor-pointer"
              >
                <option value="youtube">YouTube Live Sanctuary</option>
                <option value="facebook">Facebook Live Page</option>
                <option value="custom_rtmp">Custom RTMP Server</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 font-bold block mb-1">YouTube Live Video ID / Embed Key</label>
              <input
                type="text"
                value={streamConfig.youtubeStreamId}
                onChange={(e) => setStreamConfig({ ...streamConfig, youtubeStreamId: e.target.value })}
                placeholder="e.g. dQw4w9WgXcQ"
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-cyan-300 font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 font-bold block mb-1">RTMP Stream Key (Local Storage)</label>
              <input
                type="password"
                value={streamConfig.streamKey}
                onChange={(e) => setStreamConfig({ ...streamConfig, streamKey: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-amber-300 font-mono focus:outline-none"
              />
            </div>

            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[11px] text-emerald-200 leading-relaxed">
              ✓ <strong>Zero Cloud Cost:</strong> Large video archives remain on YouTube. Only metadata is stored locally.
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-600 text-white rounded-xl text-xs font-bold shadow-lg cursor-pointer transition"
            >
              Save YouTube &amp; Social Config
            </button>
          </div>
        </form>

        {/* Right Column: Live YouTube Embed Preview */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900 border border-white/10 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
              <Tv size={15} className="text-amber-400" />
              <span>Sanctuary Live Stream Feed (YouTube Player)</span>
            </h4>
            <span className="text-[10px] font-mono text-emerald-400">Stream ID: {streamConfig.youtubeStreamId}</span>
          </div>

          {/* YouTube Embed Player View */}
          <div className="relative aspect-video rounded-2xl bg-black border border-white/10 overflow-hidden shadow-2xl flex items-center justify-center">
            {isLiveActive ? (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${streamConfig.youtubeStreamId}?autoplay=1&mute=0`}
                title="Grace Cathedral Live Stream"
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mb-3 text-rose-500">
                  <Video size={32} />
                </div>
                <h5 className="text-sm font-bold text-white">YouTube Broadcast Offline</h5>
                <p className="text-xs text-slate-400 mt-1">
                  Click <strong>"Connect YouTube Live"</strong> above to initialize the sanctuary broadcast player.
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 text-xs text-slate-400">
            <span>Storage Policy: <strong className="text-cyan-400">YouTube Hosted (Zero Cloud Bloat)</strong></span>
            <a
              href={`https://www.youtube.com/watch?v=${streamConfig.youtubeStreamId}`}
              target="_blank"
              rel="noreferrer"
              className="text-cyan-400 hover:underline flex items-center gap-1"
            >
              <span>Open on YouTube</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </div>

      </div>

    </div>
  );
}