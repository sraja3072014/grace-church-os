import React, { useState, useRef, useEffect } from 'react';
import { 
  Building2, Globe, Sparkles, MapPin, Phone, Mail, 
  FileText, Image as ImageIcon, Target, Compass, Heart,
  Share2, Video, MessageCircle, RotateCcw, CheckCircle2, Upload, Save
} from 'lucide-react';

export default function MainChurchTab() {
  const [activeSubSection, setActiveSubSection] = useState('profile');
  const [toastMsg, setToastMsg] = useState('');
  const [logoPreview, setLogoPreview] = useState(null);
  const fileInputRef = useRef(null);

  const initialData = {
    churchName: 'Grace City Church',
    trustRegNo: 'TR-TN-2024-9842',
    seniorPastor: 'Senior Pastor',
    establishedYear: '2012',
    currency: 'INR (₹)',
    receiptPrefix: 'GCC-2026',
    motto: 'Transforming Lives, Building Generations in Grace',
    vision: 'To build a Christ-centered global church community empowered by the Holy Spirit.',
    mission: 'Preaching the Gospel, discipling believers, and demonstrating God’s love through local outreach.',
    coreValues: 'Faith, Integrity, Servant Leadership, Community Care, and Generosity.',
    phone: '+91 98765 43210',
    altPhone: '+91 94433 22110',
    email: 'contact@gracechurch.org',
    website: 'https://gracechurch.org',
    address: '124, Grace Cathedral Road, City Center, Koduvai, Tamil Nadu - 638660',
    youtube: 'https://youtube.com/@gracecitychurch',
    facebook: 'https://facebook.com/gracecitychurch',
    instagram: 'https://instagram.com/gracecitychurch',
    whatsappChannel: 'https://whatsapp.com/channel/graceos'
  };

  const [formData, setFormData] = useState(() => {
    const local = localStorage.getItem('graceos_main_church');
    return local ? JSON.parse(local) : initialData;
  });

  useEffect(() => {
    const savedLogo = localStorage.getItem('graceos_church_logo');
    if (savedLogo) setLogoPreview(savedLogo);
  }, []);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveAll = (e) => {
    if (e) e.preventDefault();
    
    // 1. Save Main Church Profile
    localStorage.setItem('graceos_main_church', JSON.stringify(formData));

    // 2. Automatically sync Main Campus branch details
    const localBranches = localStorage.getItem('graceos_branches');
    if (localBranches) {
      const branches = JSON.parse(localBranches);
      const updatedBranches = branches.map(b => {
        if (b.code === 'GCC-MAIN' || b.id === 1) {
          return {
            ...b,
            name: `${formData.churchName} (Main Campus)`,
            pastor: formData.seniorPastor,
            location: formData.address.split(',')[0] || b.location
          };
        }
        return b;
      });
      localStorage.setItem('graceos_branches', JSON.stringify(updatedBranches));
    }

    // Trigger storage event for live multi-tab sync
    window.dispatchEvent(new Event('storage'));
    showToast(`${formData.churchName} Profile Saved & Synced Successfully!`);
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
        localStorage.setItem('graceos_church_logo', reader.result);
        showToast('Official seal updated and saved!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReset = () => {
    setFormData(initialData);
    setLogoPreview(null);
    localStorage.setItem('graceos_main_church', JSON.stringify(initialData));
    localStorage.removeItem('graceos_church_logo');
    showToast('Default parameters restored');
  };

  const tabs = [
    { id: 'profile', label: 'Church Profile', icon: Building2 },
    { id: 'vision_mission', label: 'Vision & Mission', icon: Target },
    { id: 'contact_social', label: 'Contact & Social Media', icon: Share2 },
  ];

  return (
    <form onSubmit={handleSaveAll} className="flex flex-col gap-6 max-w-4xl relative select-none">
      
      {/* Toast Alert */}
      {toastMsg && (
        <div className="absolute -top-3 right-0 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-2 backdrop-blur-md animate-in fade-in z-20">
          <CheckCircle2 size={14} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Controls: Sub-Tabs & Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/30 border border-white/10 w-fit">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubSection === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSubSection(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 active:scale-95 ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/30 to-blue-600/30 text-cyan-200 border border-cyan-500/40 shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <Icon size={15} className={isActive ? 'text-cyan-300' : 'text-slate-400'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <button 
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 text-xs font-medium border border-white/5 transition"
          >
            <RotateCcw size={13} /> Reset
          </button>
          
          <button 
            type="submit"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 active:scale-95 transition"
          >
            <Save size={14} /> Save Profile
          </button>
        </div>
      </div>

      {/* 1. Church Profile View */}
      {activeSubSection === 'profile' && (
        <div className="flex flex-col gap-5 animate-in fade-in duration-200">
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleLogoUpload} 
            accept="image/*" 
            className="hidden" 
          />

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center gap-5">
            <div 
              onClick={() => fileInputRef.current.click()}
              className="w-20 h-20 rounded-2xl bg-slate-900 border border-white/10 flex flex-col items-center justify-center text-slate-400 gap-1 cursor-pointer hover:border-cyan-500/50 hover:bg-slate-800 transition shrink-0 relative overflow-hidden group"
            >
              {logoPreview ? (
                <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <>
                  <ImageIcon size={22} className="group-hover:scale-110 transition" />
                  <span className="text-[9px] font-medium">Upload Seal</span>
                </>
              )}
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                <Upload size={16} className="text-white" />
              </div>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                {formData.churchName}
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-mono">Verified Headquarters</span>
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">Click the seal box to upload the official logo used on receipts, cards, and reports.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Building2 size={13} className="text-cyan-400" /> Official Church Name
              </label>
              <input 
                type="text" 
                required
                value={formData.churchName} 
                onChange={(e) => handleChange('churchName', e.target.value)}
                className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 transition font-semibold"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <FileText size={13} className="text-indigo-400" /> Trust / Society Registration No.
              </label>
              <input 
                type="text" 
                value={formData.trustRegNo} 
                onChange={(e) => handleChange('trustRegNo', e.target.value)}
                className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 transition font-mono"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">Senior Pastor / President</label>
              <input 
                type="text" 
                value={formData.seniorPastor} 
                onChange={(e) => handleChange('seniorPastor', e.target.value)}
                className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 transition"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">Established Year</label>
              <input 
                type="text" 
                value={formData.establishedYear} 
                onChange={(e) => handleChange('establishedYear', e.target.value)}
                className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 transition font-mono"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">Base Currency</label>
              <input 
                type="text" 
                value={formData.currency} 
                onChange={(e) => handleChange('currency', e.target.value)}
                className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 transition"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">Receipt Voucher Prefix</label>
              <input 
                type="text" 
                value={formData.receiptPrefix} 
                onChange={(e) => handleChange('receiptPrefix', e.target.value)}
                className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 transition font-mono"
              />
            </div>
          </div>
        </div>
      )}

      {/* 2. Vision & Mission View */}
      {activeSubSection === 'vision_mission' && (
        <div className="flex flex-col gap-4 animate-in fade-in duration-200">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Sparkles size={14} className="text-amber-400" /> Church Motto / Tagline
            </label>
            <input 
              type="text" 
              value={formData.motto} 
              onChange={(e) => handleChange('motto', e.target.value)}
              className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 transition"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Compass size={14} className="text-cyan-400" /> Vision Statement
            </label>
            <textarea 
              rows="3"
              value={formData.vision} 
              onChange={(e) => handleChange('vision', e.target.value)}
              className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 transition"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Target size={14} className="text-indigo-400" /> Mission Statement
            </label>
            <textarea 
              rows="3"
              value={formData.mission} 
              onChange={(e) => handleChange('mission', e.target.value)}
              className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 transition"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Heart size={14} className="text-rose-400" /> Core Values
            </label>
            <input 
              type="text" 
              value={formData.coreValues} 
              onChange={(e) => handleChange('coreValues', e.target.value)}
              className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 transition"
            />
          </div>
        </div>
      )}

      {/* 3. Contact & Social Media View */}
      {activeSubSection === 'contact_social' && (
        <div className="flex flex-col gap-4 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Phone size={13} className="text-emerald-400" /> Primary Phone
              </label>
              <input 
                type="text" 
                value={formData.phone} 
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 transition font-mono"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Phone size={13} className="text-teal-400" /> Alternate Office Phone
              </label>
              <input 
                type="text" 
                value={formData.altPhone} 
                onChange={(e) => handleChange('altPhone', e.target.value)}
                className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 transition font-mono"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Mail size={13} className="text-rose-400" /> Official Email
              </label>
              <input 
                type="email" 
                value={formData.email} 
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 transition"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Globe size={13} className="text-cyan-400" /> Official Website
              </label>
              <input 
                type="text" 
                value={formData.website} 
                onChange={(e) => handleChange('website', e.target.value)}
                className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 transition"
              />
            </div>

            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <MapPin size={13} className="text-amber-400" /> Full Campus Address
              </label>
              <textarea 
                rows="2"
                value={formData.address} 
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 transition"
              />
            </div>
          </div>

          <div className="border-t border-white/10 pt-4 mt-2">
            <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">Streaming & Communication Links</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Video size={14} className="text-red-500" /> YouTube Channel Link
                </label>
                <input 
                  type="text" 
                  value={formData.youtube} 
                  onChange={(e) => handleChange('youtube', e.target.value)}
                  className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 transition"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Globe size={14} className="text-blue-500" /> Facebook Page Link
                </label>
                <input 
                  type="text" 
                  value={formData.facebook} 
                  onChange={(e) => handleChange('facebook', e.target.value)}
                  className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 transition"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Share2 size={14} className="text-pink-500" /> Instagram Link
                </label>
                <input 
                  type="text" 
                  value={formData.instagram} 
                  onChange={(e) => handleChange('instagram', e.target.value)}
                  className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 transition"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <MessageCircle size={14} className="text-emerald-400" /> WhatsApp Channel Link
                </label>
                <input 
                  type="text" 
                  value={formData.whatsappChannel} 
                  onChange={(e) => handleChange('whatsappChannel', e.target.value)}
                  className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 transition"
                />
              </div>
            </div>
          </div>
        </div>
      )}

    </form>
  );
}