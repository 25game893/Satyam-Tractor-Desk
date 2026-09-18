import React from 'react';
import { Invoice, Customer, Tractor, ShowroomSettings, TractorModel } from '../../types';
import { FileText, MapPin, Phone, Truck, ShieldCheck, Zap } from 'lucide-react';

interface DocumentHeaderProps {
  settings: ShowroomSettings;
  title: string;
  colorClass: string;
  subtitle?: string;
}

const DocumentHeader: React.FC<DocumentHeaderProps> = ({ settings, title, colorClass, subtitle }) => (
  <div className="flex items-center gap-10 mb-12 border-b-4 border-slate-900 pb-10">
    <div className="w-32 h-32 bg-white border-2 border-slate-100 p-3 rounded-[2.5rem] shadow-xl flex items-center justify-center overflow-hidden shrink-0 transform -rotate-3">
      <img src={settings.logoUrl} className="w-full h-full object-contain" alt="Logo" />
    </div>
    <div className="flex-1">
      <div className="flex justify-between items-start mb-3">
        <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter leading-none">{settings.name}</h2>
        <div className={`${colorClass} text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] shadow-lg`}>
          {title}
        </div>
      </div>
      <p className="text-[11px] font-bold text-slate-500 uppercase leading-tight mb-3 max-w-2xl">{settings.address}</p>
      <div className="flex gap-6 text-[11px] font-black text-slate-900 uppercase tracking-widest">
        <span className="flex items-center gap-2"><Phone size={14} className="text-hw-accent" /> {settings.phone}</span>
        {subtitle && <span className="flex items-center gap-2 text-hw-accent"><ShieldCheck size={14} /> {subtitle}</span>}
      </div>
    </div>
  </div>
);

interface InvoiceRendererProps {
  inv: Invoice;
  customers: Customer[];
  tractors: Tractor[];
  catalogModels: TractorModel[];
  settings: ShowroomSettings;
  id?: string;
}

const InvoiceRenderer: React.FC<InvoiceRendererProps> = ({ inv, customers, tractors, catalogModels, settings, id = "invoice-pdf-content" }) => {
  const cust = customers.find(c => c.id === inv.customerId);
  const tractor = tractors.find(t => t.id === inv.tractorId);
  const model = catalogModels.find(m => m.name === tractor?.modelName);

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

  return (
    <div id={id} className="bg-white text-black p-6 sm:p-10 max-w-[950px] mx-auto font-sans text-[11px] leading-tight border border-slate-300 shadow-lg print:shadow-none print:border-none print:p-0">
      <div className="border border-slate-400 p-4">
        {/* Header Section */}
        <div className="flex items-start mb-4">
          <div className="w-32 shrink-0">
            <img src={settings.logoUrl} alt="Logo" className="w-24 h-auto object-contain" />
          </div>
          <div className="flex-1 text-center pr-32">
            <h1 className="text-2xl font-black text-[#4682B4] uppercase mb-1 tracking-tight">{settings.name}</h1>
            <p className="text-[10px] font-bold text-slate-800 mb-0.5">{settings.address}</p>
            <p className="text-[10px] font-bold text-slate-800">Mobile No. - {settings.phone}</p>
          </div>
        </div>

        <div className="flex justify-center mb-6">
          <div className="border border-slate-800 rounded-full px-12 py-1.5 font-bold text-xs shadow-sm">
            INVOICE
          </div>
        </div>

        {/* Bill Info Row */}
        <div className="border-t border-slate-300 pt-3 flex justify-between font-bold mb-6 px-2">
          <span>Bill No.: {inv.invoiceNo}</span>
          <span>Date : {new Date(inv.date).toLocaleDateString('en-GB')}</span>
        </div>

        {/* Customer Details Section */}
        <div className="grid grid-cols-12 gap-y-2 mb-6 px-2 border-t border-slate-200 pt-4">
          <div className="col-span-7 space-y-2">
            <div className="flex">
              <span className="font-bold w-20">Name</span>
              <span className="font-bold">: {cust?.name.toUpperCase()}</span>
            </div>
            <div className="flex">
              <span className="font-bold w-20">Mobile No</span>
              <span className="font-bold">: {cust?.mobile}</span>
            </div>
            <div className="flex">
              <span className="font-bold w-20">Address</span>
              <span className="font-bold">: {cust?.village.toUpperCase()}, {cust?.tehsil.toUpperCase()}</span>
            </div>
            {inv.placeOfSupply && (
              <div className="flex">
                <span className="font-bold w-20">Supply</span>
                <span className="font-bold">: {inv.placeOfSupply.toUpperCase()}</span>
              </div>
            )}
          </div>
          <div className="col-span-5 space-y-2 pl-10">
            <div className="flex">
              <span className="font-bold w-16">S/o, W/o</span>
              <span className="font-bold">: {cust?.sog || ''}</span>
            </div>
            <div className="flex">
              <span className="font-bold w-16">HPA</span>
              <span className="font-bold">: {inv.hypo || ''}</span>
            </div>
            {inv.salesExecutive && (
              <div className="flex">
                <span className="font-bold w-16">Sales Ex.</span>
                <span className="font-bold">: {inv.salesExecutive.toUpperCase()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Notes Section */}
        {inv.notes && (
          <div className="border border-slate-800 p-2 mb-6 bg-slate-50/50 mx-2">
            <p className="font-bold text-[10px] underline mb-1">Internal Notes:</p>
            <p className="text-[10px] italic">{inv.notes}</p>
          </div>
        )}

        {/* Product Table */}
        <table className="w-full border-collapse border border-slate-800">
          <thead>
            <tr className="font-bold text-[10px]">
              <th className="border border-slate-800 px-4 py-2 text-center">Description</th>
              <th className="border border-slate-800 px-2 py-2 text-center w-20">Qty</th>
              <th className="border border-slate-800 px-2 py-2 text-center w-32">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr className="text-[10px] align-top">
              <td className="border border-slate-800 px-4 py-4 space-y-2">
                <div className="flex font-black text-[#4682B4] border-b border-slate-100 pb-1 mb-2">Asset Details</div>
                <div className="flex"><span className="font-bold w-24">Model</span><span className="font-bold">: {tractor?.modelName}</span></div>
                <div className="flex"><span className="font-bold w-24">HP</span><span className="font-bold">: {tractor?.hp}</span></div>
                <div className="flex"><span className="font-bold w-24">Chassis No.</span><span className="font-bold">: {tractor?.chassisNo}</span></div>
                <div className="flex"><span className="font-bold w-24">Engine No.</span><span className="font-bold">: {tractor?.engineNo}</span></div>
                <div className="flex"><span className="font-bold w-24">Colour</span><span className="font-bold">: {tractor?.color}</span></div>
                
                {model && model.features && model.features.length > 0 && (
                  <div className="pt-4 mt-4 border-t border-slate-100">
                    <div className="flex font-black text-[#4682B4] border-b border-slate-100 pb-1 mb-2 uppercase tracking-tighter">Technical Features</div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                      {model.features.map((f, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-[8px] font-bold text-slate-700 uppercase">
                           <div className="w-1 h-1 bg-hw-accent rounded-full shrink-0"></div>
                           <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {inv.accessoriesDetail && inv.accessoriesDetail.length > 0 && (
                  <div className="pt-4 mt-4 border-t border-slate-100">
                    <div className="flex font-black text-[#4682B4] border-b border-slate-100 pb-1 mb-2">Detailed Accessories</div>
                    <div className="space-y-1.5">
                      {inv.accessoriesDetail.map((acc, idx) => (
                        <div key={acc.id} className="flex justify-between items-center text-[9px]">
                          <span className="font-bold opacity-75">{idx + 1}. {acc.name.toUpperCase()}</span>
                          <span className="font-mono font-black text-slate-600">₹{acc.amount.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </td>
              <td className="border border-slate-800 px-2 py-4 text-center font-bold">1</td>
              <td className="border border-slate-800 px-2 py-4 text-right font-bold pr-4">
                {inv.basicAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </td>
            </tr>
            
            {/* Calculation Box */}
            <tr className="text-[10px]">
              <td rowSpan={6} className="border border-slate-800"></td>
              <td className="border border-slate-800 px-2 py-1.5 font-bold">HYP</td>
              <td className="border border-slate-800 px-2 py-1.5 text-right font-bold pr-4">0</td>
            </tr>
            <tr className="text-[10px]">
              <td className="border border-slate-800 px-2 py-1.5 font-bold">Accessories</td>
              <td className="border border-slate-800 px-2 py-1.5 text-right font-bold pr-4">{inv.accessoriesAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
            </tr>
            <tr className="text-[10px]">
              <td className="border border-slate-800 px-2 py-1.5 font-bold">RTO</td>
              <td className="border border-slate-800 px-2 py-1.5 text-right font-bold pr-4">{inv.rtoAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
            </tr>
            <tr className="text-[10px]">
              <td className="border border-slate-800 px-2 py-1.5 font-bold">Insurance</td>
              <td className="border border-slate-800 px-2 py-1.5 text-right font-bold pr-4">{inv.insuranceAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
            </tr>
            <tr className="text-[10px]">
              <td className="border border-slate-800 px-2 py-1.5 font-bold">Discount</td>
              <td className="border border-slate-800 px-2 py-1.5 text-right font-bold pr-4">{inv.discountAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
            </tr>
            <tr className="text-[10px] bg-slate-50">
              <td className="border border-slate-800 px-2 py-2 font-black">Net Total</td>
              <td className="border border-slate-800 px-2 py-2 text-right font-black pr-4 text-sm">
                {inv.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Amount in Words */}
        <div className="border border-slate-800 border-t-0 py-2 px-4 text-right font-bold text-[10px]">
          ( {numberToWords(inv.totalAmount)} )
        </div>

        {/* Bank Details Section */}
        <div className="mt-6 border border-slate-800 p-3 bg-slate-50/50">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Bank Account Details</p>
              <p className="font-bold text-[10px]">{settings.bankDetails}</p>
              <p className="font-black text-xs mt-1">A/C No: {settings.accountNumber}</p>
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <div className="mt-8 flex justify-between items-start px-2">
          <div className="space-y-4">
            <p className="font-bold underline text-[10px]">Term & Condtions</p>
            <div className="text-[9px] font-bold space-y-1">
              <p>1. Any vehicle driven by members of our staff is at owners risk only.</p>
              <p>2. Interest at the rate of 18 % per annum will be charged if not paid within 7 days.</p>
              <p>3. Price subject to change without notice.</p>
              <p>4. Goods once sold will not be taken back.</p>
              <p>5. Delivery in good condition.</p>
              <p>6. Received the following : (a)Tool Kit (b)Owner Manual & free service Coupon Book (c) All bulbs in serviceable condition.</p>
              <p>7. Subject to Local Jurisdiction.</p>
              <p>8. Cheque is Subject to realization.</p>
            </div>
          </div>
          <div className="text-center space-y-16">
            <div>
              <p className="font-bold text-[10px]">For</p>
              <p className="font-bold uppercase text-[10px]">{settings.name}</p>
            </div>
            <p className="font-bold pt-4 text-[10px] border-t border-slate-300">Authorised Signatory</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceRenderer;
