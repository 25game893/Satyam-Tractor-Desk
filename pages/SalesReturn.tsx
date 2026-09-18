
import React, { useState } from 'react';
import { 
  Undo2, Search, Filter, Calendar, TrendingDown, DollarSign, 
  CheckCircle2, XCircle, Info, Clock, ArrowRight, User, Truck, FileText, AlertCircle
} from 'lucide-react';
import { 
  ReturnRequest as ReturnRequestType, Invoice, Customer, Tractor, 
  DocApprovalStatus, TractorStatus 
} from '../types';

interface SalesReturnProps {
  requests: ReturnRequestType[];
  invoices: Invoice[];
  customers: Customer[];
  tractors: Tractor[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const SalesReturn: React.FC<SalesReturnProps> = ({ 
  requests, invoices, customers, tractors, onApprove, onReject, showToast 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<DocApprovalStatus | 'ALL'>('ALL');

  const filteredRequests = requests.filter(r => {
    const matchesSearch = 
      r.requestId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || r.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleApprove = (id: string) => {
    onApprove(id);
    showToast('Return request approved and tractor restored to inventory', 'success');
  };

  const handleReject = (id: string) => {
    onReject(id);
    showToast('Return request rejected', 'info');
  };

  const totalReturnValue = requests
    .filter(r => r.status === DocApprovalStatus.APPROVED)
    .reduce((sum, r) => {
        const inv = invoices.find(i => i.id === r.invoiceId);
        return sum + (inv?.totalAmount || 0);
    }, 0);

  const pendingCount = requests.filter(r => r.status === DocApprovalStatus.PENDING).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-hw-text tracking-tighter mb-2 italic">SALES RETURNS</h1>
          <p className="text-hw-muted font-bold text-xs uppercase tracking-[0.2em]">Management approval & inventory restoration</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="hw-card p-8 group">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-hw-accent/5 rounded-2xl flex items-center justify-center text-hw-accent group-hover:scale-110 transition-transform duration-500">
                  <Undo2 size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-hw-text tracking-tight uppercase">Incoming Requests</h3>
                  <p className="text-[10px] font-bold text-hw-muted uppercase tracking-widest">Awaiting management verification</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                 <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-hw-muted" size={16} />
                    <input 
                      type="text" 
                      placeholder="Filter..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 pr-6 py-3 bg-hw-bg border border-hw-border rounded-xl text-xs font-bold outline-none focus:border-hw-accent transition-all w-full sm:w-48"
                    />
                  </div>
                  <select 
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="px-4 py-3 bg-hw-bg border border-hw-border rounded-xl text-[10px] font-black uppercase tracking-widest outline-none focus:border-hw-accent"
                  >
                    <option value="ALL">All Status</option>
                    <option value={DocApprovalStatus.PENDING}>Pending</option>
                    <option value={DocApprovalStatus.APPROVED}>Approved</option>
                    <option value={DocApprovalStatus.REJECTED}>Rejected</option>
                  </select>
              </div>
            </div>

            <div className="space-y-4">
              {filteredRequests.length > 0 ? (
                filteredRequests.map(r => {
                  const invoice = invoices.find(inv => inv.id === r.invoiceId);
                  const customer = customers.find(c => c.id === r.customerId);
                  const tractor = tractors.find(t => t.id === r.tractorId);

                  return (
                    <div key={r.id} className="p-8 bg-hw-bg/50 border border-hw-border rounded-3xl hover:border-hw-accent/30 transition-all group/item overflow-hidden">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-4">
                             <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                   <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                      r.status === DocApprovalStatus.APPROVED ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                                      r.status === DocApprovalStatus.REJECTED ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' :
                                      'bg-amber-500/10 border-amber-500/20 text-amber-500'
                                   }`}>
                                      {r.status}
                                   </span>
                                   <span className="text-[10px] font-bold text-hw-muted uppercase tracking-widest">ID: {r.requestId}</span>
                                </div>

                                {r.status === DocApprovalStatus.PENDING && (
                                   <div className="flex items-center gap-2">
                                      <button 
                                        onClick={() => handleReject(r.id)}
                                        className="p-3 bg-white text-rose-500 hover:bg-rose-500 hover:text-white border border-hw-border rounded-xl transition-all shadow-sm active:scale-90"
                                        title="Reject"
                                      >
                                        <XCircle size={16} />
                                      </button>
                                      <button 
                                        onClick={() => handleApprove(r.id)}
                                        className="p-3 bg-hw-accent text-white hover:bg-hw-accent/90 border border-hw-accent rounded-xl shadow-lg transition-all active:scale-90"
                                        title="Approve"
                                      >
                                        <CheckCircle2 size={16} />
                                      </button>
                                   </div>
                                )}
                             </div>

                             <div>
                                <h4 className="text-xl font-black text-hw-text tracking-tighter uppercase mb-1">{customer?.name}</h4>
                                <p className="text-xs font-bold text-hw-muted flex items-center gap-2">
                                   <FileText size={14} /> {invoice?.invoiceNo} • ₹{invoice?.totalAmount.toLocaleString()}
                                </p>
                             </div>

                             <div className="p-4 bg-hw-surface border border-hw-border rounded-2xl">
                                <p className="text-[9px] font-black text-hw-accent uppercase tracking-widest mb-2 flex items-center gap-2">
                                   <Info size={12} /> Staff Reason
                                </p>
                                <p className="text-xs font-bold text-hw-muted leading-relaxed italic">"{r.reason}"</p>
                             </div>
                          </div>

                          <div className="space-y-4">
                             <div className="flex items-center gap-3 text-hw-muted mb-2">
                                <Clock size={14} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Raised by {r.staffName} on {new Date(r.date).toLocaleDateString()}</span>
                             </div>

                             <div className="hw-card p-5 bg-hw-surface border-hw-border/50">
                                <div className="flex items-center gap-4">
                                   <div className="w-10 h-10 bg-hw-accent/5 rounded-xl flex items-center justify-center text-hw-accent">
                                      <Truck size={20} />
                                   </div>
                                   <div>
                                      <p className="text-[10px] font-black text-hw-text uppercase tracking-tight">{tractor?.modelName}</p>
                                      <p className="text-[9px] font-bold text-hw-muted uppercase tracking-widest">SH: {tractor?.chassisNo}</p>
                                   </div>
                                </div>
                             </div>

                             {(r.status === DocApprovalStatus.APPROVED || r.status === DocApprovalStatus.REJECTED) && (
                                <div className="flex items-center gap-2 p-3 bg-hw-bg rounded-xl border border-hw-border border-dashed">
                                    <User size={12} className="text-hw-muted" />
                                    <span className="text-[9px] font-bold text-hw-muted uppercase tracking-widest">
                                        Action taken by {r.approvedBy || 'System'} {r.approvedAt ? `on ${new Date(r.approvedAt).toLocaleDateString()}` : ''}
                                    </span>
                                </div>
                             )}
                          </div>
                       </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex items-center justify-center py-20 border-2 border-dashed border-hw-border rounded-3xl bg-hw-bg/30">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-hw-surface rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                      <Undo2 size={32} className="text-hw-muted/20" />
                    </div>
                    <p className="text-[10px] font-black text-hw-muted uppercase tracking-widest">No pending return requests</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="hw-card p-8 bg-hw-accent text-hw-accent-foreground relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-700">
               <DollarSign size={120} />
            </div>
            <h3 className="text-lg font-black tracking-tight mb-6 uppercase italic relative z-10">Return Statistics</h3>
            <div className="space-y-6 relative z-10">
              <div className="flex items-center justify-between p-5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/50">Items Back in stock</p>
                  <p className="text-3xl font-black">{requests.filter(r => r.status === DocApprovalStatus.APPROVED).length}</p>
                </div>
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                  <Truck size={24} />
                </div>
              </div>
              <div className="flex items-center justify-between p-5 bg-rose-500/10 backdrop-blur-sm border border-rose-500/20 rounded-2xl">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-rose-400">Total Refund Value</p>
                  <p className="text-2xl font-black text-rose-400">₹{totalReturnValue.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-rose-500/20 rounded-xl flex items-center justify-center text-rose-400">
                  <DollarSign size={24} />
                </div>
              </div>
            </div>
          </div>

          <div className="hw-card p-8 bg-hw-bg border-hw-border">
             <div className="flex items-center gap-3 mb-6">
                <AlertCircle size={18} className="text-hw-accent" />
                <h3 className="text-lg font-black text-hw-text tracking-tight uppercase italic">Admin Protocol</h3>
             </div>
             <div className="space-y-4">
                <div className="p-5 bg-hw-surface rounded-2xl border border-hw-border">
                   <p className="text-[10px] font-black text-hw-accent uppercase tracking-widest mb-2">Auto-Inventory Restoration</p>
                   <p className="text-xs font-bold text-hw-muted leading-relaxed">Approving a return will automatically update the tractor's status to <span className="text-hw-accent">AVAILABLE</span> in the system inventory.</p>
                </div>
                <div className="p-5 bg-hw-surface rounded-2xl border border-hw-border">
                   <p className="text-[10px] font-black text-hw-accent uppercase tracking-widest mb-2">Audit Compliance</p>
                   <p className="text-xs font-bold text-hw-muted leading-relaxed">All returns are logged with staff ID and timestamp for financial reconciliation.</p>
                </div>
             </div>
          </div>

          <div className="space-y-4">
              <button className="w-full py-5 bg-hw-bg border border-hw-border rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-hw-accent hover:text-white transition-all shadow-xl shadow-hw-accent/5">
                Generate Full Return Audit
              </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesReturn;
