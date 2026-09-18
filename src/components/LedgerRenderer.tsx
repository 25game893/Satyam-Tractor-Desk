import React, { useState } from 'react';
import { Customer, Invoice, ShowroomSettings, PaymentRecord, User, UserRole } from '../../types';

interface LedgerRendererProps {
  customer: Customer;
  invoices: Invoice[];
  settings: ShowroomSettings;
  onDownloadVoucher?: (inv: Invoice, pay: PaymentRecord) => void;
  currentUser: User;
  id?: string;
}

const LedgerRenderer: React.FC<LedgerRendererProps> = ({ 
  customer, 
  invoices, 
  settings, 
  onDownloadVoucher, 
  currentUser,
  id = "ledger-pdf-content"
}) => {
  const [invSearch, setInvSearch] = useState('');
  const customerInvoices = invoices.filter(i => i.customerId === customer.id);
  const ledgerEntries: any[] = [];
  
  customerInvoices.forEach(inv => {
    ledgerEntries.push({ 
      id: inv.id, 
      date: inv.date, 
      receiptNo: inv.invoiceNo, 
      name: customer.name,
      particulars: 'Showroom Sales', 
      debit: inv.totalAmount, 
      credit: 0, 
      remark: 'NEW TRACTOR PRICE',
      isInvoice: true,
      invoice: inv
    });
    inv.payments.forEach(p => { 
      ledgerEntries.push({ 
        id: p.id, 
        date: p.date, 
        receiptNo: inv.invoiceNo, 
        name: customer.name,
        particulars: 'Payment Received', 
        debit: 0, 
        credit: p.amount, 
        remark: p.particulars || p.mode,
        isPayment: true,
        payment: p,
        invoice: inv
      }); 
    });
  });

  const filteredEntries = ledgerEntries.filter(e => 
    e.receiptNo.toLowerCase().includes(invSearch.toLowerCase()) ||
    e.particulars.toLowerCase().includes(invSearch.toLowerCase())
  );

  const sortedEntries = filteredEntries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const totalDebit = ledgerEntries.reduce((s, e) => s + e.debit, 0);
  const totalCredit = ledgerEntries.reduce((s, e) => s + e.credit, 0);
  const outstanding = totalDebit - totalCredit;

  const minDate = sortedEntries.length > 0 ? new Date(sortedEntries[0].date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';
  const maxDate = sortedEntries.length > 0 ? new Date(sortedEntries[sortedEntries.length - 1].date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

  return (
    <div id={id} className="bg-white text-black p-4 sm:p-10 max-w-[1000px] mx-auto font-sans text-[11px] print:p-0 relative border border-slate-200 shadow-lg print:shadow-none print:border-none">
      {/* Replica Header */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold mb-1">Ledger</h2>
        <p className="text-[10px]">From &nbsp; <span className="font-bold">{minDate}</span> &nbsp; To &nbsp; <span className="font-bold">{maxDate}</span></p>
      </div>

      {/* Customer Info Section */}
      <div className="border-t border-b border-black py-2 mb-4">
        <div className="flex justify-between mb-1">
          <div className="flex gap-2">
            <span className="font-bold w-16">Name</span>
            <span>{customer.name.toUpperCase()}</span>
          </div>
          <div className="flex gap-2">
            <span className="font-bold">Mobile No.</span>
            <span>{customer.mobile}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <span className="font-bold w-16">Address</span>
          <span>{customer.village.toUpperCase()} {customer.tehsil.toUpperCase()}</span>
        </div>
      </div>

      {/* Search - No Print */}
      <div className="mb-4 no-print">
        <input 
          type="text" 
          placeholder="Search Particulars / Receipt No..." 
          className="w-full px-4 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-hw-accent/50"
          value={invSearch}
          onChange={(e) => setInvSearch(e.target.value)}
        />
      </div>

      {/* Replica Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-black">
          <thead>
            <tr className="bg-white">
              <th className="border border-black px-2 py-2 text-center font-bold">Receipt.No.</th>
              <th className="border border-black px-2 py-2 text-center font-bold">Date</th>
              <th className="border border-black px-2 py-2 text-center font-bold">Name</th>
              <th className="border border-black px-2 py-2 text-center font-bold">Particulars</th>
              <th className="border border-black px-2 py-2 text-center font-bold">Debit</th>
              <th className="border border-black px-2 py-2 text-center font-bold">Credit</th>
              <th className="border border-black px-2 py-2 text-center font-bold">Balance</th>
              <th className="border border-black px-2 py-2 text-center font-bold">Remark</th>
              {currentUser.role === UserRole.ADMIN && <th className="border border-black px-2 py-2 text-center font-bold no-print">Action</th>}
            </tr>
          </thead>
          <tbody>
            {(() => {
              let runningBalance = 0;
              return sortedEntries.map((e, idx) => {
                runningBalance += (e.debit - e.credit);
                return (
                  <tr key={e.id}>
                    <td className="border border-black px-2 py-2 text-left">{e.receiptNo}</td>
                    <td className="border border-black px-2 py-2 text-left whitespace-nowrap">{new Date(e.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td className="border border-black px-2 py-2 text-left">{e.name.toUpperCase()}</td>
                    <td className="border border-black px-2 py-2 text-left">{e.particulars}</td>
                    <td className="border border-black px-2 py-2 text-right">{e.debit > 0 ? e.debit.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}</td>
                    <td className="border border-black px-2 py-2 text-right">{e.credit > 0 ? e.credit.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}</td>
                    <td className="border border-black px-2 py-2 text-right font-bold">{runningBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="border border-black px-2 py-2 text-left">{e.remark.toUpperCase()}</td>
                    {currentUser.role === UserRole.ADMIN && (
                      <td className="border border-black px-2 py-2 text-center no-print">
                        <button 
                          onClick={() => {
                            if (settings.isShopClosed) {
                              alert("SHOP CLOSED: Ledger entries cannot be modified at this time.");
                              return;
                            }
                            alert('Edit functionality would open here');
                          }}
                          className={`font-bold ${settings.isShopClosed ? 'text-slate-400 cursor-not-allowed' : 'text-hw-accent hover:opacity-80'}`}
                        >
                          Edit
                        </button>
                      </td>
                    )}
                  </tr>
                );
              });
            })()}
            {/* Total Row */}
            <tr className="font-bold">
              <td colSpan={4} className="border border-black px-2 py-2 text-right">Total</td>
              <td className="border border-black px-2 py-2 text-right text-hw-accent">{totalDebit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
              <td className="border border-black px-2 py-2 text-right text-hw-accent">{totalCredit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
              <td className="border border-black px-2 py-2 text-right text-hw-accent">{outstanding.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
              <td className="border border-black px-2 py-2"></td>
              {currentUser.role === UserRole.ADMIN && <td className="border border-black px-2 py-2 no-print"></td>}
            </tr>
            {/* Outstanding Row */}
            <tr className="font-bold">
              <td colSpan={4} className="border border-black px-2 py-2 text-right">Out Standing</td>
              <td colSpan={3} className="border border-black px-2 py-2 text-center text-hw-accent">{outstanding.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
              <td className="border border-black px-2 py-2"></td>
              {currentUser.role === UserRole.ADMIN && <td className="border border-black px-2 py-2 no-print"></td>}
            </tr>
          </tbody>
        </table>
      </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-45 pointer-events-none opacity-[0.02] text-[150px] font-black uppercase select-none">AUDITED</div>
    </div>
  );
};

export default LedgerRenderer;
