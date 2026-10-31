import React, { memo } from 'react';

/**
 * GraceOS Ambient Shimmer Backdrop
 * Pure CSS GPU-Accelerated atmospheric background shimmer layers.
 * 0% CPU consumption - 100% hardware composited via transform3d and opacity.
 *
 * Supported modes:
 * - 'solar': Warm radiant solar aura (Morning Golden Hour, High Noon, Sunny)
 * - 'lunar': Silvery-indigo moonlight shimmer (Dusk, Midnight, Deep Dark)
 * - 'rain':  Acrylic mist haze + silky diagonal rainfall streaks (Rainy, Thunderstorm)
 * - 'mist':  Calm frosted acrylic mist float (Cloudy, Overcast, Fog)
 */
function AmbientShimmerBackdrop({ shimmerMode = 'solar', enabled = true, opacity = 35, className = '' }) {
  if (!enabled || shimmerMode === 'off') {
    return null;
  }

  const containerOpacity = Math.min(Math.max((Number(opacity) || 35) / 100, 0), 1);

  return (
    <div
      className={`ambient-shimmer-container ${className}`}
      style={{ opacity: containerOpacity }}
      aria-hidden="true"
    >
      {shimmerMode === 'solar' && (
        <div className="ambient-shimmer-layer ambient-shimmer-solar" />
      )}

      {shimmerMode === 'lunar' && (
        <div className="ambient-shimmer-layer ambient-shimmer-lunar" />
      )}

      {shimmerMode === 'rain' && (
        <>
          {/* Subtle storm mist haze base layer */}
          <div className="ambient-shimmer-layer ambient-shimmer-mist opacity-70" />
          {/* Pure CSS silky rain shimmer streaks */}
          <div className="ambient-shimmer-layer ambient-shimmer-rain" />
        </>
      )}

      {shimmerMode === 'mist' && (
        <div className="ambient-shimmer-layer ambient-shimmer-mist" />
      )}
    </div>
  );
}

export default memo(AmbientShimmerBackdrop);

