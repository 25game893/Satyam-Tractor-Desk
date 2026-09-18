import React, { useState } from 'react';
import { downloadAsPDF } from '../src/utils/pdfGenerator';
import LedgerRenderer from '../src/components/LedgerRenderer';
import { 
  Search, Calendar, User, Tractor as TractorIcon, 
  IndianRupee, Clock, Filter, Download, 
  ChevronRight, ArrowUpRight, CheckCircle2,
  Eye, X, FileText, AlertCircle
} from 'lucide-react';
import CountdownTimer from '../components/CountdownTimer';
import { Invoice, Customer, Tractor, ShowroomSettings, User as UserType } from '../types';

interface CustomerLedgerProps {
  invoices: Invoice[];
  customers: Customer[];
  tractors: Tractor[];
  settings: ShowroomSettings;
  currentUser: UserType;
}

const CustomerLedger: React.FC<CustomerLedgerProps> = ({ invoices, customers, tractors, settings, currentUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [invoiceFilter, setInvoiceFilter] = useState('');
  const [selectedCustomerLedger, setSelectedCustomerLedger] = useState<string | null>(null);

  // Filter invoices to show only those that represent a "sale" (usually all invoices in this system)
  const filteredInvoices = invoices.filter(inv => {
    const customer = customers.find(c => c.id === inv.customerId);
    const tractor = tractors.find(t => t.id === inv.tractorId);
    
    const matchesSearch = 
      customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tractor?.modelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesDate = dateFilter ? inv.date.startsWith(dateFilter) : true;
    const matchesInvoice = invoiceFilter ? inv.invoiceNo.toLowerCase().includes(invoiceFilter.toLowerCase()) : true;
    
    return matchesSearch && matchesDate && matchesInvoice;
  });

  const customerInvoices = selectedCustomerLedger 
    ? invoices.filter(inv => inv.customerId === selectedCustomerLedger)
    : [];
  
  const currentCustomer = selectedCustomerLedger 
    ? customers.find(c => c.id === selectedCustomerLedger)
    : null;

  const stats = {
    totalSales: filteredInvoices.length,
    totalRevenue: filteredInvoices.reduce((acc, inv) => acc + inv.totalAmount, 0),
    pendingDues: filteredInvoices.reduce((acc, inv) => acc + (inv.totalAmount - inv.paidAmount), 0),
    lastEntry: filteredInvoices.length > 0 ? filteredInvoices[0].date : null
  };

  return (
    <div className={`space-y-10 animate-in fade-in duration-700 ${selectedCustomerLedger ? 'no-print' : ''}`}>
      {/* ERP Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 bg-hw-accent text-white text-[10px] font-mono font-bold uppercase tracking-widest">
              FINANCE_LEDGER_V4
            </span>
            <span className="hw-label">
              Financial History & Payment Records
            </span>
          </div>
          <h1 className="text-5xl font-display font-bold text-hw-text tracking-tighter uppercase">
            Customer Ledger
          </h1>
          <p className="text-hw-muted font-mono text-sm">Comprehensive transaction logs and balance tracking.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-hw-muted group-focus-within:text-hw-accent transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search Customer or Asset..." 
              className="pl-12 pr-6 py-4 bg-hw-surface border border-hw-border text-xs font-mono font-bold text-hw-text outline-none focus:border-hw-accent transition-all w-full sm:w-72 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative group">
            <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-hw-muted group-focus-within:text-hw-accent transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Invoice No..." 
              className="pl-12 pr-6 py-4 bg-hw-surface border border-hw-border text-xs font-mono font-bold text-hw-text outline-none focus:border-hw-accent transition-all w-full sm:w-40 shadow-sm"
              value={invoiceFilter}
              onChange={(e) => setInvoiceFilter(e.target.value)}
            />
          </div>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-hw-muted" size={18} />
            <input 
              type="date" 
              className="pl-12 pr-6 py-4 bg-hw-surface border border-hw-border text-xs font-mono font-bold text-hw-text outline-none focus:border-hw-accent transition-all shadow-sm"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>
          <button className="hw-btn-primary p-4">
            <Download size={20} />
          </button>
        </div>
      </div>

      {settings.isShopClosed && (
        <div className="bg-rose-50 border border-rose-200 p-8 flex flex-col md:flex-row items-center justify-between gap-6 animate-pulse no-print">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-rose-600 text-white flex items-center justify-center shadow-lg">
              <AlertCircle size={32} />
            </div>
            <div>
              <h3 className="text-lg font-display font-bold text-rose-900 uppercase tracking-tight">Shop Operations Suspended</h3>
              <p className="text-sm font-mono font-bold text-rose-700 uppercase">The administrator has marked the shop as CLOSED. Ledger modifications are disabled.</p>
            </div>
          </div>
          <CountdownTimer closedAt={settings.closedAt || ''} />
        </div>
      )}

      {/* Ledger Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-hw-surface border border-hw-border p-6">
          <p className="text-[10px] font-mono font-bold text-hw-muted uppercase tracking-widest mb-1">Total Sales</p>
          <p className="text-3xl font-display font-bold text-hw-text">{stats.totalSales}</p>
        </div>
        <div className="bg-hw-surface border border-hw-border p-6">
          <p className="text-[10px] font-mono font-bold text-hw-muted uppercase tracking-widest mb-1">Total Revenue</p>
          <p className="text-3xl font-display font-bold text-hw-text">₹{stats.totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-hw-surface border border-hw-border p-6">
          <p className="text-[10px] font-mono font-bold text-hw-muted uppercase tracking-widest mb-1">Pending Dues</p>
          <p className="text-3xl font-display font-bold text-hw-accent">₹{stats.pendingDues.toLocaleString()}</p>
        </div>
        <div className="bg-hw-surface border border-hw-border p-6">
          <p className="text-[10px] font-mono font-bold text-hw-muted uppercase tracking-widest mb-1">Last Entry</p>
          <p className="text-3xl font-display font-bold text-hw-text">
            {stats.lastEntry 
              ? new Date(stats.lastEntry).toLocaleDateString(undefined, { day: '2-digit', month: 'short' }) 
              : 'N/A'}
          </p>
        </div>
      </div>

      {/* Register Table */}
      <div className="bg-hw-surface border border-hw-border shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono">
            <thead>
              <tr className="bg-hw-bg border-b border-hw-border">
                <th className="px-8 py-6 text-[10px] font-bold text-hw-muted uppercase tracking-widest">Customer & ID</th>
                <th className="px-8 py-6 text-[10px] font-bold text-hw-muted uppercase tracking-widest">Asset Details</th>
                <th className="px-8 py-6 text-[10px] font-bold text-hw-muted uppercase tracking-widest">Financials</th>
                <th className="px-8 py-6 text-[10px] font-bold text-hw-muted uppercase tracking-widest">Transaction Date</th>
                <th className="px-8 py-6 text-[10px] font-bold text-hw-muted uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hw-border">
              {filteredInvoices.length > 0 ? (
                filteredInvoices.map((inv) => {
                  const customer = customers.find(c => c.id === inv.customerId);
                  const tractor = tractors.find(t => t.id === inv.tractorId);
                  
                  return (
                    <tr key={inv.id} className="hover:bg-hw-bg transition-colors group">
                      <td className="px-8 py-8 border-r border-hw-border/50">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-hw-bg border border-hw-border flex items-center justify-center text-hw-muted group-hover:bg-hw-accent group-hover:text-white transition-colors">
                            <User size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-hw-text uppercase tracking-tight">{customer?.name || 'Unknown'}</p>
                            <p className="text-[10px] font-bold text-hw-muted">INV: {inv.invoiceNo}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-8 border-r border-hw-border/50">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-hw-bg border border-hw-border flex items-center justify-center text-hw-muted group-hover:bg-hw-accent group-hover:text-white transition-colors">
                            <TractorIcon size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-hw-text uppercase tracking-tight">{tractor?.modelName || 'Unknown'}</p>
                            <p className="text-[10px] font-bold text-hw-muted">{tractor?.hp} HP • {tractor?.chassisNo.slice(-6).toUpperCase()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-8 border-r border-hw-border/50">
                        <div className="flex flex-col">
                          <p className="text-sm font-bold text-hw-text">₹{inv.totalAmount.toLocaleString()}</p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className={`w-1.5 h-1.5 rounded-full ${inv.status === 'PAID' ? 'bg-emerald-500' : 'bg-hw-accent'}`}></span>
                            <p className="text-[9px] font-bold text-hw-muted uppercase tracking-widest">{inv.status}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-8 border-r border-hw-border/50">
                        <div className="inline-flex flex-col">
                          <p className="text-sm font-bold text-hw-text">
                            {new Date(inv.date).toLocaleDateString(undefined, { day: '2-digit', month: 'long', year: 'numeric' })}
                          </p>
                          <p className="text-[10px] font-bold text-hw-muted flex items-center gap-1">
                            <Clock size={10} /> {new Date(inv.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </td>
                      <td className="px-8 py-8 text-right">
                        <button 
                          onClick={() => setSelectedCustomerLedger(inv.customerId)}
                          className="hw-btn-secondary px-6 py-3 flex items-center gap-2 ml-auto"
                        >
                          <Eye size={14} />
                          View Ledger
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-20">
                      <Search size={48} />
                      <p className="text-sm font-bold uppercase tracking-widest">No matching ledger records found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="px-8 py-6 bg-hw-bg border-t border-hw-border flex justify-between items-center">
          <p className="text-[10px] font-bold text-hw-muted uppercase tracking-widest">
            Showing {filteredInvoices.length} of {invoices.length} total sales
          </p>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 bg-hw-surface border border-hw-border text-[10px] font-bold uppercase tracking-widest text-hw-muted hover:text-hw-text transition-all">Previous</button>
            <button className="px-4 py-2 bg-hw-surface border border-hw-border text-[10px] font-bold uppercase tracking-widest text-hw-muted hover:text-hw-text transition-all">Next</button>
          </div>
        </div>
      </div>

      {/* Detailed Ledger Modal */}
      {selectedCustomerLedger && currentCustomer && (
        <div className="fixed inset-0 z-[1000] bg-hw-bg flex items-center justify-center p-4 sm:p-6 print-container print:static print:bg-white print:p-0 print:block print:w-full print:h-auto print:z-0 animate-scale-in">
          <div className="bg-hw-surface w-full max-w-5xl border border-hw-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] print:max-h-none print:shadow-none print:rounded-none print:w-full print:h-auto print:static">
            <div className="px-8 py-8 bg-hw-text text-hw-bg flex justify-between items-center shrink-0 no-print">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-hw-accent text-white flex items-center justify-center shadow-lg">
                  <FileText size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-display font-bold uppercase tracking-tighter">{currentCustomer.name}</h3>
                  <p className="text-[10px] font-mono font-bold text-hw-bg/60 uppercase tracking-widest">Complete Transaction History</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  type="button"
                  onClick={() => downloadAsPDF('ledger-history-pdf', `History_${currentCustomer.name}`)}
                  className="p-4 bg-hw-bg/10 hover:bg-hw-bg/20 border border-hw-bg/20 transition-all text-hw-bg cursor-pointer active:scale-95"
                >
                  <Download size={24} />
                </button>
                <button 
                  onClick={() => setSelectedCustomerLedger(null)}
                  className="p-4 bg-hw-bg/10 hover:bg-hw-accent border border-hw-bg/20 transition-all text-hw-bg"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-hw-bg custom-scrollbar">
              <div className="p-4 sm:p-10">
                <LedgerRenderer 
                  id="ledger-history-pdf"
                  customer={currentCustomer} 
                  invoices={invoices} 
                  settings={settings} 
                  currentUser={currentUser}
                />
              </div>
            </div>

            <div className="px-8 py-6 bg-hw-surface border-t border-hw-border flex justify-between items-center shrink-0 no-print">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-hw-accent rounded-full animate-pulse"></div>
                <p className="text-[9px] font-mono font-bold text-hw-muted uppercase tracking-widest">Live Ledger Sync Active</p>
              </div>
              <p className="text-xs font-mono font-bold text-hw-text uppercase tracking-widest">
                Outstanding Balance: <span className="text-hw-accent">₹{(customerInvoices.reduce((acc, inv) => acc + inv.totalAmount, 0) - customerInvoices.reduce((acc, inv) => acc + inv.paidAmount, 0)).toLocaleString()}</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerLedger;
