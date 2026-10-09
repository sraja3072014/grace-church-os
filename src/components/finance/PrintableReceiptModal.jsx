import React, { useMemo } from 'react';
import { Printer, X, ShieldCheck } from 'lucide-react';

export default function PrintableReceiptModal({ transaction, churchInfo, onClose, onSendReceipt }) {
  const resolvedChurchInfo = useMemo(() => {
    if (churchInfo) return churchInfo;

    try {
      return JSON.parse(localStorage.getItem('graceos_main_church') || '{}');
    } catch {
      return {};
    }
  }, [churchInfo]);

  if (!transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  const amount = Number(transaction.amount || 0);
  const formattedAmount = (Number.isFinite(amount) ? amount : 0).toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR'
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto print:fixed print:inset-0 print:bg-white print:p-0 print:block print:overflow-visible">
      {/* Print Trigger Bar - экранда ғана көрінеді, басып шығарылмайды */}
      <div className="fixed top-5 right-5 flex items-center gap-3 print:hidden z-50">
        {onSendReceipt && (
          <button
            type="button"
            onClick={onSendReceipt}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center gap-2 shadow-lg transition cursor-pointer text-sm"
          >
            <span>Send WhatsApp Receipt</span>
          </button>
        )}
        <button
          type="button"
          onClick={handlePrint}
          className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition cursor-pointer text-sm"
        >
          <Printer size={16} />
          <span>பிரிண்ட் செய் / PDF சேமி (Print)</span>
        </button>
        <button
          type="button"
          onClick={onClose}
          className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition cursor-pointer"
          aria-label="Close receipt"
        >
          <X size={18} />
        </button>
      </div>

      {/* A4 Sheet Preview Wrapper */}
      <div className="bg-white text-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl p-8 sm:p-12 print:shadow-none print:m-0 print:p-6 print:w-full print:max-w-none print:rounded-none">
        {/* Church Header */}
        <div className="border-b-2 border-slate-900 pb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
              {resolvedChurchInfo.churchName || 'Grace Central Cathedral'}
            </h1>
            <p className="text-xs text-slate-600 mt-1 max-w-md">
              {resolvedChurchInfo.address || '123 Cathedral Road, Main Campus'} • Phone: {resolvedChurchInfo.phone || '+91 98765 43210'}
            </p>
            {(resolvedChurchInfo.regNo || resolvedChurchInfo.trustRegNo) && (
              <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                Trust Reg No: {resolvedChurchInfo.regNo || resolvedChurchInfo.trustRegNo} | 80G Approval: {resolvedChurchInfo.taxExemptNo || resolvedChurchInfo.it80GOrder || 'CIT/EXEMP/80G/2026'}
              </p>
            )}
          </div>
          <div className="text-right shrink-0">
            <span className="px-3 py-1 bg-slate-100 border border-slate-300 text-[11px] font-bold uppercase rounded-md tracking-wider">
              Official Receipt
            </span>
            <div className="text-xs font-mono text-slate-500 mt-2">
              Receipt #: <span className="font-bold text-slate-900">{transaction.id || 'TXN-001'}</span>
            </div>
          </div>
        </div>

        {/* Receipt Details Grid */}
        <div className="grid grid-cols-2 gap-6 my-6 text-xs">
          <div>
            <span className="text-slate-500 block uppercase text-[10px] font-semibold">நன்கொடையாளர் / விசுவாசி பெயர்</span>
            <span className="text-base font-bold text-slate-900 block mt-0.5">
              {transaction.donorName || transaction.contributor || transaction.member || 'Anonymous Contributor'}
            </span>
            {(transaction.donorPhone || transaction.contactPhone || transaction.phone) && (
              <span className="text-slate-600 block mt-0.5 font-mono">{transaction.donorPhone || transaction.contactPhone || transaction.phone}</span>
            )}
            {(transaction.panNo || transaction.panNumber) && (
              <span className="text-slate-600 block mt-0.5 font-mono">PAN: {transaction.panNo || transaction.panNumber}</span>
            )}
          </div>
          <div className="text-right">
            <span className="text-slate-500 block uppercase text-[10px] font-semibold">தேதி &amp; நேரம்</span>
            <span className="text-sm font-semibold text-slate-900 block mt-0.5">
              {transaction.date || new Date().toISOString().slice(0, 10)}
            </span>
            <span className="text-slate-500 text-[10px] block mt-0.5">
              பணம் செலுத்திய முறை: <b className="text-slate-800">{transaction.paymentMode || transaction.mode || 'Cash'}</b>
            </span>
          </div>
        </div>

        {/* Category Breakdown Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden my-6">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-700">
              <tr>
                <th className="py-2.5 px-4">விவரம் (Description)</th>
                <th className="py-2.5 px-4">பிரிவு (Category)</th>
                <th className="py-2.5 px-4 text-right">தொகை (Amount)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-3 px-4 text-slate-800">
                  {transaction.notes || transaction.description || transaction.category || 'சபை ஆராதனை காணிக்கை / தசமபாகம்'}
                </td>
                <td className="py-3 px-4 font-semibold text-slate-700">
                  {transaction.category || 'Tithe'}
                </td>
                <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                  {formattedAmount}
                </td>
              </tr>
            </tbody>
            <tfoot className="bg-slate-50 font-bold border-t border-slate-200 text-slate-900">
              <tr>
                <td colSpan="2" className="py-3 px-4 text-right">மொத்த தொகை (Total Received):</td>
                <td className="py-3 px-4 text-right font-mono text-sm">{formattedAmount}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Footer & Signatures */}
        <div className="pt-8 border-t border-slate-200 grid grid-cols-2 items-end gap-4">
          <div className="space-y-1 text-[11px] text-slate-500">
            <p className="flex items-center gap-1 text-emerald-700 font-semibold">
              <ShieldCheck size={14} /> கணினி வழி உருவாக்கப்பட்ட அதிகாரப்பூர்வ ரசீது.
            </p>
            <p>கர்த்தர் உற்சாகமாய் கொடுக்கிறவனிடத்தில் பிரியமாயிருக்கிறார். (2 கொரி 9:7)</p>
          </div>
          <div className="text-right space-y-12">
            <span className="block text-[11px] text-slate-500">பொருளாளர் / அங்கீகரிக்கப்பட்ட கையொப்பம்</span>
            <div className="border-t border-dashed border-slate-400 w-44 ml-auto pt-1 text-[10px] text-slate-400">
              Authorized Signature
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
