import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Haptics, NotificationType } from '@capacitor/haptics';
import { Html5Qrcode } from 'html5-qrcode';

const CREDENTIALS_KEY = 'grace_mobile_vault_credentials';
const RELAY_PREFIX = 'graceos-relay:';
const RELAY_VERSION = 'GRACEOS_RELAY_V1';
const MAX_AGE_MS = 10 * 60 * 1000;

export type MobileVaultCredentials = { url: string; anonKey: string; churchId: string; createdAt: string; signature: string };
type MobilePairingScannerProps = {
  onPaired?: (credentials: MobileVaultCredentials) => Promise<void> | void;
  initializeMobileSupabase?: (credentials: MobileVaultCredentials) => Promise<void> | void;
  initializeSQLiteCache?: (credentials: MobileVaultCredentials) => Promise<void> | void;
  onComplete?: () => void;
};

function fromBase64Url(value: string): ArrayBuffer {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (value.length % 4)) % 4);
  const binary = globalThis.atob(normalized);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes.buffer;
}

function decodeEnvelope(value: string): { v: string; i: string; k: string; c: string } {
  if (!value.startsWith(RELAY_PREFIX)) throw new Error('This is not a GraceOS relay code.');
  let envelope: Partial<{ v: string; i: string; k: string; c: string }>;
  try {
    envelope = JSON.parse(new TextDecoder().decode(fromBase64Url(value.slice(RELAY_PREFIX.length))));
  } catch {
    throw new Error('The relay code is malformed.');
  }
  if (envelope.v !== RELAY_VERSION || !envelope.i || !envelope.k || !envelope.c) throw new Error('Unsupported or incomplete relay code.');
  return { v: envelope.v, i: envelope.i, k: envelope.k, c: envelope.c };
}

async function sha256Base64Url(value: string) {
  const digest = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  let binary = '';
  new Uint8Array(digest).forEach((byte) => { binary += String.fromCharCode(byte); });
  return globalThis.btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

async function notifyHaptics(type: NotificationType) {
  try {
    await Haptics.notification({ type });
  } catch {
    // Haptics are optional and may be unavailable in web or unsupported environments.
  }
}

async function decryptRelayPayload(value: string): Promise<MobileVaultCredentials> {
  const envelope = decodeEnvelope(value);
  const key = await globalThis.crypto.subtle.importKey('raw', fromBase64Url(envelope.k), { name: 'AES-GCM' }, false, ['decrypt']);
  const plaintext = await globalThis.crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromBase64Url(envelope.i) }, key, fromBase64Url(envelope.c));
  const credentials = JSON.parse(new TextDecoder().decode(plaintext)) as MobileVaultCredentials;
  const createdAt = Date.parse(credentials.createdAt);
  if (!/^https:\/\/[^\s/]+/.test(credentials.url) || !credentials.anonKey || !credentials.churchId || !credentials.signature) throw new Error('The relay credentials are incomplete.');
  if (!Number.isFinite(createdAt) || Date.now() - createdAt > MAX_AGE_MS || Date.now() < createdAt - 30_000) throw new Error('This relay code has expired. Generate a new code on the desktop.');
  const unsigned = { url: credentials.url, anonKey: credentials.anonKey, churchId: credentials.churchId, createdAt: credentials.createdAt };
  if (credentials.signature !== await sha256Base64Url(JSON.stringify(unsigned))) throw new Error('Relay signature validation failed.');
  return credentials;
}

export async function hasMobileVaultCredentials() {
  try {
    return typeof globalThis.localStorage !== 'undefined' && Boolean(globalThis.localStorage.getItem(CREDENTIALS_KEY));
  } catch {
    return false;
  }
}

export default function MobilePairingScanner({ onPaired, initializeMobileSupabase, initializeSQLiteCache, onComplete }: MobilePairingScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const processingRef = useRef(false);
  const mountedRef = useRef(true);
  const [manualCode, setManualCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [scanned, setScanned] = useState(false);

  const stopScanner = useCallback(async () => {
    const scanner = scannerRef.current;
    if (!scanner) return;
    scannerRef.current = null;
    if (scanner.isScanning) await scanner.stop().catch(() => undefined);
    try {
      scanner.clear();
    } catch {
      // Scanner cleanup is best-effort.
    }
  }, []);

  const finishPairing = useCallback(async (relayPayload: string): Promise<boolean> => {
    if (processingRef.current) return false;
    processingRef.current = true;
    setBusy(true);
    setError('');
    await stopScanner();
    try {
      const credentials = await decryptRelayPayload(relayPayload);
      localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(credentials));
      await initializeMobileSupabase?.(credentials); await initializeSQLiteCache?.(credentials); await onPaired?.(credentials);
      await notifyHaptics(NotificationType.Success); onComplete?.();
      return true;
    } catch (cause) {
      if (mountedRef.current) {
        setScanned(false); setError(cause instanceof Error ? cause.message : 'Pairing failed.');
      }
      await notifyHaptics(NotificationType.Error);
      return false;
    } finally {
      processingRef.current = false;
      if (mountedRef.current) setBusy(false);
    }
  }, [initializeMobileSupabase, initializeSQLiteCache, onComplete, onPaired, stopScanner]);

  useEffect(() => {
    mountedRef.current = true;
    if (busy || scanned) return () => { mountedRef.current = false; };

    const scanner = new Html5Qrcode('mobile-pairing-qr-reader');
    scannerRef.current = scanner;
    let cancelled = false;
    scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      (data) => { setScanned(true); void finishPairing(data); },
      () => undefined,
    ).catch((cause) => {
      if (!cancelled && mountedRef.current) setError(cause instanceof Error ? cause.message : 'Unable to access the camera.');
    });

    return () => {
      cancelled = true;
      void stopScanner();
    };
  }, [busy, finishPairing, scanned, stopScanner]);

  useEffect(() => () => {
    mountedRef.current = false;
    void stopScanner();
  }, [stopScanner]);

  const resolveManualCode = async () => {
    if (!/^\d{6}$/.test(manualCode)) { setError('Enter the 6-digit pairing code.'); return; }
    if (processingRef.current) return;
    setError('');
    try {
      const env = (import.meta as ImportMeta & { env: Record<string, string | undefined> }).env;
      const configuredUrl = env.VITE_SUPABASE_URL; const configuredAnonKey = env.VITE_SUPABASE_ANON_KEY;
      if (!configuredUrl || !configuredAnonKey) throw new Error('Online pairing is not configured in this mobile build. Use the offline QR scanner.');
      const response = await fetch(`${configuredUrl.replace(/\/$/, '')}/rest/v1/ephemeral_pair_codes?code=eq.${manualCode}&select=relay_payload,expires_at,used_at&limit=1`, { headers: { apikey: configuredAnonKey, Authorization: `Bearer ${configuredAnonKey}` } });
      if (!response.ok) throw new Error(`Pairing lookup failed (${response.status}).`);
      const rows = await response.json(); const row = rows[0];
      if (!row?.relay_payload || row.used_at || Date.parse(row.expires_at) <= Date.now()) throw new Error('That pairing code is invalid or expired.');
      const paired = await finishPairing(row.relay_payload);
      if (paired) {
        const consumeResponse = await fetch(`${configuredUrl.replace(/\/$/, '')}/rest/v1/ephemeral_pair_codes?code=eq.${manualCode}&used_at=is.null`, { method: 'PATCH', headers: { apikey: configuredAnonKey, Authorization: `Bearer ${configuredAnonKey}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' }, body: JSON.stringify({ used_at: new Date().toISOString() }) });
        if (!consumeResponse.ok) throw new Error(`Pairing code could not be marked as used (${consumeResponse.status}).`);
      }
    } catch (cause) {
      if (mountedRef.current) setError(cause instanceof Error ? cause.message : 'Pairing lookup failed.');
      setBusy(false);
    }
  };

  return <div className="flex min-h-full flex-col justify-center gap-4 bg-slate-950 p-6 text-center">
    {busy && <div className="text-cyan-300">Securing this mobile terminal…</div>}
    {!busy && <><h2 className="text-2xl font-extrabold text-slate-50">Pair your GraceOS Mobile App</h2><p className="text-sm text-slate-400">Scan the encrypted relay QR shown in Desktop Settings → Mobile App Relay.</p><div id="mobile-pairing-qr-reader" className={`min-h-[300px] overflow-hidden rounded-3xl bg-black ${scanned ? 'hidden' : ''}`} /><p className="text-xs text-slate-500">Camera unavailable? Enter the 6-digit online code.</p><div className="flex gap-2"><input value={manualCode} onChange={(event) => setManualCode(event.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" maxLength={6} placeholder="000000" className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-center text-xl tracking-[0.35em] text-white" /><button type="button" onClick={() => void resolveManualCode()} className="rounded-xl bg-cyan-500 px-5 py-3 font-extrabold text-slate-950">Pair</button></div>{!!error && <p className="text-sm text-rose-300">{error}</p>}</>}
  </div>;
}

export { decryptRelayPayload };