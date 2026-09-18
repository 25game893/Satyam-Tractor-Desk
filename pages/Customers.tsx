
import React, { useState } from 'react';
import { downloadAsPDF } from '../src/utils/pdfGenerator';
import LedgerRenderer from '../src/components/LedgerRenderer';
import { 
  Plus, Search, User as UserIcon, Phone, MapPin, 
  X, Download, FileText, Bell, Filter as FilterIcon,
  ArrowDownAz, Calendar, ChevronDown,
  MessageCircle, AlertCircle, Truck, Clock, Save, CheckCircle2, Zap,
  LayoutGrid, List, MoreHorizontal, Edit, CreditCard
} from 'lucide-react';
import CountdownTimer from '../components/CountdownTimer';
import SearchableSelect from '../src/components/SearchableSelect';
import { Customer, LeadSource, CustomerStatus, Invoice, Tractor, ShowroomSettings, TractorModel, PaymentRecord, User, UserRole } from '../types';

// Helper to get due date
const getDueDate = (customer: Customer) => {
  if (!customer.nextFollowupDays || customer.status === CustomerStatus.SALES_LOST || customer.status === CustomerStatus.SALES_DROP || customer.status === CustomerStatus.E4) return Infinity;
  
  // Calculate delivery date
  const createdDate = new Date(customer.createdAt);
  const deliveryDate = new Date(createdDate.getTime() + (customer.expectedDeliveryDays || 0) * 24 * 60 * 60 * 1000);
  
  // Followup date is relative to the delivery date
  // User request: Expected Delivery Date > Next Follow-up Date
  // So Followup = Delivery - NextFollowupDays
  return deliveryDate.getTime() - customer.nextFollowupDays * 24 * 60 * 60 * 1000;
};

// Helper to check if followup is overdue (past due date)
const isOverdue = (customer: Customer) => {
  const dueDate = getDueDate(customer);
  if (dueDate === Infinity) return false;
  const now = new Date().getTime();
  return now > dueDate;
};

// Helper to check if followup is due today
const isDueToday = (customer: Customer) => {
  const dueDate = getDueDate(customer);
  if (dueDate === Infinity) return false;
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(startOfToday);
  endOfToday.setHours(23, 59, 59, 999);
  return dueDate >= startOfToday.getTime() && dueDate <= endOfToday.getTime();
};

// Helper to get estimated delivery date
const getEstimatedDeliveryDate = (customer: Customer) => {
  if (!customer.expectedDeliveryDays) return 'NOT SET';
  const baseDate = new Date(customer.createdAt);
  const deliveryDate = new Date(baseDate);
  deliveryDate.setDate(baseDate.getDate() + customer.expectedDeliveryDays);
  return deliveryDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

// Simplified Document Renderer for Customer View
// Moved to src/components/LedgerRenderer.tsx

interface CustomersProps {
  customers: Customer[];
  invoices: Invoice[];
  models: TractorModel[];
  settings: ShowroomSettings;
  currentUser: User;
  onAdd: (customer: Omit<Customer, 'id' | 'createdAt'>) => void;
  onUpdate: (customer: Customer) => void;
  onAddFollowupLog: (customerId: string, log: { type: 'CALL' | 'WHATSAPP' | 'VISIT' | 'OTHER', remarks: string }) => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

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

const VoucherRenderer: React.FC<{ invoice: Invoice, payment: PaymentRecord, customer?: Customer, settings: ShowroomSettings }> = ({ invoice, payment, customer, settings }) => {
  return (
    <div id="voucher-pdf-content" className="bg-hw-bg text-hw-text p-10 max-w-[500px] mx-auto border-4 border-double border-hw-border shadow-2xl font-sans text-xs relative overflow-hidden">
      <div className="text-center mb-8 border-b-2 border-hw-border pb-6">
        <img src={settings.logoUrl} className="h-16 mx-auto mb-4" alt="Logo" />
        <h2 className="text-xl font-black uppercase tracking-tight leading-none mb-1 text-hw-text">{settings.name}</h2>
        <p className="text-[9px] font-bold text-hw-muted uppercase tracking-widest">Digital Payment Acknowledgement</p>
      </div>
      <div className="bg-hw-text text-hw-bg py-2 px-4 rounded-xl mb-8 flex justify-between font-black uppercase text-[10px] tracking-widest">
        <span>Receipt Voucher</span>
        <span className="text-hw-accent font-bold tracking-tighter">#{payment.id.toUpperCase().substr(0, 8)}</span>
      </div>
      <div className="space-y-4 mb-10 px-2">
        <div className="flex justify-between text-[10px] font-bold uppercase text-hw-muted"><span>Date:</span> <span className="text-hw-text">{new Date(payment.date).toLocaleDateString()}</span></div>
        <div className="flex justify-between text-[10px] font-bold uppercase text-hw-muted"><span>Payer:</span> <span className="text-hw-text">{customer?.name}</span></div>
        <div className="flex justify-between text-[10px] font-bold uppercase text-hw-muted"><span>Reference:</span> <span className="text-hw-text">Invoice #{invoice.invoiceNo}</span></div>
        <div className="flex justify-between text-[10px] font-bold uppercase text-hw-muted"><span>Mechanism:</span> <span className="text-hw-accent font-black">{payment.mode}</span></div>
      </div>
      <div className="bg-hw-accent/5 border-2 border-hw-accent/10 p-8 rounded-[2.5rem] text-center mb-8 shadow-inner">
        <p className="text-[9px] font-black uppercase text-hw-accent tracking-[0.2em] mb-2">Commercial Liquidity Received</p>
        <p className="text-4xl font-black text-hw-text tracking-tighter">₹{payment.amount.toLocaleString()}</p>
      </div>
      <p className="text-[9px] italic mb-12 text-hw-muted uppercase font-bold text-center">Amount in words: {numberToWords(payment.amount)}</p>
      <div className="flex justify-between items-end border-t border-hw-border pt-8">
        <div className="text-[8px] text-slate-500 font-black uppercase tracking-widest">System Record Only</div>
        <div className="text-center">
          <div className="w-32 border-t-2 border-hw-text mb-2"></div>
          <p className="text-[8px] font-black uppercase tracking-widest text-hw-text">Authorized Official</p>
        </div>
      </div>
      <div className="absolute top-0 right-0 w-24 h-24 bg-hw-accent/10 blur-[40px] rounded-full -mr-12 -mt-12"></div>
    </div>
  );
};

const Customers: React.FC<CustomersProps> = ({ customers, invoices, models, settings, currentUser, onAdd, onUpdate, onAddFollowupLog, showToast }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedLedgerCustomer, setSelectedLedgerCustomer] = useState<Customer | null>(null);
  const [selectedDetailCustomer, setSelectedDetailCustomer] = useState<Customer | null>(null);
  const [filterMode, setFilterMode] = useState<'ALL' | 'DUE_TODAY' | 'OVERDUE' | CustomerStatus>('ALL');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'status'>('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [selectedVoucher, setSelectedVoucher] = useState<{inv: Invoice, pay: PaymentRecord} | null>(null);
  const [showFollowupModal, setShowFollowupModal] = useState<{customerId: string, type: 'CALL' | 'WHATSAPP' | 'VISIT' | 'OTHER', mobile?: string} | null>(null);
  const [followupRemarks, setFollowupRemarks] = useState('');
  const [followupSalesDropReason, setFollowupSalesDropReason] = useState('');
  const [followupSalesDropRemark, setFollowupSalesDropRemark] = useState('');
  const [followupSalesLostReason, setFollowupSalesLostReason] = useState('');
  const [followupSalesLostRemark, setFollowupSalesLostRemark] = useState('');
  const [followupNextDays, setFollowupNextDays] = useState(0);
  const [followupDeliveryDays, setFollowupDeliveryDays] = useState(0);
  const [updatedStatus, setUpdatedStatus] = useState<CustomerStatus | null>(null);
  const [deliveryConfirm, setDeliveryConfirm] = useState<Customer | null>(null);

  const [formData, setFormData] = useState<Omit<Customer, 'id' | 'createdAt'>>({
    name: '', mobile: '', tehsil: '', village: '', sog: '', enquiryType: '',
    interestedModel: '', applicationUsage: '', interestedImplement: 'No',
    nextFollowupDays: 0, expectedDeliveryDays: 0, paymentMethod: 'Cash',
    bankName: '', exchange: 'No', exchangeBrand: '', exchangeModel: '', exchangeYear: '',
    status: CustomerStatus.E1,
    salesDropReason: '',
    salesDropRemark: '',
    salesLostReason: '',
    salesLostRemark: ''
  });

  const filteredCustomers = customers
    .filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.mobile.includes(searchTerm);
      if (filterMode === 'DUE_TODAY') return matchesSearch && isDueToday(c);
      if (filterMode === 'OVERDUE') return matchesSearch && isOverdue(c);
      if (Object.values(CustomerStatus).includes(filterMode as CustomerStatus)) {
        return matchesSearch && c.status === filterMode;
      }
      return matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'status') return a.status.localeCompare(b.status);
      if (sortBy === 'date') {
        const dateA = getDueDate(a);
        const dateB = getDueDate(b);
        return dateA - dateB;
      }
      return 0;
    });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.mobile.length !== 10) {
      showToast('Mobile number must be exactly 10 digits.', 'error');
      return;
    }

    // Check for duplicate phone number
    const isDuplicate = customers.some(c => c.mobile === formData.mobile && c.id !== editingCustomerId);
    if (isDuplicate) {
      showToast(`Phone number ${formData.mobile} is already registered with another enquiry.`, 'error');
      return;
    }
    
    if (formData.nextFollowupDays >= formData.expectedDeliveryDays) {
      showToast('Expected Delivery Date must be later than Next Follow-up Date. (Delivery Days must be > Followup Days)', 'error');
      return;
    }
    
    if (formData.nextFollowupDays <= 0 && formData.status !== CustomerStatus.E4 && formData.status !== CustomerStatus.SALES_DROP && formData.status !== CustomerStatus.SALES_LOST) {
      showToast('Next Followup Days must be at least 1.', 'error');
      return;
    }

    if (!formData.name || !formData.mobile || !formData.tehsil || !formData.village || !formData.sog || !formData.enquiryType || !formData.interestedModel) {
      showToast('Please fill all required fields.', 'error');
      return;
    }

    if (formData.paymentMethod === 'Bank' && !formData.bankName) {
      showToast('Please specify the Bank Name.', 'error');
      return;
    }

    if (formData.exchange === 'Yes' && (!formData.exchangeBrand || !formData.exchangeModel || !formData.exchangeYear)) {
      showToast('Please fill all existing tractor details for exchange.', 'error');
      return;
    }

    if (formData.nextFollowupDays >= formData.expectedDeliveryDays) {
      showToast("Expected Delivery Date must be later than Next Follow-up Date", "error");
      return;
    }

    setIsSaving(true);
    
    // Simulate slight delay for professional feel
    setTimeout(() => {
      if (editingCustomerId) {
        const existingCustomer = customers.find(c => c.id === editingCustomerId);
        if (existingCustomer) {
          onUpdate({
            ...existingCustomer,
            ...formData
          });
          showToast('Customer profile updated successfully.', 'success');
        }
      } else {
        onAdd(formData);
        showToast('Customer profile registered successfully.', 'success');
      }
      setIsSaving(false);
      setFormData({ 
        name: '', mobile: '', tehsil: '', village: '', sog: '', enquiryType: '',
        interestedModel: '', applicationUsage: '', interestedImplement: 'No',
        nextFollowupDays: 0, expectedDeliveryDays: 0, paymentMethod: 'Cash',
        bankName: '', exchange: 'No', exchangeBrand: '', exchangeModel: '', exchangeYear: '',
        status: CustomerStatus.E1,
        salesDropReason: '',
        salesDropRemark: '',
        salesLostReason: '',
        salesLostRemark: ''
      });
      setShowAddModal(false);
      setEditingCustomerId(null);
    }, 600);
  };

  const handleEdit = (customer: Customer) => {
    setFormData({
      name: customer.name,
      mobile: customer.mobile,
      tehsil: customer.tehsil,
      village: customer.village,
      sog: customer.sog,
      enquiryType: customer.enquiryType,
      interestedModel: customer.interestedModel,
      applicationUsage: customer.applicationUsage,
      interestedImplement: customer.interestedImplement,
      nextFollowupDays: customer.nextFollowupDays,
      expectedDeliveryDays: customer.expectedDeliveryDays,
      paymentMethod: customer.paymentMethod,
      bankName: customer.bankName || '',
      exchange: customer.exchange,
      exchangeBrand: customer.exchangeBrand || '',
      exchangeModel: customer.exchangeModel || '',
      exchangeYear: customer.exchangeYear || '',
      status: customer.status,
      salesDropReason: customer.salesDropReason || '',
      salesDropRemark: customer.salesDropRemark || '',
      salesLostReason: customer.salesLostReason || '',
      salesLostRemark: customer.salesLostRemark || ''
    });
    setEditingCustomerId(customer.id);
    setShowAddModal(true);
  };

  const handleCommunication = (customerId: string, type: 'CALL' | 'WHATSAPP' | 'VISIT' | 'OTHER', mobile?: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (mobile) {
      let url = type === 'CALL' ? `tel:${mobile}` : `https://wa.me/91${mobile}`;
      
      if (type === 'WHATSAPP' && customer) {
        const message = `Namaste ${customer.name} ji,
Main Satyam Tractors se bol raha hoon. Aapne Eicher ${customer.interestedModel || '[Model]'} Tractor ke baare me enquiry ki thi.
Agar aap chahen to hum aapko latest price, finance facility aur delivery details ki poori jankari de sakte hain.
Aap kabhi bhi showroom par visit kar sakte hain ya hume reply kar sakte hain.
Dhanyawaad 🙏
Satyam Tractors
Border Road, Chakghat (Rewa)
📞 8989515413 / 8839612275`;
        url = `https://wa.me/91${mobile}?text=${encodeURIComponent(message)}`;
      }

      if (type === 'WHATSAPP') {
        window.open(url, '_blank');
      } else if (type === 'CALL') {
        window.location.href = url;
      }
    }
    
    setShowFollowupModal({ customerId, type, mobile: customer?.mobile });
    setFollowupRemarks('');
    setFollowupSalesDropReason(customer?.salesDropReason || '');
    setFollowupSalesDropRemark(customer?.salesDropRemark || '');
    setFollowupSalesLostReason(customer?.salesLostReason || '');
    setFollowupSalesLostRemark(customer?.salesLostRemark || '');
    setFollowupNextDays(customer?.nextFollowupDays || 0);
    setFollowupDeliveryDays(customer?.expectedDeliveryDays || 0);
    setUpdatedStatus(customer?.status || null);
  };

  const submitFollowup = () => {
    if (!showFollowupModal) return;

    const customer = customers.find(c => c.id === showFollowupModal.customerId);
    if (customer) {
      if (followupNextDays >= (customer.expectedDeliveryDays || 0)) {
        showToast('Next Followup Date must be before Expected Delivery Date.', 'error');
        return;
      }
      
      if (followupNextDays <= 0) {
        showToast('Next Followup Days must be at least 1.', 'error');
        return;
      }

      // Add the log
      onAddFollowupLog(showFollowupModal.customerId, { 
        type: showFollowupModal.type, 
        remarks: followupRemarks || `No remarks for ${showFollowupModal.type.toLowerCase()}` 
      });

      onUpdate({
        ...customer,
        status: updatedStatus || customer.status,
        nextFollowupDays: followupNextDays,
        expectedDeliveryDays: followupDeliveryDays,
        salesDropReason: updatedStatus === CustomerStatus.SALES_DROP ? followupSalesDropReason : customer.salesDropReason,
        salesDropRemark: updatedStatus === CustomerStatus.SALES_DROP ? followupSalesDropRemark : customer.salesDropRemark,
        salesLostReason: updatedStatus === CustomerStatus.SALES_LOST ? followupSalesLostReason : customer.salesLostReason,
        salesLostRemark: updatedStatus === CustomerStatus.SALES_LOST ? followupSalesLostRemark : customer.salesLostRemark
      });
    }

    showToast(`Follow-up ${showFollowupModal.type} logged.`, 'success');
    setShowFollowupModal(null);
    setFollowupRemarks('');
    setUpdatedStatus(null);
  };

  const handleMarkDelivered = (customer: Customer) => {
    // Check if any invoice exists for this customer ID OR for a customer with matching Name AND Mobile
    const hasInvoiceById = invoices.some(inv => inv.customerId === customer.id);
    const hasInvoiceByDetails = invoices.some(inv => {
      const invCustomer = customers.find(c => c.id === inv.customerId);
      return (
        invCustomer?.name.toLowerCase() === customer.name.toLowerCase() &&
        invCustomer?.mobile === customer.mobile
      );
    });

    if (!hasInvoiceById && !hasInvoiceByDetails) {
      showToast(`No billing found for ${customer.name}. Check Name/Mobile match.`, 'error');
      return;
    }
    setDeliveryConfirm(customer);
  };

  const confirmDelivery = () => {
    if (!deliveryConfirm) return;
    onUpdate({
      ...deliveryConfirm,
      status: CustomerStatus.E4,
      nextFollowupDays: 0
    });
    showToast(`Unit delivered to ${deliveryConfirm.name}!`, 'success');
    setDeliveryConfirm(null);
  };

  const stats = {
    total: customers.length,
    leads: customers.filter(c => c.status === CustomerStatus.E1).length,
    hot: customers.filter(c => c.status === CustomerStatus.E2).length,
    delivered: customers.filter(c => c.status === CustomerStatus.E4).length,
    overdue: customers.filter(isOverdue).length,
    dueToday: customers.filter(isDueToday).length
  };

  return (
    <div className={`space-y-8 pb-20 ${(selectedLedgerCustomer || selectedVoucher || selectedDetailCustomer) ? 'no-print' : ''}`}>
      {/* ERP Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="px-2 py-0.5 bg-hw-accent text-white text-[10px] font-mono font-bold uppercase tracking-widest">
              ENQUIRY_MODULE_V4
            </div>
            <div className="h-1 w-1 bg-hw-border rounded-full" />
            <span className="hw-label">
              Enterprise Customer Registry
            </span>
          </div>
          <h1 className="text-5xl font-display font-bold text-hw-text tracking-tighter uppercase">
            Enquiry <span className="text-hw-accent">Management</span>
          </h1>
          <p className="text-hw-muted font-mono text-sm">Lifecycle tracking for leads, prospects, and valued customers.</p>
        </div>
        <button 
          onClick={() => {
            if (settings.isShopClosed) {
              showToast("SHOP CLOSED: Registration restricted.", "error");
              return;
            }
            setEditingCustomerId(null);
            setFormData({ 
              name: '', mobile: '', tehsil: '', village: '', sog: '', enquiryType: '',
              interestedModel: '', applicationUsage: '', interestedImplement: 'No',
              nextFollowupDays: 0, expectedDeliveryDays: 0, paymentMethod: 'Cash',
              bankName: '', exchange: 'No', exchangeBrand: '', exchangeModel: '', exchangeYear: '',
              status: CustomerStatus.E1
            });
            setShowAddModal(true);
          }} 
          className={`hw-btn-primary flex items-center justify-center gap-3 ${settings.isShopClosed ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform duration-500" /> 
          Register New Profile
        </button>
      </div>

      {/* Sales Funnel Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total Database', value: stats.total, icon: UserIcon, color: 'text-hw-text', mode: 'ALL' },
          { label: 'Interested (E1)', value: stats.leads, icon: LayoutGrid, color: 'text-hw-muted', mode: CustomerStatus.E1 },
          { label: 'Considering (E2)', value: stats.hot, icon: Zap, color: 'text-hw-accent', mode: CustomerStatus.E2 },
          { label: 'Delivered (E4)', value: stats.delivered, icon: Truck, color: 'text-emerald-500', mode: CustomerStatus.E4 },
          { label: 'Due Today', value: stats.dueToday, icon: Bell, color: 'text-hw-accent', mode: 'DUE_TODAY' },
          { label: 'Action Overdue', value: stats.overdue, icon: AlertCircle, color: 'text-rose-500', mode: 'OVERDUE' },
        ].map((stat, i) => (
          <div 
            key={i} 
            onClick={() => setFilterMode(stat.mode as any)}
            className={`bg-transparent border p-6 group hover:border-hw-accent hover:bg-hw-accent/[0.02] transition-all duration-500 cursor-pointer relative ${filterMode === stat.mode ? 'border-hw-accent ring-1 ring-hw-accent bg-hw-accent/[0.04]' : 'border-hw-border'}`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`w-10 h-10 bg-hw-bg border border-hw-border flex items-center justify-center ${stat.color}`}>
                <stat.icon size={20} />
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-[10px] font-mono font-bold text-hw-muted uppercase tracking-widest">0{i+1}</span>
              </div>
            </div>
            <p className="text-3xl font-display font-bold text-hw-text mb-1">{stat.value}</p>
            <p className="text-[9px] font-mono font-bold text-hw-muted uppercase tracking-widest">{stat.label}</p>
          </div>
        ))}
      </div>

      {settings.isShopClosed && (
        <div className="bg-hw-surface border border-hw-accent/50 p-6 flex flex-col md:flex-row items-center justify-between gap-6 no-print mb-8">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-hw-bg border border-hw-accent text-hw-accent flex items-center justify-center">
              <AlertCircle size={32} />
            </div>
            <div>
              <h3 className="text-lg font-display font-bold text-hw-text uppercase tracking-tight">Shop Operations Suspended</h3>
              <p className="text-sm font-mono text-hw-muted">The administrator has marked the shop as CLOSED. Enquiry delivery updates and new lead processing are restricted.</p>
            </div>
          </div>
          <CountdownTimer closedAt={settings.closedAt || ''} />
        </div>
      )}

      <div className="bg-transparent p-5 border border-hw-border flex flex-col md:flex-row gap-4 items-center hover:bg-hw-accent/[0.01] transition-all">
        <div className="relative flex-1 w-full text-hw-text group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-hw-muted" size={20} />
          <input 
            type="text" 
            placeholder="Search profiles..." 
            className="w-full pl-14 pr-6 py-4 bg-hw-bg border border-hw-border focus:border-hw-accent outline-none font-mono font-bold text-sm transition-all" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex gap-1 bg-hw-bg p-1 border border-hw-border">
            <button 
              onClick={() => setFilterMode('ALL')}
              className={`px-4 py-3 font-mono font-bold text-[9px] uppercase tracking-widest transition-all ${filterMode === 'ALL' ? 'bg-hw-accent text-white' : 'text-hw-muted hover:text-hw-text'}`}
            >
              All
            </button>
            <button 
              onClick={() => setFilterMode('DUE_TODAY')}
              className={`px-4 py-3 font-mono font-bold text-[9px] uppercase tracking-widest transition-all flex items-center gap-2 ${filterMode === 'DUE_TODAY' ? 'bg-hw-accent text-white' : 'text-hw-muted hover:text-hw-accent'}`}
            >
              <Bell size={12} /> Today
            </button>
            <button 
              onClick={() => setFilterMode('OVERDUE')}
              className={`px-4 py-3 font-mono font-bold text-[9px] uppercase tracking-widest transition-all flex items-center gap-2 ${filterMode === 'OVERDUE' ? 'bg-hw-accent text-white' : 'text-hw-muted hover:text-hw-accent'}`}
            >
              <AlertCircle size={12} /> Overdue
            </button>
          </div>

          <div className="relative group flex-1 md:flex-none">
            <SearchableSelect 
              placeholder="Sort by..."
              options={[
                { id: 'name', label: 'Sort by Name' },
                { id: 'date', label: 'Sort by Due Date' },
                { id: 'status', label: 'Sort by Status' }
              ]}
              value={sortBy}
              onChange={(val) => setSortBy(val as any)}
              searchable={false}
            />
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-hw-muted z-10 pointer-events-none">
              {sortBy === 'name' && <ArrowDownAz size={18} />}
              {sortBy === 'date' && <Calendar size={18} />}
              {sortBy === 'status' && <LayoutGrid size={18} />}
            </div>
          </div>

          <div className="flex gap-1 bg-hw-bg p-1 border border-hw-border">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-3 transition-all ${viewMode === 'grid' ? 'bg-hw-accent text-white' : 'text-hw-muted hover:text-hw-accent'}`}
              title="Grid View"
            >
              <LayoutGrid size={18} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-3 transition-all ${viewMode === 'list' ? 'bg-hw-accent text-white' : 'text-hw-muted hover:text-hw-accent'}`}
              title="List View"
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCustomers.map((customer) => {
          const overdue = isOverdue(customer);
          const dueToday = isDueToday(customer);
          
          return (
            <div key={customer.id} className={`hw-card group relative transition-all duration-500 ${
              overdue ? 'border-hw-accent ring-4 ring-hw-accent/5' : 
              dueToday ? 'border-hw-accent ring-4 ring-hw-accent/5' : 
              'border-hw-border'
            }`}>
              {(overdue || dueToday) && (
                <div className="absolute top-6 right-6 z-10">
                  <span className={`flex items-center gap-1.5 px-4 py-1.5 text-[9px] font-mono font-bold uppercase tracking-widest border ${
                    overdue ? 'bg-hw-accent text-white border-hw-accent animate-pulse' : 'bg-hw-surface text-hw-text border-hw-border'
                  }`}>
                    {overdue ? <AlertCircle size={12} /> : <Bell size={12} />}
                    {overdue ? 'Action Overdue' : 'Follow-up Today'}
                  </span>
                </div>
              )}
              <div className="p-10">
                <div className="flex justify-between items-start mb-8">
                  <div className="relative">
                    <div className="w-16 h-16 bg-hw-bg border border-hw-border flex items-center justify-center text-hw-muted text-2xl font-display font-bold group-hover:text-hw-accent group-hover:border-hw-accent transition-all duration-500">
                      {customer.name.charAt(0)}
                    </div>
                    {customer.status === CustomerStatus.E2 && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-hw-accent text-white rounded-full flex items-center justify-center animate-pulse shadow-lg shadow-hw-accent/20">
                        <Zap size={12} fill="currentColor" />
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="flex flex-col items-end gap-2">
                      <span className={`inline-block px-3 py-1 text-[9px] font-mono font-bold uppercase border ${
                        customer.status === CustomerStatus.E4 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                        customer.status === CustomerStatus.E2 ? 'bg-hw-accent/10 border-hw-accent/20 text-hw-accent' :
                        customer.status === CustomerStatus.E3 ? 'bg-hw-accent/10 border-hw-accent/20 text-hw-accent' :
                        customer.status === CustomerStatus.QUOTATION || customer.status === CustomerStatus.DELIVERY_CHALLAN || customer.status === CustomerStatus.INVOICE ? 'bg-hw-accent/10 border-hw-accent/20 text-hw-accent' :
                        customer.status === CustomerStatus.SALES_LOST || customer.status === CustomerStatus.SALES_DROP ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' :
                        'bg-hw-bg border-hw-border text-hw-muted'
                      }`}>
                        {customer.status}
                      </span>
                      {invoices.some(inv => {
                        if (inv.customerId === customer.id) return true;
                        const invCustomer = customers.find(c => c.id === inv.customerId);
                        return (
                          invCustomer?.name.toLowerCase() === customer.name.toLowerCase() &&
                          invCustomer?.mobile === customer.mobile
                        );
                      }) && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-hw-bg border border-hw-accent/20 text-hw-accent text-[8px] font-mono font-bold uppercase">
                          <CheckCircle2 size={10} /> Commercial Bill Active
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <h3 className="text-2xl font-display font-bold text-hw-text mb-2 uppercase tracking-tighter leading-tight">
                  {customer.name}
                </h3>
                <p className="hw-label mb-6">
                  S/o, W/o: <span className="text-hw-text">{customer.sog || 'Not Specified'}</span>
                </p>

                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-3 text-sm font-mono font-bold text-hw-text">
                    <div className="w-8 h-8 bg-hw-bg border border-hw-border flex items-center justify-center text-hw-muted">
                      <Phone size={14} />
                    </div>
                    {customer.mobile}
                  </div>
                  <div className="flex items-start gap-3 text-sm font-mono font-bold text-hw-text">
                    <div className="w-8 h-8 bg-hw-bg border border-hw-border flex items-center justify-center text-hw-muted shrink-0">
                      <MapPin size={14} />
                    </div>
                    <div className="text-xs leading-relaxed pt-1">
                      {customer.village}, {customer.tehsil}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm font-mono font-bold text-hw-text">
                    <div className="w-8 h-8 bg-hw-bg border border-hw-border flex items-center justify-center text-hw-muted">
                      <Truck size={14} />
                    </div>
                    <span className="text-xs font-bold text-hw-accent uppercase tracking-widest">
                      {customer.interestedModel || 'No Model Selected'}
                    </span>
                  </div>
                </div>

                <div className="pt-8 border-t border-hw-border border-dashed space-y-3">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleCommunication(customer.id, 'CALL', customer.mobile)}
                      className="flex-1 hw-btn-secondary py-4 flex items-center justify-center gap-2"
                    >
                      <Phone size={12} /> Call
                    </button>
                    <button 
                      onClick={() => handleCommunication(customer.id, 'WHATSAPP', customer.mobile)}
                      className="flex-1 hw-btn-secondary py-4 flex items-center justify-center gap-2"
                    >
                      <MessageCircle size={12} /> WhatsApp
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleCommunication(customer.id, 'VISIT')}
                      className="flex-1 hw-btn-secondary py-4"
                    >
                      Log Visit
                    </button>
                    <button 
                      onClick={() => handleEdit(customer)}
                      className="flex-1 hw-btn-secondary py-4"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="flex gap-2">
                    {customer.status !== CustomerStatus.E4 && (
                      <button 
                        onClick={() => {
                          if (settings.isShopClosed) {
                            showToast("SHOP CLOSED: Delivery update restricted.", "error");
                            return;
                          }
                          handleMarkDelivered(customer);
                        }}
                        className={`flex-1 flex items-center justify-center gap-2 py-4 ${
                          settings.isShopClosed 
                            ? 'hw-btn-secondary opacity-50 cursor-not-allowed' 
                            : 'hw-btn-primary'
                        }`}
                      >
                        <Truck size={12} /> Delivered
                      </button>
                    )}
                  </div>
                  <button 
                    onClick={() => setSelectedDetailCustomer(customer)} 
                    className="w-full text-[9px] font-mono font-bold uppercase tracking-widest text-hw-muted hover:bg-hw-accent hover:text-white py-4 border border-hw-border transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Zap size={12} /> Intelligence Profile
                  </button>
                </div>
              </div>
              <div className={`absolute bottom-0 left-0 h-1 w-full transition-all duration-500 group-hover:h-2 ${
                overdue ? 'bg-hw-accent' : 
                dueToday ? 'bg-hw-accent' : 
                'bg-hw-border'
              }`} />
            </div>
          );
        })}
      </div>
    ) : (
      <div className="overflow-x-auto pb-4 relative">
        <div className="min-w-[1200px] flex flex-col">
          <div className="sticky top-0 z-20 flex items-center gap-4 px-6 py-4 bg-hw-bg border border-hw-border text-[9px] font-mono font-bold uppercase tracking-widest text-hw-muted shadow-sm mb-2">
            <div className="min-w-[150px]">Enquiry Stage</div>
            <div className="w-32"></div> {/* Big Gap */}
            <div className="flex-1 min-w-[200px]">Customer Name</div>
            <div className="min-w-[150px]">Phone No</div>
            <div className="flex-1 min-w-[150px]">Village</div>
            <div className="flex-1 min-w-[150px]">Tehsil</div>
            <div className="flex-1 min-w-[180px]">Est. Delivery Date</div>
            <div className="w-32 text-right">Priority</div>
          </div>
          <div className="flex flex-col gap-2">
            {filteredCustomers.map((customer) => {
              const overdue = isOverdue(customer);
              const dueToday = isDueToday(customer);
              
              return (
                <div 
                  key={customer.id} 
                  onClick={() => setSelectedDetailCustomer(customer)}
                  className={`flex items-center gap-4 px-6 py-4 bg-transparent border border-hw-border hover:border-hw-accent hover:bg-hw-accent/[0.02] transition-all group relative cursor-pointer ${overdue || dueToday ? 'border-l-4 border-l-hw-accent bg-hw-accent/[0.01]' : ''}`}
                >
                  <div className="min-w-[150px] text-hw-text font-mono text-xs font-bold uppercase tracking-tight">
                    {customer.status}
                  </div>

                  <div className="w-32"></div> {/* Big Gap */}
                  
                  <div className="flex-1 min-w-[200px]">
                    <span className="text-sm font-display font-bold text-hw-accent hover:underline uppercase tracking-tight">
                      {customer.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 min-w-[150px] text-hw-text font-mono text-xs">
                    <span className="text-hw-muted">({customer.mobile.slice(0,3)}) {customer.mobile.slice(3,6)}-{customer.mobile.slice(6)}</span>
                    <Phone size={12} className="text-hw-muted" />
                  </div>

                  <div className="flex-1 min-w-[150px] text-hw-muted font-mono text-xs uppercase">
                    {customer.village}
                  </div>

                  <div className="flex-1 min-w-[150px] text-hw-muted font-mono text-xs uppercase">
                    {customer.tehsil}
                  </div>

                  <div className="flex-1 min-w-[180px] text-hw-accent font-mono text-xs font-bold">
                    {getEstimatedDeliveryDate(customer)}
                  </div>

                  <div className="w-32 flex justify-end">
                    {customer.status === CustomerStatus.E2 ? (
                      <span className="px-3 py-1 bg-hw-accent/10 border border-hw-accent/20 text-hw-accent text-[9px] font-mono font-bold uppercase tracking-widest">
                        Hot Prospect
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-hw-bg border border-hw-border text-hw-muted text-[9px] font-mono font-bold uppercase tracking-widest">
                        General
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    )}

      {/* LEDGER MODAL (FULL SCREEN) */}
      {selectedLedgerCustomer && (
        <div className="fixed inset-0 z-[1000] flex flex-col bg-hw-bg overflow-hidden print-container print:static print:block print:w-full print:h-auto print:z-0">
          <div className="px-6 py-4 bg-hw-surface border-b border-hw-border text-hw-text flex justify-between items-center shrink-0 no-print">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-hw-accent flex items-center justify-center text-white border border-hw-border">
                 <FileText size={20} />
               </div>
               <div>
                 <p className="font-display font-bold text-sm sm:text-lg uppercase tracking-tighter">Financial Audit</p>
                 <p className="hw-label">Customer Ledger Statement</p>
               </div>
             </div>
             <div className="flex gap-2">
                <button 
                  type="button"
                  onClick={() => downloadAsPDF('ledger-pdf-content', `Ledger_${selectedLedgerCustomer.name}`)} 
                  className="px-4 sm:px-8 py-2.5 bg-hw-accent text-white border border-hw-accent rounded-none text-[10px] sm:text-xs font-mono font-bold hover:bg-hw-accent/80 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Download size={16} /> 
                  Download
                </button>
                <button onClick={() => setSelectedLedgerCustomer(null)} className="p-2.5 bg-hw-bg border border-hw-border text-hw-muted hover:text-hw-accent transition-all"><X size={24} /></button>
              </div>
          </div>
          <div id="ledger-content" className="flex-1 overflow-y-auto p-4 sm:p-10 bg-hw-bg custom-scrollbar">
            <LedgerRenderer 
              customer={selectedLedgerCustomer} 
              invoices={invoices} 
              settings={settings} 
              currentUser={currentUser}
              onDownloadVoucher={(inv, pay) => setSelectedVoucher({inv, pay})}
            />
          </div>
        </div>
      )}

      {/* VOUCHER PREVIEW MODAL */}
      {selectedVoucher && (
        <div className="fixed inset-0 z-[2000] flex flex-col bg-hw-bg overflow-hidden print-container print:static print:block print:w-full print:h-auto print:z-0">
          <div className="px-6 py-4 bg-hw-surface border-b border-hw-border text-hw-text flex justify-between items-center shrink-0 no-print">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-hw-accent flex items-center justify-center text-white border border-hw-border">
                  <FileText size={20} />
                </div>
                <div>
                  <p className="font-display font-bold text-sm sm:text-lg uppercase tracking-tighter">Receipt Voucher</p>
                  <p className="hw-label">Payment Acknowledgement</p>
                </div>
             </div>
             <div className="flex gap-2">
                <button 
                  type="button"
                  onClick={() => downloadAsPDF('voucher-pdf-content', `Voucher_${selectedVoucher.inv.invoiceNo}`)} 
                  className="px-4 sm:px-8 py-2.5 bg-hw-accent text-white border border-hw-accent rounded-none text-[10px] sm:text-xs font-mono font-bold hover:bg-hw-accent/80 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Download size={16} /> 
                  Download Copy
                </button>
                <button onClick={() => setSelectedVoucher(null)} className="p-2.5 bg-hw-bg border border-hw-border text-hw-muted hover:text-hw-accent transition-all"><X size={24} /></button>
             </div>
          </div>
          <div id="voucher-pdf-content-container" className="flex-1 overflow-y-auto bg-hw-bg custom-scrollbar">
             <div className="p-4 sm:p-10">
                <VoucherRenderer 
                  invoice={selectedVoucher.inv} 
                  payment={selectedVoucher.pay} 
                  customer={customers.find(c => c.id === selectedVoucher.inv.customerId)} 
                  settings={settings} 
                />
             </div>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedDetailCustomer && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 no-print">
          <div className="absolute inset-0 bg-hw-bg/90 backdrop-blur-sm" onClick={() => setSelectedDetailCustomer(null)}></div>
          <div className="relative bg-hw-bg w-full max-w-4xl border border-hw-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-10 py-8 bg-hw-surface border-b border-hw-border flex justify-between items-center shrink-0">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-hw-accent text-white border border-hw-border flex items-center justify-center">
                  <UserIcon size={32} />
                </div>
                <div>
                  <h2 className="text-3xl font-display font-bold text-hw-text uppercase tracking-tighter leading-tight">{selectedDetailCustomer.name}</h2>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] font-mono font-bold text-hw-muted uppercase tracking-widest">Customer Intelligence Profile</span>
                    <span className="w-1.5 h-1.5 bg-hw-border" />
                    <span className="text-[10px] font-mono font-bold text-hw-accent uppercase tracking-widest">ID: {selectedDetailCustomer.id.toUpperCase().slice(0, 8)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => {
                    handleEdit(selectedDetailCustomer);
                    setSelectedDetailCustomer(null);
                  }}
                  className="px-6 py-3 bg-hw-bg border border-hw-border text-hw-text font-mono font-bold text-[10px] uppercase tracking-widest hover:border-hw-accent transition-all flex items-center gap-2"
                >
                  <Edit size={14} /> Edit Enquiry
                </button>
                <button 
                  onClick={() => setSelectedLedgerCustomer(selectedDetailCustomer)}
                  className="px-6 py-3 bg-hw-bg border border-hw-border text-hw-text font-mono font-bold text-[10px] uppercase tracking-widest hover:border-hw-accent transition-all flex items-center gap-2"
                >
                  <FileText size={14} /> Audit Ledger
                </button>
                <button onClick={() => setSelectedDetailCustomer(null)} className="p-3 text-hw-muted hover:text-hw-accent transition-all"><X size={28} /></button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-hw-bg">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-10">
                  {/* Core Information */}
                  <section>
                    <h4 className="text-[10px] font-mono font-bold text-hw-muted uppercase tracking-widest mb-6 flex items-center gap-2">
                      <div className="w-6 h-px bg-hw-border" /> Primary Demographics
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                      <div className="p-5 bg-hw-surface border border-hw-border">
                        <p className="text-[8px] font-mono font-bold text-hw-muted uppercase tracking-widest mb-2">Mobile Contact</p>
                        <p className="text-sm font-mono font-bold text-hw-text">{selectedDetailCustomer.mobile}</p>
                      </div>
                      <div className="p-5 bg-hw-surface border border-hw-border">
                        <p className="text-[8px] font-mono font-bold text-hw-muted uppercase tracking-widest mb-2">Village / Location</p>
                        <p className="text-sm font-mono font-bold text-hw-text">{selectedDetailCustomer.village}</p>
                      </div>
                      <div className="p-5 bg-hw-surface border border-hw-border">
                        <p className="text-[8px] font-mono font-bold text-hw-muted uppercase tracking-widest mb-2">Tehsil / Region</p>
                        <p className="text-sm font-mono font-bold text-hw-text">{selectedDetailCustomer.tehsil}</p>
                      </div>
                      <div className="p-5 bg-hw-surface border border-hw-border">
                        <p className="text-[8px] font-mono font-bold text-hw-muted uppercase tracking-widest mb-2">Guardian (S/o, W/o)</p>
                        <p className="text-sm font-mono font-bold text-hw-text">{selectedDetailCustomer.sog || 'N/A'}</p>
                      </div>
                      <div className="p-5 bg-hw-surface border border-hw-border">
                        <p className="text-[8px] font-mono font-bold text-hw-muted uppercase tracking-widest mb-2">Enquiry Source</p>
                        <p className="text-sm font-mono font-bold text-hw-text">{selectedDetailCustomer.enquiryType || 'Direct'}</p>
                      </div>
                      <div className="p-5 bg-hw-surface border border-hw-border">
                        <p className="text-[8px] font-mono font-bold text-hw-muted uppercase tracking-widest mb-2">Current Status</p>
                        <span className="inline-block px-2 py-1 bg-hw-bg border border-hw-accent/20 text-hw-accent text-[9px] font-mono font-bold uppercase mt-1">{selectedDetailCustomer.status}</span>
                      </div>
                    </div>
                  </section>

                  {/* Sales Lost Audit if applicable */}
                  {selectedDetailCustomer.status === CustomerStatus.SALES_LOST && (
                    <section>
                      <h4 className="text-[10px] font-mono font-bold text-rose-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <div className="w-6 h-px bg-rose-500/20" /> Sales Lost Audit
                      </h4>
                      <div className="grid grid-cols-2 gap-6 p-6 bg-rose-500/5 border border-rose-500/10">
                        <div>
                          <p className="text-[8px] font-mono font-bold text-rose-500 uppercase tracking-widest mb-1">Reason</p>
                          <p className="text-sm font-mono font-bold text-hw-text">{selectedDetailCustomer.salesLostReason || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-[8px] font-mono font-bold text-rose-500 uppercase tracking-widest mb-1">Remark</p>
                          <p className="text-sm font-mono font-bold text-hw-text">{selectedDetailCustomer.salesLostRemark || 'N/A'}</p>
                        </div>
                      </div>
                    </section>
                  )}

                  {/* Sales Drop Audit if applicable */}
                  {selectedDetailCustomer.status === CustomerStatus.SALES_DROP && (
                    <section>
                      <h4 className="text-[10px] font-mono font-bold text-rose-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <div className="w-6 h-px bg-rose-500/20" /> Sales Drop Audit
                      </h4>
                      <div className="grid grid-cols-2 gap-6 p-6 bg-rose-500/5 border border-rose-500/10">
                        <div>
                          <p className="text-[8px] font-mono font-bold text-rose-500 uppercase tracking-widest mb-1">Reason</p>
                          <p className="text-sm font-mono font-bold text-hw-text">{selectedDetailCustomer.salesDropReason || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-[8px] font-mono font-bold text-rose-500 uppercase tracking-widest mb-1">Remark</p>
                          <p className="text-sm font-mono font-bold text-hw-text">{selectedDetailCustomer.salesDropRemark || 'N/A'}</p>
                        </div>
                      </div>
                    </section>
                  )}

                  {/* Commercial Intent */}
                  <section>
                    <h4 className="text-[10px] font-mono font-bold text-hw-muted uppercase tracking-widest mb-6 flex items-center gap-2">
                      <div className="w-6 h-px bg-hw-border" /> Commercial Intent
                    </h4>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="p-6 bg-hw-surface border border-hw-border">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-10 h-10 bg-hw-accent text-white border border-hw-border flex items-center justify-center">
                            <Truck size={20} />
                          </div>
                          <div>
                            <p className="text-[8px] font-mono font-bold text-hw-accent uppercase tracking-widest">Primary Interest</p>
                            <p className="text-lg font-display font-bold text-hw-text uppercase tracking-tighter">{selectedDetailCustomer.interestedModel}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-[10px] font-mono font-bold uppercase text-hw-muted">
                            <span>Application:</span>
                            <span className="text-hw-text">{selectedDetailCustomer.applicationUsage}</span>
                          </div>
                          <div className="flex justify-between text-[10px] font-mono font-bold uppercase text-hw-muted">
                            <span>Implement:</span>
                            <span className="text-hw-text">{selectedDetailCustomer.interestedImplement}</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-6 bg-hw-surface border border-hw-accent/20">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-10 h-10 bg-hw-bg border border-hw-border text-hw-accent flex items-center justify-center">
                            <CreditCard size={20} />
                          </div>
                          <div>
                            <p className="text-[8px] font-mono font-bold text-hw-muted uppercase tracking-widest">Financial Profile</p>
                            <p className="text-lg font-display font-bold text-hw-text uppercase tracking-tighter">{selectedDetailCustomer.paymentMethod}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-[10px] font-mono font-bold uppercase text-hw-muted">
                            <span>Bank:</span>
                            <span className="text-hw-text">{selectedDetailCustomer.bankName || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between text-[10px] font-mono font-bold uppercase text-hw-muted">
                            <span>Exchange:</span>
                            <span className="text-hw-text">{selectedDetailCustomer.exchange}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Exchange Details if applicable */}
                  {selectedDetailCustomer.exchange === 'Yes' && (
                    <section>
                      <h4 className="text-[10px] font-mono font-bold text-hw-muted uppercase tracking-widest mb-6 flex items-center gap-2">
                        <div className="w-6 h-px bg-hw-border" /> Exchange Asset Audit
                      </h4>
                      <div className="grid grid-cols-3 gap-6 p-6 bg-hw-surface border border-hw-border">
                        <div>
                          <p className="text-[8px] font-mono font-bold text-hw-accent uppercase tracking-widest mb-1">Brand</p>
                          <p className="text-sm font-mono font-bold text-hw-text">{selectedDetailCustomer.exchangeBrand || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-[8px] font-mono font-bold text-hw-accent uppercase tracking-widest mb-1">Model</p>
                          <p className="text-sm font-mono font-bold text-hw-text">{selectedDetailCustomer.exchangeModel || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-[8px] font-mono font-bold text-hw-accent uppercase tracking-widest mb-1">Year</p>
                          <p className="text-sm font-mono font-bold text-hw-text">{selectedDetailCustomer.exchangeYear || 'N/A'}</p>
                        </div>
                      </div>
                    </section>
                  )}
                </div>

                {/* Sidebar: Follow-up History */}
                <div className="space-y-8">
                  <div className="bg-hw-surface border border-hw-border p-8 flex flex-col h-full">
                  {/* Quick Intervention Matrix */}
                  <div className="flex gap-4 mb-8">
                    <button 
                      onClick={() => handleCommunication(selectedDetailCustomer.id, 'OTHER')}
                      className="flex-1 p-6 bg-hw-accent/5 border border-hw-accent/20 hover:border-hw-accent hover:bg-hw-accent/10 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-hw-accent text-white flex items-center justify-center group-hover:scale-110 transition-transform"><Clock size={24} /></div>
                        <div className="text-left">
                          <p className="text-[9px] font-black uppercase text-hw-accent tracking-widest mb-0.5">Interaction</p>
                          <p className="text-[11px] font-black text-hw-text uppercase">Log Activity</p>
                        </div>
                      </div>
                    </button>
                    <button 
                      onClick={() => handleEdit(selectedDetailCustomer)}
                      className="flex-1 p-6 bg-hw-bg border border-hw-border hover:border-hw-accent transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-hw-bg border border-hw-border flex items-center justify-center text-hw-muted group-hover:text-hw-accent transition-colors"><Calendar size={24} /></div>
                        <div className="text-left">
                          <p className="text-[9px] font-black uppercase text-hw-muted tracking-widest mb-0.5">Commercials</p>
                          <p className="text-[11px] font-black text-hw-text uppercase">Adjust Schedule</p>
                        </div>
                      </div>
                    </button>
                  </div>

                  <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2">
                      {selectedDetailCustomer.followups && selectedDetailCustomer.followups.length > 0 ? (
                        selectedDetailCustomer.followups.slice().reverse().map((log) => (
                          <div key={log.id} className="p-5 bg-hw-bg border border-hw-border relative group">
                            <div className="flex justify-between items-start mb-3">
                              <span className={`px-2 py-0.5 border text-[7px] font-mono font-bold uppercase tracking-widest ${
                                log.type === 'CALL' ? 'border-hw-accent/50 text-hw-accent' : 
                                log.type === 'WHATSAPP' ? 'border-hw-accent/50 text-hw-accent' :
                                log.type === 'VISIT' ? 'border-hw-accent/50 text-hw-accent' :
                                'border-hw-muted/50 text-hw-muted'
                              }`}>
                                {log.type}
                              </span>
                              <span className="text-[7px] font-mono font-bold text-hw-muted uppercase">
                                {new Date(log.date).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-[11px] font-mono font-medium text-hw-text leading-relaxed italic">"{log.remarks}"</p>
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-hw-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        ))
                      ) : (
                        <div className="py-20 text-center">
                          <div className="w-16 h-16 bg-hw-bg border border-hw-border flex items-center justify-center mx-auto mb-4 text-hw-muted">
                            <Clock size={32} />
                          </div>
                          <p className="text-[10px] font-mono font-bold text-hw-muted uppercase tracking-widest">No activity recorded</p>
                        </div>
                      )}
                    </div>

                    <div className="mt-8 pt-8 border-t border-hw-border border-dashed">
                      <div className="bg-hw-bg p-5 border border-hw-border">
                        <p className="text-[8px] font-mono font-bold text-hw-muted uppercase tracking-widest mb-2">Next Engagement</p>
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-mono font-bold text-hw-text">
                            {selectedDetailCustomer.nextFollowupDays ? `In ${selectedDetailCustomer.nextFollowupDays} Days` : 'Not Scheduled'}
                          </p>
                          <Calendar size={16} className="text-hw-accent" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FOLLOWUP LOG MODAL */}
      {showFollowupModal && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-hw-bg/90 backdrop-blur-sm" onClick={() => setShowFollowupModal(null)}></div>
          <div className="relative bg-hw-bg w-full max-w-md border border-hw-border shadow-2xl overflow-hidden">
            <div className="px-8 py-6 bg-hw-surface border-b border-hw-border flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 border border-hw-border flex items-center justify-center ${
                  showFollowupModal.type === 'CALL' ? 'bg-hw-accent text-white' : 
                  showFollowupModal.type === 'WHATSAPP' ? 'bg-hw-accent text-white' :
                  showFollowupModal.type === 'VISIT' ? 'bg-hw-accent text-white' :
                  'bg-hw-surface text-hw-text'
                }`}>
                  {showFollowupModal.type === 'CALL' && <Phone size={24} />}
                  {showFollowupModal.type === 'WHATSAPP' && <MessageCircle size={24} />}
                  {showFollowupModal.type === 'VISIT' && <MapPin size={24} />}
                  {showFollowupModal.type === 'OTHER' && <LayoutGrid size={24} />}
                </div>
                <div>
                  <h3 className="text-lg font-display font-bold text-hw-text uppercase tracking-tighter">Log {showFollowupModal.type}</h3>
                  <p className="hw-label">Record follow-up details</p>
                </div>
              </div>
              <button onClick={() => setShowFollowupModal(null)} className="text-hw-muted hover:text-hw-accent transition-all"><X size={24} /></button>
            </div>

            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="hw-label">Communication Remarks</label>
                <textarea 
                  autoFocus
                  className="hw-input min-h-[120px]"
                  rows={4}
                  placeholder={`What happened during the ${showFollowupModal.type.toLowerCase()}?`}
                  value={followupRemarks}
                  onChange={(e) => setFollowupRemarks(e.target.value)}
                />
                {!followupRemarks.trim() && (
                  <p className="text-[8px] font-mono font-bold text-hw-accent uppercase tracking-widest ml-1 animate-pulse">
                    * Remarks are mandatory to proceed
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <SearchableSelect 
                  label="Update Enquiry Stage"
                  placeholder="Select Stage"
                  options={Object.values(CustomerStatus).map(status => ({ id: status, label: status }))}
                  value={updatedStatus || ''}
                  onChange={(val) => setUpdatedStatus(val as CustomerStatus)}
                  searchable={false}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="hw-label">Next Followup (Days)</label>
                  <input 
                    type="number"
                    className="hw-input"
                    value={followupNextDays}
                    onChange={(e) => setFollowupNextDays(parseInt(e.target.value) || 0)}
                    min={1}
                  />
                </div>
                <div className="space-y-2">
                  <label className="hw-label">Delivery Date (Days)</label>
                  <input 
                    type="number"
                    className="hw-input"
                    value={followupDeliveryDays}
                    onChange={(e) => setFollowupDeliveryDays(parseInt(e.target.value) || 0)}
                    min={1}
                  />
                </div>
              </div>

              {updatedStatus === CustomerStatus.SALES_DROP && (
                <div className="space-y-4 p-4 bg-hw-surface border border-hw-border">
                  <div className="space-y-2">
                    <label className="hw-label text-hw-accent">Sales Drop Reason</label>
                    <SearchableSelect
                      placeholder="-- Select Reason --"
                      options={[
                        { id: 'Price too high', label: 'Price too high' },
                        { id: 'Bought another brand', label: 'Bought another brand' },
                        { id: 'Finance rejected', label: 'Finance rejected' },
                        { id: 'Postponed purchase', label: 'Postponed purchase' },
                        { id: 'Other', label: 'Other' }
                      ]}
                      value={followupSalesDropReason}
                      onChange={(val) => setFollowupSalesDropReason(val)}
                      searchable={false}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="hw-label text-hw-accent">Sales Drop Remark</label>
                    <input 
                      required 
                      className="hw-input bg-hw-bg" 
                      value={followupSalesDropRemark} 
                      onChange={(e) => setFollowupSalesDropRemark(e.target.value)} 
                      placeholder="Enter specific details"
                    />
                  </div>
                </div>
              )}

              {updatedStatus === CustomerStatus.SALES_LOST && (
                <div className="space-y-4 p-4 bg-hw-surface border border-hw-border">
                  <div className="space-y-2">
                    <label className="hw-label text-rose-500">Sales Lost Reason</label>
                    <SearchableSelect
                      placeholder="-- Select Reason --"
                      options={[
                        { id: 'Price too high', label: 'Price too high' },
                        { id: 'Bought another brand', label: 'Bought another brand' },
                        { id: 'Finance rejected', label: 'Finance rejected' },
                        { id: 'Postponed purchase', label: 'Postponed purchase' },
                        { id: 'Other', label: 'Other' }
                      ]}
                      value={followupSalesLostReason}
                      onChange={(val) => setFollowupSalesLostReason(val)}
                      searchable={false}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="hw-label text-rose-500">Sales Lost Remark</label>
                    <input 
                      required 
                      className="hw-input bg-hw-bg" 
                      value={followupSalesLostRemark} 
                      onChange={(e) => setFollowupSalesLostRemark(e.target.value)} 
                      placeholder="Enter specific details"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button 
                  onClick={() => setShowFollowupModal(null)}
                  className="flex-1 py-4 bg-hw-surface border border-hw-border text-hw-muted font-mono font-bold text-[10px] uppercase tracking-widest hover:text-hw-text transition-all"
                >
                  Discard
                </button>
                <button 
                  onClick={submitFollowup}
                  disabled={!followupRemarks.trim() || 
                    (updatedStatus === CustomerStatus.SALES_DROP && (!followupSalesDropReason || !followupSalesDropRemark.trim())) ||
                    (updatedStatus === CustomerStatus.SALES_LOST && (!followupSalesLostReason || !followupSalesLostRemark.trim()))
                  }
                  className={`flex-1 py-4 font-mono font-bold text-[10px] uppercase tracking-widest transition-all ${
                    !followupRemarks.trim() || 
                    (updatedStatus === CustomerStatus.SALES_DROP && (!followupSalesDropReason || !followupSalesDropRemark.trim())) ||
                    (updatedStatus === CustomerStatus.SALES_LOST && (!followupSalesLostReason || !followupSalesLostRemark.trim()))
                      ? 'bg-hw-surface text-hw-muted border-hw-border cursor-not-allowed' 
                      : 'bg-hw-accent text-white border border-hw-accent hover:bg-hw-accent/80'
                  }`}
                >
                  Save Log
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELIVERY CONFIRMATION MODAL */}
      {deliveryConfirm && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-hw-bg/90 backdrop-blur-sm" onClick={() => setDeliveryConfirm(null)}></div>
          <div className="relative bg-hw-bg w-full max-w-md border border-hw-border shadow-2xl overflow-hidden">
            <div className="p-8 text-center space-y-6">
              <div className="w-20 h-20 bg-hw-accent/10 border border-hw-accent/20 flex items-center justify-center mx-auto">
                <Truck size={40} className="text-hw-accent" />
              </div>
              <div>
                <h3 className="text-xl font-display font-bold text-hw-text uppercase tracking-tighter">Confirm Delivery</h3>
                <p className="text-xs font-mono font-medium text-hw-muted uppercase tracking-widest mt-2 leading-relaxed">
                  Are you sure you want to mark <span className="text-hw-text font-bold">{deliveryConfirm.name}</span> as Delivered? 
                  <br />This will clear all future follow-up stages.
                </p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeliveryConfirm(null)}
                  className="flex-1 py-4 bg-hw-surface border border-hw-border text-hw-muted font-mono font-bold text-[10px] uppercase tracking-widest hover:text-hw-text transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelivery}
                  className="flex-1 py-4 bg-hw-accent text-white border border-hw-accent font-mono font-bold text-[10px] uppercase tracking-widest hover:bg-hw-accent/80 transition-all shadow-lg shadow-hw-accent/20"
                >
                  Confirm Delivery
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REGISTRATION MODAL (FULL SCREEN FEEL) */}
      {showAddModal && (
        <div className="fixed inset-0 z-[1000] flex flex-col no-print bg-hw-bg overflow-hidden">
          <div className="px-6 sm:px-10 py-6 border-b border-hw-border bg-hw-surface flex justify-between items-center shrink-0">
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="w-12 h-12 bg-hw-accent text-white border border-hw-border flex items-center justify-center shadow-xl">
                <UserIcon size={28} />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-display font-bold text-hw-text uppercase tracking-tighter">
                  {editingCustomerId ? 'Update Enquiry Profile' : 'Profile Registration'}
                </h2>
                <p className="hw-label">
                  {editingCustomerId ? 'Modify existing commercial data' : 'Detailed Commercial Enquiry Data'}
                </p>
              </div>
            </div>
            <button onClick={() => setShowAddModal(false)} className="p-3 text-hw-muted hover:text-hw-accent rounded-none transition-all active:scale-95"><X size={32} /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 sm:p-10 custom-scrollbar bg-hw-bg">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 text-hw-text max-w-4xl mx-auto">
              <div className="space-y-1">
                <label className="hw-label">Customer Name</label>
                <input required disabled={!!editingCustomerId} className={`hw-input ${editingCustomerId ? 'opacity-50 cursor-not-allowed' : ''}`} value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="hw-label">Mobile Number</label>
                <input 
                  required 
                  disabled={!!editingCustomerId}
                  type="tel"
                  pattern="[0-9]{10}"
                  maxLength={10}
                  placeholder="10-digit mobile number"
                  className={`hw-input ${editingCustomerId ? 'opacity-50 cursor-not-allowed' : ''}`} 
                  value={formData.mobile} 
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    if (val.length <= 10) {
                      setFormData({...formData, mobile: val});
                    }
                  }} 
                />
              </div>
              <div className="space-y-1">
                <label className="hw-label">Tehsil</label>
                <input required disabled={!!editingCustomerId} className={`hw-input ${editingCustomerId ? 'opacity-50 cursor-not-allowed' : ''}`} value={formData.tehsil} onChange={(e) => setFormData({...formData, tehsil: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="hw-label">Village</label>
                <input required disabled={!!editingCustomerId} className={`hw-input ${editingCustomerId ? 'opacity-50 cursor-not-allowed' : ''}`} value={formData.village} onChange={(e) => setFormData({...formData, village: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="hw-label">S/o, W/o</label>
                <input required disabled={!!editingCustomerId} className={`hw-input ${editingCustomerId ? 'opacity-50 cursor-not-allowed' : ''}`} value={formData.sog} onChange={(e) => setFormData({...formData, sog: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="hw-label">Enquiry Type</label>
                <input required disabled={!!editingCustomerId} className={`hw-input ${editingCustomerId ? 'opacity-50 cursor-not-allowed' : ''}`} value={formData.enquiryType} onChange={(e) => setFormData({...formData, enquiryType: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="hw-label">Enquiry Stage <span className="text-rose-500">*</span></label>
                <SearchableSelect
                  placeholder="-- Select Stage --"
                  required={true}
                  options={Object.values(CustomerStatus)
                    .filter(status => {
                      if (!editingCustomerId) {
                        return status !== CustomerStatus.SALES_LOST && status !== CustomerStatus.SALES_DROP;
                      }
                      return true;
                    })
                    .map(status => ({ id: status, label: status }))}
                  value={formData.status}
                  onChange={(val) => setFormData({...formData, status: val as CustomerStatus})}
                  searchable={false}
                />
              </div>
              {formData.status === CustomerStatus.SALES_DROP && (
                <>
                  <div className="space-y-1">
                    <label className="hw-label text-hw-accent">Sales Drop Reason <span className="text-rose-500">*</span></label>
                    <SearchableSelect
                      placeholder="-- Select Reason --"
                      required={true}
                      options={[
                        { id: 'Price too high', label: 'Price too high' },
                        { id: 'Bought another brand', label: 'Bought another brand' },
                        { id: 'Finance rejected', label: 'Finance rejected' },
                        { id: 'Postponed purchase', label: 'Postponed purchase' },
                        { id: 'Other', label: 'Other' }
                      ]}
                      value={formData.salesDropReason}
                      onChange={(val) => setFormData({...formData, salesDropReason: val})}
                      searchable={false}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="hw-label text-hw-accent">Sales Drop Remark</label>
                    <input 
                      required 
                      className="hw-input bg-hw-bg" 
                      value={formData.salesDropRemark} 
                      onChange={(e) => setFormData({...formData, salesDropRemark: e.target.value})} 
                      placeholder="Enter specific details"
                    />
                  </div>
                </>
              )}
              {formData.status === CustomerStatus.SALES_LOST && (
                <>
                  <div className="space-y-1">
                    <label className="hw-label text-rose-500">Sales Lost Reason <span className="text-rose-500">*</span></label>
                    <SearchableSelect
                      placeholder="-- Select Reason --"
                      required={true}
                      options={[
                        { id: 'Price too high', label: 'Price too high' },
                        { id: 'Bought another brand', label: 'Bought another brand' },
                        { id: 'Finance rejected', label: 'Finance rejected' },
                        { id: 'Postponed purchase', label: 'Postponed purchase' },
                        { id: 'Other', label: 'Other' }
                      ]}
                      value={formData.salesLostReason}
                      onChange={(val) => setFormData({...formData, salesLostReason: val})}
                      searchable={false}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="hw-label text-rose-500">Sales Lost Remark</label>
                    <input 
                      required 
                      className="hw-input bg-hw-bg" 
                      value={formData.salesLostRemark} 
                      onChange={(e) => setFormData({...formData, salesLostRemark: e.target.value})} 
                      placeholder="Enter specific details"
                    />
                  </div>
                </>
              )}
              <div className="space-y-1">
                <label className="hw-label">Interested Model <span className="text-rose-500">*</span></label>
                <SearchableSelect
                  placeholder="-- Select Model --"
                  required={true}
                  options={models.map(m => ({ id: m.name, label: m.name, sublabel: m.manufacturer }))}
                  value={formData.interestedModel}
                  onChange={(val) => setFormData({...formData, interestedModel: val})}
                />
              </div>
              <div className="space-y-1">
                <label className="hw-label">Application Usage</label>
                <input required disabled={!!editingCustomerId} className={`hw-input ${editingCustomerId ? 'opacity-50 cursor-not-allowed' : ''}`} value={formData.applicationUsage} onChange={(e) => setFormData({...formData, applicationUsage: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="hw-label">Interested to buy Implement <span className="text-rose-500">*</span></label>
                <SearchableSelect
                  placeholder="-- Select --"
                  required={true}
                  options={[
                    { id: 'Yes', label: 'Yes' },
                    { id: 'No', label: 'No' }
                  ]}
                  value={formData.interestedImplement}
                  onChange={(val) => setFormData({...formData, interestedImplement: val})}
                  searchable={false}
                  disabled={!!editingCustomerId}
                />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-baseline">
                  <label className="hw-label text-hw-accent">Next Followup (Days)</label>
                  {formData.nextFollowupDays > 0 && (
                    <span className="text-[10px] font-black text-hw-muted italic">
                      Due: {new Date(Date.now() + formData.nextFollowupDays * 24 * 60 * 60 * 1000).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <input required type="number" className="hw-input flex-1" value={formData.nextFollowupDays || ''} onChange={(e) => setFormData({...formData, nextFollowupDays: parseInt(e.target.value) || 0})} />
                  <button type="button" onClick={() => setFormData({...formData, nextFollowupDays: (formData.nextFollowupDays || 0) + 1})} className="px-4 bg-hw-surface border border-hw-border text-hw-text font-black hover:bg-hw-accent hover:text-white transition-all">+1</button>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-baseline">
                  <label className="hw-label text-hw-accent">Expected Delivery (Days)</label>
                  {formData.expectedDeliveryDays > 0 && (
                    <span className="text-[10px] font-black text-hw-muted italic">
                      Date: {new Date(Date.now() + formData.expectedDeliveryDays * 24 * 60 * 60 * 1000).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <input required type="number" className="hw-input flex-1" value={formData.expectedDeliveryDays || ''} onChange={(e) => setFormData({...formData, expectedDeliveryDays: parseInt(e.target.value) || 0})} />
                  <button type="button" onClick={() => setFormData({...formData, expectedDeliveryDays: (formData.expectedDeliveryDays || 0) + 7})} className="px-4 bg-hw-surface border border-hw-border text-hw-text font-black hover:bg-hw-accent hover:text-white transition-all">+7 Days</button>
                </div>
              </div>
              <div className="space-y-1">
                <label className="hw-label">Payment Option <span className="text-rose-500">*</span></label>
                <SearchableSelect
                  placeholder="-- Select --"
                  required={true}
                  options={[
                    { id: 'Cash', label: 'Cash' },
                    { id: 'Bank', label: 'Bank' }
                  ]}
                  value={formData.paymentMethod}
                  onChange={(val) => setFormData({...formData, paymentMethod: val, bankName: val === 'Cash' ? '' : formData.bankName})}
                  searchable={false}
                  disabled={!!editingCustomerId}
                />
              </div>
              {formData.paymentMethod === 'Bank' && (
                <div className="space-y-1">
                  <label className="hw-label">Bank Name</label>
                  <input 
                    required 
                    disabled={!!editingCustomerId}
                    className={`hw-input ${editingCustomerId ? 'opacity-50 cursor-not-allowed' : ''}`} 
                    value={formData.bankName} 
                    onChange={(e) => setFormData({...formData, bankName: e.target.value})} 
                    placeholder="Enter bank name"
                  />
                </div>
              )}
              <div className="space-y-1">
                <label className="hw-label">Exchange Available? <span className="text-rose-500">*</span></label>
                <SearchableSelect
                  placeholder="-- Select --"
                  required={true}
                  options={[
                    { id: 'No', label: 'No' },
                    { id: 'Yes', label: 'Yes' }
                  ]}
                  value={formData.exchange}
                  onChange={(val) => setFormData({...formData, exchange: val, exchangeBrand: '', exchangeModel: '', exchangeYear: ''})}
                  searchable={false}
                />
              </div>
              {formData.exchange === 'Yes' && (
                <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 bg-hw-surface p-6 border border-hw-border">
                  <div className="space-y-1">
                    <label className="hw-label text-hw-accent">Exchange Brand</label>
                    <input 
                      required 
                      className="hw-input bg-hw-bg" 
                      value={formData.exchangeBrand} 
                      onChange={(e) => setFormData({...formData, exchangeBrand: e.target.value})} 
                      placeholder="e.g. Mahindra"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="hw-label text-hw-accent">Exchange Model</label>
                    <input 
                      required 
                      className="hw-input bg-hw-bg" 
                      value={formData.exchangeModel} 
                      onChange={(e) => setFormData({...formData, exchangeModel: e.target.value})} 
                      placeholder="e.g. 575 DI"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="hw-label text-hw-accent">Exchange Year</label>
                    <input 
                      required 
                      className="hw-input bg-hw-bg" 
                      value={formData.exchangeYear} 
                      onChange={(e) => setFormData({...formData, exchangeYear: e.target.value})} 
                      placeholder="e.g. 2018"
                    />
                  </div>
                </div>
              )}
              <div className="col-span-1 md:col-span-2 flex justify-center sm:justify-end gap-4 mt-8">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)} 
                  className="px-8 py-4 text-hw-muted font-mono font-bold uppercase text-[10px] tracking-widest hover:text-hw-text"
                >
                  Discard
                </button>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className={`hw-btn-primary px-12 py-4 ${isSaving ? 'opacity-50' : ''}`}
                >
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <Save size={16} />
                  )}
                  {editingCustomerId ? 'Update Profile' : 'Commit Registry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
