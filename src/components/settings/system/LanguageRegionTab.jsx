// src/components/settings/system/LanguageRegionTab.jsx
import React, { useState } from 'react';
import { Globe, Save, CheckCircle2, Languages, RefreshCw } from 'lucide-react';
import { soundFX } from '../../../utils/audioEngine';

export default function LanguageRegionTab({ onTriggerSuccess }) {
  const [internalToast, setInternalToast] = useState('');

  // அனைத்து நாடுகள் மற்றும் அவைகளின் மொழிகள்
  const globalCountries = [
    { country: 'India', flag: '🇮🇳', code: 'IN', timeZone: 'Asia/Kolkata (IST +5:30)', currency: 'INR (₹)', currencySymbol: '₹', dateFormat: 'DD/MM/YYYY', languages: [{ code: 'ta', label: 'தமிழ் (Tamil)' }, { code: 'en', label: 'English (India)' }, { code: 'hi', label: 'हिन्दी (Hindi)' }, { code: 'te', label: 'తెలుగు (Telugu)' }, { code: 'ml', label: 'മലയാളം (Malayalam)' }, { code: 'kn', label: 'ಕನ್ನಡ (Kannada)' }] },
    { country: 'United States', flag: '🇺🇸', code: 'US', timeZone: 'America/New_York (EST -5:00)', currency: 'USD ($)', currencySymbol: '$', dateFormat: 'MM/DD/YYYY', languages: [{ code: 'en', label: 'English (US)' }, { code: 'es', label: 'Español (Spanish)' }] },
    { country: 'United Kingdom', flag: '🇬🇧', code: 'GB', timeZone: 'Europe/London (GMT/BST)', currency: 'GBP (£)', currencySymbol: '£', dateFormat: 'DD/MM/YYYY', languages: [{ code: 'en', label: 'English (UK)' }] },
    { country: 'United Arab Emirates', flag: '🇦🇪', code: 'AE', timeZone: 'Asia/Dubai (GST +4:00)', currency: 'AED (د.إ)', currencySymbol: 'AED', dateFormat: 'DD/MM/YYYY', languages: [{ code: 'ar', label: 'العربية (Arabic)' }, { code: 'en', label: 'English' }, { code: 'ta', label: 'தமிழ் (Tamil)' }, { code: 'ml', label: 'മലയാളം (Malayalam)' }, { code: 'hi', label: 'हिन्दी (Hindi)' }] },
    { country: 'Germany', flag: '🇩🇪', code: 'DE', timeZone: 'Europe/Berlin (CET +1:00)', currency: 'EUR (€)', currencySymbol: '€', dateFormat: 'DD.MM.YYYY', languages: [{ code: 'de', label: 'Deutsch (German)' }, { code: 'en', label: 'English' }] },
    { country: 'France', flag: '🇫🇷', code: 'FR', timeZone: 'Europe/Paris (CET +1:00)', currency: 'EUR (€)', currencySymbol: '€', dateFormat: 'DD/MM/YYYY', languages: [{ code: 'fr', label: 'Français (French)' }, { code: 'en', label: 'English' }] },
    { country: 'Singapore', flag: '🇸🇬', code: 'SG', timeZone: 'Asia/Singapore (SGT +8:00)', currency: 'SGD (S$)', currencySymbol: 'S$', dateFormat: 'DD/MM/YYYY', languages: [{ code: 'en', label: 'English' }, { code: 'ta', label: 'தமிழ் (Tamil)' }] },
    { country: 'Malaysia', flag: '🇲🇾', code: 'MY', timeZone: 'Asia/Kuala_Lumpur (MYT +8:00)', currency: 'MYR (RM)', currencySymbol: 'RM', dateFormat: 'DD/MM/YYYY', languages: [{ code: 'en', label: 'English' }, { code: 'ta', label: 'தமிழ் (Tamil)' }] },
    { country: 'Sri Lanka', flag: '🇱🇰', code: 'LK', timeZone: 'Asia/Colombo (SLST +5:30)', currency: 'LKR (Rs)', currencySymbol: 'Rs', dateFormat: 'DD/MM/YYYY', languages: [{ code: 'ta', label: 'தமிழ் (Tamil)' }, { code: 'en', label: 'English' }] }
  ];

  // லோக்கல் ஸ்டோரேஜில் இருந்து தற்போதைய அமைப்புகளை எடுத்தல்
  const [advancedConfig, setAdvancedConfig] = useState(() => {
    const defaults = {
      country: 'India',
      language: 'ta',
      timeZone: 'Asia/Kolkata (IST +5:30)',
      currencyCode: 'INR (₹)',
      currencySymbol: '₹',
      dateFormat: 'DD/MM/YYYY'
    };

    try {
      const savedLocale = localStorage.getItem('graceos_locale_config');
      const savedAdv = localStorage.getItem('app_advanced_config');
      const merged = { ...defaults };

      if (savedLocale) {
        const p = JSON.parse(savedLocale);
        if (p.language) merged.language = p.language;
        if (p.currencySymbol) merged.currencySymbol = p.currencySymbol;
        if (p.dateFormat) merged.dateFormat = p.dateFormat;
      }
      if (savedAdv) {
        const pAdv = JSON.parse(savedAdv);
        Object.assign(merged, pAdv);
        if (pAdv.defaultLanguage) merged.language = pAdv.defaultLanguage;
      }
      return merged;
    } catch {
      return defaults;
    }
  });

  const showToast = (msg) => {
    setInternalToast(msg);
    if (typeof onTriggerSuccess === 'function') onTriggerSuccess(msg);
    setTimeout(() => setInternalToast(''), 3000);
  };

  const handleCountrySelect = (cName) => {
    const meta = globalCountries.find(c => c.country === cName) || globalCountries[0];
    if (meta) {
      const newLang = meta.languages?.[0]?.code || 'en';
      setAdvancedConfig(prev => ({
        ...prev,
        country: meta.country,
        language: newLang,
        timeZone: meta.timeZone,
        currencyCode: meta.currency,
        currencySymbol: meta.currencySymbol,
        dateFormat: meta.dateFormat
      }));
      soundFX?.playClickPop?.();
      showToast(`Selected ${meta.flag} ${meta.country}. Click "Apply Language & Reload" to update.`);
    }
  };

  const handleLanguageChange = (langCode) => {
    setAdvancedConfig(prev => ({
      ...prev,
      language: langCode
    }));
    soundFX?.playClickPop?.();
  };

  const handleSaveAndApply = () => {
    soundFX?.playSuccessChime?.();

    // 1. அனைத்து லோக்கல் ஸ்டோரேஜ் சாவிகளையும் ஒரே சீராகப் புதுப்பித்தல்
    const advToSave = {
      ...advancedConfig,
      defaultLanguage: advancedConfig.language
    };
    localStorage.setItem('app_advanced_config', JSON.stringify(advToSave));

    const coreLocale = {
      language: advancedConfig.language,
      currencySymbol: advancedConfig.currencySymbol,
      currencyCode: advancedConfig.currencyCode,
      dateFormat: advancedConfig.dateFormat
    };
    localStorage.setItem('graceos_locale_config', JSON.stringify(coreLocale));

    // 2. Custom Events பிராட்காஸ்ட் செய்தல்
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('graceos_locale_updated', { detail: coreLocale }));

    showToast('✓ மொழி வெற்றிகரமாக மாற்றப்பட்டது! திரையைப் புதுப்பிக்கிறது...');

    // 3. முழு திரையையும் புதிய மொழியுடன் உடனே ரீலோட் செய்தல்
    setTimeout(() => {
      window.location.reload();
    }, 600);
  };

  const currentCountryObj = globalCountries.find(c => c.country === advancedConfig.country) || globalCountries[0];
  const availableLanguages = currentCountryObj?.languages || [{ code: 'ta', label: 'தமிழ் (Tamil)' }, { code: 'en', label: 'English' }];

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-10 text-slate-200 relative z-10">
      
      {internalToast && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 backdrop-blur-md shadow-2xl animate-in fade-in">
          <CheckCircle2 size={15} />
          <span className="font-semibold">{internalToast}</span>
        </div>
      )}

      <div className="win11-card rounded-3xl p-6 sm:p-8 space-y-6 border border-white/10">
        
        <div className="border-b border-white/10 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Globe className="text-cyan-400" size={20} />
              Global Language, Regional Locale &amp; Currency Engine
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Select your territory language (தமிழ், മലയാളം, తెలుగు, हिन्दी, English, Español, etc.)
            </p>
          </div>

          <button
            type="button"
            onClick={handleSaveAndApply}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-500/25 cursor-pointer transition shrink-0 active:scale-95"
          >
            <RefreshCw size={15} />
            <span>Apply Language &amp; Reload</span>
          </button>
        </div>

        <div className="space-y-4">
          <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
            <Languages size={15} />
            <span>Regional Hierarchy &amp; Auto-Cascading Settings</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Country Selector */}
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Target Country / Territory *</label>
              <select
                value={advancedConfig.country || 'India'}
                onChange={(e) => handleCountrySelect(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 cursor-pointer font-bold"
              >
                {globalCountries.map((c) => (
                  <option key={c.country} value={c.country}>
                    {c.flag} {c.country} ({c.currency})
                  </option>
                ))}
              </select>
            </div>

            {/* Language Selector (Working for all languages) */}
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Regional Language Selection (மொழி) *</label>
              <select
                value={advancedConfig.language || 'ta'}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="w-full bg-slate-900 border border-cyan-500/50 rounded-2xl px-4 py-2.5 text-xs text-amber-300 font-bold focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                {availableLanguages.map((lang) => (
                  <option key={lang.code} value={lang.code}>{lang.label}</option>
                ))}
              </select>
            </div>

            {/* Timezone */}
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Synchronized Timezone</label>
              <input
                type="text"
                readOnly
                value={advancedConfig.timeZone || 'Asia/Kolkata (IST +5:30)'}
                className="w-full bg-slate-950/80 border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-cyan-300 font-mono focus:outline-none cursor-default"
              />
            </div>

            {/* Currency */}
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Currency Standard</label>
              <input
                type="text"
                readOnly
                value={`${advancedConfig.currencyCode} [${advancedConfig.currencySymbol}]`}
                className="w-full bg-slate-950/80 border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-emerald-300 font-mono font-bold focus:outline-none cursor-default"
              />
            </div>

          </div>
        </div>

        {/* Footer Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <span className="text-[11px] text-slate-400">
            Selected Language Code: <strong className="text-amber-300 uppercase">{advancedConfig.language}</strong> • Currency: <strong className="text-emerald-300 font-mono">{advancedConfig.currencySymbol}</strong>
          </span>

          <button
            type="button"
            onClick={handleSaveAndApply}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-bold rounded-2xl shadow-lg shadow-cyan-500/25 cursor-pointer transition active:scale-95"
          >
            <RefreshCw size={15} />
            <span>Apply Language &amp; Reload UI</span>
          </button>
        </div>

      </div>

    </div>
  );
}