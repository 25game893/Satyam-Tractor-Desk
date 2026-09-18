
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Truck, Users, FileText, PieChart, 
  Settings, LogOut, UserCircle, History, 
  ClipboardList, ChevronDown, Bell, Search, Clock,
  CheckCircle2, Sun, Moon, Menu, X, ChevronRight,
  RotateCcw, Undo2,
  ShieldCheck, HelpCircle
} from 'lucide-react';
import { User, UserRole, ShowroomSettings, Customer, CustomerStatus } from '../types';

interface LayoutProps {
  user: User;
  onLogout: () => void;
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  settings: ShowroomSettings;
  customers: Customer[];
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const Layout: React.FC<LayoutProps> = ({ user, onLogout, children, activeTab, setActiveTab, settings, customers, isDarkMode, toggleDarkMode }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isSystemMenuOpen, setIsSystemMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const dueFollowupsCount = customers.filter(customer => {
    if (!customer.nextFollowupDays || customer.status === CustomerStatus.SALES_LOST || customer.status === CustomerStatus.SALES_DROP || customer.status === CustomerStatus.E4) return false;
    
    const createdDate = new Date(customer.createdAt);
    const deliveryDate = new Date(createdDate.getTime() + (customer.expectedDeliveryDays || 0) * 24 * 60 * 60 * 1000);
    const dueDate = new Date(deliveryDate.getTime() - customer.nextFollowupDays * 24 * 60 * 60 * 1000);
    
    return dueDate <= new Date();
  }).length;

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, category: 'Main' },
    { id: 'inventory', label: 'Inventory', icon: Truck, category: 'Main' },
    { id: 'vehicle-master', label: 'Vehicle Master', icon: ClipboardList, category: 'Main' },
    { id: 'customers', label: 'Enquiry', icon: Users, category: 'Main' },
    { id: 'billing', label: 'Billing', icon: FileText, category: 'Main' },
    { id: 'return-request', label: 'Return Request', icon: RotateCcw, category: 'Main', role: UserRole.STAFF },
    { id: 'sales-return', label: 'Sales Return', icon: Undo2, category: 'Main', role: UserRole.ADMIN },
    { id: 'customer-ledger', label: 'Ledger', icon: CheckCircle2, category: 'Main' },
    { id: 'reports', label: 'Analytics', icon: PieChart, category: 'Main' },
    { id: 'models', label: 'Catalog', icon: ClipboardList, category: 'System' },
    { id: 'logs', label: 'Audit Logs', icon: History, category: 'System' },
    { id: 'users', label: 'Team', icon: UserCircle, category: 'System' },
    { id: 'settings', label: 'Settings', icon: Settings, category: 'System' },
  ];

  const filteredMenu = menuItems.filter(item => {
    if (settings.isShopClosed) {
      return item.id === 'settings' && user.role === UserRole.ADMIN;
    }
    
    // Check role-specific items
    if ((item as any).role) {
      return user.role === (item as any).role;
    }

    return user.role === UserRole.ADMIN || (user.permissions && user.permissions.includes(item.id));
  });

  const mainItems = filteredMenu.filter(i => i.category === 'Main');
  const systemItems = filteredMenu.filter(i => i.category === 'System');

  return (
    <div className="min-h-screen bg-hw-bg flex flex-col lg:flex-row overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-80 bg-hw-surface border-r border-hw-border h-screen sticky top-0 z-50 no-print transition-all duration-500 overflow-hidden shrink-0">
        <div className="p-8 border-b border-hw-border">
          <div 
            className="flex items-center gap-4 cursor-pointer group"
            onClick={() => !settings.isShopClosed && setActiveTab('dashboard')}
          >
            <div className="w-12 h-12 bg-hw-accent/5 rounded-2xl flex items-center justify-center p-2.5 group-hover:scale-110 transition-transform duration-500 shadow-sm border border-hw-accent/10">
              <img src={settings.logoUrl} className="w-full h-full object-contain" alt="Logo" />
            </div>
            <div>
              <h1 className="text-hw-text font-black text-xl tracking-tighter leading-none">{settings.name.split(' ')[0]}</h1>
              <p className="text-[10px] font-bold text-hw-accent uppercase tracking-[0.2em] mt-1">Enterprise ERP</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
          {/* Main Navigation */}
          <div className="space-y-2">
            <h3 className="px-4 text-[10px] font-black text-hw-muted uppercase tracking-[0.2em] mb-4">Core Modules</h3>
            <nav className="space-y-1">
              {mainItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`nav-item w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative ${
                      isActive 
                        ? 'text-hw-accent bg-hw-accent/5' 
                        : 'text-hw-muted hover:text-hw-text hover:bg-hw-bg'
                    }`}
                  >
                    <item.icon size={20} className={`transition-transform duration-500 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                    <span className="font-bold text-sm tracking-tight">
                      {item.label}
                    </span>
                    {item.id === 'customers' && dueFollowupsCount > 0 && (
                      <span className="ml-auto w-5 h-5 bg-rose-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border border-hw-surface">
                        {dueFollowupsCount}
                      </span>
                    )}
                    {isActive && (
                      <div className="absolute left-0 top-3 bottom-3 w-1 bg-hw-accent rounded-r-full shadow-[2px_0_10px_rgba(70,130,180,0.4)]"></div>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* System Navigation */}
          {systemItems.length > 0 && (
            <div className="space-y-2 pt-2">
              <h3 className="px-4 text-[10px] font-black text-hw-muted uppercase tracking-[0.2em] mb-4">Management</h3>
              <nav className="space-y-1">
                {systemItems.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`nav-item w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative ${
                        isActive 
                          ? 'text-hw-accent bg-hw-accent/5' 
                          : 'text-hw-muted hover:text-hw-text hover:bg-hw-bg'
                      }`}
                    >
                      <item.icon size={18} className={`transition-transform duration-500 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                      <span className="font-bold text-sm tracking-tight">{item.label}</span>
                      {isActive && (
                        <div className="absolute left-0 top-3 bottom-3 w-1 bg-hw-accent rounded-r-full shadow-[2px_0_10px_rgba(70,130,180,0.4)]"></div>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          )}
        </div>

        {/* Sidebar Footer / User Profile */}
        <div className="p-6 mt-auto border-t border-hw-border bg-hw-bg/30">
          <div className="flex items-center justify-between mb-6">
            <button 
              onClick={toggleDarkMode}
              className="p-3 text-hw-muted hover:text-hw-accent hover:bg-hw-accent/5 rounded-xl transition-all flex-1 flex items-center justify-center gap-2"
              title="Toggle Theme"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              <span className="text-[10px] font-black uppercase tracking-widest">{isDarkMode ? 'Light' : 'Dark'}</span>
            </button>
            <div className="w-px h-8 bg-hw-border mx-2"></div>
            <button 
              className="p-3 text-hw-muted hover:text-hw-text hover:bg-hw-bg rounded-xl transition-all relative flex-1 flex items-center justify-center gap-2"
              title="Notifications"
            >
              <Bell size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest">Alerts</span>
              <span className="absolute top-2 right-4 w-2 h-2 bg-rose-500 rounded-full border-2 border-hw-surface"></span>
            </button>
          </div>

          <div className="relative">
            <button 
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              className="w-full flex items-center gap-3 p-3 bg-hw-surface border border-hw-border hover:border-hw-accent/30 transition-all rounded-[1.25rem] group shadow-sm"
            >
              <div className="w-10 h-10 bg-hw-accent text-hw-accent-foreground rounded-xl flex items-center justify-center font-bold text-sm shadow-lg shadow-hw-accent/20 shrink-0">
                {user.fullName.charAt(0)}
              </div>
              <div className="text-left overflow-hidden">
                <p className="text-xs font-black text-hw-text leading-none mb-1 truncate">{user.fullName}</p>
                <p className="text-[9px] font-bold text-hw-muted uppercase tracking-widest">{user.role}</p>
              </div>
              <ChevronDown size={14} className={`text-hw-muted ml-auto transition-transform ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isUserDropdownOpen && (
              <>
                <div className="fixed inset-0 z-[60]" onClick={() => setIsUserDropdownOpen(false)}></div>
                <div className="absolute bottom-full left-0 mb-3 w-full bg-hw-surface border border-hw-border shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-[70] overflow-hidden rounded-[1.5rem] animate-in fade-in slide-in-from-bottom-2 duration-200">
                  <div className="p-4 border-b border-hw-border">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-hw-accent/10 text-hw-accent rounded-xl flex items-center justify-center font-bold">
                        {user.fullName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-hw-text">{user.fullName}</p>
                        <p className="text-[10px] font-bold text-hw-muted">{user.username}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-2 space-y-1">
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-hw-muted hover:bg-hw-bg hover:text-hw-text transition-all font-bold text-xs rounded-xl">
                      <UserCircle size={18} />
                      Profile
                    </button>
                    <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 text-rose-500 hover:bg-rose-500/10 transition-all font-bold text-xs rounded-xl">
                      <LogOut size={18} />
                      Logout
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="lg:hidden h-20 bg-hw-surface border-b border-hw-border sticky top-0 z-50 px-6 flex items-center justify-between no-print shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-hw-accent/5 rounded-xl flex items-center justify-center p-2 border border-hw-accent/10">
            <img src={settings.logoUrl} className="w-full h-full object-contain" alt="Logo" />
          </div>
          <h1 className="text-hw-text font-black text-lg tracking-tighter">{settings.name.split(' ')[0]}</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={toggleDarkMode}
            className="p-3 text-hw-muted rounded-xl"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-3 bg-hw-accent text-white rounded-xl shadow-lg shadow-hw-accent/20"
          >
            <Menu size={24} />
          </button>
        </div>
      </header>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sub-Header for Content Context (Optional, could just be empty h-20 placeholder if needed) */}
        <div className="hidden lg:flex h-20 bg-hw-surface/50 backdrop-blur-xl border-b border-hw-border items-center px-10 justify-between no-print sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-black text-hw-text uppercase tracking-[0.2em] italic">
              {menuItems.find(i => i.id === activeTab)?.label || 'Overview'}
            </h2>
          </div>
          <div className="flex items-center gap-8">
            <div className="flex flex-col items-end">
              <p className="text-xs font-black text-hw-text tracking-tight uppercase">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
              </p>
              <p className="text-[9px] font-bold text-hw-muted uppercase tracking-[0.3em]">
                {currentTime.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto custom-scrollbar relative bg-hw-bg/50">
          <div className="max-w-[1600px] mx-auto p-6 sm:p-10 pb-20">
            {children}
          </div>
          
          <footer className="bg-hw-surface border-t border-hw-border px-10 py-6 flex flex-col sm:flex-row items-center justify-between no-print gap-4 mt-auto">
            <p className="text-[10px] font-bold text-hw-muted uppercase tracking-widest">© 2025 {settings.name} • Cloud ERP System</p>
            <div className="flex gap-8">
              <span className="text-[10px] font-bold text-hw-muted uppercase tracking-widest cursor-pointer hover:text-hw-accent transition-colors">Documentation</span>
              <span className="text-[10px] font-bold text-hw-muted uppercase tracking-widest cursor-pointer hover:text-hw-accent transition-colors">Status</span>
            </div>
          </footer>
        </main>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div className="absolute inset-0 bg-hw-bg/80 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
          <aside className="absolute inset-y-0 left-0 w-80 bg-hw-surface border-r border-hw-border flex flex-col animate-in slide-in-from-left duration-300">
            <div className="h-24 flex items-center px-8 border-b border-hw-border justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-hw-accent/5 rounded-xl flex items-center justify-center p-2">
                  <img src={settings.logoUrl} className="w-full h-full object-contain" alt="Logo" />
                </div>
                <h1 className="text-hw-text font-extrabold tracking-tighter">{settings.name.split(' ')[0]}</h1>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-hw-muted">
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              <div className="space-y-3">
                <h3 className="px-4 text-[10px] font-bold text-hw-muted uppercase tracking-[0.2em]">Navigation</h3>
                <div className="space-y-1">
                  {filteredMenu.map((item) => {
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all ${
                          isActive 
                            ? 'bg-hw-accent text-hw-accent-foreground shadow-lg shadow-hw-accent/20' 
                            : 'text-hw-muted hover:bg-hw-bg hover:text-hw-text'
                        }`}
                      >
                        <item.icon size={20} />
                        <span className="font-bold text-sm">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-hw-border">
              <button onClick={onLogout} className="w-full flex items-center justify-center gap-3 px-4 py-4 bg-rose-500/10 text-rose-500 font-bold text-sm rounded-2xl">
                <LogOut size={20} />
                Log Out
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};

export default Layout;
