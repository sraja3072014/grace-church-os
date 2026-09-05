import React, { useState } from 'react';
import { 
  Tv, Video, Play, Radio, Users, 
  ExternalLink, Copy, Check, Sparkles, Send, 
  Clock, ShieldAlert, Heart, MessageSquare
} from 'lucide-react';

export default function LiveDesk({ session }) {
  const [activeStreamType, setActiveStreamType] = useState('youtube'); // 'youtube' | 'zoom' | 'gmeet'
  const [copied, setCopied] = useState('');
  
  // YouTube Stream Config
  const [youtubeVideoId, setYoutubeVideoId] = useState('jfKfPfyJRdk');
  const [streamTitle, setStreamTitle] = useState('Sunday Live Worship & Miracle Service');

  // Zoom & GMeet Details
  const [meetingDetails, setMeetingDetails] = useState({
    zoomMeetingId: '849 2039 1102',
    zoomPasscode: 'PRAY2026',
    zoomLink: 'https://zoom.us/j/84920391102',
    gmeetLink: 'https://meet.google.com/abc-defg-hij',
    topic: '24/7 Chain Prayer & Intercession Room'
  });

  // Live Chat & Prayer Requests State
  const [chatMessages, setChatMessages] = useState([
    { id: 1, name: 'Bro. David Kumar', text: 'Praise the Lord! Watching from Coimbatore.', time: '09:05 AM' },
    { id: 2, name: 'Sister Sarah', text: 'Please pray for my mother’s speedy recovery.', time: '09:12 AM' }
  ]);
  const [newChatText, setNewChatText] = useState('');
  const [senderName, setSenderName] = useState('');

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 2500);
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!newChatText.trim()) return;

    const newMsg = {
      id: Date.now(),
      name: senderName.trim() || session?.username || 'Online Believer',
      text: newChatText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages([...chatMessages, newMsg]);
    setNewChatText('');
  };

  return (
    <div className="flex flex-col gap-6 select-none animate-in fade-in duration-200 pb-16 text-slate-100">
      
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              Virtual Sanctuary & Live Broadcast
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Tv className="text-rose-400" size={24} />
            <span>Church Live Broadcast & Online Sanctuary</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            YouTube ஆராதனை நேரலை, Zoom 24/7 ஜெபக் கூடார அறை மற்றும் Google Meet உடனடி இணைப்பு.
          </p>
        </div>

        {/* Stream Selector Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-black/40 rounded-2xl border border-white/10 shrink-0">
          <button
            onClick={() => setActiveStreamType('youtube')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeStreamType === 'youtube' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Play size={14} />
            <span>YouTube Live</span>
          </button>
          <button
            onClick={() => setActiveStreamType('zoom')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeStreamType === 'zoom' ? 'bg-sky-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Video size={14} />
            <span>Zoom Room</span>
          </button>
          <button
            onClick={() => setActiveStreamType('gmeet')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeStreamType === 'gmeet' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users size={14} />
            <span>Google Meet</span>
          </button>
        </div>
      </div>

      {/* Main Stream Area & Side Feed Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Video Player / Meeting Details */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* 1. YouTube Live Embed */}
          {activeStreamType === 'youtube' && (
            <div className="space-y-4">
              <div className="relative w-full aspect-video rounded-3xl overflow-hidden bg-black border border-white/10 shadow-2xl">
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1`}
                  title="Live Stream"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>

              <div className="win11-card p-4 rounded-2xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <h3 className="font-bold text-white text-sm">{streamTitle}</h3>
                  <p className="text-[11px] text-slate-400">Live Sunday Morning Broadcast • Main Cathedral Sanctuary</p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="YouTube Video ID"
                    value={youtubeVideoId}
                    onChange={(e) => setYoutubeVideoId(e.target.value)}
                    className="bg-slate-950/80 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 2. Zoom 24/7 Room Card */}
          {activeStreamType === 'zoom' && (
            <div className="win11-card p-8 rounded-3xl border border-sky-500/30 shadow-2xl space-y-6 flex flex-col justify-between min-h-[400px]">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3.5 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
                    <Video size={28} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">{meetingDetails.topic}</h3>
                    <p className="text-xs text-slate-400">தொடர் சங்கிலி ஜெபம் மற்றும் விசேஷ பரிந்துரைத்தல் அரங்கம்</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Meeting ID:</span>
                    <div className="text-lg font-black text-white font-mono flex items-center justify-between">
                      <span>{meetingDetails.zoomMeetingId}</span>
                      <button 
                        onClick={() => copyToClipboard(meetingDetails.zoomMeetingId, 'zoomId')}
                        className="text-slate-400 hover:text-sky-400 cursor-pointer"
                      >
                        {copied === 'zoomId' ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Passcode:</span>
                    <div className="text-lg font-black text-sky-400 font-mono flex items-center justify-between">
                      <span>{meetingDetails.zoomPasscode}</span>
                      <button 
                        onClick={() => copyToClipboard(meetingDetails.zoomPasscode, 'zoomPass')}
                        className="text-slate-400 hover:text-sky-400 cursor-pointer"
                      >
                        {copied === 'zoomPass' ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <a
                  href={meetingDetails.zoomLink}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 bg-sky-500 hover:bg-sky-400 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition active:scale-98"
                >
                  <span>Launch Zoom Meeting App</span>
                  <ExternalLink size={15} />
                </a>
              </div>
            </div>
          )}

          {/* 3. Google Meet Card */}
          {activeStreamType === 'gmeet' && (
            <div className="win11-card p-8 rounded-3xl border border-emerald-500/30 shadow-2xl space-y-6 flex flex-col justify-between min-h-[400px]">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <Users size={28} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">Google Meet Fellowship</h3>
                    <p className="text-xs text-slate-400">விரைவு வேதாகமப் படிப்பு மற்றும் சிறிய குழு ஐக்கிய அரங்கம்</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Meet Direct Link:</span>
                  <div className="text-sm font-bold text-emerald-400 font-mono flex items-center justify-between">
                    <span className="truncate">{meetingDetails.gmeetLink}</span>
                    <button 
                      onClick={() => copyToClipboard(meetingDetails.gmeetLink, 'gmeet')}
                      className="text-slate-400 hover:text-emerald-400 cursor-pointer"
                    >
                      {copied === 'gmeet' ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <a
                  href={meetingDetails.gmeetLink}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition active:scale-98"
                >
                  <span>Join Google Meet Instantly</span>
                  <ExternalLink size={15} />
                </a>
              </div>
            </div>
          )}

        </div>

        {/* Right 1 Column: Live Chat & Prayer Feed */}
        <div className="win11-card p-5 rounded-3xl border border-white/10 shadow-2xl flex flex-col justify-between space-y-4 min-h-[460px]">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h4 className="text-xs font-bold text-white flex items-center gap-2">
                <MessageSquare size={15} className="text-rose-400" />
                <span>Live Prayer Requests & Feed</span>
              </h4>
              <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 text-[10px] font-bold border border-rose-500/20">
                {chatMessages.length} Messages
              </span>
            </div>

            <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
              {chatMessages.map((msg) => (
                <div key={msg.id} className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-300">{msg.name}</span>
                    <span className="text-[9px] text-slate-500 font-mono">{msg.time}</span>
                  </div>
                  <p className="text-xs text-slate-200 font-medium leading-relaxed">{msg.text}</p>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSendChat} className="space-y-2 pt-2 border-t border-white/10">
            <input
              type="text"
              placeholder="Your Name (e.g. Sister Monisha)"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-rose-400"
            />
            <div className="flex items-center gap-2">
              <input
                type="text"
                required
                placeholder="Type prayer note or greeting..."
                value={newChatText}
                onChange={(e) => setNewChatText(e.target.value)}
                className="flex-1 bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-400"
              />
              <button
                type="submit"
                className="p-2 bg-gradient-to-r from-rose-500 to-amber-600 text-white rounded-xl cursor-pointer active:scale-95 shadow-md shadow-rose-500/20"
              >
                <Send size={15} />
              </button>
            </div>
          </form>

        </div>

      </div>

    </div>
  );
}