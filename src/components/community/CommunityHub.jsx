import React, { useState } from 'react';
import { 
  Users, MessageSquare, Send, Paperclip, 
  ShieldCheck, Heart, Sparkles, Plus, Image as ImageIcon, 
  FileText, QrCode, CheckCircle2, Lock, Share2
} from 'lucide-react';

export default function CommunityHub({ session }) {
  const [toast, setToast] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('chnl_all_church');
  const [postText, setPostText] = useState('');
  const [postType, setPostType] = useState('announcement'); // 'announcement' | 'prayer' | 'giving'

  // Channels List
  const [channels, setChannels] = useState([
    {
      id: 'chnl_all_church',
      name: 'Cathedral Official Broadcast',
      category: 'Broadcast',
      badge: 'Official Only',
      members: 3420,
      adminOnly: true
    },
    {
      id: 'chnl_youth',
      name: 'Youth Ministry & Ignite',
      category: 'Fellowship',
      badge: 'Interactive',
      members: 380,
      adminOnly: false
    },
    {
      id: 'chnl_cell_north',
      name: 'North Area Cell Circle',
      category: 'Cell Group',
      badge: 'Community',
      members: 65,
      adminOnly: false
    }
  ]);

  // Feed Posts
  const [posts, setPosts] = useState([
    {
      id: 1,
      channelId: 'chnl_all_church',
      author: 'Senior Pastor',
      role: 'Head Admin',
      time: 'Today at 07:30 AM',
      title: 'Sunday Worship Service Schedule & 80G Receipts Available',
      body: 'Grace to you and peace! The audited financial receipts for the month are generated. Members can download them directly from your member mobile portal.',
      type: 'announcement',
      likes: 84,
      prayers: 42,
      attachments: [{ name: 'September_Service_Order.pdf', size: '1.2 MB', type: 'pdf' }]
    },
    {
      id: 2,
      channelId: 'chnl_youth',
      author: 'Bro. Timothy',
      role: 'Youth Leader',
      time: 'Yesterday at 05:40 PM',
      title: 'Ignite Fellowship Outreach Registration',
      body: 'Registrations are open for the urban mission outreach this Saturday. Seed contribution of ₹200 can be paid directly inside this circle.',
      type: 'giving',
      likes: 31,
      prayers: 19,
      attachments: []
    }
  ]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const handleCreatePost = (e) => {
    e.preventDefault();
    if (!postText.trim()) return;

    const newPost = {
      id: Date.now(),
      channelId: selectedChannel,
      author: session?.username || 'Pastor Administration',
      role: 'Admin',
      time: 'Just now',
      title: postType === 'giving' ? 'Seed Giving & Support Call' : 'General Update',
      body: postText,
      type: postType,
      likes: 0,
      prayers: 0,
      attachments: []
    };

    setPosts([newPost, ...posts]);
    setPostText('');
    showToast('Update broadcasted to circle members!');
  };

  const currentChannel = channels.find(c => c.id === selectedChannel);
  const activePosts = posts.filter(p => p.channelId === selectedChannel);

  return (
    <div className="flex flex-col gap-6 select-none animate-in fade-in duration-200 pb-12">
      
      {toast && (
        <div className="fixed top-5 right-5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 backdrop-blur-md shadow-2xl z-50 animate-in fade-in">
          <CheckCircle2 size={15} />
          <span className="font-semibold">{toast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Users className="text-cyan-400" size={24} />
            <span>Community Circles & Broadcast Feed</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Native group communication, prayer feeds and direct in-app giving without WhatsApp API dependencies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => showToast('Syncing all subscriber devices...')}
            className="px-3.5 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold hover:bg-cyan-500/20 transition flex items-center gap-2"
          >
            <Sparkles size={14} /> Sync Live Feed
          </button>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Column: Circles / Groups List */}
        <div className="lg:col-span-1 win11-card p-4 rounded-3xl space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider">Circles & Groups</span>
              <button 
                onClick={() => showToast('New circle creation modal')}
                className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white"
              >
                <Plus size={14} />
              </button>
            </div>

            <div className="space-y-2">
              {channels.map((chnl) => {
                const isActive = chnl.id === selectedChannel;
                return (
                  <div
                    key={chnl.id}
                    onClick={() => setSelectedChannel(chnl.id)}
                    className={`p-3 rounded-2xl cursor-pointer transition border flex flex-col gap-1.5 ${
                      isActive 
                        ? 'border-cyan-400/50 bg-cyan-500/10 shadow-lg' 
                        : 'border-white/5 bg-black/20 hover:bg-white/[0.03]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${isActive ? 'text-cyan-300' : 'text-white'}`}>
                        {chnl.name}
                      </span>
                      {chnl.adminOnly && <Lock size={12} className="text-amber-400" />}
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>{chnl.category}</span>
                      <span className="font-mono">{chnl.members} Members</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-black/30 border border-white/5 text-[10px] text-slate-400 space-y-1">
            <span className="font-bold text-white flex items-center gap-1.5">
              <ShieldCheck size={13} className="text-emerald-400" /> Private Cloud Channel
            </span>
            <p>Direct push sync without meta fees or number ban limits.</p>
          </div>
        </div>

        {/* Right Columns: Active Feed & Live Messenger */}
        <div className="lg:col-span-3 space-y-5">
          
          {/* Post / Announcement Composer */}
          <form onSubmit={handleCreatePost} className="win11-card p-5 rounded-3xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold text-white">
                  Posting to: <strong className="text-cyan-400">{currentChannel?.name}</strong>
                </span>
              </div>

              <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setPostType('announcement')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${postType === 'announcement' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'}`}
                >
                  Circular
                </button>
                <button
                  type="button"
                  onClick={() => setPostType('prayer')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${postType === 'prayer' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'}`}
                >
                  Prayer Need
                </button>
                <button
                  type="button"
                  onClick={() => setPostType('giving')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${postType === 'giving' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'}`}
                >
                  Giving Seed
                </button>
              </div>
            </div>

            <textarea 
              rows={3}
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              placeholder="Type message, pastoral blessing, or fellowship update for members..."
              className="w-full bg-slate-950/80 border border-white/10 rounded-2xl p-3.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 resize-none"
            />

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2 text-slate-400">
                <button type="button" onClick={() => showToast('Attach PDF / Circular')} className="p-2 rounded-xl hover:bg-white/5 border border-white/5">
                  <FileText size={15} />
                </button>
                <button type="button" onClick={() => showToast('Attach Photo / Gallery')} className="p-2 rounded-xl hover:bg-white/5 border border-white/5">
                  <ImageIcon size={15} />
                </button>
                <button type="button" onClick={() => showToast('UPI Payment QR Link')} className="p-2 rounded-xl hover:bg-white/5 border border-white/5">
                  <QrCode size={15} />
                </button>
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center gap-2 hover:scale-[1.01] transition cursor-pointer"
              >
                <Send size={13} /> Broadcast to Circle
              </button>
            </div>
          </form>

          {/* Feed Post List */}
          <div className="space-y-4">
            {activePosts.map((post) => (
              <div key={post.id} className="win11-card p-5 rounded-3xl space-y-3.5 border border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-black text-sm">
                      {post.author[0]}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <span>{post.author}</span>
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                          {post.role}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500">{post.time}</span>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-slate-300 capitalize">
                    {post.type}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-sm font-bold text-white">{post.title}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{post.body}</p>
                </div>

                {/* Attachments if any */}
                {post.attachments && post.attachments.length > 0 && (
                  <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <FileText size={18} className="text-amber-400" />
                      <div>
                        <span className="text-xs font-bold text-white block">{post.attachments[0].name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{post.attachments[0].size}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => showToast('Opening attached circular...')}
                      className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-cyan-300 text-xs font-bold"
                    >
                      View PDF
                    </button>
                  </div>
                )}

                {/* Social / Response Actions */}
                <div className="flex items-center justify-between border-t border-white/5 pt-3 text-xs text-slate-400">
                  <div className="flex items-center gap-4">
                    <button onClick={() => showToast('Amen / Prayed')} className="flex items-center gap-1.5 hover:text-rose-400 transition">
                      <Heart size={14} /> <span>{post.prayers} Prayers</span>
                    </button>
                    <button onClick={() => showToast('Liked')} className="flex items-center gap-1.5 hover:text-cyan-400 transition">
                      <Sparkles size={14} /> <span>{post.likes} Amens</span>
                    </button>
                  </div>

                  <button onClick={() => showToast('Sharing direct portal link...')} className="flex items-center gap-1 hover:text-white transition text-[11px]">
                    <Share2 size={13} /> Share Link
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>

    </div>
  );
}