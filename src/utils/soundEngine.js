// கணினியில் உள்ள நேட்டிவ் வாய்ஸைப் பயன்படுத்தி பேச வைக்கும் முறை
export const speakHolyVerse = (text, gender = 'female') => {
  if (!('speechSynthesis' in window)) return;

  window.speechSynthesis.cancel(); // பழைய ஆடியோவை நிறுத்த

  const utterance = new SpeechSynthesisUtterance(text);
  const voices = window.speechSynthesis.getVoices();

  // தமிழ் அல்லது இந்திய ஆங்கிலக் குரல்களைத் தேர்வு செய்தல்
  const selectedVoice = voices.find(v => 
    gender === 'female' 
      ? (v.name.includes('Female') || v.name.includes('Zira') || v.lang.includes('ta'))
      : (v.name.includes('Male') || v.name.includes('David') || v.lang.includes('ta'))
  );

  if (selectedVoice) utterance.voice = selectedVoice;
  utterance.rate = 0.9; // மெதுவான, அமைதியான வேகம்
  utterance.pitch = 1.0;

  window.speechSynthesis.speak(utterance);
};