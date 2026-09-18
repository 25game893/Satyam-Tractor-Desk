import React from 'react';
import { Invoice, PaymentRecord, Customer, ShowroomSettings, PaymentMode } from '../../types';
import { X } from 'lucide-react';

interface VoucherRendererProps {
  invoice: Invoice;
  payment: PaymentRecord;
  customer?: Customer;
  settings: ShowroomSettings;
  id?: string;
}

const VoucherRenderer: React.FC<VoucherRendererProps> = ({ invoice, payment, customer, settings, id = "voucher-pdf-content" }) => {
  const numberToWords = (num: number): string => {
    const a = ['', 'one ', 'two ', 'three ', 'four ', 'five ', 'six ', 'seven ', 'eight ', 'nine ', 'ten ', 'eleven ', 'twelve ', 'thirteen ', 'fourteen ', 'fifteen ', 'sixteen ', 'seventeen ', 'eighteen ', 'nineteen '];
    const b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
    const regex = new RegExp(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    
    const numStr = Math.floor(num).toString();
    if (numStr.length > 9) return 'OVERFLOW';
    const n = ('000000000' + numStr).substr(-9).match(regex);
    if (!n) return '';
    
    let str = '';
    str += (Number(n[1]) !== 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'crore ' : '';
    str += (Number(n[2]) !== 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'lakh ' : '';
    str += (Number(n[3]) !== 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'thousand ' : '';
    str += (Number(n[4]) !== 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'hundred ' : '';
    str += (Number(n[5]) !== 0) ? ((str !== '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + 'only ' : '';
    return str.toUpperCase();
  };

  const SingleVoucher = ({ copyType }: { copyType: string }) => (
    <div className="bg-white text-slate-900 p-8 border border-slate-300 font-sans text-[10px] relative shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-6 mb-4 border-b border-slate-200 pb-4">
        <div className="w-20 h-20 bg-white border border-slate-100 p-2 rounded-2xl shadow-sm flex items-center justify-center overflow-hidden shrink-0">
          <img src={settings.logoUrl} className="w-full h-full object-contain" alt="Logo" />
        </div>
        <div className="flex-1 text-center">
          <h2 className="text-2xl font-black text-hw-accent uppercase tracking-tight mb-1">{settings.name}</h2>
          <p className="text-[9px] font-bold text-slate-600 uppercase leading-tight mb-1">{settings.address}</p>
          <p className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Mobile No. - {settings.phone}</p>
        </div>
      </div>

      <div className="text-center mb-6">
        <h3 className="inline-block border-b-2 border-slate-900 font-black uppercase tracking-[0.3em] text-xs pb-0.5">Received Voucher</h3>
      </div>

      {/* Info Row 1 */}
      <div className="flex justify-between mb-4 font-black uppercase text-[11px] tracking-tight">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Vr No.</span> 
          <span className="bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">{payment.id.toUpperCase().substr(0, 8)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Date</span> 
          <span className="bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">{new Date(payment.date).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
        </div>
      </div>

      {/* Main Table */}
      <div className="border-2 border-slate-900 rounded-2xl overflow-hidden mb-6 shadow-sm">
        <div className="grid grid-cols-4 border-b-2 border-slate-900">
          <div className="col-span-1 p-3 border-r-2 border-slate-900 bg-slate-50 font-black uppercase text-slate-500">Received From</div>
          <div className="col-span-2 p-3 border-r-2 border-slate-900 font-black uppercase text-slate-900 text-sm">{customer?.name}</div>
          <div className="col-span-1 p-3 flex flex-col justify-center bg-slate-50">
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Mobile No</span>
            <span className="font-black text-slate-900">{customer?.mobile}</span>
          </div>
        </div>
        <div className="grid grid-cols-4 border-b-2 border-slate-900">
          <div className="col-span-1 p-3 border-r-2 border-slate-900 bg-slate-50 font-black uppercase text-slate-500">Father Name</div>
          <div className="col-span-3 p-3 font-black uppercase text-slate-900">{customer?.sog || '-'}</div>
        </div>
        <div className="grid grid-cols-4 border-b-2 border-slate-900">
          <div className="col-span-1 p-3 border-r-2 border-slate-900 bg-slate-50 font-black uppercase text-slate-500">Address</div>
          <div className="col-span-3 p-3 font-black uppercase text-slate-900">{customer?.village}, {customer?.tehsil}</div>
        </div>
        <div className="grid grid-cols-4">
          <div className="col-span-1 p-3 border-r-2 border-slate-900 bg-slate-50 font-black uppercase text-slate-500">Finance From</div>
          <div className="col-span-3 p-3 font-black uppercase text-hw-accent">{invoice.hypo || 'Self Finance'}</div>
        </div>
      </div>

      {/* Amount Table */}
      <div className="border-2 border-slate-900 rounded-2xl overflow-hidden mb-6 shadow-md">
        <div className="grid grid-cols-4 border-b-2 border-slate-900 bg-slate-900 text-white">
          <div className="col-span-3 p-3 border-r-2 border-slate-800 font-black uppercase text-center tracking-[0.2em]">Being Amount Received</div>
          <div className="col-span-1 p-3 font-black uppercase text-center tracking-[0.2em]">Amount (₹)</div>
        </div>
        <div className="grid grid-cols-4 min-h-[80px]">
          <div className="col-span-3 p-4 border-r-2 border-slate-900 font-bold uppercase italic text-slate-600 leading-relaxed">
            {payment.particulars || `Payment received towards purchase of asset against Invoice #${invoice.invoiceNo}.`}
          </div>
          <div className="col-span-1 p-4 font-black text-right text-2xl tracking-tighter flex items-center justify-end text-slate-900">
            {payment.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Footer Details */}
      <div className="space-y-4 mb-10 bg-slate-50 p-6 rounded-2xl border border-slate-100">
        <div className="flex items-center gap-6">
          <span className="font-black uppercase text-slate-400 w-32 shrink-0">Mode of Payment</span>
          <span className="font-black uppercase text-slate-900 bg-white px-4 py-1.5 rounded-lg border border-slate-200 shadow-sm">{payment.mode}</span>
        </div>
        <div className="flex items-center gap-6">
          <span className="font-black uppercase text-slate-400 w-32 shrink-0">Ref / Instrument No.</span>
          <div className="flex-1 border-b-2 border-dotted border-slate-300 font-black uppercase text-slate-900 pb-1">
             {payment.mode === PaymentMode.CASH ? 'CASH TRANSACTION' : (payment.id.toUpperCase().substr(0, 10))}
          </div>
          <span className="font-black uppercase text-slate-400">Of</span>
          <div className="flex-1 border-b-2 border-dotted border-slate-300 font-black uppercase text-slate-900 pb-1 text-center">
            {payment.mode === PaymentMode.CASH ? '-' : 'BANK RECORD'}
          </div>
        </div>
        <div className="flex items-start gap-6">
          <span className="font-black uppercase text-slate-400 w-32 shrink-0">Rupees in Words</span>
          <span className="flex-1 font-black uppercase italic text-slate-900 leading-tight">{numberToWords(payment.amount)}</span>
        </div>
      </div>

      {/* Signatures */}
      <div className="flex justify-between items-end mt-16">
        <div className="text-center">
          <div className="w-40 border-t-2 border-slate-900 mb-2"></div>
          <p className="font-black uppercase text-[9px] text-slate-400 tracking-widest">Prepared By</p>
        </div>
        <div className="text-center">
          <div className="w-40 h-16 border-2 border-slate-200 rounded-xl mb-2 flex items-center justify-center relative group">
             <div className="absolute inset-2 border border-slate-100 rounded-lg opacity-50"></div>
             <span className="text-[9px] text-slate-200 font-black uppercase tracking-widest">Official Seal</span>
          </div>
          <p className="font-black uppercase text-[9px] text-slate-900 tracking-widest">Authorized Receiver</p>
        </div>
      </div>

      {/* Copy Indicator */}
      <div className="absolute top-6 right-6 text-[9px] font-black uppercase text-white bg-slate-900 px-4 py-1.5 rounded-full shadow-lg tracking-[0.2em]">
        {copyType}
      </div>
    </div>
  );

  return (
    <div id={id} className="max-w-[950px] mx-auto space-y-12 print:space-y-8 bg-white p-4">
      <SingleVoucher copyType="Office Copy" />
      <div className="border-t-2 border-dashed border-slate-300 relative no-print">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 py-1 rounded-full border border-slate-200 text-[10px] font-black uppercase text-slate-400 flex items-center gap-2">
          <X size={12} /> Cut Along This Line
        </div>
      </div>
      <SingleVoucher copyType="Customer Copy" />
    </div>
  );
};

export default VoucherRenderer;
