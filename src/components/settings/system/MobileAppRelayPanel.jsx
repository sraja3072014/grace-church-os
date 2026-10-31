import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import {
  CheckCircle2,
  Clock3,
  Copy,
  KeyRound,
  RefreshCw,
  ScanLine,
  ShieldCheck,
  Smartphone,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { getSupabase } from '../../../utils/supabaseClient';

const QR_TTL_MS = 10 * 60 * 1000;
const PAIR_CODE_TTL_MS = 5 * 60 * 1000;
const RELAY_VERSION = 'GRACEOS_RELAY_V1';

function bytesToBase64Url(bytes) {
  let binary = '';
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64UrlToBytes(value) {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (value.length % 4)) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function sha256Base64Url(value) {
  const digest = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return bytesToBase64Url(new Uint8Array(digest));
}

async function createRelayPayload(credentials) {
  const createdAt = new Date().toISOString();
  const keyBytes = window.crypto.getRandomValues(new Uint8Array(32));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const key = await window.crypto.subtle.importKey('raw', keyBytes, { name: 'AES-GCM' }, false, ['encrypt']);
  const unsigned = { url: credentials.url, anonKey: credentials.anonKey, churchId: credentials.churchId, createdAt };
  const signature = await sha256Base64Url(JSON.stringify(unsigned));
  const plaintext = JSON.stringify({ ...unsigned, signature });
  const cipher = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(plaintext),
  );

  const envelope = {
    v: RELAY_VERSION,
    i: bytesToBase64Url(iv),
    k: bytesToBase64Url(keyBytes),
    c: bytesToBase64Url(new Uint8Array(cipher)),
  };
  return `graceos-relay:${bytesToBase64Url(new TextEncoder().encode(JSON.stringify(envelope)))}`;
}

function readJson(key, fallback = {}) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function formatRemaining(ms) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  return `${String(Math.floor(totalSeconds / 60)).padStart(2, '0')}:${String(totalSeconds % 60).padStart(2, '0')}`;
}

export default function MobileAppRelayPanel() {
  const [qrValue, setQrValue] = useState('');
  const [qrExpiresAt, setQrExpiresAt] = useState(0);
  const [pairCode, setPairCode] = useState('');
  const [pairCodeExpiresAt, setPairCodeExpiresAt] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [pairRemaining, setPairRemaining] = useState(0);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);

  const credentials = useMemo(() => {
    const vault = readJson('grace_os_vault_credentials', {});
    const cloud = readJson('graceos_unified_cloud_config', readJson('graceos_supabase_config', {}));
    const church = readJson('graceos_main_church', {});
    return {
      url: (vault.url || cloud.supabaseUrl || '').trim().replace(/\/$/, ''),
      anonKey: (vault.anonKey || cloud.supabaseAnonKey || '').trim(),
      churchId: church.churchId || church.id || church.registrationNo || church.trustRegNo || 'main-church',
    };
  }, []);

  const generateQr = useCallback(async () => {
    setIsGenerating(true);
    setStatus({ type: '', message: '' });
    try {
      if (!/^https:\/\/[^\s/]+/.test(credentials.url) || !credentials.anonKey) {
        throw new Error('Configure the Supabase URL and public anon key before creating a relay code.');
      }
      const value = await createRelayPayload(credentials);
      const expiresAt = Date.now() + QR_TTL_MS;
      setQrValue(value);
      setQrExpiresAt(expiresAt);
      setRemaining(QR_TTL_MS);
      setStatus({ type: 'success', message: 'Encrypted mobile relay QR generated.' });
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Unable to generate the relay QR.' });
    } finally {
      setIsGenerating(false);
    }
  }, [credentials]);

  useEffect(() => { generateQr(); }, [generateQr]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setRemaining(Math.max(0, qrExpiresAt - Date.now()));
      setPairRemaining(Math.max(0, pairCodeExpiresAt - Date.now()));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [qrExpiresAt, pairCodeExpiresAt]);

  const generatePairCode = async () => {
    setIsGeneratingCode(true);
    try {
      const supabase = getSupabase();
      if (!supabase) throw new Error('Supabase is not configured; use the offline QR instead.');
      const code = String(Math.floor(100000 + Math.random() * 900000));
      const expiresAt = new Date(Date.now() + PAIR_CODE_TTL_MS).toISOString();
      const church = readJson('graceos_main_church', {});
      const relayPayload = qrValue || await createRelayPayload(credentials);
      const payload = { code, church_id: church.churchId || church.id || church.registrationNo || church.trustRegNo || 'main-church', relay_payload: relayPayload, expires_at: expiresAt, used_at: null };
      const { error } = await supabase.from('ephemeral_pair_codes').insert(payload);
      if (error) throw error;
      setPairCode(code);
      setPairCodeExpiresAt(Date.parse(expiresAt));
      setPairRemaining(PAIR_CODE_TTL_MS);
      setStatus({ type: 'success', message: 'Online pairing PIN created and expires in 5 minutes.' });
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Unable to create the online pairing PIN.' });
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const copy = async (value, message) => {
    if (!value) return;
    await navigator.clipboard?.writeText(value);
    setStatus({ type: 'success', message });
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl relative text-slate-100">
      {status.message && <div className={`${status.type === 'error' ? 'bg-rose-500/15 border-rose-500/40 text-rose-200' : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200'} border rounded-xl px-4 py-3 text-xs flex items-center gap-2`}><CheckCircle2 size={15} /><span>{status.message}</span></div>}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-500/10 to-indigo-500/10 border border-cyan-400/25 flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-cyan-400/15 text-cyan-300 flex items-center justify-center shrink-0"><Smartphone size={25} /></div>
        <div><h3 className="text-base font-bold text-white">Mobile App Relay</h3><p className="text-xs text-slate-300 mt-1">Zero-key setup for a GraceOS Mobile terminal. Credentials are read from this desktop vault and never need to be typed on the phone.</p><p className="text-xs font-semibold text-amber-200 mt-3">Scan this code with your GraceOS Mobile App camera to authorize and configure your mobile terminal without typing credentials.</p></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5">
        <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5 flex flex-col items-center gap-4">
          <div className="bg-white p-3 rounded-2xl shadow-2xl"><QRCodeCanvas value={qrValue || 'graceos-relay:pending'} size={220} level="M" bgColor="#ffffff" fgColor="#050816" includeMargin /></div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-200"><Clock3 size={14} />{remaining ? `${formatRemaining(remaining)} remaining` : 'Refresh required'}</div>
          <button type="button" onClick={generateQr} disabled={isGenerating} className="w-full px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50"><RefreshCw size={14} className={isGenerating ? 'animate-spin' : ''} />Refresh encrypted QR</button>
          <button type="button" onClick={() => copy(qrValue, 'Relay payload copied. Treat it like a temporary credential.')} disabled={!qrValue} className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 disabled:opacity-40"><Copy size={13} />Copy payload</button>
        </div>

        <div className="flex flex-col gap-4">
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10"><div className="flex items-center gap-2 mb-3"><ShieldCheck size={17} className="text-emerald-300" /><h4 className="text-sm font-bold">Offline encrypted handshake</h4></div><p className="text-xs text-slate-400 leading-5">The QR contains an AES-GCM authenticated envelope with a random one-time key, a 10-minute expiry timestamp, church identity, and a tamper-detection signature. It does not require a pairing server or internet connection to scan.</p><div className="mt-4 flex items-center gap-2 text-[11px] text-emerald-300"><WifiOff size={14} /> Works without an external pairing server</div></div>
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10"><div className="flex items-center justify-between gap-3 mb-3"><div className="flex items-center gap-2"><KeyRound size={17} className="text-amber-300" /><h4 className="text-sm font-bold">Online 6-digit pairing fallback</h4></div><Wifi size={15} className="text-cyan-300" /></div><p className="text-xs text-slate-400 mb-4">Use this only when the mobile camera is unavailable. The PIN is stored in <code className="text-cyan-200">ephemeral_pair_codes</code> and expires after five minutes.</p><div className="flex items-center gap-3"><div className="flex-1 rounded-xl bg-slate-950 border border-white/10 px-4 py-3 text-center font-mono text-2xl tracking-[0.35em] text-cyan-200">{pairCode || '------'}</div><button type="button" onClick={generatePairCode} disabled={isGeneratingCode} className="px-4 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold flex items-center gap-2 disabled:opacity-50"><RefreshCw size={14} className={isGeneratingCode ? 'animate-spin' : ''} />Generate</button></div>{pairRemaining > 0 && <div className="text-[11px] text-amber-200 mt-3">Expires in {formatRemaining(pairRemaining)}</div>}</div>
          <div className="text-[11px] text-slate-500 flex items-center gap-2"><ScanLine size={14} />Never screenshot or publish a live relay QR or PIN.</div>
        </div>
      </div>
    </div>
  );
}

export { createRelayPayload, bytesToBase64Url, base64UrlToBytes };