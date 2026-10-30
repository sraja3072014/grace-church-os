// src/utils/localeConfig.js

export const LOCALE_DICTIONARY = {
  en: {
    dashboard: 'Main Dashboard',
    members: 'Members Desk',
    visitors: 'Visitors Hub',
    finance: 'Finance & 80G',
    attendance: 'Attendance',
    ministries: 'Ministries & Kids',
    prayer: 'Prayer Wall',
    events: 'Events Hub',
    live: 'Live Desk',
    reports: 'Reports',
    settings: 'Settings',
    present: 'Present',
    absent: 'Absent',
    totalCongregation: 'Total Congregation',
    totalGiving: 'Month Giving Inflow'
  },
  ta: {
    dashboard: 'பிரதான முகப்பு பலகை',
    members: 'விசுவாசிகள் பதிவேடு',
    visitors: 'வருகையாளர்கள் மையம்',
    finance: 'நிதி & 80G வரி விலக்கு',
    attendance: 'வருகைப் பதிவு',
    ministries: 'பணித்தளங்கள் & சிறுவர் சபை',
    prayer: 'ஜெபச் சுவர்',
    events: 'நிகழ்வுகள் & நாட்காட்டி',
    live: 'நேரலை மேடைத் திரை',
    reports: 'தணிக்கை அறிக்கைகள்',
    settings: 'அமைப்புகள்',
    present: 'வந்தவர்',
    absent: 'வராதவர்',
    totalCongregation: 'மொத்த விசுவாசிகள்',
    totalGiving: 'மாதக் காணிக்கை வரவு'
  }
};

export function getActiveLocaleConfig() {
  try {
    const raw = localStorage.getItem('graceos_locale_config');
    return raw ? JSON.parse(raw) : { lang: 'ta', currencySymbol: '₹' };
  } catch {
    return { lang: 'ta', currencySymbol: '₹' };
  }
}

export function t(key, lang = 'ta') {
  return LOCALE_DICTIONARY[lang]?.[key] || LOCALE_DICTIONARY['en']?.[key] || key;
}