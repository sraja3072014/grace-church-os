// src/components/settings/system/LanguageRegionTab.jsx
import React, { useState } from 'react';
import { Globe, Save, CheckCircle2, Wrench } from 'lucide-react';

export default function LanguageRegionTab({ onTriggerSuccess }) {
  // Comprehensive Global Countries Metadata
  const globalCountries = [
    { country: 'India', flag: '🇮🇳', code: 'IN', timeZone: 'Asia/Kolkata (IST +5:30)', currency: 'INR (₹)', dateFormat: 'DD/MM/YYYY', languages: [{ code: 'ta', label: 'தமிழ் (Tamil)' }, { code: 'en', label: 'English (India)' }, { code: 'hi', label: 'हिन्दी (Hindi)' }, { code: 'te', label: 'తెలుగు (Telugu)' }, { code: 'ml', label: 'മലയാളം (Malayalam)' }, { code: 'kn', label: 'ಕನ್ನಡ (Kannada)' }] },
    { country: 'United States', flag: '🇺🇸', code: 'US', timeZone: 'America/New_York (EST -5:00)', currency: 'USD ($)', dateFormat: 'MM/DD/YYYY', languages: [{ code: 'en-US', label: 'English (US)' }, { code: 'es', label: 'Español (Spanish)' }] },
    { country: 'United Kingdom', flag: '🇬🇧', code: 'GB', timeZone: 'Europe/London (GMT/BST)', currency: 'GBP (£)', dateFormat: 'DD/MM/YYYY', languages: [{ code: 'en-GB', label: 'English (UK)' }, { code: 'cy', label: 'Welsh' }] },
    { country: 'Canada', flag: '🇨🇦', code: 'CA', timeZone: 'America/Toronto (EST -5:00)', currency: 'CAD ($)', dateFormat: 'YYYY-MM-DD', languages: [{ code: 'en-CA', label: 'English (Canada)' }, { code: 'fr-CA', label: 'Français (French)' }] },
    { country: 'Australia', flag: '🇦🇺', code: 'AU', timeZone: 'Australia/Sydney (AEST +10:00)', currency: 'AUD ($)', dateFormat: 'DD/MM/YYYY', languages: [{ code: 'en-AU', label: 'English (Australia)' }] },
    { country: 'Singapore', flag: '🇸🇬', code: 'SG', timeZone: 'Asia/Singapore (SGT +8:00)', currency: 'SGD (S$)', dateFormat: 'DD/MM/YYYY', languages: [{ code: 'en', label: 'English (Singapore)' }, { code: 'zh', label: '简体中文 (Mandarin)' }, { code: 'ta', label: 'தமிழ் (Tamil)' }, { code: 'ms', label: 'Bahasa Melayu' }] },
    { country: 'Malaysia', flag: '🇲🇾', code: 'MY', timeZone: 'Asia/Kuala_Lumpur (MYT +8:00)', currency: 'MYR (RM)', dateFormat: 'DD/MM/YYYY', languages: [{ code: 'ms', label: 'Bahasa Melayu' }, { code: 'en', label: 'English' }, { code: 'ta', label: 'தமிழ் (Tamil)' }, { code: 'zh', label: '简体中文' }] },
    { country: 'Sri Lanka', flag: '🇱🇰', code: 'LK', timeZone: 'Asia/Colombo (SLST +5:30)', currency: 'LKR (Rs)', dateFormat: 'DD/MM/YYYY', languages: [{ code: 'ta', label: 'தமிழ் (Tamil)' }, { code: 'si', label: 'සිංහල (Sinhala)' }, { code: 'en', label: 'English' }] },
    { country: 'United Arab Emirates', flag: '🇦🇪', code: 'AE', timeZone: 'Asia/Dubai (GST +4:00)', currency: 'AED (د.إ)', dateFormat: 'DD/MM/YYYY', languages: [{ code: 'ar', label: 'العربية (Arabic)' }, { code: 'en', label: 'English' }, { code: 'ta', label: 'தமிழ் (Tamil)' }, { code: 'ml', label: 'മലയാളം (Malayalam)' }] },
    { country: 'Germany', flag: '🇩🇪', code: 'DE', timeZone: 'Europe/Berlin (CET +1:00)', currency: 'EUR (€)', dateFormat: 'DD.MM.YYYY', languages: [{ code: 'de', label: 'Deutsch (German)' }, { code: 'en', label: 'English' }] },
    { country: 'France', flag: '🇫🇷', code: 'FR', timeZone: 'Europe/Paris (CET +1:00)', currency: 'EUR (€)', dateFormat: 'DD/MM/YYYY', languages: [{ code: 'fr', label: 'Français (French)' }, { code: 'en', label: 'English' }] },
    { country: 'Russia', flag: '🇷🇺', code: 'RU', timeZone: 'Europe/Moscow (MSK +3:00)', currency: 'RUB (₽)', dateFormat: 'DD.MM.YYYY', languages: [{ code: 'ru', label: 'Русский (Russian)' }, { code: 'en', label: 'English' }] },
    { country: 'China', flag: '🇨🇳', code: 'CN', timeZone: 'Asia/Shanghai (CST +8:00)', currency: 'CNY (¥)', dateFormat: 'YYYY-MM-DD', languages: [{ code: 'zh-CN', label: '简体中文 (Simplified)' }, { code: 'zh-TW', label: '繁體中文 (Traditional)' }] },
    { country: 'Japan', flag: '🇯🇵', code: 'JP', timeZone: 'Asia/Tokyo (JST +9:00)', currency: 'JPY (¥)', dateFormat: 'YYYY/MM/DD', languages: [{ code: 'ja', label: '日本語 (Japanese)' }, { code: 'en', label: 'English' }] },
    { country: 'South Africa', flag: '🇿🇦', code: 'ZA', timeZone: 'Africa/Johannesburg (SAST +2:00)', currency: 'ZAR (R)', dateFormat: 'YYYY/MM/DD', languages: [{ code: 'en-ZA', label: 'English' }, { code: 'af', label: 'Afrikaans' }, { code: 'zu', label: 'isiZulu' }] },
    { country: 'Brazil', flag: '🇧🇷', code: 'BR', timeZone: 'America/Sao_Paulo (BRT -3:00)', currency: 'BRL (R$)', dateFormat: 'DD/MM/YYYY', languages: [{ code: 'pt-BR', label: 'Português (Portuguese)' }] }
  ];

  // Global Config with Safe Schema Normalization
  const [advancedConfig, setAdvancedConfig] = useState(() => {
    const defaults = {
      country: 'India',
      defaultLanguage: 'ta',
      timeZone: 'Asia/Kolkata (IST +5:30)',
      currencyCode: 'INR (₹)',
      dateFormat: 'DD/MM/YYYY',
    };

    try {
      const saved = localStorage.getItem('app_advanced_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...defaults, ...parsed };
      }
    } catch (e) {
      console.error(e);
    }
    return defaults;
  });

  // Country Selection Change Handler
  const handleCountrySelect = (cName) => {
    const meta = globalCountries.find(c => c.country === cName) || globalCountries[0];
    if (meta) {
      setAdvancedConfig(prev => ({
        ...prev,
        country: meta.country,
        defaultLanguage: meta.languages?.[0]?.code || 'en',
        timeZone: meta.timeZone,
        currencyCode: meta.currency,
        dateFormat: meta.dateFormat
      }));
      if (onTriggerSuccess) {
        onTriggerSuccess(`Country set to ${meta.flag} ${meta.country}. Timezone, Currency & Languages updated!`);
      }
    }
  };

  const handleSaveAll = (e) => {
    if (e) e.preventDefault();
    localStorage.setItem('app_advanced_config', JSON.stringify(advancedConfig));
    if (onTriggerSuccess) {
      onTriggerSuccess('Global Language & Region preferences saved successfully!');
    }
  };

  const currentCountryObj = globalCountries.find(c => c.country === advancedConfig.country) || globalCountries[0];
  const availableLanguages = currentCountryObj?.languages || [{ code: 'en', label: 'English' }];

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-10 text-slate-200">
      <form onSubmit={handleSaveAll} className="space-y-6">

        {/* Master Header Bar */}
        <div className="win11-card rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="border-b border-white/10 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Globe className="text-cyan-400" size={20} />
                Global Language, Regional Locale &amp; Currency Engine
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage worldwide country hierarchy with auto-cascading currency, regional language selection, and synchronized timezones.
              </p>
            </div>

            {/* Save Button */}
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-500/25 cursor-pointer transition shrink-0"
            >
              <Save size={15} />
              <span>Save Language &amp; Region</span>
            </button>
          </div>

          {/* 1. Global Country Selection */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <Globe size={15} />
              <span>Regional Hierarchy &amp; Auto-Cascading Settings</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-300">Target Country / Territory *</label>
                <select
                  value={advancedConfig.country || 'India'}
                  onChange={(e) => handleCountrySelect(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white mt-1 focus:outline-none focus:border-cyan-400 cursor-pointer font-bold"
                >
                  {globalCountries.map((c) => (
                    <option key={c.country} value={c.country}>
                      {c.flag} {c.country} ({c.currency})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300">Regional Language Selection *</label>
                <select
                  value={advancedConfig.defaultLanguage || 'ta'}
                  onChange={(e) => setAdvancedConfig({ ...advancedConfig, defaultLanguage: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white mt-1 focus:outline-none focus:border-cyan-400 cursor-pointer"
                >
                  {availableLanguages.map((lang) => (
                    <option key={lang.code} value={lang.code}>{lang.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300">Synchronized Timezone</label>
                <input
                  type="text"
                  readOnly
                  value={advancedConfig.timeZone || 'Asia/Kolkata (IST +5:30)'}
                  className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-cyan-300 font-mono mt-1 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300">Currency Standard</label>
                <input
                  type="text"
                  readOnly
                  value={advancedConfig.currencyCode || 'INR (₹)'}
                  className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-emerald-300 font-mono font-bold mt-1 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Footer Save Button */}
          <div className="flex justify-end pt-3 border-t border-white/10">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-bold rounded-2xl shadow-lg shadow-cyan-500/25 cursor-pointer transition"
            >
              <Save size={15} />
              <span>Save Language &amp; Region Settings</span>
            </button>
          </div>

        </div>

      </form>
    </div>
  );
}