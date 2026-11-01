export function buildGoogleMapsNavigationUrl(latitude, longitude) {
  if (!Number.isFinite(Number(latitude)) || !Number.isFinite(Number(longitude))) return '';
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${latitude},${longitude}`)}`;
}

export function parseGoogleMapsUrl(value) {
  const text = String(value || '').trim();
  if (!text) return { latitude: '', longitude: '', maps_url: '' };
  const coordinateMatch = text.match(/(?:@|destination=|query=|q=|maps\/|^)(-?\d{1,3}(?:\.\d+)?)[, ]+(-?\d{1,3}(?:\.\d+)?)/i)
    || text.match(/!3d(-?\d{1,3}(?:\.\d+)?).*?!4d(-?\d{1,3}(?:\.\d+)?)/i);
  if (!coordinateMatch) return { latitude: '', longitude: '', maps_url: text };
  const latitude = coordinateMatch[1];
  const longitude = coordinateMatch[2];
  return { latitude, longitude, maps_url: buildGoogleMapsNavigationUrl(latitude, longitude) || text };
}

export function requestCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject(new Error('Location is not available on this device.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => resolve({
        latitude: String(coords.latitude),
        longitude: String(coords.longitude),
        maps_url: buildGoogleMapsNavigationUrl(coords.latitude, coords.longitude)
      }),
      (error) => {
        const message = error.code === 1
          ? 'Location permission denied. Please allow access or paste a Google Maps URL manually.'
          : 'Unable to get your location. Please try again or paste a Google Maps URL manually.';
        reject(new Error(message));
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  });
}

export function hasCoordinates(value) {
  return Number.isFinite(Number(value?.latitude)) && Number.isFinite(Number(value?.longitude));
}