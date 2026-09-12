import CottagePrayerDesk from './CottagePrayerDesk';

// Sub-Tab பொத்தானில்:
<button 
  onClick={() => setActiveSubTab('cottage_prayer')} 
  className="..."
>
  Cottage Prayer & Home Visits
</button>

// Render பகுதி:
{activeSubTab === 'cottage_prayer' && <CottagePrayerDesk session={session} />}