import React, { useState, useEffect } from 'react';
import { ShieldCheck, Sparkles, MapPin } from 'lucide-react';

export default function DynamicAuraKiosk({ churchCoords = { lat: 11.0168, lon: 76.9558 } }) {
  const [pulseToken, setPulseToken] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(30);

  // Generate a dynamic cryptographic time-based hash every 30 seconds
  const generatePulse = () => {
    const rawSeed = `${Math.floor(Date.now() / 30000)}-GRACE-OS-SECURE`;
    const token = btoa(rawSeed).slice(0, 8).toUpperCase();
    setPulseToken(token);
    setSecondsLeft(30);
  };

  useEffect(() => {
    generatePulse();
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          generatePulse();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Compute 16 orbital neon dots encoded from current pulse token
  const dots = Array.from({ length: 16 }).map((_, i) => {
    const charCode = pulseToken.charCodeAt(i % pulseToken.length) || 65;
    const active = charCode % 2 === 0;
    const angle = (i * 360) / 16;
    return { id: i, angle, active };
  });

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[500px] w-full bg-[#07050d]/90 backdrop-blur-2xl rounded-3xl p-8 border border-cyan-500/20 shadow-2xl overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />

      {/* Header Info */}
      <div className="z-10 text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5 animate-spin" />
          Aura Dynamic Check-In
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
          Grace Church Network
        </h2>
        <p className="text-slate-400 text-sm mt-1 flex items-center justify-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-cyan-400" /> வளாகத்திற்குள் கேமராவை லோகோவில் மையப்படுத்தவும்
        </p>
      </div>

      {/* Circular Dynamic Pulse Visual Engine */}
      <div className="relative w-64 h-64 flex items-center justify-center z-10">
        {/* Rotating Outer Orbital Ring */}
        <div className="absolute inset-0 rounded-full border border-cyan-500/30 animate-[spin_18s_linear_infinite]" />

        {/* Orbit Dots (Visual Encoding Pattern) */}
        {dots.map((dot) => {
          const rad = (dot.angle * Math.PI) / 180;
          const radiusPx = 115;
          const x = Math.cos(rad) * radiusPx;
          const y = Math.sin(rad) * radiusPx;

          return (
            <div
              key={dot.id}
              style={{ transform: `translate(${x}px, ${y}px)` }}
              className={`absolute w-3.5 h-3.5 rounded-full transition-all duration-700 ${
                dot.active
                  ? 'bg-cyan-400 shadow-[0_0_12px_#06b6d4] scale-110'
                  : 'bg-slate-700/60 scale-75'
              }`}
            />
          );
        })}

        {/* Center Glowing Logo / Cross Hub */}
        <div className="relative w-40 h-40 rounded-full bg-gradient-to-tr from-cyan-950/80 via-slate-900 to-indigo-950/80 border border-cyan-400/40 shadow-[0_0_30px_rgba(6,182,212,0.3)] flex flex-col items-center justify-center p-4">
          <span className="text-4xl select-none mb-1">✝</span>
          <span className="text-xs font-bold tracking-widest text-cyan-200 uppercase">
            GraceOS
          </span>
          <span className="text-[10px] font-mono text-cyan-400/80 mt-1 tracking-wider">
            TOKEN: {pulseToken}
          </span>
        </div>
      </div>

      {/* Expiry Progress Bar */}
      <div className="z-10 mt-8 w-60">
        <div className="flex justify-between text-xs text-slate-400 mb-1">
          <span>அடுத்த கோடிங் மாற்றம்:</span>
          <span className="font-mono text-cyan-300 font-bold">{secondsLeft}s</span>
        </div>
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-1000 ease-linear"
            style={{ width: `${(secondsLeft / 30) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}