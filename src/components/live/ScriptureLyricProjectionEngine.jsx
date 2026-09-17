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

  const sampleScriptures = [
    {
      ref: 'John 3:16',
      primaryText: 'For God so loved the world that He gave His only begotten Son, that whoever believes in Him should not perish but have everlasting life.',
      secondaryText: 'தேவன், தம்முடைய ஒரேபேறான குமாரனை விசுவாசிக்கிறவன் எவனோ அவன் கெட்டுப்போகாமல் நித்தியஜீவனை அடையும்படிக்கு, அவரைத் தந்தருளி, இவ்வளவாய் உலகத்தில் அன்புகூர்ந்தார்.'
    },
    {
      ref: 'Psalm 23:1',
      primaryText: 'The LORD is my shepherd; I shall not want.',
      secondaryText: 'கர்த்தர் என் மேய்ப்பராயிருக்கிறார்; நான் தாழ்ச்சியடையேன்.'
    },
    {
      ref: 'Isaiah 40:31',
      primaryText: 'But those who wait on the LORD shall renew their strength; they shall mount up with wings like eagles.',
      secondaryText: 'கர்த்தருக்குக் காத்திருக்கிறவர்களோ புதுப்பெலன் அடைந்து, கழுகுகளைப்போலச் செட்டைகளை அடித்து எழும்புவார்கள்.'
    },
    {
      ref: 'Philippians 4:13',
      primaryText: 'I can do all things through Christ who strengthens me.',
      secondaryText: 'என்னைப் பெலப்படுத்துகிற கிறிஸ்துவினாலே எல்லாவற்றையுஞ்செய்ய எனக்குப் பெலனுண்டு.'
    }
  ];

  const sampleSongs = [
    {
      title: 'Amazing Grace (My Chains Are Gone)',
      slides: [
        'Amazing grace how sweet the sound\nThat saved a wretch like me\nI once was lost, but now I\'m found\nWas blind, but now I see',
        'My chains are gone, I\'ve been set free\nMy God, my Savior has ransomed me\nAnd like a flood His mercy reigns\nUnending love, amazing grace'
      ]
    },
    {
      title: 'How Great Thou Art',
      slides: [
        'O Lord my God, when I in awesome wonder\nConsider all the worlds Thy hands have made\nI see the stars, I hear the rolling thunder\nThy power throughout the universe displayed',
        'Then sings my soul, my Savior God, to Thee\nHow great Thou art, how great Thou art\nThen sings my soul, my Savior God, to Thee\nHow great Thou art, how great Thou art'
      ]
    },
    {
      title: 'Nandri Yesu Raja (Thanksgiving Hymn)',
      slides: [
        'Nandri Yesu Raja - En\nVaazhvil Seidha Nanmaikkaai\nNandri Yesu Raja - En\nThevai Ellaam Sandhitheer',
        'Kodi Kodi Sthothiram\nEredoppen Naalume\nEn Jeevan Ulla Naatkalellaam\nUmmaiye Naan Paaduven'
      ]
    }
  ];

  const filteredScriptures = useMemo(() => {
    if (!searchQuery.trim()) return sampleScriptures;
    const q = searchQuery.toLowerCase();
    return sampleScriptures.filter(
      (s) =>
        s.ref.toLowerCase().includes(q) ||
        s.primaryText.toLowerCase().includes(q) ||
        s.secondaryText.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const filteredSongs = useMemo(() => {
    if (!searchQuery.trim()) return sampleSongs;
    const q = searchQuery.toLowerCase();
    return sampleSongs.filter(
      (song) =>
        song.title.toLowerCase().includes(q) ||
        song.slides.some((slide) => slide.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  const handleGoLiveScripture = (item) => {
    soundFX?.playClickPop?.();
    setLiveSlide({
      type: 'SCRIPTURE',
      title: item.ref,
      content: item.primaryText,
      subContent: item.secondaryText
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
            <span>Scripture &amp; Lyric Live Projection Engine</span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono border border-indigo-500/30">
              Dual-Monitor Live
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Instant stage projection for worship lyrics, responsive scripture verses, and sermon slides.
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-2xl border border-white/10 text-xs font-bold">
          <button
            type="button"
            onClick={() => { setActiveTab('SCRIPTURE'); setSearchQuery(''); }}
            className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'SCRIPTURE' 
                ? 'bg-indigo-500 text-white shadow-md' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen size={13} />
            <span>Holy Scriptures</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('SONGS'); setSearchQuery(''); }}
            className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'SONGS' 
                ? 'bg-indigo-500 text-white shadow-md' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Music size={13} />
            <span>Worship Lyrics</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Search & Slide Feeds */}
        <div className="lg:col-span-2 space-y-4">
          
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                activeTab === 'SCRIPTURE'
                  ? 'Search scripture reference or keyword (e.g. John 3:16 / Psalm 23)...'
                  : 'Search worship songs by title or lyric excerpt...'
              }
              className="w-full bg-slate-900 border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-400 font-medium"
            />
          </div>

          {/* Scripture Selection Stream */}
          {activeTab === 'SCRIPTURE' && (
            <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
              {filteredScriptures.map((item, idx) => (
                <div 
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-900/80 border border-white/5 space-y-2 hover:border-indigo-500/30 transition group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-300 font-mono">
                      {item.ref}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleGoLiveScripture(item)}
                      className="px-3 py-1 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Tv size={12} />
                      <span>Send to Screen</span>
                    </button>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-sans">{item.primaryText}</p>
                  <p className="text-[11px] text-slate-400 italic">{item.secondaryText}</p>
                </div>
              ))}
            </div>
          )}

          {/* Song Lyrics Stream */}
          {activeTab === 'SONGS' && (
            <div className="space-y-4 max-h-[440px] overflow-y-auto pr-1">
              {filteredSongs.map((song, sIdx) => (
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

        {/* Right Column: Virtual Monitor Output Preview */}
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

            {/* Virtual Screen Canvas */}
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
                    GraceOS Dual Display Active
                  </span>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-1">
                  <Tv size={24} />
                  <span className="text-[10px]">Display Output Blank</span>
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
              Clear Screen (Blackout)
            </button>
          )}
        </div>

      </div>

    </div>
  );
}