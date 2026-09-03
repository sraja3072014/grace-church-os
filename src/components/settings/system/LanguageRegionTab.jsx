import React, { useState } from 'react';
import { Globe, DollarSign, Clock, CheckCircle2, ShieldAlert, FileText, Check } from 'lucide-react';

export default function LanguageRegionTab() {
  const [toast, setToast] = useState('');

  const [localeConfig, setLocaleConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('graceos_locale_config');
      const parsed = saved ? JSON.parse(saved) : {};
      return {
        country: parsed.country || 'IN',
        language: parsed.language || 'ta',
        currency: parsed.currency || 'INR (₹)',
        currencySymbol: parsed.currencySymbol || '₹',
        taxComplianceType: parsed.taxComplianceType || '80G (India)',
        taxRegNumber: parsed.taxRegNumber || 'AABTG4902RF20214',
        dateFormat: parsed.dateFormat || 'DD/MM/YYYY'
      };
    } catch {
      return {
        country: 'IN',
        language: 'ta',
        currency: 'INR (₹)',
        currencySymbol: '₹',
        taxComplianceType: '80G (India)',
        taxRegNumber: 'AABTG4902RF20214',
        dateFormat: 'DD/MM/YYYY'
      };
    }
  });

  const regions = [
    {
      code: 'IN',
      country: 'India (இந்தியா)',
      flag: '🇮🇳',
      defaultCurrency: 'INR (₹)',
      symbol: '₹',
      defaultTax: '80G / 12A (IT Act)',
      languages: [
        { code: 'ta', name: 'தமிழ் (Tamil)' },
        { code: 'en', name: 'English' },
        { code: 'hi', name: 'हिन्दी (Hindi)' },
        { code: 'ml', name: 'മലയാളം (Malayalam)' }
      ]
    },
    {
      code: 'LK',
      country: 'Sri Lanka (இலங்கை)',
      flag: '🇱🇰',
      defaultCurrency: 'LKR (Rs)',
      symbol: 'Rs.',
      defaultTax: 'Ministry of Religious Affairs Trust',
      languages: [
        { code: 'ta', name: 'தமிழ் (Tamil)' },
        { code: 'si', name: 'සිංහල (Sinhala)' },
        { code: 'en', name: 'English' }
      ]
    },
    {
      code: 'US',
      country: 'United States & Canada',
      flag: '🇺🇸',
      defaultCurrency: 'USD ($)',
      symbol: '$',
      defaultTax: '501(c)(3) Non-Profit Exempt',
      languages: [
        { code: 'en', name: 'English (US)' },
        { code: 'es', name: 'Español' }
      ]
    },
    {
      code: 'AE',
      country: 'Middle East & Gulf (UAE/SA)',
      flag: '🇦🇪',
      defaultCurrency: 'AED (د.إ)',
      symbol: 'AED',
      defaultTax: 'Awqaf & Islamic Affairs / Community Trust',
      languages: [
        { code: 'ar', name: 'العربية (Arabic - RTL)' },
        { code: 'en', name: 'English' },
        { code: 'ta', name: 'தமிழ்' }
      ]
    },
    {
      code: 'SG',
      country: 'Singapore & Malaysia',
      flag: '🇸🇬',
      defaultCurrency: 'SGD (S$)',
      symbol: 'S$',
      defaultTax: 'Charities Act Reg / IPC Status',
      languages: [
        { code: 'en', name: 'English' },
        { code: 'ta', name: 'தமிழ்' },
        { code: 'ms', name: 'Bahasa Melayu' }
      ]
    }
  ];

  const updateLocale = (updated) => {
    setLocaleConfig(updated);
    localStorage.setItem('graceos_locale_config', JSON.stringify(updated));
    window.dispatchEvent(new Event('graceos_locale_updated'));
    setToast('Language & Region settings applied across GraceOS!');
    setTimeout(() => setToast(''), 2500);
  };

  const handleRegionSelect = (reg) => {
    updateLocale({
      ...localeConfig,
      country: reg.code,
      currency: reg.defaultCurrency,
      currencySymbol: reg.symbol,
      taxComplianceType: reg.defaultTax,
      language: reg.languages[0].code
    });
  };

  const currentRegionData = regions.find(r => r.code === localeConfig.country) || regions[0];

  return (
    <div className="flex flex-col gap-6 max-w-4xl select-none animate-in fade-in duration-200 pb-12">
      
      {toast && (
        <div className="fixed top-5 right-5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 backdrop-blur-md shadow-2xl z-50 animate-in fade-in">
          <CheckCircle2 size={15} />
          <span className="font-semibold">{toast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
            <Globe size={24} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              Global Language & Regional Localization Hub
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-mono">
                Multi-Nation i18n
              </span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Select church territorial country, local language dialect, and currency formatting standards.
            </p>
          </div>
        </div>
      </div>

      {/* 1. Country / Region Selector Grid */}
      <div className="flex flex-col gap-3">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Church Operational Territory (நாடு தேர்வு)
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {regions.map((reg) => {
            const isSelected = localeConfig.country === reg.code;
            return (
              <div
                key={reg.code}
                onClick={() => handleRegionSelect(reg)}
                className={`p-4 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                  isSelected 
                    ? 'border-cyan-400 bg-cyan-500/10 shadow-lg shadow-cyan-500/10' 
                    : 'border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{reg.flag}</span>
                  <div>
                    <h5 className="text-xs font-bold text-white">{reg.country}</h5>
                    <span className="text-[10px] font-mono text-cyan-300">{reg.defaultCurrency}</span>
                  </div>
                </div>
                {isSelected && <Check size={16} className="text-cyan-400" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Language Selection for Chosen Territory */}
      <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] flex flex-col gap-3">
        <span className="text-xs font-bold uppercase tracking-wider text-white">
          Active Interface Language (பயன்பாட்டு மொழி)
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          {currentRegionData.languages.map((lang) => {
            const isLangSelected = localeConfig.language === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => updateLocale({ ...localeConfig, language: lang.code })}
                className={`py-3 px-4 rounded-xl border text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                  isLangSelected 
                    ? 'border-cyan-400 bg-cyan-500 text-slate-950 shadow-md' 
                    : 'border-white/10 bg-black/30 text-slate-300 hover:bg-white/5'
                }`}
              >
                <span>{lang.name}</span>
                {isLangSelected && <Check size={14} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Currency & Legal Tax Compliance Customizer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Currency Formatting */}
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] flex flex-col gap-3">
          <span className="text-xs font-bold text-white flex items-center gap-2">
            <DollarSign size={16} className="text-emerald-400" />
            Active Currency Symbol & Standard
          </span>
          <div className="flex items-center gap-3">
            <input 
              type="text" 
              value={localeConfig.currencySymbol}
              onChange={(e) => updateLocale({ ...localeConfig, currencySymbol: e.target.value })}
              className="w-16 bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-center text-emerald-400 font-black font-mono text-base focus:outline-none"
            />
            <div className="text-[11px] text-slate-400">
              Used in Finance Desk, Dashboard, and 80G Receipts (e.g. ₹, $, AED, Rs.)
            </div>
          </div>
        </div>

        {/* Tax Exemption Standards */}
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] flex flex-col gap-2">
          <span className="text-xs font-bold text-white flex items-center gap-2">
            <FileText size={16} className="text-amber-400" />
            Tax Exemption Framework
          </span>
          <input 
            type="text" 
            value={localeConfig.taxComplianceType}
            onChange={(e) => updateLocale({ ...localeConfig, taxComplianceType: e.target.value })}
            className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-amber-300 font-semibold focus:outline-none"
            placeholder="e.g. 80G Tax Exemption (India) / 501(c)(3)"
          />
        </div>

      </div>

    </div>
  );
}