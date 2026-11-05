import PrayerWallDesk from './PrayerWallDesk';

export default function PrayerWall({ session }) {
  return (
    <div className="space-y-6">
      <PrayerWallDesk session={session} />
    </div>
  );
}
