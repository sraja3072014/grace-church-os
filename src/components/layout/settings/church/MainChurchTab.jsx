import React, { useState } from 'react';
import { Building2, MapPin, Phone, Mail, FileText, Image as ImageIcon } from 'lucide-react';

export default function MainChurchTab() {
  const [formData, setFormData] = useState({
    churchName: 'Grace City Church',
    trustRegNo: 'TR-TN-2024-9842',
    pastorName: 'Senior Pastor',
    phone: '+91 98765 43210',
    email: 'contact@gracechurch.org',
    address: '124, Grace Cathedral Road, City Center',
    currency: 'INR (₹)',
    receiptPrefix: 'GCC-2026'
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      
      {/* Church Identity & Branding */}
      <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center gap-6">
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 flex flex-col items-center justify-center text-slate-400 gap-1 cursor-pointer hover:border-cyan-500/50 transition">
          <ImageIcon size={24} />
          <span className="text-[10px] font-medium">Upload Logo</span>
        </div>
        <div>
          <h4 className="text-base font-bold text-white">Church Branding & Seals</h4>
          <p className="text-xs text-slate-400 mt-0.5">This logo and official name will appear on all 80G Receipts, Member ID Cards and PDF Reports.</p>
        </div>
      </div>

      {/* Input Fields Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Building2 size={14} className="text-cyan-400" /> Official Church Name
          </label>
          <input 
            type="text" 
            value={formData.churchName} 
            onChange={(e) => handleChange('churchName', e.target.value)}
            className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 transition"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <FileText size={14} className="text-indigo-400" /> Trust / Society Reg. Number
          </label>
          <input 
            type="text" 
            value={formData.trustRegNo} 
            onChange={(e) => handleChange('trustRegNo', e.target.value)}
            className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 transition"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Phone size={14} className="text-emerald-400" /> Official Contact Number
          </label>
          <input 
            type="text" 
            value={formData.phone} 
            onChange={(e) => handleChange('phone', e.target.value)}
            className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 transition"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Mail size={14} className="text-rose-400" /> Official Email Address
          </label>
          <input 
            type="email" 
            value={formData.email} 
            onChange={(e) => handleChange('email', e.target.value)}
            className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 transition"
          />
        </div>

        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <MapPin size={14} className="text-amber-400" /> Full Headquarters Address
          </label>
          <textarea 
            rows="2"
            value={formData.address} 
            onChange={(e) => handleChange('address', e.target.value)}
            className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 transition"
          />
        </div>

      </div>

    </div>
  );
}