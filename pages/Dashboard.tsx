
import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';
import { 
  TrendingUp, Users, Truck, DollarSign, ArrowRight, ShieldCheck,
  Zap, BarChart3, Receipt, ClipboardCheck, Clock, Bell,
  Phone, MessageCircle, Calendar, Package,
  ArrowUpRight, ArrowDownRight, MoreHorizontal, AlertCircle,
  CheckCircle2, FileText, Globe, Target, Briefcase
} from 'lucide-react';
import { Tractor, Customer, Invoice, TractorStatus, CustomerStatus, Quotation, DocApprovalStatus, UserRole, User } from '../types';

// Helper to check if followup is due
const isFollowupDue = (customer: Customer) => {
  if (!customer.nextFollowupDays || customer.status === CustomerStatus.SALES_LOST || customer.status === CustomerStatus.SALES_DROP || customer.status === CustomerStatus.E4) return false;
  
  const createdDate = new Date(customer.createdAt);
  const deliveryDate = new Date(createdDate.getTime() + (customer.expectedDeliveryDays || 0) * 24 * 60 * 60 * 1000);
  const dueDate = new Date(deliveryDate.getTime() - customer.nextFollowupDays * 24 * 60 * 60 * 1000);
  
  return new Date() >= dueDate;
};

interface DashboardProps {
  tractors: Tractor[];
  customers: Customer[];
  invoices: Invoice[];
  quotations: Quotation[];
  currentUser: User;
  setActiveTab: (tab: string) => void;
  onAddFollowupLog: (customerId: string, log: { type: 'CALL' | 'WHATSAPP', remarks: string }) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ tractors, customers, invoices, quotations, currentUser, setActiveTab, onAddFollowupLog }) => {
  const availableStock = tractors.filter(t => t.status === TractorStatus.AVAILABLE).length;
  const totalTractors = tractors.length;
  const totalSales = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const totalCollections = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
  const totalDue = totalSales - totalCollections;
  const dueFollowups = customers.filter(isFollowupDue);
  const pendingApprovals = quotations.filter(q => q.discountStatus === DocApprovalStatus.PENDING).length;
  
  // Calculate inventory value
  const inventoryValue = tractors
    .filter(t => t.status === TractorStatus.AVAILABLE)
    .reduce((sum, t) => sum + t.exShowroomPrice, 0);

  const stats = [
    { 
      label: 'Inventory Asset', 
      value: availableStock, 
      subValue: `₹${(inventoryValue / 10000000).toFixed(2)} Cr`,
      icon: Package, 
      color: 'text-hw-accent', 
      bg: 'bg-hw-accent/10',
      trend: '+2.5%',
      isPositive: true
    },
    { 
      label: 'Gross Revenue', 
      value: `₹${(totalSales / 100000).toFixed(1)}L`, 
      subValue: 'Lifetime Sales',
      icon: TrendingUp, 
      color: 'text-emerald-500', 
      bg: 'bg-emerald-500/10',
      trend: '+12.3%',
      isPositive: true
    },
    { 
      label: 'Enquiry Pipeline', 
      value: customers.length, 
      subValue: `${customers.filter(c => c.status === CustomerStatus.E2).length} Considering`,
      icon: Target, 
      color: 'text-hw-accent', 
      bg: 'bg-hw-accent/10',
      trend: '+5.1%',
      isPositive: true
    },
    { 
      label: 'Action Items', 
      value: currentUser.role === UserRole.ADMIN ? pendingApprovals : dueFollowups.length, 
      subValue: currentUser.role === UserRole.ADMIN ? 'Approvals' : 'Follow-ups',
      icon: Briefcase, 
      color: currentUser.role === UserRole.ADMIN ? 'text-rose-500' : 'text-amber-500', 
      bg: currentUser.role === UserRole.ADMIN ? 'bg-rose-500/10' : 'bg-amber-500/10',
      trend: 'High Priority',
      isPositive: false
    },
  ];

  const stockDistribution = [
    { name: 'Available', value: availableStock, color: 'var(--hw-accent)' },
    { name: 'Sold', value: tractors.filter(t => t.status === TractorStatus.SOLD).length, color: '#10b981' },
    { name: 'Delivered', value: tractors.filter(t => t.status === TractorStatus.DELIVERED).length, color: '#f59e0b' },
  ];

  const handleCommunication = (customer: Customer, type: 'CALL' | 'WHATSAPP') => {
    const mobile = customer.mobile;
    let url = type === 'CALL' ? `tel:${mobile}` : `https://wa.me/91${mobile}`;
    
    if (type === 'WHATSAPP') {
      const message = `Namaste ${customer.name} ji,
Main Satyam Tractors se bol raha hoon. Aapne Eicher ${customer.interestedModel || '[Model]'} Tractor ke baare me enquiry ki thi.
Agar aap chahen to hum aapko latest price, finance facility aur delivery details ki poori jankari de sakte hain.
Aap kabhi bhi showroom par visit kar sakte hain ya hume reply kar sakte hain.
Dhanyawaad 🙏
Satyam Tractors
Border Road, Chakghat (Rewa)
📞 8989515413 / 8839612275`;
      url = `https://wa.me/91${mobile}?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
    } else {
      window.location.href = url;
    }
    
    setTimeout(() => {
      const remarks = window.prompt(`Enter remarks for this ${type.toLowerCase()}:`);
      if (remarks !== null) {
        onAddFollowupLog(customer.id, { type, remarks: remarks || 'No remarks provided' });
      }
    }, 1000);
  };

  return (
    <div className="space-y-10 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 bg-hw-accent/10 rounded-full border border-hw-accent/20 flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-hw-accent rounded-full animate-pulse"></div>
              <span className="text-[10px] font-bold text-hw-accent uppercase tracking-[0.2em]">
                System Live
              </span>
            </div>
            <div className="flex items-center gap-2 text-hw-muted">
              <Globe size={14} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Global Instance</span>
            </div>
          </div>
          <h1 className="text-5xl font-extrabold text-hw-text tracking-tighter leading-none">
            Executive <span className="text-hw-accent">Dashboard</span>
          </h1>
          <p className="text-hw-muted text-sm font-bold uppercase tracking-widest">
            Welcome, {currentUser.fullName} • <span className="text-hw-text">{currentUser.role} Control</span>
          </p>
        </div>
        
        <div className="flex items-center gap-4 bg-transparent p-4 rounded-[2rem] border border-hw-border shadow-xl hover:bg-hw-accent/[0.01] transition-all">
          <div className="flex items-center gap-4 px-4 border-r border-hw-border">
            <div className="w-10 h-10 bg-hw-bg rounded-2xl flex items-center justify-center text-hw-accent">
              <Calendar size={20} />
            </div>
            <div>
              <p className="text-[9px] font-bold text-hw-muted uppercase tracking-widest mb-0.5">Fiscal Period</p>
              <p className="text-xs font-bold text-hw-text">Q4 - 2025</p>
            </div>
          </div>
          <div className="flex items-center gap-4 px-4">
            <div className="w-10 h-10 bg-hw-bg rounded-2xl flex items-center justify-center text-emerald-500">
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="text-[9px] font-bold text-hw-muted uppercase tracking-widest mb-0.5">Security</p>
              <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Encrypted</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, idx) => (
          <div key={idx} className="hw-card p-8 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-hw-accent/5 rounded-full -mr-16 -mt-16 transition-transform duration-700 group-hover:scale-150"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center shadow-inner`}>
                  <stat.icon size={28} />
                </div>
                <div className={`flex items-center gap-1 font-bold text-[10px] px-3 py-1.5 rounded-full border ${stat.isPositive ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-hw-bg text-hw-muted border-hw-border'}`}>
                  {stat.isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {stat.trend}
                </div>
              </div>
              <p className="text-[10px] font-bold text-hw-muted uppercase tracking-[0.2em] mb-2">{stat.label}</p>
              <div className="flex items-baseline gap-3">
                <h3 className="text-4xl font-extrabold text-hw-text tracking-tighter">{stat.value}</h3>
                <span className="text-[10px] font-bold text-hw-muted uppercase tracking-widest">{stat.subValue}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Financial Summary Panel */}
        <div className="lg:col-span-2 hw-card p-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
            <div>
              <h3 className="text-2xl font-extrabold text-hw-text tracking-tight">Financial Audit</h3>
              <p className="text-[10px] font-bold text-hw-muted uppercase tracking-[0.2em] mt-2">Revenue & Collection Performance</p>
            </div>
            <div className="flex bg-hw-bg p-1.5 rounded-2xl border border-hw-border shadow-inner">
              <button className="px-6 py-2.5 text-[10px] font-bold rounded-xl text-hw-muted hover:text-hw-text transition-all uppercase tracking-widest">Weekly</button>
              <button className="px-6 py-2.5 text-[10px] font-bold bg-hw-accent text-hw-accent-foreground rounded-xl shadow-lg shadow-hw-accent/20 uppercase tracking-widest">Monthly</button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="p-8 bg-hw-bg rounded-[2rem] border border-hw-border group hover:border-hw-accent/30 transition-all duration-500">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center">
                  <DollarSign size={16} />
                </div>
                <p className="text-[10px] font-bold text-hw-muted uppercase tracking-widest">Realized Liquidity</p>
              </div>
              <div className="flex items-baseline gap-3">
                <h4 className="text-5xl font-extrabold text-hw-text tracking-tighter">₹{(totalCollections / 100000).toFixed(1)}</h4>
                <span className="text-xs font-bold text-hw-muted uppercase tracking-widest">Lakhs</span>
              </div>
              <div className="mt-6 flex items-center gap-3 text-[10px] font-bold text-emerald-500 bg-emerald-500/5 w-fit px-3 py-1.5 rounded-full">
                <TrendingUp size={12} />
                +15.2% vs PREVIOUS PERIOD
              </div>
            </div>
            
            <div className="p-8 bg-hw-bg rounded-[2rem] border border-hw-border group hover:border-rose-500/30 transition-all duration-500">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-rose-500/10 text-rose-500 rounded-xl flex items-center justify-center">
                  <AlertCircle size={16} />
                </div>
                <p className="text-[10px] font-bold text-hw-muted uppercase tracking-widest">Total Outstandings</p>
              </div>
              <div className="flex items-baseline gap-3">
                <h4 className="text-5xl font-extrabold text-hw-text tracking-tighter">₹{(totalDue / 100000).toFixed(1)}</h4>
                <span className="text-xs font-bold text-hw-muted uppercase tracking-widest">Lakhs</span>
              </div>
              <div className={`mt-6 flex items-center gap-3 text-[10px] font-bold px-3 py-1.5 rounded-full w-fit ${totalDue > 0 ? 'text-rose-500 bg-rose-500/5' : 'text-emerald-500 bg-emerald-500/5'}`}>
                <Zap size={12} />
                {totalDue > 0 ? 'IMMEDIATE ACTION REQUIRED' : 'PORTFOLIO HEALTHY'}
              </div>
            </div>
          </div>

          <div className="mt-12 space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[10px] font-bold text-hw-muted uppercase tracking-widest mb-1">Collection Efficiency</p>
                <p className="text-sm font-extrabold text-hw-text">Target: 95.0%</p>
              </div>
              <span className="text-2xl font-extrabold text-hw-accent tracking-tighter">{((totalCollections / (totalSales || 1)) * 100).toFixed(1)}%</span>
            </div>
            <div className="w-full h-4 bg-hw-bg rounded-full overflow-hidden border border-hw-border p-1">
              <div 
                className="h-full bg-hw-accent rounded-full transition-all duration-1000 relative group"
                style={{ width: `${(totalCollections / (totalSales || 1)) * 100}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Inventory Pulse */}
        <div className="hw-card p-10 flex flex-col">
          <div className="mb-10">
            <h3 className="text-2xl font-extrabold text-hw-text tracking-tight">Stock Pulse</h3>
            <p className="text-[10px] font-bold text-hw-muted uppercase tracking-[0.2em] mt-2">Inventory Distribution</p>
          </div>
          
          <div className="flex-1 flex flex-col justify-center">
            <div className="h-[240px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stockDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={95}
                    paddingAngle={10}
                    dataKey="value"
                    stroke="none"
                  >
                    {stockDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'var(--hw-surface)', 
                      border: '1px solid var(--hw-border)', 
                      borderRadius: '1rem', 
                      fontSize: '10px',
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-4xl font-extrabold text-hw-text tracking-tighter">{tractors.length}</span>
                <span className="text-[10px] font-bold text-hw-muted uppercase tracking-widest">Total Units</span>
              </div>
            </div>

            <div className="space-y-3 mt-10">
              {stockDistribution.map((item) => (
                <div key={item.name} className="flex items-center justify-between p-4 bg-hw-bg rounded-2xl border border-hw-border hover:border-hw-accent/20 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 rounded-full shadow-sm" style={{backgroundColor: item.color}}></div>
                    <span className="text-[10px] font-bold text-hw-text uppercase tracking-widest">{item.name}</span>
                  </div>
                  <span className="text-xs font-extrabold text-hw-text">{item.value} <span className="text-[10px] font-bold text-hw-muted uppercase ml-1">Units</span></span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Task Queue */}
        <div className="lg:col-span-2 hw-card p-10">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-2xl font-extrabold text-hw-text tracking-tight">
                {currentUser.role === UserRole.ADMIN ? 'Approval Queue' : 'Priority Follow-ups'}
              </h3>
              <p className="text-[10px] font-bold text-hw-muted uppercase tracking-[0.2em] mt-2">Critical Action Required</p>
            </div>
            <button className="px-6 py-2.5 text-[10px] font-bold bg-hw-bg border border-hw-border rounded-xl text-hw-muted hover:text-hw-accent hover:border-hw-accent transition-all uppercase tracking-[0.2em]">View Full Queue</button>
          </div>
          
          <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-4">
            {currentUser.role === UserRole.ADMIN ? (
              quotations.filter(q => q.discountStatus === DocApprovalStatus.PENDING).length > 0 ? (
                quotations.filter(q => q.discountStatus === DocApprovalStatus.PENDING).map(q => {
                  const cust = customers.find(c => c.id === q.customerId);
                  const tractor = tractors.find(t => t.id === q.tractorId);
                  return (
                    <div key={q.id} className="flex items-center justify-between p-6 bg-hw-bg rounded-[2rem] border border-hw-border hover:border-hw-accent/30 transition-all group">
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-transparent border border-hw-border rounded-2xl flex items-center justify-center text-hw-accent shadow-sm group-hover:scale-110 transition-transform duration-500 hover:bg-hw-accent/5">
                          <Zap size={24} />
                        </div>
                        <div>
                          <p className="text-sm font-extrabold text-hw-text mb-1">{cust?.name}</p>
                          <p className="text-[10px] font-bold text-hw-muted uppercase tracking-widest">{tractor?.modelName} • ₹{q.discountAmount.toLocaleString()} Discount Request</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setActiveTab('billing')}
                        className="px-8 py-3 bg-transparent border border-hw-border rounded-2xl text-[10px] font-bold text-hw-text hover:bg-hw-accent hover:text-hw-accent-foreground hover:border-hw-accent hover:shadow-lg hover:shadow-hw-accent/20 transition-all uppercase tracking-[0.2em]"
                      >
                        Review Request
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="py-20 text-center bg-hw-bg rounded-[3rem] border-2 border-dashed border-hw-border">
                  <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 size={40} />
                  </div>
                  <h4 className="text-lg font-extrabold text-hw-text mb-2">Queue Cleared</h4>
                  <p className="text-[10px] font-bold text-hw-muted uppercase tracking-[0.2em]">No pending approvals at this time</p>
                </div>
              )
            ) : (
              dueFollowups.length > 0 ? (
                dueFollowups.map(c => (
                  <div key={c.id} className="flex items-center justify-between p-6 bg-hw-bg rounded-[2rem] border border-hw-border hover:border-hw-accent/30 transition-all group">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 bg-transparent border border-hw-border rounded-2xl flex items-center justify-center text-hw-accent shadow-sm group-hover:scale-110 transition-transform duration-500 hover:bg-hw-accent/5">
                        <Phone size={24} />
                      </div>
                      <div>
                        <p className="text-sm font-extrabold text-hw-text mb-1">{c.name}</p>
                        <p className="text-[10px] font-bold text-hw-muted uppercase tracking-widest">{c.village} • {c.mobile}</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => handleCommunication(c, 'CALL')}
                        className="p-4 bg-transparent border border-hw-border rounded-2xl text-hw-muted hover:text-hw-accent hover:border-hw-accent hover:shadow-lg transition-all"
                        title="Call Customer"
                      >
                        <Phone size={20} />
                      </button>
                      <button 
                        onClick={() => handleCommunication(c, 'WHATSAPP')}
                        className="p-4 bg-transparent border border-hw-border rounded-2xl text-hw-muted hover:text-hw-accent hover:border-hw-accent hover:shadow-lg transition-all"
                        title="WhatsApp Customer"
                      >
                        <MessageCircle size={20} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-20 text-center bg-hw-bg rounded-[3rem] border-2 border-dashed border-hw-border">
                  <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 size={40} />
                  </div>
                  <h4 className="text-lg font-extrabold text-hw-text mb-2">All Caught Up</h4>
                  <p className="text-[10px] font-bold text-hw-muted uppercase tracking-[0.2em]">No pending follow-ups for today</p>
                </div>
              )
            )}
          </div>
        </div>

        {/* Quick Actions Matrix */}
        <div className="lg:col-span-1 grid grid-cols-1 gap-6">
          {[
            { id: 'inventory', label: 'Fleet Management', icon: Truck, desc: 'Stock & Specifications', color: 'bg-hw-accent' },
            { id: 'customers', label: 'Enquiry Pipeline', icon: Users, desc: 'Leads & Conversions', color: 'bg-hw-accent' },
            { id: 'billing', label: 'Sales Terminal', icon: FileText, desc: 'Billing & Quotations', color: 'bg-emerald-500' },
            { id: 'reports', label: 'Business Intel', icon: BarChart3, desc: 'Analytics & Growth', color: 'bg-amber-500' },
          ].map((action) => (
            <button 
              key={action.id}
              onClick={() => setActiveTab(action.id)}
              className="flex items-center gap-6 p-6 hw-card group text-left relative overflow-hidden"
            >
              <div className={`absolute top-0 right-0 w-24 h-24 ${action.color}/5 rounded-full -mr-12 -mt-12 transition-transform duration-500 group-hover:scale-150`}></div>
              <div className={`w-16 h-16 ${action.color} text-white rounded-[1.5rem] flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-hw-accent/10 relative z-10`}>
                <action.icon size={32} />
              </div>
              <div className="relative z-10">
                <h4 className="text-sm font-extrabold text-hw-text uppercase tracking-tight mb-1">{action.label}</h4>
                <p className="text-[10px] font-bold text-hw-muted uppercase tracking-widest">{action.desc}</p>
              </div>
              <ArrowRight size={20} className="ml-auto text-hw-muted group-hover:text-hw-accent group-hover:translate-x-2 transition-all relative z-10" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
