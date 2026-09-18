
import React, { useState } from 'react';
import { Search, Truck, User, Phone, Hash, Calendar, CheckCircle2, Filter } from 'lucide-react';
import { Tractor, Customer, Invoice, TractorStatus } from '../types';

interface VehicleMasterProps {
  tractors: Tractor[];
  customers: Customer[];
  invoices: Invoice[];
}

const VehicleMaster: React.FC<VehicleMasterProps> = ({ tractors, customers, invoices }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter delivered tractors
  const deliveredTractors = tractors.filter(t => t.status === TractorStatus.DELIVERED);

  const masterData = deliveredTractors.map(tractor => {
    // Find the invoice for this tractor to get the customer
    const invoice = invoices.find(inv => inv.tractorId === tractor.id);
    const customer = customers.find(c => c.id === invoice?.customerId);

    return {
      tractor,
      customer,
      invoice
    };
  });

  const filteredData = masterData.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    return (
      item.tractor.modelName.toLowerCase().includes(searchLower) ||
      item.tractor.chassisNo.toLowerCase().includes(searchLower) ||
      item.customer?.name.toLowerCase().includes(searchLower) ||
      item.customer?.mobile.includes(searchTerm)
    );
  });

  return (
    <div className="space-y-10 pb-20">
      {/* ERP Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 bg-hw-accent text-white text-[10px] font-mono font-bold uppercase tracking-widest">
              REGISTRY_V2
            </span>
            <span className="hw-label">
              Historical Vehicle Records
            </span>
          </div>
          <h1 className="text-5xl font-display font-bold text-hw-text tracking-tighter uppercase">
            Vehicle Master
          </h1>
          <p className="text-hw-muted font-mono text-sm">Complete record of all delivered units and their owners.</p>
        </div>
        
        <div className="bg-hw-surface border border-hw-border p-6 shadow-xl flex items-center gap-6">
          <div className="w-12 h-12 bg-hw-bg border border-hw-border flex items-center justify-center text-hw-accent">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-[10px] font-mono font-bold text-hw-muted uppercase tracking-widest leading-none mb-1">Total Deliveries</p>
            <p className="text-3xl font-display font-bold text-hw-text tracking-tight">{deliveredTractors.length}</p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-hw-surface border border-hw-border p-2 shadow-xl">
        <div className="relative group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-hw-muted group-focus-within:text-hw-accent transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="SEARCH BY CUSTOMER, MOBILE, MODEL OR CHASSIS..." 
            className="w-full pl-16 pr-8 py-6 bg-hw-bg border border-hw-border outline-none focus:border-hw-accent transition-all font-mono font-bold text-xs text-hw-text uppercase tracking-wider shadow-inner" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-hw-surface border border-hw-border shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-hw-bg border-b border-hw-border">
                <th className="px-8 py-6 text-[10px] font-mono font-bold text-hw-muted uppercase tracking-widest">Customer Details</th>
                <th className="px-8 py-6 text-[10px] font-mono font-bold text-hw-muted uppercase tracking-widest">Vehicle Info</th>
                <th className="px-8 py-6 text-[10px] font-mono font-bold text-hw-muted uppercase tracking-widest">Chassis No</th>
                <th className="px-8 py-6 text-[10px] font-mono font-bold text-hw-muted uppercase tracking-widest">Delivery Date</th>
                <th className="px-8 py-6 text-[10px] font-mono font-bold text-hw-muted uppercase tracking-widest text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hw-border">
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <tr key={item.tractor.id} className="hover:bg-hw-bg/50 transition-colors group">
                    <td className="px-8 py-8">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-hw-bg border border-hw-border flex items-center justify-center text-hw-muted group-hover:bg-hw-text group-hover:text-hw-bg transition-all duration-300">
                          <User size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-display font-bold text-hw-text uppercase tracking-tight">{item.customer?.name || 'Unknown'}</p>
                          <p className="text-[10px] font-mono font-bold text-hw-muted flex items-center gap-2 mt-1 uppercase tracking-widest">
                            <Phone size={10} className="text-hw-accent" /> {item.customer?.mobile || '-'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-8">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-hw-bg border border-hw-border flex items-center justify-center text-hw-muted group-hover:bg-hw-text group-hover:text-hw-bg transition-all duration-300">
                          <Truck size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-display font-bold text-hw-text uppercase tracking-tight">{item.tractor.modelName}</p>
                          <p className="text-[10px] font-mono font-bold text-hw-muted uppercase tracking-widest mt-1">{item.tractor.manufacturer} • {item.tractor.color || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-8">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-hw-bg border border-hw-border flex items-center justify-center text-hw-accent">
                          <Hash size={14} />
                        </div>
                        <span className="text-xs font-mono font-bold text-hw-text uppercase tracking-widest">{item.tractor.chassisNo}</span>
                      </div>
                    </td>
                    <td className="px-8 py-8">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-hw-bg border border-hw-border flex items-center justify-center text-hw-muted">
                          <Calendar size={14} />
                        </div>
                        <span className="text-xs font-mono font-bold text-hw-text uppercase tracking-widest">
                          {item.invoice ? new Date(item.invoice.date).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-8 text-right">
                      <span className="px-4 py-1.5 bg-hw-bg text-hw-text text-[9px] font-mono font-bold uppercase tracking-widest border border-hw-border group-hover:bg-hw-accent group-hover:text-white group-hover:border-hw-accent transition-all duration-300">
                        Delivered
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-8 py-32 text-center">
                    <div className="flex flex-col items-center gap-6 opacity-20">
                      <div className="w-24 h-24 bg-hw-bg border border-hw-border flex items-center justify-center">
                        <Truck size={48} />
                      </div>
                      <p className="text-xl font-display font-bold uppercase tracking-[0.2em]">No Delivered Vehicles Found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VehicleMaster;
