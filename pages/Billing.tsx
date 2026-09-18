
import React, { useState } from 'react';
import { downloadAsPDF } from '../src/utils/pdfGenerator';
import ChallanRenderer from '../src/components/ChallanRenderer';
import LedgerRenderer from '../src/components/LedgerRenderer';
import InvoiceRenderer from '../src/components/InvoiceRenderer';
import QuotationRenderer from '../src/components/QuotationRenderer';
import VoucherRenderer from '../src/components/VoucherRenderer';
import { 
  Plus, Search, Receipt, Truck, User as UserIcon, 
  Download, X, FileText, Clipboard, Package,
  PlusCircle, IndianRupee, Edit3, Trash2,
  Calendar, CheckCircle2, AlertCircle, FilePlus, Check, RotateCcw,
  ClipboardCheck, MapPin, UserCheck, ShieldCheck,
  Hash, Info, FileSignature, Gauge, Zap, Phone,
  MessageCircle, Share2, Clock, CreditCard
} from 'lucide-react';
import CountdownTimer from '../components/CountdownTimer';
import SearchableSelect from '../src/components/SearchableSelect';
import { 
  Tractor, TractorModel, Customer, Invoice, PaymentMode, 
  TractorStatus, ShowroomSettings, PaymentRecord,
  Quotation, DeliveryChallan, User, UserRole, DocApprovalStatus,
  AccessoryItem
} from '../types';

// Helper for Amount to Words
const numberToWords = (num: number): string => {
  const a = ['', 'one ', 'two ', 'three ', 'four ', 'five ', 'six ', 'seven ', 'eight ', 'nine ', 'ten ', 'eleven ', 'twelve ', 'thirteen ', 'fourteen ', 'fifteen ', 'sixteen ', 'seventeen ', 'eighteen ', 'nineteen '];
  const b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  const regex = new RegExp(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  
  const numStr = Math.floor(num).toString();
  if (numStr.length > 9) return 'OVERFLOW';
  const n = ('000000000' + numStr).substr(-9).match(regex);
  if (!n) return '';
  let str = '';
  str += n[1] !== '00' ? (a[Number(n[1])] || b[parseInt(n[1][0])] + ' ' + a[parseInt(n[1][1])]) + 'crore ' : '';
  str += n[2] !== '00' ? (a[Number(n[2])] || b[parseInt(n[2][0])] + ' ' + a[parseInt(n[2][1])]) + 'lakh ' : '';
  str += n[3] !== '00' ? (a[Number(n[3])] || b[parseInt(n[3][0])] + ' ' + a[parseInt(n[3][1])]) + 'thousand ' : '';
  str += n[4] !== '00' ? (a[Number(n[4])] || b[parseInt(n[4][0])] + ' ' + a[parseInt(n[4][1])]) + 'hundred ' : '';
  str += n[5] !== '00' ? (str !== '' ? 'and ' : '') + (a[Number(n[5])] || b[parseInt(n[5][0])] + ' ' + a[parseInt(n[5][1])]) : '';
  return str.toUpperCase() + ' ONLY';
};

// --- Standalone Document Renderers ---

const DocumentHeader: React.FC<{ settings: ShowroomSettings, title: string, colorClass: string, subtitle?: string }> = ({ settings, title, colorClass, subtitle }) => (
  <div className="relative mb-10 pb-8 border-b-2 border-slate-900">
    <div className="flex justify-between items-start gap-10">
      <div className="flex gap-8 items-center">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-hw-accent to-hw-accent/30 rounded-[2.2rem] blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
          <div className="relative w-28 h-28 bg-white border-2 border-slate-100 p-3 rounded-[2rem] shadow-sm flex items-center justify-center overflow-hidden">
            <img src={settings.logoUrl} className="w-full h-full object-contain" alt="Logo" />
          </div>
        </div>
        <div>
          <h1 className="text-4xl font-black text-hw-text leading-none tracking-tighter uppercase mb-2">{settings.name}</h1>
          <div className="flex items-center gap-3 mb-4">
            <p className="text-[11px] font-black text-hw-accent uppercase tracking-[0.5em]">Authorized Enterprise Showroom</p>
            <div className="h-1 w-1 bg-slate-300 rounded-full"></div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Est. 1998</p>
          </div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 text-[10px] text-slate-500 font-bold uppercase leading-tight max-w-[500px]">
            <p className="flex items-start gap-2 col-span-2"><MapPin size={12} className="text-slate-400 mt-0.5 shrink-0" /> {settings.address}</p>
            <p className="flex items-center gap-2"><Phone size={12} className="text-slate-400 shrink-0" /> +91 {settings.phone}</p>
            <p className="flex items-center gap-2"><FileText size={12} className="text-slate-400 shrink-0" /> {settings.email}</p>
          </div>
        </div>
      </div>
      <div className="text-right pt-2 flex flex-col items-end">
        <div className={`px-8 py-3 ${colorClass} text-white rounded-2xl mb-4 shadow-xl relative overflow-hidden group`}>
          <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
          <span className="relative z-10 text-base font-black uppercase tracking-[0.25em]">{title}</span>
        </div>
        {subtitle && <p className="text-[10px] font-black text-hw-text uppercase tracking-widest mb-1">{subtitle}</p>}
        <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest italic">
          <ShieldCheck size={10} className="text-emerald-500" />
          <span>Digital Record System ID: 039A-V2-PRO</span>
        </div>
      </div>
    </div>
    <div className="absolute -bottom-0.5 right-0 w-1/3 h-1.5 bg-hw-accent rounded-full"></div>
  </div>
);

// Moved renderers to src/components/

// Moved LedgerRenderer to src/components/LedgerRenderer.tsx


interface BillingProps {
  tractors: Tractor[];
  catalogModels: TractorModel[];
  customers: Customer[];
  invoices: Invoice[];
  quotations: Quotation[];
  challans: DeliveryChallan[];
  settings: ShowroomSettings;
  currentUser: User;
  onAddInvoice: (invoiceData: Omit<Invoice, 'id' | 'invoiceNo' | 'payments' | 'approvalStatus'>) => void;
  onUpdateInvoice: (updatedInvoice: Invoice) => void;
  onAddQuotation: (quoteData: Omit<Quotation, 'id' | 'quotationNo' | 'approvalStatus'>) => void;
  onUpdateQuotation: (updatedQuote: Quotation) => void;
  onAddChallan: (challanData: Omit<DeliveryChallan, 'id' | 'challanNo' | 'approvalStatus'>) => void;
  onUpdateChallan: (updatedChallan: DeliveryChallan) => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

type BillingTab = 'invoices' | 'quotations' | 'challans';

// Main Component
const Billing: React.FC<BillingProps> = ({ 
  tractors, catalogModels, customers, invoices, quotations, challans, settings, currentUser,
  onAddInvoice, onUpdateInvoice, onAddQuotation, onUpdateQuotation, onAddChallan, onUpdateChallan, showToast
}) => {
  const [activeTab, setActiveTab] = useState<BillingTab>('quotations');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal Visibility States
  const [showNewBilling, setShowNewBilling] = useState(false);
  const [showNewQuotation, setShowNewQuotation] = useState(false);
  const [showNewChallan, setShowNewChallan] = useState(false);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<Invoice | null>(null);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [selectedChallan, setSelectedChallan] = useState<DeliveryChallan | null>(null);
  const [selectedLedgerCustomer, setSelectedLedgerCustomer] = useState<Customer | null>(null);
  const [selectedVoucher, setSelectedVoucher] = useState<{inv: Invoice, pay: PaymentRecord} | null>(null);

  // Form States
  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    mode: PaymentMode.CASH,
    particulars: 'Part Payment',
    transactionRef: ''
  });
  const [quoteData, setQuoteData] = useState<{
    customerId: string;
    tractorId: string;
    hypo: string;
    basicAmount: number;
    rtoAmount: number;
    insuranceAmount: number;
    accessoriesAmount: number;
    accessoriesDetail: AccessoryItem[];
    otherCharges: number;
    discountAmount: number;
    date: string;
    validUntil: string;
    notes: string;
    salesExecutive: string;
  }>({
    customerId: '', tractorId: '', hypo: '', basicAmount: 0, rtoAmount: 0,
    insuranceAmount: 0, accessoriesAmount: 0, accessoriesDetail: [], otherCharges: 0, discountAmount: 0,
    date: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: '', salesExecutive: currentUser.fullName
  });

  const [billingData, setBillingData] = useState<{
    quotationId: string;
    customerId: string;
    tractorId: string;
    hypo: string;
    basicAmount: number;
    rtoAmount: number;
    insuranceAmount: number;
    accessoriesAmount: number;
    accessoriesDetail: AccessoryItem[];
    otherCharges: number;
    discountAmount: number;
    paidAmount: number;
    paymentMode: PaymentMode;
    notes: string;
    salesExecutive: string;
    placeOfSupply: string;
    date: string;
  }>({ 
    quotationId: '', customerId: '', tractorId: '', hypo: '', basicAmount: 0, rtoAmount: 0, 
    insuranceAmount: 0, accessoriesAmount: 0, accessoriesDetail: [], otherCharges: 0, discountAmount: 0,
    paidAmount: 0, paymentMode: PaymentMode.CASH, notes: '', 
    salesExecutive: currentUser.fullName, placeOfSupply: 'Madhya Pradesh',
    date: new Date().toISOString().split('T')[0]
  });

  const [challanData, setChallanData] = useState({
    invoiceId: '', customerId: '', tractorId: '', hypo: '', deliveryAddress: '', deliveredBy: '', notes: '',
    exchangeValue: 0,
    isExchangeConfirmed: false,
    date: new Date().toISOString().split('T')[0],
    checklist: { hitch: false, hood: false, toolKit: false, topLink: false, drawbar: false, frontBumper: false, battery: false, tyres: false, oilLevel: false, cultivator: false }
  });
  const [whatsappSent, setWhatsappSent] = useState(false);
  const [adminApproved, setAdminApproved] = useState(false);

  const closeAllModals = () => {
    setShowNewBilling(false);
    setShowNewQuotation(false);
    setShowNewChallan(false);
    setShowAddPayment(false);
    setSelectedInvoice(null);
    setSelectedInvoiceForPayment(null);
    setSelectedQuotation(null);
    setSelectedChallan(null);
    setSelectedLedgerCustomer(null);
    setSelectedVoucher(null);
    setWhatsappSent(false);
    setAdminApproved(false);
  };

  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceForPayment) return;

    const newPayment: PaymentRecord = {
      id: Math.random().toString(36).substr(2, 9),
      amount: paymentForm.amount,
      date: new Date().toISOString(),
      mode: paymentForm.mode,
      particulars: paymentForm.particulars,
      transactionRef: paymentForm.transactionRef
    };

    const updatedPayments = [...selectedInvoiceForPayment.payments, newPayment];
    const newPaidAmount = selectedInvoiceForPayment.paidAmount + paymentForm.amount;
    const newStatus = newPaidAmount >= selectedInvoiceForPayment.totalAmount ? 'PAID' : 'PARTIAL';

    onUpdateInvoice({
      ...selectedInvoiceForPayment,
      payments: updatedPayments,
      paidAmount: newPaidAmount,
      status: newStatus
    });

    showToast(`Payment of ₹${paymentForm.amount.toLocaleString()} recorded.`, 'success');
    setShowAddPayment(false);
    setSelectedInvoiceForPayment(null);
    setPaymentForm({ amount: 0, mode: PaymentMode.CASH, particulars: 'Part Payment', transactionRef: '' });
  };

  const handleQuoteSelection = (qId: string) => {
    const q = quotations.find(item => item.id === qId);
    if (q) {
      if (q.discountStatus === DocApprovalStatus.PENDING) {
        showToast("Quotation pending discount approval. Contact Admin.", "info");
        return;
      }
      if (q.discountStatus === DocApprovalStatus.REJECTED) {
        showToast("Discount for this quotation was rejected.", "error");
        return;
      }
      setBillingData({
        ...billingData,
        quotationId: q.id,
        customerId: q.customerId,
        tractorId: q.tractorId,
        hypo: q.hypo || '',
        basicAmount: q.basicAmount,
        rtoAmount: q.rtoAmount,
        insuranceAmount: q.insuranceAmount,
        accessoriesAmount: q.accessoriesAmount,
        accessoriesDetail: q.accessoriesDetail || [],
        otherCharges: q.otherCharges,
        discountAmount: q.discountAmount,
        notes: q.notes || '',
        salesExecutive: q.salesExecutive || currentUser.fullName
      });
    }
  };

  const handleInvoiceSelectionForChallan = (invId: string) => {
    const inv = invoices.find(i => i.id === invId);
    if (inv) {
      setChallanData({
        ...challanData,
        invoiceId: inv.id,
        customerId: inv.customerId,
        tractorId: inv.tractorId,
        hypo: inv.hypo || '',
        exchangeValue: 0,
        isExchangeConfirmed: false
      });
    }
  };

  // WhatsApp Sharing Logic
  const handleWhatsAppShare = (inv: Invoice) => {
    const cust = customers.find(c => c.id === inv.customerId);
    const tractor = tractors.find(t => t.id === inv.tractorId);
    if (!cust) return;

    // Refining message format for a professional business feel
    const message = `*🧾 TAX INVOICE: ${settings.name.toUpperCase()}*\n\n` +
      `Dear *${cust.name}*,\n` +
      `Thank you for choosing us for your agricultural needs. Your digital invoice *#${inv.invoiceNo}* is now ready.\n\n` +
      `*🛒 Booking Details:*\n` +
      `• *Asset:* ${tractor?.modelName} [${tractor?.hp} HP]\n` +
      `• *Chassis:* ${tractor?.chassisNo.slice(-6).toUpperCase()} (Ref Only)\n` +
      `• *Date:* ${new Date(inv.date).toLocaleDateString()}\n\n` +
      `*💰 Financial Summary:*\n` +
      `• *Net Amount:* ₹${inv.totalAmount.toLocaleString()}\n` +
      `• *Payment Status:* ${inv.status}\n\n` +
      `🔗 *Digital Copy:* ${window.location.origin}/view-invoice/${inv.id}?auth=v1\n\n` +
      `For any support, please call: +91 ${settings.phone}\n` +
      `_Powered by Enterprise Digital Registry_`;

    const encodedMessage = encodeURIComponent(message);
    // Sanitize phone number (strip spaces, dashes, ensure only digits)
    const cleanPhone = cust.mobile.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/91${cleanPhone}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredItems = activeTab === 'invoices' ? invoices : (activeTab === 'quotations' ? quotations : challans);
  const filteredDisplay = filteredItems.filter((item: any) => {
    const cust = customers.find(c => c.id === item.customerId);
    const searchStr = (item.invoiceNo || item.quotationNo || item.challanNo || '').toLowerCase();
    const matchesSearch = searchStr.includes(searchTerm.toLowerCase()) || cust?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || (item.discountStatus === statusFilter) || (item.approvalStatus === statusFilter);
    return matchesSearch && matchesStatus;
  });

  const handleSendChallanWhatsApp = () => {
    const customer = customers.find(c => c.id === challanData.customerId);
    const tractor = tractors.find(t => t.id === challanData.tractorId);
    
    if (!customer || !tractor) {
      showToast("Please select customer and tractor first.", "error");
      return;
    }

    const message = `Namaste ${customer.name} ji,
Aapko Eicher ${tractor.modelName} Tractor ki delivery par bahut bahut badhai 🎉
Hume bahut khushi hai ki aapne apne bharose ke liye Satyam Tractors ko chuna. Eicher tractor apni powerful performance, kam diesel khapat aur majbooti ke liye jaana jata hai, hume pura vishwas hai ki ye tractor aapke kheti ke kaam ko aur bhi aasaan aur productive banayega.
Satyam Tractors par aapko milti hai:
✔ Genuine tractor aur implements
✔ Best price aur finance facility
✔ Fast service support
Agar aapke gaon ya parichay me kisi ko tractor ya agricultural implements ki zarurat ho to hume jarur batayein.
Dhanyawaad 🙏
Satyam Tractors
Border Road, Chakghat (Rewa)
📞 8989515413 | 8839612275`;

    const whatsappUrl = `https://wa.me/91${customer.mobile}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    setWhatsappSent(true);
    showToast("WhatsApp message opened. You can now register handover.", "info");
  };

  const stats = {
    totalSales: invoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
    pendingPayments: invoices.reduce((sum, inv) => sum + (inv.totalAmount - inv.paidAmount), 0),
    quotations: quotations.length,
    invoices: invoices.length,
    challans: challans.length,
    pendingApprovals: quotations.filter(q => q.discountStatus === DocApprovalStatus.PENDING).length + 
                     invoices.filter(i => i.approvalStatus === DocApprovalStatus.PENDING).length + 
                     challans.filter(c => c.approvalStatus === DocApprovalStatus.PENDING).length
  };

  return (
    <div className={`space-y-10 pb-20 ${(selectedInvoice || selectedQuotation || selectedChallan || selectedLedgerCustomer || selectedVoucher) ? 'no-print' : ''}`}>
      {/* ERP Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 bg-hw-accent text-white text-[10px] font-mono font-bold uppercase tracking-widest">
              FINANCE_MODULE_V4
            </span>
            <span className="hw-label">
              Commercial Document Management
            </span>
          </div>
          <h1 className="text-5xl font-display font-bold text-hw-text tracking-tighter uppercase">
            Billing & <span className="text-hw-accent">Accounts</span>
          </h1>
          <p className="text-hw-muted font-mono text-sm">Lifecycle tracking for quotations, tax invoices, and delivery challans.</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => {
              if (settings.isShopClosed) {
                showToast("SHOP CLOSED: Quotation generation restricted.", "error");
                return;
              }
              setShowNewQuotation(true);
            }} 
            className={`hw-btn-secondary ${settings.isShopClosed ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <FileText size={16} /> New Quotation
          </button>
          <button 
            onClick={() => {
              if (settings.isShopClosed) {
                showToast("SHOP CLOSED: Billing restricted.", "error");
                return;
              }
              setShowNewBilling(true);
            }} 
            className={`hw-btn-primary ${settings.isShopClosed ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Receipt size={16} /> Generate Bill
          </button>
          <button 
            onClick={() => {
              if (settings.isShopClosed) {
                showToast("SHOP CLOSED: Challan generation restricted.", "error");
                return;
              }
              setShowNewChallan(true);
            }} 
            className={`hw-btn-primary bg-slate-900 border-slate-900 ${settings.isShopClosed ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Truck size={16} /> New Challan
          </button>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total Revenue', value: `₹${stats.totalSales.toLocaleString()}`, icon: Receipt, color: 'text-emerald-500' },
          { label: 'Pending Dues', value: `₹${stats.pendingPayments.toLocaleString()}`, icon: AlertCircle, color: 'text-rose-500' },
          { label: 'Quotations', value: stats.quotations, icon: FileText, color: 'text-hw-muted' },
          { label: 'Tax Invoices', value: stats.invoices, icon: Receipt, color: 'text-hw-text' },
          { label: 'Challans', value: stats.challans, icon: Truck, color: 'text-hw-muted' },
          { label: 'Approvals', value: stats.pendingApprovals, icon: CheckCircle2, color: 'text-hw-accent' },
        ].map((stat, i) => (
          <div key={i} className="bg-transparent border border-hw-border p-6 group hover:border-hw-accent transition-all duration-500">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-10 h-10 bg-hw-bg border border-hw-border flex items-center justify-center ${stat.color}`}>
                <stat.icon size={20} />
              </div>
              <span className="text-[10px] font-mono font-bold text-hw-muted uppercase tracking-widest">0{i+1}</span>
            </div>
            <p className="text-2xl font-display font-bold text-hw-text mb-1 tracking-tight">{stat.value}</p>
            <p className="text-[9px] font-mono font-bold text-hw-muted uppercase tracking-widest">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="flex p-1.5 bg-transparent border border-hw-border w-fit gap-1.5 no-print">
        {[
          { id: 'quotations', icon: Clipboard, label: 'Quotations' },
          { id: 'invoices', icon: FileText, label: 'Tax Invoices' },
          { id: 'challans', icon: Truck, label: 'Delivery Challans' }
        ].map(tab => (
          <button 
            key={tab.id} 
            onClick={() => setActiveTab(tab.id as BillingTab)} 
            className={`flex items-center gap-3 px-8 py-4 transition-all font-mono font-bold text-[10px] uppercase tracking-widest active:scale-95 ${
              activeTab === tab.id 
                ? `bg-hw-accent text-white shadow-xl shadow-hw-accent/20` 
                : `text-hw-muted hover:text-hw-text hover:bg-hw-bg`
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {settings.isShopClosed && (
        <div className="bg-rose-50 border border-rose-200 p-8 flex flex-col md:flex-row items-center justify-between gap-8 animate-pulse no-print">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-rose-600 text-white flex items-center justify-center shadow-xl shadow-rose-600/20">
              <AlertCircle size={32} />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-display font-bold text-rose-900 uppercase tracking-tight">Shop Operations Suspended</h3>
              <p className="text-sm font-mono font-bold text-rose-700 uppercase tracking-tighter">The administrator has marked the shop as CLOSED. All financial and document generation activities are temporarily disabled.</p>
            </div>
          </div>
          <CountdownTimer closedAt={settings.closedAt || ''} />
        </div>
      )}

      {/* Table Terminal */}
      <div className="bg-transparent border border-hw-border overflow-hidden no-print">
        <div className="p-6 border-b border-hw-border bg-transparent flex flex-col md:flex-row gap-6 items-center">
          <div className="relative flex-1 w-full group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-hw-muted group-focus-within:text-hw-accent transition-colors" size={18} />
            <input 
              type="text" 
              placeholder={`Filter ${activeTab} by ID or Client Name...`} 
              className="w-full pl-14 pr-6 py-4 bg-transparent border border-hw-border focus:outline-none focus:border-hw-accent transition-all font-mono font-bold text-xs uppercase tracking-tight"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {currentUser.role === UserRole.ADMIN && (
            <div className="flex gap-2 p-1 bg-transparent border border-hw-border">
              {['ALL', DocApprovalStatus.PENDING, DocApprovalStatus.APPROVED, DocApprovalStatus.REJECTED].map(s => (
                <button 
                  key={s} 
                  onClick={() => setStatusFilter(s)} 
                  className={`px-4 py-2 font-mono font-bold text-[9px] uppercase tracking-widest transition-all active:scale-95 ${statusFilter === s ? 'bg-hw-text text-hw-bg' : 'text-hw-muted hover:text-hw-text'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-transparent text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-hw-muted border-b border-hw-border">
              <tr>
                <th className="px-8 py-5">Serial / ID</th>
                <th className="px-8 py-5">Client Profile</th>
                <th className="px-8 py-5">Asset Matrix</th>
                <th className="px-8 py-5 text-right">Valuation</th>
                <th className="px-8 py-5 text-center">Control Matrix</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hw-border text-xs font-mono">
              {filteredDisplay.map((item: any) => {
                const tractor = tractors.find(t => t.id === item.tractorId);
                const cust = customers.find(c => c.id === item.customerId);
                return (
                  <tr key={item.id} className="hover:bg-hw-accent/[0.02] transition-all group">
                    <td className="px-8 py-8 border-r border-hw-border/50">
                      <p className="font-bold text-hw-text text-sm">#{item.invoiceNo || item.quotationNo || item.challanNo}</p>
                      <p className="text-[9px] text-hw-muted uppercase tracking-widest mt-1">{new Date(item.date).toLocaleDateString()}</p>
                    </td>
                    <td className="px-8 py-8 border-r border-hw-border/50">
                      <p className="font-display font-bold text-hw-text uppercase tracking-tight">{cust?.name}</p>
                      <p className="text-[9px] text-hw-muted font-bold mt-1 tracking-widest">{cust?.mobile}</p>
                    </td>
                    <td className="px-8 py-8 border-r border-hw-border/50">
                      <p className="font-bold text-hw-text uppercase tracking-tighter truncate max-w-[150px]">{tractor?.modelName}</p>
                      <p className="text-[9px] text-hw-muted font-bold mt-1 uppercase">CH: {tractor?.chassisNo.slice(-8)}</p>
                    </td>
                    <td className="px-8 py-8 text-right border-r border-hw-border/50">
                      {item.totalAmount ? (
                        <div className="space-y-1">
                          <p className="font-display font-bold text-hw-text text-lg tracking-tight">₹{item.totalAmount.toLocaleString()}</p>
                          {item.discountAmount > 0 && (
                            <p className="text-[9px] text-rose-500 font-bold uppercase tracking-widest bg-rose-500/10 px-2 py-0.5 inline-block">Disc: ₹{item.discountAmount.toLocaleString()}</p>
                          )}
                        </div>
                      ) : (
                        <p className="text-hw-muted uppercase text-[10px] font-bold tracking-widest">Delivery Only</p>
                      )}
                    </td>
                    <td className="px-8 py-8 text-center">
                      <div className="flex justify-center gap-3">
                        {activeTab === 'invoices' && (
                          <div className="flex items-center gap-3">
                            {item.approvalStatus === DocApprovalStatus.PENDING && (
                              <div className="flex items-center gap-2 mr-3">
                                <span className="px-2 py-1 bg-hw-accent/10 text-hw-accent text-[8px] font-bold uppercase border border-hw-accent/20 animate-pulse tracking-widest">Pending Approval</span>
                                {currentUser.role === UserRole.ADMIN && (
                                  <div className="flex gap-1">
                                    <button 
                                      onClick={() => onUpdateInvoice({...item, approvalStatus: DocApprovalStatus.APPROVED})} 
                                      className="p-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all active:scale-95"
                                      title="Approve Invoice"
                                    >
                                      <CheckCircle2 size={14} />
                                    </button>
                                    <button 
                                      onClick={() => onUpdateInvoice({...item, approvalStatus: DocApprovalStatus.REJECTED})} 
                                      className="p-2 bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all active:scale-95"
                                      title="Reject Invoice"
                                    >
                                      <X size={14} />
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                            {item.approvalStatus === DocApprovalStatus.REJECTED && (
                              <span className="px-2 py-1 bg-rose-500/10 text-rose-500 text-[8px] font-bold uppercase border border-rose-500/20 mr-3 tracking-widest">Rejected</span>
                            )}
                            <button 
                              onClick={() => setSelectedInvoice(item)} 
                              className="px-6 py-3 bg-hw-text text-hw-bg text-[10px] font-bold uppercase tracking-widest hover:bg-hw-accent hover:text-white transition-all flex items-center gap-2 active:scale-95 shadow-lg" 
                              title="Download Invoice"
                              disabled={item.approvalStatus === DocApprovalStatus.PENDING && currentUser.role !== UserRole.ADMIN}
                            >
                              <Download size={14} />
                              Download
                            </button>
                            <button onClick={() => handleWhatsAppShare(item)} className="p-3 bg-hw-surface border border-hw-accent/20 text-hw-accent hover:bg-hw-accent hover:text-white transition-all active:scale-95" title="Share on WhatsApp"><MessageCircle size={16} /></button>
                            <button onClick={() => setSelectedVoucher({inv: item, pay: item.payments[0]})} className="p-3 bg-hw-surface border border-hw-border text-hw-text hover:bg-hw-accent hover:text-white transition-all active:scale-95" title="Receipt Voucher"><Receipt size={16} /></button>
                            {!challans.some(c => c.invoiceId === item.id) && (
                              <button 
                                onClick={() => {
                                  if (settings.isShopClosed) {
                                    showToast("SHOP CLOSED: Challan generation restricted.", "error");
                                    return;
                                  }
                                  handleInvoiceSelectionForChallan(item.id);
                                  setShowNewChallan(true);
                                }} 
                                className="p-3 bg-hw-surface border border-hw-border text-slate-600 hover:bg-hw-accent hover:text-white transition-all active:scale-95" 
                                title="Generate Delivery Challan"
                              >
                                <Truck size={16} />
                              </button>
                            )}
                            {item.status !== 'PAID' && (
                              <button 
                                onClick={() => {
                                  if (settings.isShopClosed) {
                                    showToast("SHOP CLOSED: Payment recording restricted.", "error");
                                    return;
                                  }
                                  setSelectedInvoiceForPayment(item);
                                  setShowAddPayment(true);
                                }} 
                                className="p-3 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all active:scale-95" 
                                title="Add Part Payment"
                              >
                                <Plus size={16} />
                              </button>
                            )}
                          </div>
                        )}
                        {activeTab === 'quotations' && (
                          <div className="flex items-center gap-3">
                            {item.discountStatus === DocApprovalStatus.PENDING && (
                              <div className="flex items-center gap-2 mr-3">
                                <span className="px-2 py-1 bg-hw-accent/10 text-hw-accent text-[8px] font-bold uppercase border border-hw-accent/20 animate-pulse tracking-widest">Pending Approval</span>
                                {currentUser.role === UserRole.ADMIN && (
                                  <div className="flex gap-1">
                                    <button 
                                      onClick={() => onUpdateQuotation({...item, discountStatus: DocApprovalStatus.APPROVED})} 
                                      className="p-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all active:scale-95"
                                      title="Approve Discount"
                                    >
                                      <CheckCircle2 size={14} />
                                    </button>
                                    <button 
                                      onClick={() => onUpdateQuotation({...item, discountStatus: DocApprovalStatus.REJECTED})} 
                                      className="p-2 bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all active:scale-95"
                                      title="Reject Discount"
                                    >
                                      <X size={14} />
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                            {item.discountStatus === DocApprovalStatus.REJECTED && (
                              <span className="px-2 py-1 bg-rose-500/10 text-rose-500 text-[8px] font-bold uppercase border border-rose-500/20 mr-3 tracking-widest">Rejected</span>
                            )}
                            {item.discountStatus === DocApprovalStatus.APPROVED && item.discountAmount > 10000 && (
                              <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 text-[8px] font-bold uppercase border border-emerald-100 mr-3 tracking-widest">Approved</span>
                            )}
                            <button 
                              onClick={() => setSelectedQuotation(item)} 
                              className="px-6 py-3 bg-hw-text text-hw-bg text-[10px] font-bold uppercase tracking-widest hover:bg-hw-accent hover:text-white transition-all flex items-center gap-2 active:scale-95 shadow-lg"
                              disabled={item.discountStatus === DocApprovalStatus.PENDING && currentUser.role !== UserRole.ADMIN}
                            >
                              <Download size={14} />
                              Download
                            </button>
                          </div>
                        )}
                        {activeTab === 'challans' && (
                          <div className="flex items-center gap-3">
                            {item.approvalStatus === DocApprovalStatus.PENDING && (
                              <div className="flex items-center gap-2 mr-3">
                                <span className="px-2 py-1 bg-hw-accent/10 text-hw-accent text-[8px] font-bold uppercase border border-hw-accent/20 animate-pulse tracking-widest">Pending Approval</span>
                                {currentUser.role === UserRole.ADMIN && (
                                  <div className="flex gap-1">
                                    <button 
                                      onClick={() => onUpdateChallan({...item, approvalStatus: DocApprovalStatus.APPROVED})} 
                                      className="p-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all active:scale-95"
                                      title="Approve Challan"
                                    >
                                      <CheckCircle2 size={14} />
                                    </button>
                                    <button 
                                      onClick={() => onUpdateChallan({...item, approvalStatus: DocApprovalStatus.REJECTED})} 
                                      className="p-2 bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all active:scale-95"
                                      title="Reject Challan"
                                    >
                                      <X size={14} />
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                            {item.approvalStatus === DocApprovalStatus.REJECTED && (
                              <span className="px-2 py-1 bg-rose-500/10 text-rose-500 text-[8px] font-bold uppercase border border-rose-500/20 mr-3 tracking-widest">Rejected</span>
                            )}
                            <button 
                              onClick={() => setSelectedChallan(item)} 
                              className="px-6 py-3 bg-hw-text text-hw-bg text-[10px] font-bold uppercase tracking-widest hover:bg-hw-accent hover:text-white transition-all flex items-center gap-2 active:scale-95 shadow-lg"
                              disabled={item.approvalStatus === DocApprovalStatus.PENDING && currentUser.role !== UserRole.ADMIN}
                            >
                              <Download size={14} />
                              Download
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredDisplay.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-32 text-center text-hw-muted font-mono font-bold uppercase tracking-widest italic opacity-50">
                    No records found in current matrix.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DOCUMENT PREVIEW MODAL */}
      {(selectedInvoice || selectedQuotation || selectedChallan || selectedLedgerCustomer || selectedVoucher) && (
        <div className="fixed inset-0 z-[1000] flex flex-col bg-hw-bg animate-scale-in overflow-hidden print-container print:static print:block print:w-full print:h-auto print:z-0">
          <div className="px-6 py-4 bg-hw-text text-hw-bg flex justify-between items-center shrink-0 no-print">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-hw-accent flex items-center justify-center"><FileText size={20} /></div>
                <div><p className="font-bold text-sm sm:text-lg uppercase tracking-tighter">Document Terminal</p><p className="text-[8px] sm:text-[10px] font-mono font-bold text-hw-bg/60 uppercase tracking-widest">Digital Registry Preview</p></div>
             </div>
             <div className="flex gap-2">
                {selectedInvoice && (
                  <button onClick={() => handleWhatsAppShare(selectedInvoice)} className="px-4 sm:px-8 py-2.5 bg-hw-accent text-white rounded-xl text-[10px] sm:text-xs font-black hover:bg-hw-accent/80 transition-all flex items-center gap-2"><MessageCircle size={16} /> WhatsApp Share</button>
                )}
                <button 
                  type="button"
                  onClick={() => {
                    const id = selectedInvoice ? 'invoice-pdf-content' : 
                               selectedQuotation ? 'quotation-pdf-content' :
                               selectedChallan ? 'challan-pdf-content' :
                               selectedLedgerCustomer ? 'ledger-pdf-content' :
                               selectedVoucher ? 'voucher-pdf-content' : 'printable-content';
                    const name = selectedInvoice ? `Invoice_${selectedInvoice.invoiceNo}` : 
                                 selectedQuotation ? `Quotation_${selectedQuotation.quotationNo}` :
                                 selectedChallan ? `Challan_${selectedChallan.challanNo}` :
                                 selectedLedgerCustomer ? `Ledger_${selectedLedgerCustomer.name}` :
                                 selectedVoucher ? `Voucher_${selectedVoucher.inv.invoiceNo}` : 'Document';
                    downloadAsPDF(id, name);
                  }} 
                  className="px-4 sm:px-8 py-2.5 bg-hw-surface text-hw-text border border-hw-border rounded-xl text-[10px] sm:text-xs font-black hover:bg-hw-accent hover:text-white transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Download size={16} /> 
                  Download Copy
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    const id = selectedInvoice ? 'invoice-pdf-content' : 
                               selectedQuotation ? 'quotation-pdf-content' :
                               selectedChallan ? 'challan-pdf-content' :
                               selectedLedgerCustomer ? 'ledger-pdf-content' :
                               selectedVoucher ? 'voucher-pdf-content' : 'printable-content';
                    const name = selectedInvoice ? `Invoice_${selectedInvoice.invoiceNo}` : 
                                 selectedQuotation ? `Quotation_${selectedQuotation.quotationNo}` :
                                 selectedChallan ? `Challan_${selectedChallan.challanNo}` :
                                 selectedLedgerCustomer ? `Ledger_${selectedLedgerCustomer.name}` :
                                 selectedVoucher ? `Voucher_${selectedVoucher.inv.invoiceNo}` : 'Document';
                    downloadAsPDF(id, name);
                  }} 
                  className="px-4 sm:px-8 py-2.5 bg-hw-text text-hw-bg rounded-xl text-[10px] sm:text-xs font-black hover:bg-hw-accent hover:text-white transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Download size={16} /> 
                  Export PDF
                </button>
                <button onClick={closeAllModals} className="p-2.5 bg-white/10 text-white rounded-xl hover:bg-red-500 transition-all"><X size={24} /></button>
             </div>
          </div>
          <div id="printable-content" className="flex-1 overflow-y-auto bg-white custom-scrollbar print:overflow-visible print:p-0">
             <div className="p-0">
             {selectedInvoice && <InvoiceRenderer inv={selectedInvoice} customers={customers} tractors={tractors} catalogModels={catalogModels} settings={settings} />}
             {selectedQuotation && <QuotationRenderer quote={selectedQuotation} customers={customers} tractors={tractors} catalogModels={catalogModels} settings={settings} />}
             {selectedChallan && <ChallanRenderer challan={selectedChallan} customers={customers} tractors={tractors} invoices={invoices} settings={settings} />}
             {selectedLedgerCustomer && (
               <LedgerRenderer 
                 customer={selectedLedgerCustomer} 
                 invoices={invoices} 
                 settings={settings} 
                 currentUser={currentUser}
                 onDownloadVoucher={(inv, pay) => setSelectedVoucher({inv, pay})}
               />
             )}
             {selectedVoucher && <VoucherRenderer invoice={selectedVoucher.inv} payment={selectedVoucher.pay} customer={customers.find(c => c.id === selectedVoucher.inv.customerId)} settings={settings} />}
             </div>
          </div>
        </div>
      )}

      {/* NEW CHALLAN MODAL */}
      {showNewChallan && (
        <div className="fixed inset-0 z-[1000] flex flex-col no-print bg-white animate-scale-in overflow-hidden">
           <div className="px-6 sm:px-10 py-6 border-b bg-transparent flex justify-between items-center shrink-0">
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="p-4 sm:p-5 bg-hw-accent text-white rounded-[1.5rem] shadow-xl shadow-hw-accent/20"><Truck size={28} /></div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-hw-text uppercase tracking-tight">Delivery Challan</h2>
                  <p className="text-[8px] sm:text-[10px] font-black text-hw-muted uppercase tracking-[0.2em]">Formal Asset Handover & Technical Verification</p>
                </div>
              </div>
              <button onClick={() => setShowNewChallan(false)} className="p-3 sm:p-4 bg-white border border-slate-200 rounded-2xl hover:bg-red-50 text-slate-300 hover:text-red-500 transition-all active:scale-95"><X size={28} /></button>
           </div>
           <div className="flex-1 overflow-y-auto p-6 sm:p-12 custom-scrollbar bg-slate-50/30">
              <form onSubmit={(e) => {
                e.preventDefault();
                if (!whatsappSent && !adminApproved) {
                  showToast("Please send the WhatsApp message or get Admin Approval first.", "error");
                  return;
                }
                onAddChallan({ ...challanData, date: new Date(challanData.date).toISOString() });
                setWhatsappSent(false);
                setAdminApproved(false);
                setChallanData({
                  invoiceId: '', customerId: '', tractorId: '', hypo: '', deliveryAddress: '', deliveredBy: '', notes: '',
                  exchangeValue: 0,
                  isExchangeConfirmed: false,
                  date: new Date().toISOString().split('T')[0],
                  checklist: { hitch: false, hood: false, toolKit: false, topLink: false, drawbar: false, frontBumper: false, battery: false, tyres: false, oilLevel: false, cultivator: false }
                });
                showToast("Delivery Challan generated successfully.", "success");
                setShowNewChallan(false);
              }} className="max-w-5xl mx-auto space-y-10">
                
                {/* Reference Section */}
                <div className="bg-transparent p-8 rounded-[2.5rem] border border-hw-border shadow-sm space-y-8">
                  <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                    <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center"><FileText size={18} /></div>
                    <h3 className="text-xs font-black text-hw-text uppercase tracking-widest">Transaction Reference</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="md:col-span-2">
                      <SearchableSelect 
                        label="Reference Bill (Invoice)"
                        placeholder="-- Select Bill Number --"
                        options={invoices
                          .filter(inv => !challans.some(c => c.invoiceId === inv.id))
                          .map(inv => ({ 
                            id: inv.id, 
                            label: inv.invoiceNo, 
                            sublabel: `${customers.find(c => c.id === inv.customerId)?.name} | ${tractors.find(t => t.id === inv.tractorId)?.modelName}` 
                          }))}
                        value={challanData.invoiceId}
                        onChange={handleInvoiceSelectionForChallan}
                        required
                      />
                    </div>
                    {challanData.invoiceId && (
                      <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-top-4">
                        <div className="bg-transparent p-6 rounded-3xl border border-hw-border shadow-sm flex items-center gap-5">
                          <div className="w-12 h-12 bg-transparent border border-hw-border text-slate-600 rounded-2xl flex items-center justify-center shrink-0"><UserIcon size={24} /></div>
                          <div>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Consignee</p>
                            <p className="text-xs font-black text-hw-text uppercase">{customers.find(c => c.id === challanData.customerId)?.name}</p>
                          </div>
                        </div>
                        <div className="bg-transparent p-6 rounded-3xl border border-hw-border shadow-sm flex items-center gap-5">
                          <div className="w-12 h-12 bg-transparent border border-hw-border text-slate-600 rounded-2xl flex items-center justify-center shrink-0"><Truck size={24} /></div>
                          <div>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Asset</p>
                            <p className="text-xs font-black text-hw-text uppercase">{tractors.find(t => t.id === challanData.tractorId)?.modelName}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Logistics Section */}
                <div className="bg-transparent p-8 rounded-[2.5rem] border border-hw-border shadow-sm space-y-8">
                  <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                    <div className="w-8 h-8 bg-hw-accent/10 text-hw-accent rounded-lg flex items-center justify-center"><MapPin size={18} /></div>
                    <h3 className="text-xs font-black text-hw-text uppercase tracking-widest">Logistics & Handover Details</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Handover Date</label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                        <input 
                          type="date" 
                          className="w-full pl-12 pr-5 py-4 bg-transparent border border-hw-border rounded-2xl font-bold text-xs focus:ring-4 focus:ring-hw-accent/5 focus:border-hw-accent outline-none transition-all" 
                          value={challanData.date}
                          onChange={(e) => setChallanData({...challanData, date: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Delivery Destination</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                        <input type="text" placeholder="Leave blank for customer home address" className="w-full pl-12 pr-5 py-4 bg-transparent border border-hw-border rounded-2xl font-bold text-xs focus:ring-4 focus:ring-hw-accent/5 focus:border-hw-accent outline-none transition-all" value={challanData.deliveryAddress} onChange={(e) => setChallanData({...challanData, deliveryAddress: e.target.value})} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Handover Personnel</label>
                      <div className="relative">
                        <UserCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                        <input type="text" placeholder="Driver / Staff Name" className="w-full pl-12 pr-5 py-4 bg-transparent border border-hw-border rounded-2xl font-bold text-xs focus:ring-4 focus:ring-hw-accent/5 focus:border-hw-accent outline-none transition-all" value={challanData.deliveredBy} onChange={(e) => setChallanData({...challanData, deliveredBy: e.target.value})} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Exchange Confirmation Section */}
                {customers.find(c => c.id === challanData.customerId)?.exchange === 'Yes' && (
                  <div className="bg-transparent p-8 rounded-[2.5rem] border-2 border-hw-accent/20 bg-hw-accent/[0.02] shadow-sm space-y-8 animate-in zoom-in-95">
                    <div className="flex items-center justify-between border-b border-hw-accent/10 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-hw-accent text-white rounded-lg flex items-center justify-center"><RotateCcw size={18} /></div>
                        <h3 className="text-xs font-black text-hw-text uppercase tracking-widest">Tractor Exchange Confirmation</h3>
                      </div>
                      <span className="text-[9px] font-black text-hw-accent uppercase bg-hw-accent/10 px-3 py-1 rounded-full">Final Valuation</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirmed Exchange Value (₹)</label>
                        <div className="relative">
                          <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-hw-accent" size={18} />
                          <input 
                            type="number" 
                            placeholder="Enter final value..."
                            className="w-full pl-12 pr-5 py-4 bg-white border border-hw-border rounded-2xl font-black text-lg focus:ring-4 focus:ring-hw-accent/5 focus:border-hw-accent outline-none transition-all text-hw-accent" 
                            value={challanData.exchangeValue || ''}
                            onChange={(e) => setChallanData({...challanData, exchangeValue: Number(e.target.value)})}
                          />
                        </div>
                      </div>
                      <div className="flex items-end pb-1">
                        <label className="flex items-center gap-4 cursor-pointer group p-5 rounded-2xl border-2 border-hw-accent/10 hover:border-hw-accent/30 hover:bg-white transition-all w-full">
                          <div className="relative shrink-0">
                            <input 
                              type="checkbox" 
                              className="peer sr-only" 
                              checked={challanData.isExchangeConfirmed} 
                              onChange={(e) => setChallanData({...challanData, isExchangeConfirmed: e.target.checked})} 
                            />
                            <div className="w-8 h-8 border-2 border-hw-border rounded-xl group-hover:border-hw-accent transition-colors peer-checked:bg-hw-accent peer-checked:border-hw-accent" />
                            <CheckCircle2 size={18} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white scale-0 peer-checked:scale-100 transition-transform" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase text-hw-text">Confirm Final Value with Customer</p>
                            <p className="text-[8px] font-bold text-hw-muted uppercase tracking-widest">Verification completed at delivery site</p>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Technical Checklist */}
                <div className="bg-transparent p-8 rounded-[2.5rem] border border-hw-border shadow-sm space-y-8">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center"><ClipboardCheck size={18} /></div>
                      <h3 className="text-xs font-black text-hw-text uppercase tracking-widest">Technical Handover Checklist</h3>
                    </div>
                    <span className="text-[9px] font-black text-slate-400 uppercase bg-slate-100 px-3 py-1 rounded-full">All items mandatory</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {Object.keys(challanData.checklist).map((key) => (
                      <label key={key} className="flex items-center gap-4 cursor-pointer group p-4 rounded-2xl border border-transparent hover:border-hw-accent/10 hover:bg-hw-accent/[0.02] transition-all">
                        <div className="relative shrink-0">
                          <input 
                            type="checkbox" 
                            className="peer sr-only" 
                            checked={(challanData.checklist as any)[key]} 
                            onChange={(e) => setChallanData({...challanData, checklist: {...challanData.checklist, [key]: e.target.checked}})} 
                          />
                          <div className="w-7 h-7 border-2 border-slate-200 rounded-xl group-hover:border-emerald-400 transition-colors peer-checked:bg-emerald-500 peer-checked:border-emerald-500" />
                          <CheckCircle2 size={16} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white scale-0 peer-checked:scale-100 transition-transform" />
                        </div>
                        <span className="text-[10px] font-black uppercase text-slate-600 group-hover:text-emerald-700 transition-colors leading-tight">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Action Footer */}
                <div className="flex flex-col sm:flex-row justify-center sm:justify-end gap-4 mt-12 pb-12">
                  <button type="button" onClick={() => setShowNewChallan(false)} className="px-10 py-5 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:text-slate-600 transition-colors">Discard Draft</button>
                  {currentUser.role === UserRole.ADMIN && (
                    <button 
                      type="button" 
                      onClick={() => {
                        setAdminApproved(!adminApproved);
                        if (!adminApproved) showToast("Admin Approval Granted", "success");
                      }}
                      className={`px-10 py-5 rounded-2xl font-black uppercase text-[10px] shadow-xl transition-all flex items-center gap-3 active:scale-95 ${adminApproved ? 'bg-hw-accent/10 text-hw-accent border border-hw-accent/20' : 'bg-hw-accent text-white hover:bg-hw-accent/80 shadow-hw-accent/20'}`}
                    >
                      <ShieldCheck size={18} />
                      {adminApproved ? 'Approved by Admin' : 'Admin Approval'}
                    </button>
                  )}
                  {!adminApproved && (
                    <button 
                      type="button" 
                      onClick={handleSendChallanWhatsApp}
                      className={`px-10 py-5 rounded-2xl font-black uppercase text-[10px] shadow-xl transition-all flex items-center gap-3 active:scale-95 ${whatsappSent ? 'bg-emerald-100 text-emerald-600 border border-emerald-200' : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/20'}`}
                    >
                      <MessageCircle size={18} />
                      {whatsappSent ? 'WhatsApp Sent' : 'Send Handover Alert'}
                    </button>
                  )}
                  <button 
                    type="submit" 
                    disabled={!whatsappSent && !adminApproved}
                    className={`px-14 py-5 rounded-2xl font-black uppercase text-[10px] shadow-xl transition-all active:scale-95 ${(!whatsappSent && !adminApproved) ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-emerald-600 shadow-slate-900/20'}`}
                  >
                    Register Handover
                  </button>
                </div>
              </form>
           </div>
        </div>
      )}

      {/* NEW QUOTATION MODAL */}
      {showNewQuotation && (
        <div className="fixed inset-0 z-[1000] flex flex-col no-print bg-white animate-scale-in overflow-hidden">
           <div className="px-6 sm:px-10 py-6 border-b bg-transparent flex justify-between items-center shrink-0">
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="p-4 sm:p-5 bg-hw-accent text-white rounded-[1.5rem] shadow-xl shadow-hw-accent/20"><Clipboard size={28} /></div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-hw-text uppercase tracking-tight">Draft Quotation</h2>
                  <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Phase 1: Commercial Estimate & Asset Reservation</p>
                </div>
              </div>
              <button onClick={() => setShowNewQuotation(false)} className="p-3 sm:p-4 bg-white border border-slate-200 rounded-2xl hover:bg-red-50 text-slate-300 hover:text-red-500 transition-all active:scale-95"><X size={28} /></button>
           </div>
           <div className="flex-1 overflow-y-auto p-6 sm:p-12 custom-scrollbar bg-slate-50/30">
              <form onSubmit={(e) => {
                e.preventDefault();
                const total = quoteData.basicAmount + quoteData.accessoriesAmount + quoteData.rtoAmount + quoteData.insuranceAmount + quoteData.otherCharges - quoteData.discountAmount;
                const status = (quoteData.discountAmount > 10000 && currentUser.role !== UserRole.ADMIN) 
                  ? DocApprovalStatus.PENDING 
                  : DocApprovalStatus.APPROVED;
                onAddQuotation({ 
                  ...quoteData, 
                  totalAmount: total, 
                  discountStatus: status,
                  date: new Date(quoteData.date).toISOString() 
                });
                if (status === DocApprovalStatus.PENDING) {
                  showToast("Discount > ₹10,000. Pending Admin approval.", "info");
                } else {
                  showToast("Quotation generated successfully.", "success");
                }
                setShowNewQuotation(false);
              }} className="max-w-5xl mx-auto space-y-10">
                
                {/* Entity Selection */}
                <div className="bg-transparent p-8 rounded-[2.5rem] border border-hw-border shadow-sm space-y-8">
                  <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                    <div className="w-8 h-8 bg-hw-accent/10 text-hw-accent rounded-lg flex items-center justify-center"><UserIcon size={18} /></div>
                    <h3 className="text-xs font-black text-hw-text uppercase tracking-widest">Entity Selection</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <SearchableSelect 
                      label="Prospect / Customer"
                      placeholder="-- Select Contact --"
                      options={customers.map(c => ({ id: c.id, label: c.name, sublabel: c.mobile }))}
                      value={quoteData.customerId}
                      onChange={(val) => setQuoteData({...quoteData, customerId: val})}
                      required
                    />
                    <SearchableSelect 
                      label="Asset (In-Stock)"
                      placeholder="-- Search Chassis --"
                      options={tractors
                        .filter(t => t.status === TractorStatus.AVAILABLE && !quotations.some(q => q.tractorId === t.id))
                        .map(t => ({ id: t.id, label: t.chassisNo, sublabel: t.modelName }))}
                      value={quoteData.tractorId}
                      onChange={(val) => setQuoteData({...quoteData, tractorId: val})}
                      required
                    />
                  </div>

                  {quoteData.tractorId && (
                    <div className="bg-transparent border border-hw-border rounded-3xl p-6 flex flex-col sm:flex-row items-center gap-6 animate-in fade-in slide-in-from-top-4">
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-hw-accent shadow-sm shrink-0">
                        <Truck size={32} />
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 flex-1 w-full">
                        <div>
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Model</p>
                          <p className="text-xs font-black text-hw-text uppercase">{tractors.find(t => t.id === quoteData.tractorId)?.modelName}</p>
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Horsepower</p>
                          <p className="text-xs font-black text-slate-900 uppercase">{tractors.find(t => t.id === quoteData.tractorId)?.hp} HP</p>
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Engine No</p>
                          <p className="text-xs font-black text-slate-900 uppercase">{tractors.find(t => t.id === quoteData.tractorId)?.engineNo}</p>
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Color</p>
                          <p className="text-xs font-black text-slate-900 uppercase">{tractors.find(t => t.id === quoteData.tractorId)?.color}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Financial Estimates */}
                <div className="bg-transparent p-8 rounded-[2.5rem] border border-hw-border shadow-sm space-y-8">
                  <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                    <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center"><IndianRupee size={18} /></div>
                    <h3 className="text-xs font-black text-hw-text uppercase tracking-widest">Commercial Breakdown</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Quotation Date</label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                        <input 
                          type="date" 
                          className="w-full pl-12 pr-5 py-4 bg-transparent border border-hw-border rounded-2xl font-bold text-xs focus:ring-4 focus:ring-hw-accent/5 focus:border-hw-accent outline-none transition-all" 
                          value={quoteData.date}
                          onChange={(e) => setQuoteData({...quoteData, date: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Finance / HYPO</label>
                      <div className="relative">
                        <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                        <input type="text" placeholder="e.g. HDFC Bank, Self Finance" className="w-full pl-12 pr-5 py-4 bg-transparent border border-hw-border rounded-2xl font-bold text-xs focus:ring-4 focus:ring-hw-accent/5 focus:border-hw-accent outline-none transition-all" value={quoteData.hypo} onChange={(e) => setQuoteData({...quoteData, hypo: e.target.value})} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sales Executive</label>
                      <div className="relative">
                        <UserCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                        <input type="text" className="w-full pl-12 pr-5 py-4 bg-transparent border border-hw-border rounded-2xl font-bold text-xs focus:ring-4 focus:ring-hw-accent/5 focus:border-hw-accent outline-none transition-all" value={quoteData.salesExecutive} onChange={(e) => setQuoteData({...quoteData, salesExecutive: e.target.value})} />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-hw-muted uppercase tracking-widest ml-1">Validity (Quotation Expiry)</label>
                      <div className="relative">
                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-hw-muted/50" size={16} />
                        <SearchableSelect
                          placeholder="-- Selection Timeline --"
                          options={[
                            { id: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], label: '7 Days - Fast Track' },
                            { id: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], label: '15 Days - Standard' },
                            { id: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], label: '30 Days - Extended' }
                          ]}
                          value={quoteData.validUntil}
                          onChange={(val) => setQuoteData({...quoteData, validUntil: val})}
                          searchable={false}
                        />
                      </div>
                      <p className="text-[9px] font-bold text-hw-muted uppercase tracking-[0.1em] px-1 opacity-60">Price validity period for this consultation.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Base Asset Value (₹)</label>
                      <div className="relative">
                        <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                        <input type="number" required className="w-full pl-12 pr-5 py-4 bg-transparent border border-hw-border rounded-2xl font-black text-sm focus:ring-4 focus:ring-hw-accent/5 focus:border-hw-accent outline-none transition-all" value={quoteData.basicAmount || ''} onChange={(e) => setQuoteData({...quoteData, basicAmount: parseFloat(e.target.value) || 0})} />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase ml-1">RTO Charges</label>
                        <input type="number" className="w-full px-5 py-3.5 bg-transparent border border-hw-border rounded-xl text-xs font-bold" value={quoteData.rtoAmount || ''} onChange={(e) => setQuoteData({...quoteData, rtoAmount: parseFloat(e.target.value) || 0})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Insurance</label>
                        <input type="number" className="w-full px-5 py-3.5 bg-transparent border border-hw-border rounded-xl text-xs font-bold" value={quoteData.insuranceAmount || ''} onChange={(e) => setQuoteData({...quoteData, insuranceAmount: parseFloat(e.target.value) || 0})} />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Total Accessories (₹)</label>
                        <input type="number" className="w-full px-5 py-3.5 bg-slate-50 border border-hw-border rounded-xl text-xs font-bold" value={quoteData.accessoriesAmount || ''} readOnly />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-rose-600 uppercase ml-1">Special Discount</label>
                        <input type="number" className="w-full px-5 py-3.5 bg-transparent border border-rose-500/20 text-rose-600 rounded-xl text-xs font-black outline-none focus:ring-4 focus:ring-rose-500/5" value={quoteData.discountAmount || ''} onChange={(e) => setQuoteData({...quoteData, discountAmount: parseFloat(e.target.value) || 0})} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Internal Notes / Terms</label>
                      <textarea 
                        rows={1}
                        placeholder="e.g. Price inclusive of 5 year warranty" 
                        className="w-full px-5 py-3.5 bg-transparent border border-hw-border rounded-2xl font-bold text-xs focus:ring-4 focus:ring-hw-accent/5 focus:border-hw-accent outline-none transition-all resize-none" 
                        value={quoteData.notes} 
                        onChange={(e) => setQuoteData({...quoteData, notes: e.target.value})} 
                      />
                    </div>
                  </div>

                  {/* Detailed Accessories Section */}
                  <div className="p-6 bg-slate-50 rounded-3xl border border-dashed border-slate-300 space-y-6">
                    <div className="flex justify-between items-center">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-700">Detailed Accessories List</h4>
                      <button 
                        type="button" 
                        onClick={() => {
                          const id = Math.random().toString(36).substr(2, 9);
                          setQuoteData({
                            ...quoteData,
                            accessoriesDetail: [...quoteData.accessoriesDetail, { id, name: '', amount: 0 }]
                          });
                        }}
                        className="text-[9px] font-black text-hw-accent uppercase flex items-center gap-1 hover:underline"
                      >
                        <PlusCircle size={14} /> Add Item
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {quoteData.accessoriesDetail.map((acc, idx) => (
                        <div key={acc.id} className="flex gap-4 animate-in slide-in-from-left-2">
                          <input 
                            type="text" 
                            placeholder="Accessory Name" 
                            className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                            value={acc.name}
                            onChange={(e) => {
                              const newList = [...quoteData.accessoriesDetail];
                              newList[idx].name = e.target.value;
                              setQuoteData({ ...quoteData, accessoriesDetail: newList });
                            }}
                          />
                          <input 
                            type="number" 
                            placeholder="Price" 
                            className="w-32 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                            value={acc.amount || ''}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              const newList = [...quoteData.accessoriesDetail];
                              newList[idx].amount = val;
                              const newTotal = newList.reduce((sum, item) => sum + item.amount, 0);
                              setQuoteData({ ...quoteData, accessoriesDetail: newList, accessoriesAmount: newTotal });
                            }}
                          />
                          <button 
                            type="button" 
                            onClick={() => {
                              const newList = quoteData.accessoriesDetail.filter((_, i) => i !== idx);
                              const newTotal = newList.reduce((sum, item) => sum + item.amount, 0);
                              setQuoteData({ ...quoteData, accessoriesDetail: newList, accessoriesAmount: newTotal });
                            }}
                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                      {quoteData.accessoriesDetail.length === 0 && (
                        <p className="text-[10px] text-center text-slate-400 font-bold uppercase py-4">No detailed accessories added</p>
                      )}
                    </div>
                  </div>

                  <div className="bg-slate-900 rounded-3xl p-8 flex justify-between items-center text-white">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Total Estimated Value</p>
                      <h4 className="text-3xl font-black">₹{(quoteData.basicAmount + quoteData.accessoriesAmount + quoteData.rtoAmount + quoteData.insuranceAmount + quoteData.otherCharges - quoteData.discountAmount).toLocaleString()}</h4>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Validity</p>
                      <p className="text-xs font-black uppercase">{new Date(quoteData.validUntil).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex justify-center sm:justify-end gap-4 mt-12 pb-12">
                  <button type="button" onClick={() => setShowNewQuotation(false)} className="px-10 py-5 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:text-slate-600 transition-colors">Discard Draft</button>
                  <button type="submit" className="px-14 py-5 bg-hw-accent text-white rounded-2xl font-black uppercase text-[10px] shadow-xl shadow-hw-accent/20 hover:bg-hw-accent/80 transition-all active:scale-95">Generate Quotation</button>
                </div>
              </form>
           </div>
        </div>
      )}

      {/* ADD PAYMENT MODAL */}
      {showAddPayment && selectedInvoiceForPayment && (
        <div className="fixed inset-0 z-[1000] flex flex-col no-print bg-white animate-scale-in overflow-hidden">
          <div className="px-6 sm:px-10 py-6 border-b bg-transparent flex justify-between items-center shrink-0">
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="p-4 sm:p-5 bg-emerald-600 text-white rounded-[1.5rem] shadow-xl shadow-emerald-600/20">
                <IndianRupee size={28} />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-hw-text uppercase tracking-tight">Record Part Payment</h2>
                <div className="flex items-center gap-2">
                  <span className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Invoice: {selectedInvoiceForPayment.invoiceNo}</span>
                  <div className="h-1 w-1 bg-slate-300 rounded-full"></div>
                  <span className="text-[8px] sm:text-[10px] font-black text-emerald-600 uppercase tracking-widest">Settlement Entry</span>
                </div>
              </div>
            </div>
            <button onClick={() => setShowAddPayment(false)} className="p-3 sm:p-4 bg-white border border-slate-200 rounded-2xl hover:bg-red-50 text-slate-300 hover:text-red-500 transition-all active:scale-95">
              <X size={28} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 sm:p-12 custom-scrollbar bg-slate-50/30">
            <form onSubmit={handleAddPayment} className="grid grid-cols-1 gap-8 max-w-3xl mx-auto">
              {/* Summary Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-6 bg-transparent border border-hw-border rounded-3xl shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-transparent border border-hw-border rounded-xl flex items-center justify-center text-slate-500">
                      <Receipt size={16} />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Bill</p>
                  </div>
                  <p className="text-2xl font-black text-hw-text">₹{selectedInvoiceForPayment.totalAmount.toLocaleString()}</p>
                </div>
                <div className="p-6 bg-transparent border border-hw-border rounded-3xl shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-transparent border border-hw-border rounded-xl flex items-center justify-center text-emerald-600">
                      <CheckCircle2 size={16} />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Paid So Far</p>
                  </div>
                  <p className="text-2xl font-black text-emerald-600">₹{selectedInvoiceForPayment.paidAmount.toLocaleString()}</p>
                </div>
                <div className="p-6 bg-transparent border border-hw-border rounded-3xl shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-transparent border border-hw-border rounded-xl flex items-center justify-center text-rose-600">
                      <AlertCircle size={16} />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Balance Due</p>
                  </div>
                  <p className="text-2xl font-black text-rose-600">₹{(selectedInvoiceForPayment.totalAmount - selectedInvoiceForPayment.paidAmount).toLocaleString()}</p>
                </div>
              </div>

              <div className="bg-transparent p-8 sm:p-10 rounded-[2.5rem] border border-hw-border shadow-xl space-y-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] block text-center">Enter Payment Amount Received</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-8 flex items-center pointer-events-none">
                      <IndianRupee size={40} className="text-emerald-200 group-focus-within:text-emerald-500 transition-colors" />
                    </div>
                    <input 
                      type="number" 
                      required 
                      autoFocus
                      max={selectedInvoiceForPayment.totalAmount - selectedInvoiceForPayment.paidAmount}
                      className="w-full pl-24 pr-8 py-10 bg-transparent border-2 border-hw-border rounded-[2rem] font-black text-6xl text-center text-emerald-600 outline-none focus:ring-8 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all" 
                      value={paymentForm.amount || ''} 
                      onChange={(e) => setPaymentForm({...paymentForm, amount: parseFloat(e.target.value) || 0})} 
                    />
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 text-center uppercase tracking-widest">Maximum allowed: ₹{(selectedInvoiceForPayment.totalAmount - selectedInvoiceForPayment.paidAmount).toLocaleString()}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10 border-t border-slate-100">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Zap size={14} className="text-hw-accent" /> Payment Mode
                    </label>
                    <SearchableSelect
                      placeholder="-- Select --"
                      options={Object.values(PaymentMode).map(m => ({ id: m, label: m }))}
                      value={paymentForm.mode}
                      onChange={(val) => setPaymentForm({...paymentForm, mode: val as PaymentMode})}
                      searchable={false}
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Hash size={14} className="text-hw-accent" /> Transaction Reference
                    </label>
                    <input 
                      type="text" 
                      placeholder="UPI ID, Cheque No, etc." 
                      className="w-full px-6 py-4 bg-transparent border border-hw-border rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all" 
                      value={paymentForm.transactionRef} 
                      onChange={(e) => setPaymentForm({...paymentForm, transactionRef: e.target.value})} 
                    />
                  </div>
                  <div className="md:col-span-2 space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <MessageCircle size={14} className="text-hw-accent" /> Particulars / Remarks
                    </label>
                    <input 
                      type="text" 
                      placeholder="e.g. Second Installment, Final Settlement" 
                      className="w-full px-6 py-4 bg-transparent border border-hw-border rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all" 
                      value={paymentForm.particulars} 
                      onChange={(e) => setPaymentForm({...paymentForm, particulars: e.target.value})} 
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-center sm:justify-end gap-4 mt-8 pb-12">
                <button type="button" onClick={() => setShowAddPayment(false)} className="px-10 py-5 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:text-slate-600 transition-colors">Discard</button>
                <button type="submit" className="px-16 py-5 bg-emerald-600 text-white rounded-2xl font-black uppercase text-[10px] shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 transition-all active:scale-95">Confirm & Save Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GENERATE BILL MODAL */}
      {showNewBilling && (
        <div className="fixed inset-0 z-[1000] flex flex-col no-print bg-white animate-scale-in overflow-hidden">
          <div className="px-6 sm:px-10 py-6 border-b bg-transparent flex justify-between items-center shrink-0">
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="p-4 sm:p-5 bg-hw-accent text-white rounded-[1.5rem] shadow-xl shadow-hw-accent/20"><IndianRupee size={28} /></div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-hw-text uppercase tracking-tight">Generate Commercial Bill</h2>
                <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Phase 2: Finalizing Transaction & Legal Transfer</p>
              </div>
            </div>
            <button onClick={() => setShowNewBilling(false)} className="p-3 sm:p-4 bg-white border border-slate-200 rounded-2xl hover:bg-red-50 text-slate-300 hover:text-red-500 transition-all active:scale-95"><X size={28} /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 sm:p-12 custom-scrollbar bg-slate-50/30">
            <form onSubmit={(e) => {
              e.preventDefault();
              const total = billingData.basicAmount + billingData.accessoriesAmount + billingData.rtoAmount + billingData.insuranceAmount + billingData.otherCharges - billingData.discountAmount;
              onAddInvoice({
                ...billingData,
                totalAmount: total,
                discountStatus: DocApprovalStatus.APPROVED,
                status: billingData.paidAmount >= total ? 'PAID' : (billingData.paidAmount > 0 ? 'PARTIAL' : 'DUE'),
                date: new Date(billingData.date).toISOString()
              });
              showToast("Commercial Bill generated successfully.", "success");
              setShowNewBilling(false);
            }} className="max-w-5xl mx-auto space-y-10">
              
              {/* Reference Section */}
              <div className="bg-transparent p-8 rounded-[2.5rem] border border-hw-border shadow-sm space-y-8">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <div className="w-8 h-8 bg-hw-accent/10 text-hw-accent rounded-lg flex items-center justify-center"><Search size={18} /></div>
                  <h3 className="text-xs font-black text-hw-text uppercase tracking-widest">Quotation Lookup</h3>
                </div>
                <SearchableSelect 
                  label="Select Active Quotation"
                  placeholder="-- Choose From Registry --"
                  options={quotations
                    .filter(q => !invoices.some(inv => inv.tractorId === q.tractorId))
                    .map(q => {
                      const c = customers.find(item => item.id === q.customerId);
                      const t = tractors.find(item => item.id === q.tractorId);
                      return { id: q.id, label: `${q.quotationNo} - ${c?.name}`, sublabel: `${t?.modelName} | ${t?.chassisNo}` };
                    })}
                  value={billingData.quotationId}
                  onChange={(val) => handleQuoteSelection(val)}
                  required
                />
              </div>

              {billingData.quotationId && (
                <div className="animate-in fade-in slide-in-from-top-6 space-y-10">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-transparent p-6 rounded-3xl border border-hw-border shadow-sm flex items-center gap-5">
                      <div className="w-12 h-12 bg-transparent border border-hw-border text-slate-600 rounded-2xl flex items-center justify-center shrink-0"><UserIcon size={24} /></div>
                      <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Customer</p>
                        <p className="text-xs font-black text-hw-text uppercase">{customers.find(c => c.id === billingData.customerId)?.name}</p>
                      </div>
                    </div>
                    <div className="bg-transparent p-6 rounded-3xl border border-hw-border shadow-sm flex items-center gap-5">
                      <div className="w-12 h-12 bg-transparent border border-hw-border text-slate-600 rounded-2xl flex items-center justify-center shrink-0"><Truck size={24} /></div>
                      <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Asset</p>
                        <p className="text-xs font-black text-hw-text uppercase">{tractors.find(t => t.id === billingData.tractorId)?.modelName}</p>
                      </div>
                    </div>
                    <div className="bg-transparent p-6 rounded-3xl border border-hw-border shadow-sm flex items-center gap-5">
                      <div className="w-12 h-12 bg-transparent border border-hw-border text-emerald-600 rounded-2xl flex items-center justify-center shrink-0"><CreditCard size={24} /></div>
                      <div className="flex-1">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Payment Mode</p>
                        <SearchableSelect
                          placeholder="-- Select --"
                          options={Object.values(PaymentMode).map(m => ({ id: m, label: m }))}
                          value={billingData.paymentMode}
                          onChange={(val) => setBillingData({...billingData, paymentMode: val as PaymentMode})}
                          searchable={false}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Financial Breakdown */}
                  <div className="bg-transparent p-8 rounded-[2.5rem] border border-hw-border shadow-sm space-y-8">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                      <div className="w-8 h-8 bg-hw-accent/10 text-hw-accent rounded-lg flex items-center justify-center"><FileText size={18} /></div>
                      <h3 className="text-xs font-black text-hw-text uppercase tracking-widest">Final Financial Breakdown</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-hw-muted uppercase tracking-widest ml-1">Place of Supply</label>
                        <div className="relative">
                          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-hw-muted/50" size={16} />
                          <input type="text" className="w-full pl-12 pr-5 py-4 bg-transparent border border-hw-border rounded-2xl font-bold text-xs focus:ring-4 focus:ring-hw-accent/5 focus:border-hw-accent outline-none transition-all text-hw-text" value={billingData.placeOfSupply} onChange={(e) => setBillingData({...billingData, placeOfSupply: e.target.value})} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-hw-muted uppercase tracking-widest ml-1">Sales Executive</label>
                        <div className="relative">
                          <UserCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-hw-muted/50" size={16} />
                          <input type="text" className="w-full pl-12 pr-5 py-4 bg-transparent border border-hw-border rounded-2xl font-bold text-xs focus:ring-4 focus:ring-hw-accent/5 focus:border-hw-accent outline-none transition-all text-hw-text" value={billingData.salesExecutive} onChange={(e) => setBillingData({...billingData, salesExecutive: e.target.value})} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-hw-muted uppercase tracking-widest ml-1">Invoice Date</label>
                        <div className="relative">
                          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-hw-muted/50" size={16} />
                          <input 
                            type="date" 
                            className="w-full pl-12 pr-5 py-4 bg-transparent border border-hw-border rounded-2xl font-bold text-xs focus:ring-4 focus:ring-hw-accent/5 focus:border-hw-accent outline-none transition-all text-hw-text" 
                            value={billingData.date}
                            onChange={(e) => setBillingData({...billingData, date: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase">Base Asset</label>
                        <input type="number" className="w-full px-5 py-3.5 bg-transparent border border-hw-border rounded-xl text-xs font-bold" value={billingData.basicAmount || ''} onChange={(e) => setBillingData({...billingData, basicAmount: parseFloat(e.target.value) || 0})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase">RTO Charges</label>
                        <input type="number" className="w-full px-5 py-3.5 bg-transparent border border-hw-border rounded-xl text-xs font-bold" value={billingData.rtoAmount || ''} onChange={(e) => setBillingData({...billingData, rtoAmount: parseFloat(e.target.value) || 0})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase">Insurance</label>
                        <input type="number" className="w-full px-5 py-3.5 bg-transparent border border-hw-border rounded-xl text-xs font-bold" value={billingData.insuranceAmount || ''} onChange={(e) => setBillingData({...billingData, insuranceAmount: parseFloat(e.target.value) || 0})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-hw-accent uppercase">Accessories Sum</label>
                        <input type="number" className="w-full px-5 py-3.5 bg-hw-accent/[0.03] border border-hw-accent/20 rounded-xl text-xs font-black text-hw-accent" value={billingData.accessoriesAmount || 0} readOnly />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-rose-600 uppercase">Approved Disc.</label>
                        <input type="number" className="w-full px-5 py-3.5 bg-transparent border border-rose-500/20 text-rose-600 rounded-xl text-xs font-black" value={billingData.discountAmount || ''} onChange={(e) => setBillingData({...billingData, discountAmount: parseFloat(e.target.value) || 0})} />
                      </div>
                    </div>

                    {/* Detailed Accessories Section in Billing */}
                    <div className="p-6 bg-slate-50 rounded-3xl border border-dashed border-slate-300 space-y-6">
                      <div className="flex justify-between items-center">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-hw-muted">Detailed Accessories List</h4>
                        <button 
                          type="button" 
                          onClick={() => {
                            const id = Math.random().toString(36).substr(2, 9);
                            setBillingData({
                              ...billingData,
                              accessoriesDetail: [...billingData.accessoriesDetail, { id, name: '', amount: 0 }]
                            });
                          }}
                          className="text-[9px] font-black text-hw-accent uppercase flex items-center gap-1 hover:underline"
                        >
                          <PlusCircle size={14} /> Add Item
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        {billingData.accessoriesDetail.map((acc, idx) => (
                          <div key={acc.id} className="flex gap-4 animate-in slide-in-from-left-2">
                            <input 
                              type="text" 
                              placeholder="Accessory Name" 
                              className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                              value={acc.name}
                              onChange={(e) => {
                                const newList = [...billingData.accessoriesDetail];
                                newList[idx].name = e.target.value;
                                setBillingData({ ...billingData, accessoriesDetail: newList });
                              }}
                            />
                            <input 
                              type="number" 
                              placeholder="Price" 
                              className="w-32 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                              value={acc.amount || ''}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                const newList = [...billingData.accessoriesDetail];
                                newList[idx].amount = val;
                                const newTotal = newList.reduce((sum, item) => sum + item.amount, 0);
                                setBillingData({ ...billingData, accessoriesDetail: newList, accessoriesAmount: newTotal });
                              }}
                            />
                            <button 
                              type="button" 
                              onClick={() => {
                                const newList = billingData.accessoriesDetail.filter((_, i) => i !== idx);
                                const newTotal = newList.reduce((sum, item) => sum + item.amount, 0);
                                setBillingData({ ...billingData, accessoriesDetail: newList, accessoriesAmount: newTotal });
                              }}
                              className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-slate-900 rounded-3xl p-10 flex flex-col md:flex-row justify-between items-center gap-8 text-white">
                      <div className="text-center md:text-left">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">Net Payable Amount</p>
                        <h4 className="text-5xl font-black">₹{(billingData.basicAmount + billingData.accessoriesAmount + billingData.rtoAmount + billingData.insuranceAmount + billingData.otherCharges - billingData.discountAmount).toLocaleString()}</h4>
                      </div>
                      <div className="w-full md:w-72 space-y-4">
                        <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block text-center">Received Down Payment</label>
                        <div className="relative">
                          <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400" size={20} />
                          <input type="number" required className="w-full pl-12 pr-6 py-5 bg-white/10 border-2 border-white/20 rounded-2xl font-black text-2xl text-center text-white outline-none focus:border-emerald-400 transition-all" value={billingData.paidAmount || ''} onChange={(e) => setBillingData({...billingData, paidAmount: parseFloat(e.target.value) || 0})} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Settlement Details */}
                  <div className="bg-transparent p-8 rounded-[2.5rem] border border-hw-border shadow-sm space-y-8">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                      <div className="w-8 h-8 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center"><ShieldCheck size={18} /></div>
                      <h3 className="text-xs font-black text-hw-text uppercase tracking-widest">Settlement & Compliance</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Finance / HYPO Details</label>
                        <div className="relative">
                          <Zap className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                          <input type="text" placeholder="e.g. HDFC Bank - Loan A/C 12345" className="w-full pl-12 pr-5 py-4 bg-transparent border border-hw-border rounded-2xl font-bold text-xs focus:ring-4 focus:ring-hw-accent/5 focus:border-hw-accent outline-none transition-all" value={billingData.hypo} onChange={(e) => setBillingData({...billingData, hypo: e.target.value})} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Internal Notes</label>
                        <div className="relative">
                          <MessageCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                          <input type="text" placeholder="e.g. Special delivery instructions" className="w-full pl-12 pr-5 py-4 bg-transparent border border-hw-border rounded-2xl font-bold text-xs focus:ring-4 focus:ring-hw-accent/5 focus:border-hw-accent outline-none transition-all" value={billingData.notes} onChange={(e) => setBillingData({...billingData, notes: e.target.value})} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center sm:justify-end gap-4 mt-12 pb-12">
                    <button type="button" onClick={() => setShowNewBilling(false)} className="px-10 py-5 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:text-slate-600 transition-colors">Discard Bill</button>
                    <button type="submit" className="px-16 py-5 bg-hw-text text-hw-bg rounded-2xl font-black uppercase text-[10px] shadow-xl shadow-slate-900/20 hover:bg-hw-accent transition-all active:scale-95">Finalize & Print Bill</button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;
