
import React, { useState } from 'react';
import { 
  RotateCcw, Search, Filter, Calendar, Clock, CheckCircle2, 
  Plus, X, AlertCircle, FileText, User, Truck, Info, TrendingDown
} from 'lucide-react';
import { 
  ReturnRequest as ReturnRequestType, Invoice, Customer, Tractor, 
  User as UserType, DocApprovalStatus, TractorStatus 
} from '../types';
import SearchableSelect from '../src/components/SearchableSelect';

interface ReturnRequestProps {
  requests: ReturnRequestType[];
  invoices: Invoice[];
  customers: Customer[];
  tractors: Tractor[];
  currentUser: UserType;
  onAdd: (data: Omit<ReturnRequestType, 'id' | 'requestId' | 'status' | 'date' | 'staffId' | 'staffName'>) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const ReturnRequest: React.FC<ReturnRequestProps> = ({ 
  requests, invoices, customers, tractors, currentUser, onAdd, showToast 
}) => {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    invoiceId: '',
    reason: ''
  });

  const filteredRequests = requests.filter(r => 
    r.requestId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.staffName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.invoiceId) {
      showToast('Please select an invoice', 'error');
      return;
    }
    if (!formData.reason.trim()) {
      showToast('Please provide a reason for return', 'error');
      return;
    }

    const invoice = invoices.find(inv => inv.id === formData.invoiceId);
    if (!invoice) return;

    onAdd({
      invoiceId: invoice.id,
      customerId: invoice.customerId,
      tractorId: invoice.tractorId,
      reason: formData.reason
    });

    showToast('Return request raised successfully', 'success');
    setShowModal(false);
    setFormData({ invoiceId: '', reason: '' });
  };

  const invoiceOptions = invoices.map(inv => {
    const customer = customers.find(c => c.id === inv.customerId);
    const tractor = tractors.find(t => t.id === inv.tractorId);
    return {
      id: inv.id,
      label: `${inv.invoiceNo} - ${customer?.name || 'Unknown'}`,
      sublabel: `${tractor?.modelName || ''} (${tractor?.chassisNo || ''})`
    };
  });

  const pendingCount = requests.filter(r => r.status === DocApprovalStatus.PENDING).length;
  const approvedToday = requests.filter(r => 
    r.status === DocApprovalStatus.APPROVED && 
    new Date(r.approvedAt!).toDateString() === new Date().toDateString()
  ).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-hw-text tracking-tighter mb-2 italic">RETURN REQUESTS</h1>
          <p className="text-hw-muted font-bold text-xs uppercase tracking-[0.2em]">Raise and track tractor return applications</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="hw-btn-primary flex items-center gap-3 px-8 py-4 group"
        >
          <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center group-hover:rotate-90 transition-transform duration-500">
            <Plus size={16} />
          </div>
          <span className="uppercase tracking-widest text-[11px] font-black">Raise Return Request</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="hw-card p-8 group">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-hw-accent/5 rounded-2xl flex items-center justify-center text-hw-accent group-hover:scale-110 transition-transform duration-500">
                  <RotateCcw size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-hw-text tracking-tight uppercase">My Requests</h3>
                  <p className="text-[10px] font-bold text-hw-muted uppercase tracking-widest">Tracking verification status</p>
                </div>
              </div>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-hw-muted" size={16} />
                <input 
                  type="text" 
                  placeholder="Filter requests..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-6 py-3 bg-hw-bg border border-hw-border rounded-xl text-xs font-bold outline-none focus:border-hw-accent transition-all w-full sm:w-64"
                />
              </div>
            </div>

            <div className="space-y-4">
              {filteredRequests.length > 0 ? (
                filteredRequests.map(r => {
                  const invoice = invoices.find(inv => inv.id === r.invoiceId);
                  const customer = customers.find(c => c.id === r.customerId);
                  const tractor = tractors.find(t => t.id === r.tractorId);

                  return (
                    <div key={r.id} className="p-6 bg-hw-bg/50 border border-hw-border rounded-2xl hover:border-hw-accent/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-6 group/item">
                      <div className="flex items-center gap-5">
                        <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center border shadow-sm ${
                          r.status === DocApprovalStatus.APPROVED ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                          r.status === DocApprovalStatus.REJECTED ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' :
                          'bg-amber-500/10 border-amber-500/20 text-amber-500'
                        }`}>
                          <Calendar size={18} />
                        </div>
                        <div>
                          <p className="text-xs font-black text-hw-text uppercase tracking-tight">{r.requestId}</p>
                          <p className="text-[10px] font-bold text-hw-muted uppercase tracking-widest mt-0.5">
                            {customer?.name} • {invoice?.invoiceNo}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                             <div className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-[0.1em] border ${
                                r.status === DocApprovalStatus.APPROVED ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-500' :
                                r.status === DocApprovalStatus.REJECTED ? 'bg-rose-500/5 border-rose-500/10 text-rose-500' :
                                'bg-amber-500/5 border-amber-500/10 text-amber-500'
                             }`}>
                                {r.status}
                             </div>
                             <span className="text-[9px] font-bold text-hw-muted uppercase tracking-widest">
                               Applied on {new Date(r.date).toLocaleDateString()}
                             </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <p className="text-[10px] font-black text-hw-text uppercase tracking-widest leading-none">Reason for Return</p>
                        <p className="text-xs font-bold text-hw-muted italic">"{r.reason}"</p>
                        {r.status === DocApprovalStatus.APPROVED && (
                            <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest mt-2">
                              Approved by {r.approvedBy}
                            </p>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex items-center justify-center py-20 border-2 border-dashed border-hw-border rounded-3xl bg-hw-bg/30">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-hw-surface rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                      <RotateCcw size={32} className="text-hw-muted/20" />
                    </div>
                    <p className="text-[10px] font-black text-hw-muted uppercase tracking-widest">No return requests found</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="hw-card p-8 bg-hw-accent text-hw-accent-foreground relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-700">
               <TrendingDown size={120} />
            </div>
            <h3 className="text-lg font-black tracking-tight mb-6 uppercase italic relative z-10">Application Summary</h3>
            <div className="space-y-6 relative z-10">
              <div className="flex items-center justify-between p-5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/50">Awaiting Admin</p>
                  <p className="text-3xl font-black">{pendingCount}</p>
                </div>
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                  <Clock size={24} />
                </div>
              </div>
              <div className="flex items-center justify-between p-5 bg-emerald-500/10 backdrop-blur-sm border border-emerald-500/20 rounded-2xl">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Successfully Returned</p>
                  <p className="text-3xl font-black text-emerald-400">{approvedToday}</p>
                </div>
                <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400">
                  <CheckCircle2 size={24} />
                </div>
              </div>
            </div>
          </div>

          <div className="hw-card p-8">
            <div className="flex items-center gap-3 mb-6">
                <Info size={18} className="text-hw-accent" />
                <h3 className="text-lg font-black text-hw-text tracking-tight uppercase">Staff Protocol</h3>
            </div>
            <div className="space-y-4">
              <div className="p-5 bg-hw-bg rounded-2xl border border-hw-border group hover:border-hw-accent/20 transition-all">
                <p className="text-[10px] font-black text-hw-accent uppercase tracking-[0.2em] mb-2 leading-none">Step 01</p>
                <p className="text-xs font-bold text-hw-muted">Verify original invoice and chassis number against physically returned unit.</p>
              </div>
              <div className="p-5 bg-hw-bg rounded-2xl border border-hw-border group hover:border-hw-accent/20 transition-all">
                <p className="text-[10px] font-black text-hw-accent uppercase tracking-[0.2em] mb-2 leading-none">Step 02</p>
                <p className="text-xs font-bold text-hw-muted">Note specific customer concerns or vehicle defects in the reason field.</p>
              </div>
              <div className="p-5 bg-hw-bg rounded-2xl border border-hw-border group hover:border-hw-accent/20 transition-all">
                <p className="text-[10px] font-black text-hw-accent uppercase tracking-[0.2em] mb-2 leading-none">Step 03</p>
                <p className="text-xs font-bold text-hw-muted">Wait for Administrator approval before marking vehicle as available in warehouse.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RAISE REQUEST MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 sm:p-10">
          <div className="absolute inset-0 bg-hw-bg/80 backdrop-blur-md" onClick={() => setShowModal(false)}></div>
          
          <div className="w-full max-w-2xl bg-hw-surface border border-hw-border rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
             <div className="h-2 bg-hw-accent w-full"></div>
             
             <button 
               onClick={() => setShowModal(false)}
               className="absolute top-8 right-8 p-3 bg-hw-bg hover:bg-hw-accent hover:text-white rounded-2xl transition-all z-10"
             >
               <X size={20} />
             </button>

             <div className="p-8 sm:p-12">
                <div className="flex items-center gap-5 mb-10">
                   <div className="w-16 h-16 bg-hw-accent text-white rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-hw-accent/20">
                      <RotateCcw size={32} />
                   </div>
                   <div>
                      <h2 className="text-3xl font-black text-hw-text tracking-tighter uppercase italic">Raise Return Request</h2>
                      <p className="text-[10px] font-bold text-hw-muted uppercase tracking-[0.2em] mt-1">Submit application for management review</p>
                   </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                   <div className="space-y-6">
                      <div className="grid grid-cols-1 gap-6">
                        <SearchableSelect 
                          label="Select Sold Invoice"
                          placeholder="Search by Invoice No or Customer Name..."
                          options={invoiceOptions}
                          value={formData.invoiceId}
                          onChange={(val) => setFormData({ ...formData, invoiceId: val })}
                          required
                        />

                        <div className="space-y-2">
                           <label className="hw-label italic">Reason for Return</label>
                           <textarea 
                             required
                             placeholder="Describe why the customer is returning the vehicle (e.g. Finance rejected, defective unit, change of mind)..."
                             className="w-full h-32 px-6 py-4 bg-hw-bg border border-hw-border rounded-[1.5rem] outline-none focus:border-hw-accent transition-all font-bold text-xs resize-none"
                             value={formData.reason}
                             onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                           />
                        </div>
                      </div>
                   </div>

                   <div className="pt-6 border-t border-hw-border flex items-center justify-end gap-3">
                      <button 
                        type="button"
                        onClick={() => setShowModal(false)}
                        className="px-8 py-4 bg-hw-bg hover:bg-hw-border text-[11px] font-black uppercase tracking-widest text-hw-muted rounded-2xl transition-all"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        className="hw-btn-primary px-10 py-4 flex items-center gap-3"
                      >
                        <CheckCircle2 size={18} />
                        <span className="uppercase tracking-widest text-[11px] font-black">Submit Application</span>
                      </button>
                   </div>
                </form>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReturnRequest;
