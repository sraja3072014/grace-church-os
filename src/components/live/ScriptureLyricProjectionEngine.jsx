import React, { useState, useMemo } from 'react';
import { 
  BookOpen, Music, Search, Tv, 
  Eye, CheckCircle2, ChevronRight, Sparkles 
} from 'lucide-react';
import { soundFX } from '../../utils/audioEngine';

export default function ScriptureLyricProjectionEngine() {
  const [activeTab, setActiveTab] = useState('SCRIPTURE'); // 'SCRIPTURE' | 'SONGS'
  const [searchQuery, setSearchQuery] = useState('');
  const [liveSlide, setLiveSlide] = useState(null);

  // மாதிரி வேத வசன தரவுத்தளம் (Tamil & English Bibles)
  const sampleScriptures = [
    {
      ref: 'யோவான் 3:16',
      refEn: 'John 3:16',
      tamil: 'தேவன், தம்முடைய ஒரேபேறான குமாரனை விசுவாசிக்கிறவன் எவனோ அவன் கெட்டுப்போகாமல் நித்தியஜீவனை அடையும்படிக்கு, அவரைத் தந்தருளி, இவ்வளவாய் உலகத்தில் அன்புகூர்ந்தார்.',
      english: 'For God so loved the world that He gave His only begotten Son, that whoever believes in Him should not perish but have everlasting life.'
    },
    {
      ref: 'சங்கீதம் 23:1',
      refEn: 'Psalm 23:1',
      tamil: 'கர்த்தர் என் மேய்ப்பராயிருக்கிறார்; நான் தாழ்ச்சியடையேன்.',
      english: 'The LORD is my shepherd; I shall not want.'
    },
    {
      ref: 'ஏசாயா 40:31',
      refEn: 'Isaiah 40:31',
      tamil: 'கர்த்தருக்குக் காத்திருக்கிறவர்களோ புதுப்பெலன் அடைந்து, கழுகுகளைப்போலச் செட்டைகளை அடித்து எழும்புவார்கள்; அவர்கள் ஓடினாலும் இளைப்படையார்கள், நடந்தாலும் சோர்ந்துபோகார்கள்.',
      english: 'But those who wait on the LORD Shall renew their strength; They shall mount up with wings like eagles.'
    },
    {
      ref: 'பிலிப்பியர் 4:13',
      refEn: 'Philippians 4:13',
      tamil: 'என்னைப் பெலப்படுத்துகிற கிறிஸ்துவினாலே எல்லாவற்றையுஞ்செய்ய எனக்குப் பெலனுண்டு.',
      english: 'I can do all things through Christ who strengthens me.'
    }
  ];

  // மாதிரி ஆராதனைப் பாடல்கள் (Worship Songs)
  const sampleSongs = [
    {
      title: 'நன்றி இயேசு ராஜா (Nandri Yesu Raja)',
      slides: [
        'நன்றி இயேசு ராஜா - என்\nவாழ்வில் செய்த நன்மைக்காய்\nநன்றி இயேசு ராஜா - என்\nதேவை எல்லாம் சந்தித்தீர்',
        'கோடி கோடி ஸ்தோத்திரம்\nஏறெடுப்பேன் நாளுமே\nஎன் ஜீவன் உள்ள நாட்களெல்லாம்\nஉம்மையே நான் பாடுவேன்'
      ]
    },
    {
      title: 'என் மேய்ப்பர் நீர்தானையா (En Meipar Neerthanaiya)',
      slides: [
        'என் மேய்ப்பர் நீர்தானையா\nஎனக்கொன்றும் குறைவில்லையே\nபுல்லுள்ள இடங்களில் என்னை\nமேய்த்து நடத்துவாரே',
        'மரண இருளின் பள்ளத்தாக்கில்\nநான் நடந்தாலும் பயப்படேன்\nஉமது கோலும் உமது தடியும்\nஎன்னைத் தேற்றும் என் தேவா'
      ]
    }
  ];

  // வசன வடிகட்டி
  const filteredScriptures = useMemo(() => {
    if (!searchQuery) return sampleScriptures;
    const q = searchQuery.toLowerCase();
    return sampleScriptures.filter(
      s => s.ref.toLowerCase().includes(q) || 
           s.refEn.toLowerCase().includes(q) || 
           s.tamil.includes(q) || 
           s.english.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const handleGoLiveScripture = (item) => {
    soundFX?.playClickPop?.();
    setLiveSlide({
      type: 'SCRIPTURE',
      title: `${item.ref} (${item.refEn})`,
      content: item.tamil,
      subContent: item.english
    });
  };

  const handleGoLiveSongSlide = (songTitle, slideText, idx) => {
    soundFX?.playClickPop?.();
    setLiveSlide({
      type: 'SONG',
      title: `${songTitle} (Stanza ${idx + 1})`,
      content: slideText,
      subContent: ''
    });
  };

  return (
    <div className="space-y-6 max-w-5xl select-none text-slate-200 animate-in fade-in pb-12">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <span>Scripture & Lyric Live Projection Engine</span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono border border-indigo-500/30">
              Dual-Monitor Live
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            பாடல்கள் மற்றும் வசனங்களை ப்ரொஜெக்டர் திரையில் உடனுக்குடன் ஒளிபரப்பும் நேரலைப் பலகை.
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-2xl border border-white/10">
          <button
            type="button"
            onClick={() => setActiveTab('SCRIPTURE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'SCRIPTURE' 
                ? 'bg-indigo-500 text-white shadow-md' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen size={13} />
            <span>வேத வசனங்கள் (Scripture)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('SONGS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'SONGS' 
                ? 'bg-indigo-500 text-white shadow-md' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Music size={13} />
            <span>பாடல்கள் (Lyrics)</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* இடதுபுறம்: தேடல் மற்றும் பட்டியல்கள் */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Search Box */}
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={activeTab === 'SCRIPTURE' ? "வசனம் அல்லது புத்தகப் பெயரைத் தேடுக (எ.கா: யோவான் 3:16 / John)..." : "பாடல் வரிகளைத் தேடுக..."}
              className="w-full bg-slate-900 border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-400 font-medium"
            />
          </div>

          {/* வசனப் பட்டியல் */}
          {activeTab === 'SCRIPTURE' && (
            <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
              {filteredScriptures.map((item, idx) => (
                <div 
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-900/80 border border-white/5 space-y-2 hover:border-indigo-500/30 transition group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-300 font-mono">
                      {item.ref} • {item.refEn}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleGoLiveScripture(item)}
                      className="px-3 py-1 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Tv size={12} />
                      <span>திரைக்கு அனுப்பு (Go Live)</span>
                    </button>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-sans">{item.tamil}</p>
                  <p className="text-[11px] text-slate-400 italic">{item.english}</p>
                </div>
              ))}
            </div>
          )}

          {/* பாடல்கள் பட்டியல் */}
          {activeTab === 'SONGS' && (
            <div className="space-y-4 max-h-[440px] overflow-y-auto pr-1">
              {sampleSongs.map((song, sIdx) => (
                <div key={sIdx} className="p-4 rounded-2xl bg-slate-900/80 border border-white/5 space-y-3">
                  <h4 className="text-xs font-bold text-cyan-300">{song.title}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {song.slides.map((slide, slIdx) => (
                      <div 
                        key={slIdx} 
                        onClick={() => handleGoLiveSongSlide(song.title, slide, slIdx)}
                        className="p-3 rounded-xl bg-slate-950 border border-white/5 hover:border-cyan-500/40 cursor-pointer transition text-[11px] text-slate-300 whitespace-pre-line leading-relaxed space-y-2"
                      >
                        <div>{slide}</div>
                        <span className="text-[9px] text-cyan-400 font-mono font-bold block">
                          Slide #{slIdx + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* வலதுபுறம்: நேரலை ப்ரொஜெக்டர் மாதிரிக் காட்சி (Live Monitor Preview) */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-white/10 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Tv size={14} className="text-emerald-400" />
                <span>Live Projector Output</span>
              </span>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                ON AIR
              </span>
            </div>

            {/* Projection Virtual Screen Box */}
            <div className="aspect-video bg-black rounded-2xl border border-white/20 p-4 flex flex-col justify-between shadow-2xl relative overflow-hidden text-center">
              {liveSlide ? (
                <>
                  <span className="text-[10px] text-amber-300 font-mono font-bold uppercase tracking-wider block">
                    {liveSlide.title}
                  </span>
                  <div className="my-auto">
                    <p className="text-xs sm:text-sm font-bold text-white leading-relaxed whitespace-pre-line drop-shadow-md">
                      {liveSlide.content}
                    </p>
                    {liveSlide.subContent && (
                      <p className="text-[10px] text-slate-300 italic mt-1 font-serif">
                        {liveSlide.subContent}
                      </p>
                    )}
                  </div>
                  <span className="text-[8px] text-slate-500 font-mono">
                    GraceOS Projection Live
                  </span>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-1">
                  <Tv size={24} />
                  <span className="text-[10px]">திரையில் எதுவும் இல்லை (Screen Blank)</span>
                </div>
              )}
            </div>
          </div>

          {liveSlide && (
            <button
              type="button"
              onClick={() => setLiveSlide(null)}
              className="w-full py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-bold transition cursor-pointer"
            >
              Clear Screen (திரையை அழிக்க)
            </button>
          )}
        </div>

      </div>

    </div>
  );
}