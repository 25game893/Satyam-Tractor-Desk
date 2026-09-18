
import React, { useState, useRef } from 'react';
import { 
  Save, Building, Phone, Mail, MapPin, 
  Receipt, Info, Image as ImageIcon, Upload, 
  Trash2, AlertCircle, CheckCircle2,
  Settings as SettingsIcon, Database, RefreshCw, Clock
} from 'lucide-react';
import { ShowroomSettings, User, UserRole } from '../types';
import { StorageService } from '../services/storage';
import CountdownTimer from '../components/CountdownTimer';

// Internal icon for URL input
// Renamed to LinkIcon to avoid potential collisions and moved above Settings component for better scope management
const LinkIcon = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

interface SettingsProps {
  settings: ShowroomSettings;
  onSave: (settings: ShowroomSettings) => void;
  onPurgeData: () => void;
  currentUser: User;
  onUpdateCurrentUser?: (user: User) => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, onSave, onPurgeData, currentUser, onUpdateCurrentUser }) => {
  const [formData, setFormData] = useState<ShowroomSettings>(settings);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success'>('idle');
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showPurgeModal, setShowPurgeModal] = useState(false);
  const [modalTime, setModalTime] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Admin Security Settings States
  const [newMobileNumber, setNewMobileNumber] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [verificationOtp, setVerificationOtp] = useState('');
  const [otpAttempt, setOtpAttempt] = useState('');
  const [securityError, setSecurityError] = useState('');
  const [securitySuccess, setSecuritySuccess] = useState('');

  // Real SMS States
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpGateway, setOtpGateway] = useState<'FAST2SMS' | 'TWILIO' | 'MOCK' | 'NONE'>('NONE');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        alert("Image is too large. Please select an image under 2MB.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, logoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setFormData({ ...formData, logoUrl: '' });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('saving');
    
    // Simulate slight delay for professional feel
    setTimeout(() => {
      onSave(formData);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }, 600);
  };

  return (
    <div className="max-w-5xl space-y-10 pb-20">
      {/* ERP Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 bg-hw-accent text-white text-[10px] font-mono font-bold uppercase tracking-widest">
              SYSTEM_CONFIG_V4
            </span>
            <span className="hw-label">
              Global Preferences & Business Identity
            </span>
          </div>
          <h1 className="text-5xl font-display font-bold text-hw-text tracking-tighter uppercase">
            Showroom Configurations
          </h1>
          <p className="text-hw-muted font-mono text-sm">Manage your business profile and digital branding assets.</p>
        </div>
        
        {saveStatus === 'success' && (
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-6 py-3 border border-emerald-100 animate-in fade-in slide-in-from-right-4">
            <CheckCircle2 size={18} />
            <span className="text-xs font-mono font-bold uppercase tracking-widest">Settings Synchronized</span>
          </div>
        )}
      </div>

      <div className="bg-hw-surface border border-hw-border shadow-xl overflow-hidden">
        <form onSubmit={handleSubmit}>
          <div className="p-10 space-y-16">
            
            {/* Branding Section */}
            <section className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-hw-bg border border-hw-border flex items-center justify-center">
                  <ImageIcon size={20} className="text-hw-accent" />
                </div>
                <div>
                  <h3 className="text-xl font-display font-bold text-hw-text uppercase tracking-tight">Visual Identity & Branding</h3>
                  <p className="text-[10px] font-mono font-bold text-hw-muted uppercase tracking-widest">Corporate Mark & Digital Assets</p>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row gap-10 items-center bg-hw-bg p-10 border border-hw-border border-dashed">
                <div className="relative group shrink-0">
                  <div className="w-48 h-48 bg-hw-surface border border-hw-border shadow-2xl flex items-center justify-center overflow-hidden transition-all duration-500 group-hover:scale-105">
                    {formData.logoUrl ? (
                      <img 
                        src={formData.logoUrl} 
                        alt="Logo Preview" 
                        className="w-full h-full object-contain p-6" 
                        onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/150?text=Invalid+Logo')} 
                      />
                    ) : (
                      <div className="flex flex-col items-center text-hw-muted">
                        <ImageIcon size={48} className="opacity-20 mb-2" />
                        <span className="text-[10px] font-mono font-bold uppercase tracking-widest opacity-40">No Logo</span>
                      </div>
                    )}
                  </div>
                  
                  {formData.logoUrl && (
                    <button 
                      type="button"
                      onClick={removeLogo}
                      className="absolute -top-3 -right-3 w-10 h-10 bg-hw-text text-hw-bg border border-hw-text flex items-center justify-center shadow-lg hover:bg-hw-accent hover:border-hw-accent hover:text-white transition-all hover:scale-110 active:scale-95"
                      title="Remove Logo"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>

                <div className="flex-1 space-y-6 w-full">
                  <div>
                    <h4 className="text-lg font-display font-bold text-hw-text mb-2 uppercase tracking-tight">Showroom Brand Mark</h4>
                    <p className="text-xs text-hw-muted font-mono font-bold uppercase leading-relaxed italic">
                      Upload your official showroom logo. This will appear on all invoices, receipts, and reports. High-resolution PNG or JPG recommended.
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-4">
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      className="hidden" 
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                    <button 
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="hw-btn-primary px-8 py-4"
                    >
                      <Upload size={16} /> Choose Image File
                    </button>
                    
                    <div className="flex-1 min-w-[250px] relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-hw-muted">
                        <LinkIcon size={14} />
                      </div>
                      <input 
                        type="text"
                        className="w-full pl-12 pr-4 py-4 bg-hw-bg border border-hw-border outline-none focus:border-hw-accent font-mono font-bold text-xs text-hw-text shadow-inner"
                        placeholder="OR PASTE EXTERNAL IMAGE URL..."
                        value={(formData.logoUrl || '').startsWith('data:') ? 'LOCAL_IMAGE_UPLOADED' : formData.logoUrl}
                        onChange={(e) => setFormData({...formData, logoUrl: e.target.value})}
                        disabled={(formData.logoUrl || '').startsWith('data:')}
                      />
                    </div>
                  </div>
                  <p className="text-[9px] font-mono font-bold text-hw-muted uppercase tracking-widest flex items-center gap-2">
                    <Info size={12} className="text-hw-accent" />
                    Maximum file size: 2MB. Preferred dimensions: 512x512px
                  </p>
                </div>
              </div>
            </section>
            
            {/* Shop Operations Control - Admin Only */}
            {currentUser.role === UserRole.ADMIN && (
              <section className="space-y-8 pt-10 border-t border-hw-border">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-hw-bg border border-hw-border flex items-center justify-center">
                    <SettingsIcon size={20} className="text-hw-accent" />
                  </div>
                  <div>
                    <h3 className="text-xl font-display font-bold text-hw-text uppercase tracking-tight">Shop Operations Control</h3>
                    <p className="text-[10px] font-mono font-bold text-hw-muted uppercase tracking-widest">Global System Status & Access</p>
                  </div>
                </div>
                
                <div className={`p-10 border transition-all duration-500 ${formData.isShopClosed ? 'bg-hw-bg border-hw-accent shadow-lg' : 'bg-hw-bg border-hw-border'}`}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <h4 className={`text-lg font-display font-bold uppercase tracking-tight ${formData.isShopClosed ? 'text-hw-accent' : 'text-hw-text'}`}>
                          Shop Operational Status
                        </h4>
                        <p className={`text-xs font-mono font-bold uppercase italic leading-relaxed max-w-xl ${formData.isShopClosed ? 'text-hw-accent/80' : 'text-hw-muted'}`}>
                          {formData.isShopClosed 
                            ? `The shop was CLOSED at ${new Date(formData.closedAt || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} on ${new Date(formData.closedAt || '').toLocaleDateString()}. Billing, Ledger updates, Quotations, and Delivery Challans are disabled for all users.` 
                            : "The shop is currently OPEN. All business operations are active."}
                        </p>
                      </div>
                      {formData.isShopClosed && <CountdownTimer closedAt={formData.closedAt || ''} />}
                    </div>
                    
                    <button 
                      type="button"
                      onClick={() => {
                        if (!formData.isShopClosed) {
                          const now = new Date();
                          setModalTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
                          setShowCloseModal(true);
                        } else {
                          const updated = {
                            ...formData, 
                            isShopClosed: false, 
                            closedAt: undefined
                          };
                          setFormData(updated);
                          onSave(updated);
                        }
                      }}
                      className={`px-10 py-5 font-mono font-bold border transition-all flex items-center gap-4 active:scale-95 text-[10px] uppercase tracking-widest shadow-xl ${
                        formData.isShopClosed 
                          ? 'bg-hw-bg text-hw-accent border-hw-accent hover:bg-hw-accent hover:text-white' 
                          : 'hw-btn-primary'
                      }`}
                    >
                      {formData.isShopClosed ? (
                        <>
                          <CheckCircle2 size={16} /> Open Shop Now
                        </>
                      ) : (
                        <>
                          <AlertCircle size={16} /> Close Shop Now
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* Showroom Profile */}
            <section className="space-y-8 pt-10 border-t border-hw-border">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-hw-bg border border-hw-border flex items-center justify-center">
                  <Building size={20} className="text-hw-accent" />
                </div>
                <div>
                  <h3 className="text-xl font-display font-bold text-hw-text uppercase tracking-tight">Establishment Details</h3>
                  <p className="text-[10px] font-mono font-bold text-hw-muted uppercase tracking-widest">Legal Identity & Contact Matrix</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono font-bold text-hw-muted uppercase tracking-widest ml-1">Trade Name (Official)</label>
                  <input 
                    type="text"
                    required
                    className="w-full px-6 py-5 bg-hw-bg border border-hw-border focus:border-hw-accent outline-none font-display font-bold text-hw-text uppercase shadow-inner"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono font-bold text-hw-muted uppercase tracking-widest ml-1">Primary Support Contact</label>
                  <div className="relative">
                    <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-hw-muted" size={18} />
                    <input 
                      type="text"
                      required
                      className="w-full pl-14 pr-6 py-5 bg-hw-bg border border-hw-border focus:border-hw-accent outline-none font-mono font-bold text-hw-text shadow-inner"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono font-bold text-hw-muted uppercase tracking-widest ml-1">Business Correspondence Email</label>
                  <div className="relative">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-hw-muted" size={18} />
                    <input 
                      type="email"
                      required
                      className="w-full pl-14 pr-6 py-5 bg-hw-bg border border-hw-border focus:border-hw-accent outline-none font-mono font-bold text-hw-text shadow-inner"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono font-bold text-hw-muted uppercase tracking-widest ml-1">Physical Showroom Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-5 top-6 text-hw-muted" size={18} />
                    <textarea 
                      required
                      className="w-full pl-14 pr-6 py-5 bg-hw-bg border border-hw-border focus:border-hw-accent outline-none font-mono font-bold text-hw-text shadow-inner"
                      rows={2}
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono font-bold text-hw-muted uppercase tracking-widest ml-1">Bank Account Number</label>
                  <input 
                    type="text"
                    required
                    className="w-full px-6 py-5 bg-hw-bg border border-hw-border focus:border-hw-accent outline-none font-mono font-bold text-hw-text shadow-inner"
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-mono font-bold text-hw-muted uppercase tracking-widest ml-1">Bank Details (IFSC, Branch, etc.)</label>
                  <input 
                    type="text"
                    className="w-full px-6 py-5 bg-hw-bg border border-hw-border focus:border-hw-accent outline-none font-mono font-bold text-hw-text shadow-inner"
                    value={formData.bankDetails}
                    onChange={(e) => setFormData({...formData, bankDetails: e.target.value})}
                  />
                </div>
              </div>
            </section>

            {/* Invoice Configuration */}
            <section className="space-y-8 pt-10 border-t border-hw-border">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-hw-bg border border-hw-border flex items-center justify-center">
                  <Receipt size={20} className="text-hw-accent" />
                </div>
                <div>
                  <h3 className="text-xl font-display font-bold text-hw-text uppercase tracking-tight">Billing & Document Engine</h3>
                  <p className="text-[10px] font-mono font-bold text-hw-muted uppercase tracking-widest">Serial Sequences & Footer Directives</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono font-bold text-hw-muted uppercase tracking-widest ml-1">Invoice Serial Prefix</label>
                  <input 
                    type="text"
                    required
                    className="w-full px-6 py-5 bg-hw-bg border border-hw-border focus:border-hw-accent outline-none font-mono font-bold text-xl text-hw-accent shadow-inner uppercase"
                    placeholder="e.g. ST-"
                    value={formData.invoicePrefix}
                    onChange={(e) => setFormData({...formData, invoicePrefix: e.target.value})}
                  />
                  <p className="text-[10px] text-hw-muted font-mono font-bold ml-1 uppercase tracking-tighter">Next Sequence: {formData.invoicePrefix}{(formData.invoiceStartNumber || 1).toString().padStart(4, '0')}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono font-bold text-hw-muted uppercase tracking-widest ml-1">Invoice Starting Number</label>
                  <input 
                    type="number"
                    required
                    className="w-full px-6 py-5 bg-hw-bg border border-hw-border focus:border-hw-accent outline-none font-mono font-bold text-hw-text shadow-inner"
                    value={formData.invoiceStartNumber}
                    onChange={(e) => setFormData({...formData, invoiceStartNumber: parseInt(e.target.value) || 1})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono font-bold text-hw-muted uppercase tracking-widest ml-1">Delivery Challan Start Number</label>
                  <input 
                    type="number"
                    required
                    className="w-full px-6 py-5 bg-hw-bg border border-hw-border focus:border-hw-accent outline-none font-mono font-bold text-hw-text shadow-inner"
                    value={formData.challanStartNumber}
                    onChange={(e) => setFormData({...formData, challanStartNumber: parseInt(e.target.value) || 1})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono font-bold text-hw-muted uppercase tracking-widest ml-1">Quotation Start Number</label>
                  <input 
                    type="number"
                    required
                    className="w-full px-6 py-5 bg-hw-bg border border-hw-border focus:border-hw-accent outline-none font-mono font-bold text-hw-text shadow-inner"
                    value={formData.quotationStartNumber}
                    onChange={(e) => setFormData({...formData, quotationStartNumber: parseInt(e.target.value) || 1})}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-mono font-bold text-hw-muted uppercase tracking-widest ml-1">Mandatory Invoice Footer</label>
                  <input 
                    type="text"
                    required
                    className="w-full px-6 py-5 bg-hw-bg border border-hw-border focus:border-hw-accent outline-none font-mono font-bold text-hw-text shadow-inner uppercase"
                    value={formData.footerMessage}
                    onChange={(e) => setFormData({...formData, footerMessage: e.target.value})}
                  />
                </div>
              </div>
            </section>
          </div>

          <div className="p-10 bg-hw-bg border-t border-hw-border flex justify-between items-center">
            <div className="flex items-center gap-3 text-hw-muted text-[10px] font-mono font-bold uppercase tracking-widest">
              <div className="w-2 h-2 bg-hw-accent animate-pulse"></div>
              Cloud-Sync Protocol Active
            </div>
            
            <button 
              type="submit"
              disabled={saveStatus === 'saving'}
              className={`hw-btn-primary px-16 py-5 ${saveStatus === 'saving' ? 'opacity-50' : ''}`}
            >
              {saveStatus === 'saving' ? (
                <div className="w-4 h-4 border-2 border-hw-bg/30 border-t-hw-bg rounded-full animate-spin"></div>
              ) : (
                <Save size={18} />
              )}
              Synchronize Configuration
            </button>
          </div>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="bg-hw-surface border border-hw-accent/20 overflow-hidden">
        <div className="p-10 space-y-8">
          <div className="flex items-center gap-4 text-hw-accent">
            <div className="w-12 h-12 bg-hw-bg border border-hw-accent/20 flex items-center justify-center">
              <Database size={24} />
            </div>
            <div>
              <h3 className="text-lg font-display font-bold uppercase tracking-widest">Danger Zone</h3>
              <p className="text-[10px] font-mono font-bold uppercase tracking-widest opacity-70">Irreversible System Actions</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-hw-bg p-10 border border-hw-accent/10">
            <div className="space-y-2">
              <h4 className="text-lg font-display font-bold text-hw-text uppercase tracking-tight">Reset All System Data</h4>
              <p className="text-xs text-hw-muted font-mono font-bold uppercase italic leading-relaxed max-w-xl">
                This will permanently delete all tractors, customers, invoices, and activity logs. Your showroom settings and admin account will be preserved.
              </p>
            </div>
            
            <button 
              type="button"
              onClick={() => setShowPurgeModal(true)}
              className="px-10 py-5 bg-hw-bg text-hw-accent border border-hw-accent font-mono font-bold hover:bg-hw-accent hover:text-white shadow-xl transition-all flex items-center gap-4 active:scale-95 text-[10px] uppercase tracking-widest"
            >
              <RefreshCw size={16} /> Purge All Data
            </button>
          </div>
        </div>
      </div>

      {/* Admin Security Profile (Registered Mobile Number & OTP Verification) */}
      {currentUser.role === UserRole.ADMIN && (
        <div className="bg-hw-surface border border-hw-border shadow-xl overflow-hidden mt-10">
          <div className="border-b border-hw-border p-10 flex items-center justify-between bg-hw-bg/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-hw-bg border border-hw-border flex items-center justify-center text-hw-accent shadow-inner">
                <SettingsIcon size={24} />
              </div>
              <div>
                <h3 className="text-xl font-display font-bold uppercase tracking-widest text-hw-text">Admin Security & MFA</h3>
                <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-hw-muted">Manage your registered phone number & login security</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[9px] font-mono font-bold uppercase tracking-wider">
              OTP_SYSTEM_ACTIVE
            </span>
          </div>

          <div className="p-10 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Left Column: Current Status & Info */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <span className="text-xs font-mono font-bold uppercase text-hw-accent tracking-widest">Registered Device</span>
                  <div className="text-3xl font-display font-bold text-hw-text font-mono tracking-wide tabular-nums">
                    {currentUser.mobileNumber || '9098832111'}
                  </div>
                  <p className="text-xs text-hw-muted leading-relaxed font-mono">
                    This is your active, verified phone number used to receive One-Time Passcodes (OTP) for admin session verification.
                  </p>
                </div>

                <div className="p-6 bg-hw-bg border border-hw-border space-y-2">
                  <h4 className="text-xs font-mono font-bold uppercase text-hw-accent tracking-widest flex items-center gap-2">
                    <Info size={14} /> Security Policy
                  </h4>
                  <p className="text-[11px] text-hw-text font-mono leading-relaxed italic">
                    All administrative login requests are subject to Multi-Factor Authentication. Changing this number requires successful verification of the new device.
                  </p>
                </div>
              </div>

              {/* Right Column: Update Form */}
              <div className="space-y-6 border-t md:border-t-0 md:border-l border-hw-border pt-8 md:pt-0 md:pl-10">
                <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-hw-text">Change Registered Number</h4>
                
                {securityError && (
                  <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[10px] font-mono font-bold uppercase tracking-wide">
                    {securityError}
                  </div>
                )}
                
                {securitySuccess && (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-mono font-bold uppercase tracking-wide">
                    {securitySuccess}
                  </div>
                )}

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="hw-label">New Mobile Number (10 digits)</label>
                    <input 
                      type="text"
                      placeholder="e.g. 9098832111"
                      maxLength={10}
                      className="w-full px-6 py-4 bg-hw-bg border border-hw-border text-hw-text font-mono font-bold text-xs outline-none focus:border-hw-accent transition-all"
                      value={newMobileNumber}
                      onChange={(e) => setNewMobileNumber(e.target.value.replace(/\D/g, ''))}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (newMobileNumber.length !== 10) {
                        setSecurityError('Please enter a valid 10-digit mobile number.');
                        setSecuritySuccess('');
                        return;
                      }
                      setSecurityError('');
                      setSecuritySuccess('');
                      if (onUpdateCurrentUser) {
                        onUpdateCurrentUser({
                          ...currentUser,
                          mobileNumber: newMobileNumber
                        });
                      }
                      setSecuritySuccess(`Registered mobile number updated to +91 ${newMobileNumber} successfully!`);
                      setNewMobileNumber('');
                    }}
                    className="px-8 py-4 bg-hw-accent hover:bg-hw-accent/80 text-white font-mono font-bold text-[10px] uppercase tracking-widest transition-all"
                  >
                    Update Registered Number
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Purge Data Confirmation Modal */}
      {showPurgeModal && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-hw-text/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-hw-surface w-full max-w-lg border border-hw-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-12 text-center space-y-10">
              <div className="w-24 h-24 bg-hw-bg border border-hw-accent/20 text-hw-accent flex items-center justify-center mx-auto shadow-inner">
                <RefreshCw size={48} className="animate-spin-slow" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-3xl font-display font-bold text-hw-text uppercase tracking-tight">Purge All Data?</h3>
                <p className="text-xs font-mono font-bold text-hw-accent uppercase tracking-widest">This action is irreversible</p>
              </div>

              <div className="bg-hw-bg p-8 border border-hw-accent/20 text-left">
                <p className="text-xs font-mono font-bold text-hw-text uppercase leading-relaxed italic">
                  CRITICAL WARNING: This will permanently erase ALL business data including <span className="text-hw-accent">Tractors, Customers, Invoices, Quotations, and Logs</span>. Your showroom settings will be preserved.
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <button 
                  onClick={() => {
                    onPurgeData();
                    setShowPurgeModal(false);
                  }}
                  className="w-full py-6 bg-hw-accent text-white font-mono font-bold hover:bg-hw-accent/90 transition-all active:scale-95 text-xs uppercase tracking-widest"
                >
                  Yes, Purge Everything
                </button>
                <button 
                  onClick={() => setShowPurgeModal(false)}
                  className="w-full py-6 bg-hw-surface text-hw-muted border border-hw-border font-mono font-bold hover:bg-hw-bg transition-all active:scale-95 text-xs uppercase tracking-widest"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Shop Closure Modal */}
      {showCloseModal && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-hw-text/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-hw-surface w-full max-w-lg border border-hw-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-12 text-center space-y-10">
              <div className="w-24 h-24 bg-hw-bg border border-hw-border text-hw-accent flex items-center justify-center mx-auto shadow-inner">
                <Clock size={48} />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-3xl font-display font-bold text-hw-text uppercase tracking-tight">Confirm Shop Closure</h3>
                <p className="text-xs font-mono font-bold text-hw-muted uppercase tracking-widest">Current System Time</p>
                <div className="text-6xl font-display font-bold text-hw-text tracking-tighter tabular-nums py-4">
                  {modalTime}
                </div>
              </div>

              <div className="bg-hw-bg p-8 border border-hw-border text-left">
                <p className="text-xs font-mono font-bold text-hw-muted uppercase leading-relaxed italic">
                  By closing the shop now, all billing and inventory induction will be suspended. The system will <span className="text-hw-accent font-bold">automatically reopen tomorrow at 10:00 AM</span>.
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <button 
                  onClick={() => {
                    const updated = {
                      ...formData, 
                      isShopClosed: true, 
                      closedAt: new Date().toISOString()
                    };
                    setFormData(updated);
                    onSave(updated);
                    setShowCloseModal(false);
                  }}
                  className="w-full py-6 bg-hw-accent text-white font-mono font-bold hover:bg-hw-accent/90 transition-all active:scale-95 text-xs uppercase tracking-widest"
                >
                  Confirm & Close Shop
                </button>
                <button 
                  onClick={() => setShowCloseModal(false)}
                  className="w-full py-6 bg-hw-surface text-hw-muted border border-hw-border font-mono font-bold hover:bg-hw-bg transition-all active:scale-95 text-xs uppercase tracking-widest"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
