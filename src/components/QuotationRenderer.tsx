import React from 'react';
import { Quotation, Customer, Tractor, ShowroomSettings, TractorModel } from '../../types';

interface QuotationRendererProps {
  quote: Quotation;
  customers: Customer[];
  tractors: Tractor[];
  catalogModels: TractorModel[];
  settings: ShowroomSettings;
  id?: string;
}

const QuotationRenderer: React.FC<QuotationRendererProps> = ({ quote, customers, tractors, catalogModels, settings, id = "quotation-pdf-content" }) => {
  const cust = customers.find(c => c.id === quote.customerId);
  const tractor = tractors.find(t => t.id === quote.tractorId);
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
    <div id={id} className="bg-hw-bg text-hw-text p-6 sm:p-10 max-w-[950px] mx-auto font-sans text-[11px] leading-tight border border-hw-border shadow-lg print:shadow-none print:border-none print:p-0 print:bg-white print:text-black">
      <div className="border border-hw-border p-4 print:border-slate-400">
        {/* Header Section */}
        <div className="text-center mb-2">
        </div>
        
        <div className="flex items-start mb-4">
          <div className="w-24 shrink-0">
            <img src={settings.logoUrl} alt="Logo" className="w-20 h-20 rounded-full object-contain border border-hw-border p-1 print:border-slate-200" />
          </div>
          <div className="flex-1 text-center pr-24">
            <h1 className="text-2xl font-black text-hw-accent uppercase mb-1 tracking-tight print:text-[#4682B4]">{settings.name}</h1>
            <p className="text-[10px] font-bold text-hw-text mb-0.5 print:text-slate-800">{settings.address}</p>
            <p className="text-[10px] font-bold text-hw-text print:text-slate-800">Mobile No. - {settings.phone}</p>
          </div>
        </div>

        <div className="flex justify-center mb-6">
          <div className="border border-hw-text rounded-full px-10 py-1.5 font-bold text-xs shadow-sm print:border-slate-800">
            Quotation
          </div>
        </div>

        {/* Quotation Info Row */}
        <div className="border-t border-hw-border pt-3 flex justify-between font-bold mb-6 px-2 print:border-slate-300">
          <span>Quotation No.: {quote.quotationNo}</span>
          <span>Date: {new Date(quote.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
        </div>

        {/* Customer Details Section */}
        <div className="border border-hw-border p-4 mb-6 print:border-slate-800">
          <div className="grid grid-cols-12 gap-y-2">
            <div className="col-span-7 space-y-2">
              <div className="flex">
                <span className="font-bold w-32 border-b border-hw-border print:border-slate-100">Name</span>
                <span className="font-bold">: {cust?.name.toUpperCase()}</span>
              </div>
              <div className="flex">
                <span className="font-bold w-32 border-b border-hw-border print:border-slate-100">Mobile No</span>
                <span className="font-bold">: {cust?.mobile}</span>
              </div>
              <div className="flex">
                <span className="font-bold w-32 border-b border-hw-border print:border-slate-100">Address</span>
                <span className="font-bold">: {cust?.village.toUpperCase()}, {cust?.tehsil.toUpperCase()}</span>
              </div>
              <div className="flex">
                <span className="font-bold w-32 border-b border-hw-border print:border-slate-100">Introducer Name</span>
                <span className="font-bold">: {settings.name}</span>
              </div>
              <div className="flex">
                <span className="font-bold w-32 border-b border-hw-border print:border-slate-100">Finance</span>
                <span className="font-bold">: {quote.hypo || ''}</span>
              </div>
              {quote.salesExecutive && (
                <div className="flex">
                  <span className="font-bold w-32 border-b border-hw-border print:border-slate-100">Sales Executive</span>
                  <span className="font-bold text-hw-accent">: {quote.salesExecutive.toUpperCase()}</span>
                </div>
              )}
            </div>
            <div className="col-span-5 space-y-2 pl-10 border-l border-hw-border print:border-slate-800">
              <div className="flex">
                <span className="font-bold w-20">S/o, W/o</span>
                <span className="font-bold">: {cust?.sog || ''}</span>
              </div>
              <div className="flex">
                <span className="font-bold w-20">City</span>
                <span className="font-bold">: {cust?.tehsil.toUpperCase()}</span>
              </div>
              {quote.validUntil && (
                <div className="flex">
                  <span className="font-bold w-20">Validity</span>
                  <span className="font-bold text-hw-accent">: {quote.validUntil}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Notes Section */}
        {quote.notes && (
          <div className="border border-hw-border p-4 mb-6 bg-hw-accent/5 print:border-slate-800 print:bg-slate-50/50">
            <p className="font-bold text-[10px] underline mb-1 uppercase tracking-widest text-hw-muted">Special Instructions / Notes:</p>
            <p className="text-[10px] italic font-bold">{quote.notes}</p>
          </div>
        )}

        {/* Table Section */}
        <table className="w-full border-collapse border border-hw-border print:border-slate-800">
          <thead>
            <tr className="font-bold text-[10px] bg-hw-accent/5 print:bg-transparent">
              <th className="border border-hw-border px-2 py-3 text-left w-12 print:border-slate-800 uppercase">Sr No</th>
              <th className="border border-hw-border px-4 py-3 text-left print:border-slate-800 uppercase">Asset Description</th>
              <th className="border border-hw-border px-2 py-3 text-center w-24 print:border-slate-800 uppercase">Qty</th>
              <th className="border border-hw-border px-2 py-3 text-center w-32 print:border-slate-800 uppercase">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr className="text-[10px]">
              <td className="border border-hw-border px-2 py-3 text-center font-bold print:border-slate-800">1</td>
              <td className="border border-hw-border px-4 py-3 font-bold print:border-slate-800">
                MODEL : {tractor?.modelName} {tractor?.color ? `(${tractor.color})` : ''}
                <div className="text-[9px] mt-1 font-normal opacity-80">
                  CHASSIS ID: {tractor?.chassisNo} | ENGINE ID: {tractor?.engineNo}
                </div>
                {model && model.features && model.features.length > 0 && (
                  <div className="mt-3 grid grid-cols-2 gap-2 pb-2">
                    {model.features.map((f, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-[8px] font-bold text-hw-accent uppercase">
                        <div className="w-1.5 h-1.5 bg-hw-accent rounded-full shrink-0"></div>
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                )}
              </td>
              <td className="border border-hw-border px-2 py-3 text-center font-bold print:border-slate-800">1</td>
              <td className="border border-hw-border px-2 py-3 text-right font-bold pr-4 print:border-slate-800">
                {quote.basicAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </td>
            </tr>

            {/* Accessories Detail List */}
            {quote.accessoriesDetail && quote.accessoriesDetail.length > 0 && quote.accessoriesDetail.map((acc, idx) => (
              <tr key={acc.id} className="text-[10px]">
                <td className="border border-hw-border px-2 py-3 text-center print:border-slate-800">{idx + 2}</td>
                <td className="border border-hw-border px-4 py-3 italic print:border-slate-800">ACCESSORY: {acc.name.toUpperCase()}</td>
                <td className="border border-hw-border px-2 py-3 text-center print:border-slate-800">1</td>
                <td className="border border-hw-border px-2 py-3 text-right pr-4 print:border-slate-800">
                  {acc.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
              </tr>
            ))}

            {/* Totals Block */}
            <tr className="text-[10px]">
              <td 
                rowSpan={quote.accessoriesDetail && quote.accessoriesDetail.length > 0 ? 5 : 6} 
                className="border border-hw-border print:border-slate-800 bg-hw-accent/5"
              ></td>
              <td className="border border-hw-border px-4 py-3 font-bold print:border-slate-800"></td>
              <td className="border border-hw-border px-2 py-3 font-bold text-center print:border-slate-800 uppercase">RTO/Reg</td>
              <td className="border border-hw-border px-2 py-3 text-right font-bold pr-4 print:border-slate-800">
                {quote.rtoAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </td>
            </tr>
            <tr className="text-[10px]">
              <td className="border border-hw-border px-4 py-3 font-bold print:border-slate-800"></td>
              <td className="border border-hw-border px-2 py-3 font-bold text-center print:border-slate-800 uppercase">Insurance</td>
              <td className="border border-hw-border px-2 py-3 text-right font-bold pr-4 print:border-slate-800">
                {quote.insuranceAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </td>
            </tr>
            <tr className="text-[10px]">
              <td className="border border-hw-border px-4 py-3 font-bold print:border-slate-800"></td>
              <td className="border border-hw-border px-2 py-3 font-bold text-center print:border-slate-800 uppercase text-rose-500">Discount (-)</td>
              <td className="border border-hw-border px-2 py-3 text-right font-bold pr-4 print:border-slate-800 text-rose-500">
                - {quote.discountAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </td>
            </tr>
            <tr className="text-[10px]">
              <td className="border border-hw-border px-4 py-3 font-bold print:border-slate-800"></td>
              <td className="border border-hw-border px-2 py-3 font-bold text-center print:border-slate-800 uppercase">Handling/Other</td>
              <td className="border border-hw-border px-2 py-3 text-right font-bold pr-4 print:border-slate-800">
                {quote.otherCharges.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </td>
            </tr>
            <tr className="text-[10px] font-bold bg-hw-accent/10 print:bg-slate-50">
              <td className="border border-hw-border px-4 py-4 font-bold text-right uppercase print:border-slate-800 tracking-widest">Grand Commercial Quote</td>
              <td className="border border-hw-border px-2 py-4 font-bold text-center print:border-slate-800">TOTAL</td>
              <td className="border border-hw-border px-2 py-4 text-right font-bold pr-4 print:border-slate-800 text-lg">
                ₹{quote.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Amount in Words */}
        <div className="border border-hw-border border-t-0 py-4 px-6 text-right font-bold text-[10px] print:border-slate-800 bg-hw-bg print:bg-white uppercase tracking-tighter">
          Amount in words: {numberToWords(quote.totalAmount)}
        </div>

        {/* Bank Details Section */}
        <div className="border border-hw-border p-4 mt-6 bg-hw-accent/5 print:border-slate-800 print:bg-white">
          <p className="font-bold text-[10px] uppercase tracking-widest text-hw-muted mb-2 underline">Showroom Settlement Details:</p>
          <p className="font-bold text-[10px] mb-1">
            BANK NAME: {settings.bankDetails}
          </p>
          <p className="font-black text-xs text-hw-accent">A/C NO: {settings.accountNumber}</p>
        </div>

        {/* Terms & Conditions Section */}
        <div className="mt-8 mb-12">
          <p className="font-bold underline text-[10px] mb-3 uppercase tracking-widest">Commercial Terms & Conditions</p>
          <div className="text-[9px] font-bold space-y-2 opacity-90">
            <p>• Settlement via D.D. / RTGS favor of " {settings.name.toUpperCase()} "</p>
            <p>1) Market fluctuation clause: Prices are subject to change without notice. Prevalent price at delivery time is final.</p>
            <p>2) Logistic clause: Assets released only after realization of full commercial value.</p>
            <p>3) Statutory clause: RTO Registration, Insurance & Handling to be settled directly with authorized agents where applicable.</p>
            <p>4) Jurisdiction: Subject to local Court jurisdiction.</p>
          </div>
        </div>

        {/* Signature Section */}
        <div className="flex justify-between items-end pt-24">
          <div className="text-center">
            <div className="w-56 border-t border-hw-border mb-3 print:border-slate-400"></div>
            <p className="font-bold text-[10px] uppercase tracking-widest">Customer's Acceptance</p>
          </div>
          <div className="text-center">
            <div className="w-56 border-t border-hw-border mb-3 print:border-slate-400"></div>
            <p className="font-bold text-[10px] uppercase tracking-widest">For {settings.name.toUpperCase()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationRenderer;
