import React, { useEffect, useMemo, useState } from 'react';
import { Heart, Printer, Receipt, ShieldCheck, Wallet } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { getSupabase } from '../../utils/supabaseClient';
import { getVaultData, setVaultData } from '../../utils/vaultStore';

const GIVING_CATEGORIES = [
  { value: 'TITHE', label: 'Tithe' },
  { value: 'OFFERING', label: 'Offering' },
  { value: 'MISSIONS', label: 'Missions' },
  { value: 'BUILDING_FUND', label: 'Building Fund' }
];

const PAYMENT_MODES = ['UPI', 'CASH', 'BANK_TRANSFER'];

function isVerifiedVpa(value) {
  return /^[\w.-]+@[\w.-]+$/.test(String(value || '').trim());
}

function findVerifiedChurchVpa(church, accounts) {
  const explicitlyVerified = church?.verifiedChurchVpa
    || ((church?.upiVerified === true || church?.isUpiVerified === true)
      ? (church.upiVpa || church.upiId)
      : '');
  if (isVerifiedVpa(explicitlyVerified)) return String(explicitlyVerified).trim();

  const verifiedAccount = (Array.isArray(accounts) ? accounts : []).find((account) => (
    account?.verified === true
    || account?.isVerified === true
    || account?.is_verified === true
    || String(account?.status || '').toUpperCase() === 'VERIFIED'
  ));
  const accountVpa = verifiedAccount?.upiId || verifiedAccount?.upi_id;
  return isVerifiedVpa(accountVpa) ? String(accountVpa).trim() : '';
}

function receiptIdentity(record) {
  return record.id || record.receipt_no || 'Giving receipt';
}

export default function MemberGivingPortal({ currentUser }) {
  const [activeTab, setActiveTab] = useState('give');
  const [givingRecords, setGivingRecords] = useState([]);
  const [verifiedChurchVpa, setVerifiedChurchVpa] = useState('');
  const [churchName, setChurchName] = useState('Grace Church');
  const [currencySymbol, setCurrencySymbol] = useState('₹');
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [form, setForm] = useState({
    amount: '',
    category: 'TITHE',
    paymentMode: 'UPI',
    transactionReference: ''
  });

  const memberId = currentUser?.id ?? null;
  const memberPhone = currentUser?.phone ?? '';
  const memberName = currentUser?.name || currentUser?.full_name || currentUser?.username || 'Church Member';

  const refreshPortalData = async () => {
    const [transactions, church, accounts] = await Promise.all([
      getVaultData('finance', []),
      getVaultData('church', {}),
      getVaultData('bank_accounts', [])
    ]);
    const records = Array.isArray(transactions) ? transactions : [];
    setGivingRecords(records.filter((record) => record && (
      (memberId !== null && record.member_id === memberId)
      || (Boolean(memberPhone) && (record.phone || record.donor_phone) === memberPhone)
    )));
    setChurchName(church?.churchName || church?.name || 'Grace Church');
    setVerifiedChurchVpa(findVerifiedChurchVpa(church, accounts));

    try {
      const locale = JSON.parse(localStorage.getItem('graceos_locale_config') || '{}');
      setCurrencySymbol(locale.currencySymbol || '₹');
    } catch (error) {
      console.warn('[MemberGivingPortal] Could not read currency settings:', error);
    }
  };

  useEffect(() => {
    refreshPortalData();
    const refresh = () => refreshPortalData();
    window.addEventListener('storage', refresh);
    return () => window.removeEventListener('storage', refresh);
  }, [memberId, memberPhone]);

  const upiQrValue = useMemo(() => {
    if (!verifiedChurchVpa) return '';
    const query = new URLSearchParams({
      pa: verifiedChurchVpa,
      pn: churchName,
      cu: 'INR'
    });
    const amount = Number(form.amount);
    if (Number.isFinite(amount) && amount > 0) query.set('am', amount.toFixed(2));
    return `upi://pay?${query.toString()}`;
  }, [verifiedChurchVpa, churchName, form.amount]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setNotice('');
    setErrorMessage('');

    const amount = Number(form.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setErrorMessage('Enter a contribution amount greater than zero.');
      return;
    }
    if (memberId === null && !memberPhone) {
      setErrorMessage('Your profile is missing a member ID and phone number. Update your profile before submitting a contribution.');
      return;
    }
    if (form.paymentMode === 'UPI' && !form.transactionReference.trim()) {
      setErrorMessage('Enter the UPI transaction reference / UTR to submit a UPI contribution.');
      return;
    }

    setIsSubmitting(true);
    const now = new Date();
    const transactionReference = form.transactionReference.trim();
    const newGiving = {
      id: `GFT-${now.getTime()}`,
      receipt_no: `GFT-${now.getTime()}`,
      member_id: memberId,
      member: memberName,
      donor_name: memberName,
      phone: memberPhone,
      category: form.category,
      amount,
      mode: form.paymentMode,
      paymentMode: form.paymentMode,
      transaction_reference: transactionReference,
      utr: transactionReference,
      status: 'PENDING_RECONCILIATION',
      date: now.toISOString(),
      record_date: now.toISOString().slice(0, 10),
      campus: currentUser?.campus || currentUser?.activeCampus || 'Headquarters'
    };

    try {
      const latestTransactions = await getVaultData('finance', []);
      const updatedTransactions = [
        newGiving,
        ...(Array.isArray(latestTransactions) ? latestTransactions : [])
      ];
      await setVaultData('finance', updatedTransactions, false);
      setGivingRecords((current) => [newGiving, ...current]);

      const supabase = getSupabase();
      if (supabase && navigator.onLine) {
        const { error } = await supabase.from('finance').upsert({
          id: newGiving.id,
          receipt_no: newGiving.receipt_no,
          member_id: newGiving.member_id,
          donor_name: newGiving.donor_name,
          donor_phone: newGiving.phone,
          category: newGiving.category,
          amount: newGiving.amount,
          payment_mode: newGiving.mode,
          transaction_reference: newGiving.transaction_reference,
          status: newGiving.status,
          campus: newGiving.campus,
          record_date: newGiving.record_date,
          updated_at: now.toISOString()
        }, { onConflict: 'id' });

        if (error) throw error;
        setNotice('Contribution submitted. It will appear as pending until reconciled by the church finance team.');
      } else {
        setNotice('Contribution saved on this device. Cloud reconciliation will resume when you are online and connected.');
      }

      setForm({ amount: '', category: 'TITHE', paymentMode: 'UPI', transactionReference: '' });
    } catch (error) {
      console.error('[MemberGivingPortal] Contribution could not be synced:', error);
      setErrorMessage(`Your contribution is saved locally, but cloud sync failed: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryLabel = (category) => (
    GIVING_CATEGORIES.find((option) => option.value === category)?.label || category || 'Contribution'
  );

  return (
    <div className="flex flex-col gap-6 pb-16 text-slate-100">
      <header className="print:hidden flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-black text-white">
            <Heart className="text-rose-400" size={24} />
            My Giving
          </h1>
          <p className="mt-1 text-xs text-slate-400">Submit a contribution and view only your personal giving receipts.</p>
        </div>
        <div className="flex gap-2 rounded-xl border border-white/10 bg-black/30 p-1">
          <button type="button" onClick={() => setActiveTab('give')} className={`rounded-lg px-4 py-2 text-xs font-bold ${activeTab === 'give' ? 'bg-emerald-400 text-slate-950' : 'text-slate-300 hover:bg-white/10'}`}>
            Give Online
          </button>
          <button type="button" onClick={() => setActiveTab('receipts')} className={`rounded-lg px-4 py-2 text-xs font-bold ${activeTab === 'receipts' ? 'bg-emerald-400 text-slate-950' : 'text-slate-300 hover:bg-white/10'}`}>
            My Giving Receipts
          </button>
        </div>
      </header>

      {notice && <p role="status" className="print:hidden rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-xs text-emerald-200">{notice}</p>}
      {errorMessage && <p role="alert" className="print:hidden rounded-xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-xs text-rose-200">{errorMessage}</p>}

      {activeTab === 'give' ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.7fr)]">
          <section className="win11-card rounded-3xl border border-white/10 p-6">
            <h2 className="mb-5 flex items-center gap-2 text-sm font-bold text-white">
              <Wallet size={17} className="text-emerald-300" />
              Contribution details
            </h2>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <label className="text-xs font-semibold text-slate-300">
                Amount ({currencySymbol})
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  value={form.amount}
                  onChange={(event) => setForm((previous) => ({ ...previous, amount: event.target.value }))}
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-emerald-400"
                />
              </label>
              <label className="text-xs font-semibold text-slate-300">
                Category
                <select
                  value={form.category}
                  onChange={(event) => setForm((previous) => ({ ...previous, category: event.target.value }))}
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-emerald-400"
                >
                  {GIVING_CATEGORIES.map((category) => <option key={category.value} value={category.value}>{category.label}</option>)}
                </select>
              </label>
              <label className="text-xs font-semibold text-slate-300">
                Payment mode
                <select
                  value={form.paymentMode}
                  onChange={(event) => setForm((previous) => ({ ...previous, paymentMode: event.target.value }))}
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-emerald-400"
                >
                  {PAYMENT_MODES.map((mode) => <option key={mode} value={mode}>{mode.replace('_', ' ')}</option>)}
                </select>
              </label>
              <label className="text-xs font-semibold text-slate-300">
                UPI transaction reference / UTR {form.paymentMode === 'UPI' && '*'}
                <input
                  type="text"
                  required={form.paymentMode === 'UPI'}
                  value={form.transactionReference}
                  onChange={(event) => setForm((previous) => ({ ...previous, transactionReference: event.target.value }))}
                  placeholder="Enter your UTR or reference"
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-emerald-400"
                />
              </label>
              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-400 px-5 py-3 text-xs font-black text-slate-950 transition hover:bg-emerald-300 disabled:cursor-wait disabled:opacity-60 sm:col-span-2"
              >
                <Heart size={15} />
                {isSubmitting ? 'Submitting…' : 'Submit contribution'}
              </button>
            </form>
            <p className="mt-4 flex items-start gap-2 text-[11px] leading-relaxed text-slate-400">
              <ShieldCheck size={15} className="mt-0.5 shrink-0 text-amber-300" />
              Contributions stay pending until reconciled by the church finance team. Keep your payment reference for follow-up.
            </p>
          </section>

          <aside className="win11-card flex flex-col items-center rounded-3xl border border-white/10 p-6 text-center">
            <div className="mb-3 rounded-xl bg-cyan-400/10 p-3 text-cyan-300"><Receipt size={22} /></div>
            <h2 className="text-sm font-bold text-white">Church UPI</h2>
            {verifiedChurchVpa ? (
              <>
                <p className="mt-1 text-xs text-slate-400">{churchName}</p>
                <div className="mt-4 rounded-2xl bg-white p-3">
                  <QRCodeCanvas value={upiQrValue} size={190} level="M" includeMargin />
                </div>
                <p className="mt-3 break-all font-mono text-sm font-bold text-cyan-200">{verifiedChurchVpa}</p>
                <p className="mt-1 text-[10px] text-slate-500">Verified church VPA • QR amount follows the form amount</p>
              </>
            ) : (
              <p role="status" className="mt-3 max-w-xs text-xs leading-relaxed text-amber-200">
                No verified Church VPA is configured. Please contact the church finance team for a verified payment destination.
              </p>
            )}
          </aside>
        </div>
      ) : (
        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(300px,0.8fr)]">
          <div className="win11-card print:hidden overflow-hidden rounded-3xl border border-white/10">
            <div className="border-b border-white/10 px-5 py-4">
              <h2 className="text-sm font-bold text-white">My Giving Receipts</h2>
              <p className="mt-1 text-[11px] text-slate-400">{givingRecords.length} personal contribution{givingRecords.length === 1 ? '' : 's'}</p>
            </div>
            {givingRecords.length ? (
              <div className="divide-y divide-white/5">
                {givingRecords.map((record) => (
                  <button
                    key={record.id || record.receipt_no}
                    type="button"
                    onClick={() => setSelectedReceipt(record)}
                    className={`flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-white/5 ${selectedReceipt === record ? 'bg-white/5' : ''}`}
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-xs font-bold text-white">{getCategoryLabel(record.category)}</span>
                      <span className="mt-1 block font-mono text-[10px] text-slate-400">{record.date || record.record_date || 'Date unavailable'} · {receiptIdentity(record)}</span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block text-xs font-bold text-emerald-300">{currencySymbol} {Number(record.amount || 0).toLocaleString()}</span>
                      <span className="mt-1 block text-[9px] uppercase text-amber-200">{String(record.status || 'PENDING_RECONCILIATION').replaceAll('_', ' ')}</span>
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="px-5 py-8 text-center text-xs text-slate-400">No personal giving receipts are available yet.</p>
            )}
          </div>

          <div className="win11-card rounded-3xl border border-white/10 p-5">
            {selectedReceipt ? (
              <div className="rounded-2xl border border-slate-300 bg-white p-6 text-slate-900 print:border-0 print:p-0">
                <div className="text-center">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700">{churchName}</p>
                  <h3 className="mt-2 text-xl font-black">Giving receipt</h3>
                  <p className="mt-1 font-mono text-xs">{receiptIdentity(selectedReceipt)}</p>
                </div>
                <dl className="mt-6 space-y-3 border-t border-slate-200 pt-4 text-xs">
                  <div className="flex justify-between gap-4"><dt className="text-slate-500">Contributor</dt><dd className="text-right font-semibold">{memberName}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-slate-500">Category</dt><dd className="text-right font-semibold">{getCategoryLabel(selectedReceipt.category)}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-slate-500">Date</dt><dd className="text-right font-semibold">{selectedReceipt.date || selectedReceipt.record_date || 'Date unavailable'}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-slate-500">Reference</dt><dd className="break-all text-right font-mono font-semibold">{selectedReceipt.transaction_reference || selectedReceipt.utr || selectedReceipt.receipt_no || '—'}</dd></div>
                  <div className="flex justify-between gap-4 border-t border-slate-200 pt-3"><dt className="font-bold">Amount</dt><dd className="text-right text-base font-black">{currencySymbol} {Number(selectedReceipt.amount || 0).toLocaleString()}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-slate-500">Status</dt><dd className="text-right font-semibold">{String(selectedReceipt.status || 'PENDING_RECONCILIATION').replaceAll('_', ' ')}</dd></div>
                </dl>
                <p className="mt-5 text-center text-[9px] text-slate-500">Digital acknowledgement. Tax exemption certificate is issued separately when applicable.</p>
                <button type="button" onClick={() => window.print()} className="print:hidden mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white">
                  <Printer size={14} /> Print receipt
                </button>
              </div>
            ) : (
              <p className="py-12 text-center text-xs text-slate-400">Select one of your receipts to preview or print it.</p>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
