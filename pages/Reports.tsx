
import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell, LabelList
} from 'recharts';
import { Calendar, Download, Filter, TrendingUp, DollarSign, CreditCard, Wallet, Info, AlertCircle, Layers, ArrowRight } from 'lucide-react';
import { Invoice, Customer, PaymentMode, CustomerStatus } from '../types';

interface ReportsProps {
  invoices: Invoice[];
  customers: Customer[];
}

const Reports: React.FC<ReportsProps> = ({ invoices, customers }) => {
  const [dateRange, setDateRange] = useState({ 
    start: new Date(new Date().setMonth(new Date().getMonth() - 3)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0] 
  });

  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const date = new Date(inv.date);
      const start = dateRange.start ? new Date(dateRange.start) : new Date(0);
      const end = dateRange.end ? new Date(dateRange.end) : new Date();
      end.setHours(23, 59, 59, 999);
      return date >= start && date <= end;
    });
  }, [invoices, dateRange]);

  const totalSales = filteredInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const totalCollections = filteredInvoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
  const totalDue = totalSales - totalCollections;

  const paymentModes = Object.values(PaymentMode).map(mode => {
    const amount = filteredInvoices
      .filter(inv => inv.paymentMode === mode)
      .reduce((sum, inv) => sum + inv.paidAmount, 0);
    return { name: mode, value: amount };
  }).filter(p => p.value > 0);

  // Enhanced Sales Funnel Data Calculation with Conversion Rates
  const funnelData = useMemo(() => {
    const statusOrder = [
      CustomerStatus.E1,
      CustomerStatus.E2,
      CustomerStatus.E3,
      CustomerStatus.QUOTATION,
      CustomerStatus.INVOICE,
      CustomerStatus.DELIVERY_CHALLAN,
      CustomerStatus.E4
    ];

    const data = statusOrder.map(status => ({
      name: status,
      value: customers.filter(c => c.status === status).length,
      fill: status === CustomerStatus.E4 ? '#10b981' : 
            status === CustomerStatus.DELIVERY_CHALLAN ? '#059669' :
            status === CustomerStatus.INVOICE ? '#4682B4' :
            status === CustomerStatus.QUOTATION ? '#5C9BD1' : 
            status === CustomerStatus.E3 ? '#7BAFD4' : 
            status === CustomerStatus.E2 ? '#9AC4E8' : '#cbd5e1'
    }));

    // Calculate cumulative values for funnel logic (how many reached at least this stage)
    let cumulative = 0;
    const funnelSteps = [];
    for (let i = data.length - 1; i >= 0; i--) {
        cumulative += data[i].value;
        funnelSteps.unshift({ ...data[i], cumulative });
    }

    return funnelSteps.map((step, idx) => {
        const nextStep = funnelSteps[idx + 1];
        const conversion = nextStep ? ((nextStep.cumulative / step.cumulative) * 100).toFixed(0) : null;
        return { ...step, conversion };
    });
  }, [customers]);

  return (
    <div className="space-y-10 pb-20">
      {/* ERP Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 bg-hw-accent text-white text-[10px] font-mono font-bold uppercase tracking-widest">
              ANALYTICS_NODE_V4
            </span>
            <span className="hw-label">
              Business Intelligence & Performance Tracking
            </span>
          </div>
          <h1 className="text-5xl font-display font-bold text-hw-text tracking-tighter uppercase">
            Showroom Performance
          </h1>
          <p className="text-hw-muted font-mono text-sm">Real-time data visualization and sales funnel efficiency.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-3 bg-hw-surface border border-hw-border px-6 py-4 shadow-sm">
            <Calendar size={18} className="text-hw-muted" />
            <input 
              type="date" 
              className="text-xs font-mono font-bold outline-none bg-transparent text-hw-text" 
              value={dateRange.start}
              onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
            />
            <span className="text-hw-muted font-bold">→</span>
            <input 
              type="date" 
              className="text-xs font-mono font-bold outline-none bg-transparent text-hw-text" 
              value={dateRange.end}
              onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
            />
          </div>
          <button className="hw-btn-primary px-8 py-4">
            <Download size={18} /> Export Data
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-hw-surface border border-hw-border p-8 relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-hw-muted text-[10px] font-mono font-bold uppercase tracking-[0.2em] mb-2">Period Revenue</p>
            <h3 className="text-5xl font-display font-bold tracking-tighter text-hw-text">₹{totalSales.toLocaleString()}</h3>
            <div className="mt-8 pt-6 border-t border-hw-border flex items-center justify-between text-hw-muted">
               <div className="flex items-center gap-2">
                 <TrendingUp size={16} className="text-emerald-500" />
                 <span className="text-[10px] font-mono font-bold uppercase">Analysis Active</span>
               </div>
               <span className="text-[10px] font-mono font-bold uppercase bg-hw-bg px-2 py-1 border border-hw-border">Gross</span>
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-700 text-hw-text">
             <DollarSign size={160} />
          </div>
        </div>

        <div className="bg-hw-surface border border-hw-border p-8 relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-hw-muted text-[10px] font-mono font-bold uppercase tracking-[0.2em] mb-2">Total Collection</p>
            <h3 className="text-5xl font-display font-bold tracking-tighter text-hw-accent">₹{totalCollections.toLocaleString()}</h3>
            <div className="mt-8 pt-6 border-t border-hw-border flex items-center justify-between text-hw-muted">
               <div className="flex items-center gap-2">
                 <DollarSign size={16} />
                 <span className="text-[10px] font-mono font-bold uppercase">{totalSales > 0 ? ((totalCollections/totalSales)*100).toFixed(1) : 0}% recovery rate</span>
               </div>
               <span className="text-[10px] font-mono font-bold uppercase bg-hw-bg px-2 py-1 border border-hw-border">Settled</span>
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-700 text-hw-accent">
             <Wallet size={160} />
          </div>
        </div>

        <div className="bg-hw-surface border border-hw-border p-8 relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-hw-muted text-[10px] font-mono font-bold uppercase tracking-[0.2em] mb-2">Period Deficit</p>
            <h3 className="text-5xl font-display font-bold tracking-tighter text-hw-text">₹{totalDue.toLocaleString()}</h3>
            <div className="mt-8 pt-6 border-t border-hw-border flex items-center justify-between text-hw-muted">
               <div className="flex items-center gap-2">
                 <CreditCard size={16} />
                 <span className="text-[10px] font-mono font-bold uppercase">{filteredInvoices.filter(i => i.status !== 'PAID').length} open invoices</span>
               </div>
               <span className="text-[10px] font-mono font-bold uppercase bg-hw-bg px-2 py-1 border border-hw-border">Due</span>
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-700 text-hw-text">
             <AlertCircle size={160} />
          </div>
        </div>
      </div>

      {/* Enhanced Sales Funnel Section */}
      <div className="bg-hw-surface p-10 border border-hw-border shadow-sm">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h3 className="text-2xl font-display font-bold text-hw-text tracking-tighter flex items-center gap-3 uppercase">
              <div className="w-2 h-8 bg-hw-accent"></div>
              Conversion Funnel Analysis
            </h3>
            <p className="text-[10px] font-mono font-bold text-hw-muted uppercase tracking-widest mt-1 ml-5">Pipeline Efficiency & Prospect Flow</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-hw-bg border border-hw-border">
             <Layers size={14} className="text-hw-muted" />
             <span className="text-[10px] font-mono font-bold uppercase text-hw-muted tracking-widest">Total Managed: {customers.length} Profiles</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="h-[450px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        layout="vertical"
                        data={funnelData}
                        margin={{ left: 100, right: 100, top: 20, bottom: 20 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(0,0,0,0.1)" />
                        <XAxis type="number" hide />
                        <YAxis 
                            type="category" 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: 'currentColor', fontSize: 10, fontWeight: 700, textAnchor: 'end' }} 
                        />
                        <Tooltip 
                            cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                            contentStyle={{ backgroundColor: 'var(--hw-surface)', border: '1px solid var(--hw-border)', fontWeight: 700 }}
                        />
                        <Bar dataKey="cumulative" radius={[0, 0, 0, 0]} barSize={50}>
                            {funnelData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                            <LabelList dataKey="cumulative" position="right" style={{ fill: 'currentColor', fontWeight: 700, fontSize: '14px' }} />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="space-y-6">
                <h4 className="text-[10px] font-mono font-bold text-hw-muted uppercase tracking-widest mb-6 border-b border-hw-border pb-2">Stage Progression Metrics</h4>
                {funnelData.map((stage, idx) => (
                    <div key={idx} className="relative group">
                        <div className="flex justify-between items-end mb-2">
                            <div>
                                <span className="text-[9px] font-mono font-bold text-hw-muted uppercase tracking-tighter">{stage.name}</span>
                                <p className="text-2xl font-display font-bold text-hw-text leading-none uppercase">{stage.cumulative}</p>
                            </div>
                            {stage.conversion && (
                                <div className="bg-hw-bg text-hw-accent px-3 py-1 border border-hw-border text-[10px] font-mono font-bold flex items-center gap-1.5 shadow-sm">
                                    <TrendingUp size={12} /> {stage.conversion}% Conversion
                                </div>
                            )}
                        </div>
                        <div className="h-4 bg-hw-bg border border-hw-border overflow-hidden flex">
                            <div 
                                className="h-full transition-all duration-1000" 
                                style={{ width: `${customers.length > 0 ? (stage.cumulative / funnelData[0].cumulative) * 100 : 0}%`, backgroundColor: stage.fill }}
                            ></div>
                        </div>
                        {idx < funnelData.length - 1 && (
                            <div className="flex justify-center py-1 opacity-20 group-hover:opacity-100 transition-opacity">
                                <ArrowRight size={14} className="rotate-90 text-hw-muted" />
                            </div>
                        )}
                    </div>
                ))}
                
                <div className="mt-8 p-8 bg-hw-bg border border-hw-border">
                    <div className="flex items-start gap-4">
                        <Info size={18} className="text-hw-accent mt-1" />
                        <div>
                            <h5 className="text-[11px] font-mono font-bold uppercase text-hw-text mb-1">Funnel Strategy</h5>
                            <p className="text-[10px] text-hw-muted font-mono font-bold leading-relaxed italic uppercase">
                                Retention is measured from the initial Lead induction. A closed sale rate above 15% is considered optimal for industrial asset showrooms.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
