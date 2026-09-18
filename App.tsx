
import React, { useState, useEffect } from 'react';
import { StorageService } from './services/storage';
import { SqlStorageService, isFirebaseActive } from './services/sqlStorage';
import { FirebaseStorageService } from './services/firebaseStorage';

import { 
  Tractor, Customer, Invoice, User, ShowroomSettings, 
  TractorStatus, TractorModel, PaymentRecord, PaymentMode,
  Quotation, DeliveryChallan, DocApprovalStatus, ReturnRequest as ReturnRequestType,
  ActivityLog
} from './types';
import Login from './pages/Login';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import VehicleMaster from './pages/VehicleMaster';
import ModelManager from './pages/ModelManager';
import Customers from './pages/Customers';
import Billing from './pages/Billing';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import UserManagement from './pages/UserManagement';
import ActivityLogs from './pages/ActivityLogs';
import CustomerLedger from './pages/CustomerLedger';
import ReturnRequest from './pages/ReturnRequest';
import SalesReturn from './pages/SalesReturn';
import Loader from './components/Loader';
import ShopClosedOverlay from './components/ShopClosedOverlay';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(StorageService.getSettings().isShopClosed ? 'settings' : 'dashboard');
  const [isBypassed, setIsBypassed] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };
  
  const [tractors, setTractors] = useState<Tractor[]>(StorageService.getTractors());
  const [models, setModels] = useState<TractorModel[]>(StorageService.getModels());
  const [customers, setCustomers] = useState<Customer[]>(StorageService.getCustomers());
  const [invoices, setInvoices] = useState<Invoice[]>(StorageService.getInvoices());
  const [quotations, setQuotations] = useState<Quotation[]>(StorageService.getQuotations());
  const [challans, setChallans] = useState<DeliveryChallan[]>(StorageService.getChallans());
  const [returnRequests, setReturnRequests] = useState<ReturnRequestType[]>(StorageService.getReturns());
  const [users, setUsers] = useState<User[]>(StorageService.getUsers());
  const [settings, setSettings] = useState<ShowroomSettings>(StorageService.getSettings());
  const [logs, setLogs] = useState<ActivityLog[]>(StorageService.getLogs());

  // Robust helper to safely fetch and parse JSON with fallback
  const safeFetchJson = async (url: string, defaultValue: any) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.warn(`Fetch to ${url} returned status ${response.status}`);
        return defaultValue;
      }
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.warn(`Fetch to ${url} returned non-JSON content: ${contentType}`);
        return defaultValue;
      }
      return await response.json();
    } catch (err) {
      console.error(`Error fetching ${url}:`, err);
      return defaultValue;
    }
  };

  // Fetch all data from either Cloud Firestore (if Firebase active) or local Express fallback
  const fetchAllData = async () => {
    try {
      if (isFirebaseActive) {
        const [
          resTractors, resModels, resCustomers, resInvoices, resQuotations, resChallans, resReturns, resUsers, resSettings, resLogs
        ] = await Promise.all([
          FirebaseStorageService.getTractors(),
          FirebaseStorageService.getModels(),
          FirebaseStorageService.getCustomers(),
          FirebaseStorageService.getInvoices(),
          FirebaseStorageService.getQuotations(),
          FirebaseStorageService.getChallans(),
          FirebaseStorageService.getReturns(),
          FirebaseStorageService.getUsers(),
          FirebaseStorageService.getSettings(),
          FirebaseStorageService.getLogs(),
        ]);
        setTractors(resTractors);
        setModels(resModels);
        setCustomers(resCustomers);
        setInvoices(resInvoices);
        setQuotations(resQuotations);
        setChallans(resChallans);
        setReturnRequests(resReturns);
        setUsers(resUsers);
        if (resSettings) {
          setSettings(resSettings);
        }
        setLogs(resLogs);
      } else {
        const [
          resTractors, resModels, resCustomers, resInvoices, resQuotations, resChallans, resReturns, resUsers, resSettings, resLogs
        ] = await Promise.all([
          safeFetchJson('/api/tractors', []),
          safeFetchJson('/api/models', []),
          safeFetchJson('/api/customers', []),
          safeFetchJson('/api/invoices', []),
          safeFetchJson('/api/quotations', []),
          safeFetchJson('/api/challans', []),
          safeFetchJson('/api/returns', []),
          safeFetchJson('/api/users', []),
          safeFetchJson('/api/settings', null),
          safeFetchJson('/api/logs', []),
        ]);
        setTractors(resTractors);
        setModels(resModels);
        setCustomers(resCustomers);
        setInvoices(resInvoices);
        setQuotations(resQuotations);
        setChallans(resChallans);
        setReturnRequests(resReturns);
        setUsers(resUsers);
        if (resSettings) {
          setSettings(resSettings);
        }
        setLogs(resLogs);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  // Real-time synchronization with Cloud SQL via Express or direct Cloud Firestore
  useEffect(() => {
    // Dynamically overwrite StorageService logging and settings update methods so other parts of the app use active database
    StorageService.addLog = (logData) => {
      SqlStorageService.addLog(logData).then(() => fetchAllData()).catch(err => console.error(err));
    };
    StorageService.saveSettings = (s) => {
      localStorage.setItem('tf_settings', JSON.stringify(s));
      SqlStorageService.saveSettings(s).then(() => fetchAllData()).catch(err => console.error(err));
    };

    const initSqlSync = async () => {
      // 1. Run local-to-SQL migration first
      await SqlStorageService.migrateToSQL();

      // 2. If Firebase config is active, run automated server-to-Firestore migration
      if (isFirebaseActive) {
        await SqlStorageService.migrateToFirebase();
      }

      // 3. Initial fetch
      await fetchAllData();
    };

    initSqlSync();

    // 4. Short polling interval to mimic real-time sync across clients
    const interval = setInterval(fetchAllData, 5000);
    return () => clearInterval(interval);
  }, []);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => { StorageService.saveTractors(tractors); }, [tractors]);
  useEffect(() => { StorageService.saveModels(models); }, [models]);
  useEffect(() => { StorageService.saveCustomers(customers); }, [customers]);
  useEffect(() => { StorageService.saveInvoices(invoices); }, [invoices]);
  useEffect(() => { StorageService.saveQuotations(quotations); }, [quotations]);
  useEffect(() => { StorageService.saveChallans(challans); }, [challans]);
  useEffect(() => { StorageService.saveReturns(returnRequests); }, [returnRequests]);
  useEffect(() => { StorageService.saveUsers(users); }, [users]);

  useEffect(() => {
    if (settings.isShopClosed && settings.closedAt) {
      const checkAutoOpen = () => {
        const closedDate = new Date(settings.closedAt!);
        const now = new Date();
        
        // Reopen time: Next day at 10:00 AM
        const reopenTime = new Date(closedDate);
        reopenTime.setDate(reopenTime.getDate() + 1);
        reopenTime.setHours(10, 0, 0, 0);
        
        if (now >= reopenTime) {
          const updatedSettings = { ...settings, isShopClosed: false, closedAt: undefined };
          setSettings(updatedSettings);
          setIsBypassed(false);
          StorageService.saveSettings(updatedSettings);
          StorageService.addLog({ 
            userId: 'system', 
            username: 'System', 
            action: 'Shop automatically opened (Scheduled)' 
          });
        }
      };

      checkAutoOpen();
      const interval = setInterval(checkAutoOpen, 60000); // Check every minute
      return () => clearInterval(interval);
    }
  }, [settings, settings.isShopClosed, settings.closedAt]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    StorageService.addLog({ userId: user.id, username: user.username, action: 'User logged in' });
  };

  const handleLogout = () => {
    if (currentUser) {
      StorageService.addLog({ userId: currentUser.id, username: currentUser.username, action: 'User logged out' });
    }
    setCurrentUser(null);
  };

  const addTractor = async (tractorData: Omit<Tractor, 'id' | 'createdAt'>) => {
    const newTractor: Tractor = { ...tractorData, id: Math.random().toString(36).substr(2, 9), createdAt: new Date().toISOString() };
    await SqlStorageService.saveTractor(newTractor);
    await fetchAllData();
  };

  const updateTractor = async (updatedTractor: Tractor) => { 
    await SqlStorageService.saveTractor(updatedTractor); 
    await fetchAllData();
  };
  
  const deleteTractor = async (id: string) => { 
    await SqlStorageService.deleteTractor(id); 
    await fetchAllData();
  };

  const addModel = async (modelData: Omit<TractorModel, 'id'>) => { 
    const newModel: TractorModel = { ...modelData, id: Math.random().toString(36).substr(2, 9) };
    await SqlStorageService.saveModel(newModel); 
    await fetchAllData();
  };
  const updateModel = async (updatedModel: TractorModel) => { 
    await SqlStorageService.saveModel(updatedModel); 
    await fetchAllData();
  };
  const deleteModel = async (id: string) => { 
    await SqlStorageService.deleteModel(id); 
    await fetchAllData();
  };

  const addCustomer = async (customerData: Omit<Customer, 'id' | 'createdAt'>) => { 
    if (customers.some(c => c.mobile === customerData.mobile)) {
      return; 
    }
    const newCustomer: Customer = { ...customerData, id: Math.random().toString(36).substr(2, 9), createdAt: new Date().toISOString() };
    await SqlStorageService.saveCustomer(newCustomer); 
    await fetchAllData();
  };
  const updateCustomer = async (updatedCustomer: Customer) => { 
    await SqlStorageService.saveCustomer(updatedCustomer); 
    await fetchAllData();
  };

  const addFollowupLog = async (customerId: string, log: { type: 'CALL' | 'WHATSAPP' | 'VISIT' | 'OTHER', remarks: string }) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      const now = new Date().toISOString();
      const newLog = {
        id: Math.random().toString(36).substr(2, 9),
        date: now,
        ...log
      };
      const updatedCustomer: Customer = {
        ...customer,
        lastFollowupDate: now,
        followups: [newLog, ...(customer.followups || [])]
      };
      await SqlStorageService.saveCustomer(updatedCustomer);
      await fetchAllData();
    }
  };

  const addInvoice = async (invoiceData: Omit<Invoice, 'id' | 'invoiceNo' | 'payments' | 'approvalStatus'>) => {
    const nextNum = (settings.invoiceStartNumber || 1) + invoices.length;
    const invoiceNo = `${settings.invoicePrefix}-INV-${nextNum.toString().padStart(4, '0')}`;
    const newInvoice: Invoice = {
      ...invoiceData,
      id: Math.random().toString(36).substr(2, 9),
      invoiceNo,
      date: invoiceData.date || new Date().toISOString(),
      approvalStatus: currentUser?.role === 'ADMIN' ? DocApprovalStatus.APPROVED : DocApprovalStatus.PENDING,
      payments: [{ id: Math.random().toString(36).substr(2, 9), amount: invoiceData.paidAmount, date: invoiceData.date || new Date().toISOString(), mode: invoiceData.paymentMode, particulars: 'Initial Down Payment' }]
    };
    await SqlStorageService.saveInvoice(newInvoice);
    const tractor = tractors.find(t => t.id === invoiceData.tractorId);
    if (tractor) {
      await SqlStorageService.saveTractor({ ...tractor, status: TractorStatus.SOLD });
    }
    await fetchAllData();
  };

  const updateInvoice = async (updatedInvoice: Invoice) => { 
    await SqlStorageService.saveInvoice(updatedInvoice); 
    await fetchAllData();
  };

  const addQuotation = async (quoteData: Omit<Quotation, 'id' | 'quotationNo' | 'approvalStatus'>) => {
    const nextNum = (settings.quotationStartNumber || 1) + quotations.length;
    const newQuote: Quotation = { 
      ...quoteData, 
      id: Math.random().toString(36).substr(2, 9), 
      quotationNo: `${settings.invoicePrefix}-QT-${nextNum.toString().padStart(4, '0')}`, 
      date: quoteData.date || new Date().toISOString(),
      approvalStatus: currentUser?.role === 'ADMIN' ? DocApprovalStatus.APPROVED : DocApprovalStatus.PENDING
    };
    await SqlStorageService.saveQuotation(newQuote);
    await fetchAllData();
  };

  const updateQuotation = async (updatedQuote: Quotation) => {
    await SqlStorageService.saveQuotation(updatedQuote);
    await fetchAllData();
  };

  const updateChallan = async (updatedChallan: DeliveryChallan) => {
    await SqlStorageService.saveChallan(updatedChallan);
    await fetchAllData();
  };

  const addChallan = async (challanData: Omit<DeliveryChallan, 'id' | 'challanNo' | 'approvalStatus'>) => {
    const nextNum = (settings.challanStartNumber || 1) + challans.length;
    const newChallan: DeliveryChallan = { 
      ...challanData, 
      id: Math.random().toString(36).substr(2, 9), 
      challanNo: `${settings.invoicePrefix}-DC-${nextNum.toString().padStart(4, '0')}`, 
      date: challanData.date || new Date().toISOString(),
      approvalStatus: currentUser?.role === 'ADMIN' ? DocApprovalStatus.APPROVED : DocApprovalStatus.PENDING
    };
    
    await SqlStorageService.saveChallan(newChallan);
    const tractor = tractors.find(t => t.id === challanData.tractorId);
    if (tractor) {
      await SqlStorageService.saveTractor({ ...tractor, status: TractorStatus.DELIVERED });
    }

    // Handle Exchange Value at Delivery
    if (challanData.invoiceId && challanData.exchangeValue && challanData.exchangeValue > 0) {
      const inv = invoices.find(i => i.id === challanData.invoiceId);
      if (inv) {
        const exchangePayment: PaymentRecord = {
          id: Math.random().toString(36).substr(2, 9),
          amount: challanData.exchangeValue || 0,
          date: new Date().toISOString(),
          mode: PaymentMode.EXCHANGE,
          particulars: `Exchange Value Confirmed at Delivery (Challan: ${newChallan.challanNo})`
        };
        
        const newPaidAmount = inv.paidAmount + exchangePayment.amount;
        const newStatus = newPaidAmount >= inv.totalAmount ? 'PAID' : 'PARTIAL';
        
        const updatedInv = {
          ...inv,
          payments: [...inv.payments, exchangePayment],
          paidAmount: newPaidAmount,
          status: newStatus
        };
        await SqlStorageService.saveInvoice(updatedInv);
      }
      
      StorageService.addLog({ 
        userId: currentUser?.id || 'system', 
        username: currentUser?.username || 'System', 
        action: `Recorded Exchange Value of ₹${challanData.exchangeValue.toLocaleString()} for Invoice: ${newChallan.invoiceId}` 
      });
    }
    await fetchAllData();
  };

  const addReturnRequest = async (data: Omit<ReturnRequestType, 'id' | 'requestId' | 'status' | 'date' | 'staffId' | 'staffName'>) => {
    const nextNum = returnRequests.length + 1;
    const newRequest: ReturnRequestType = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      requestId: `${settings.invoicePrefix || 'SS'}-RET-${nextNum.toString().padStart(4, '0')}`,
      date: new Date().toISOString(),
      staffId: currentUser!.id,
      staffName: currentUser!.fullName,
      status: DocApprovalStatus.PENDING
    };
    await SqlStorageService.saveReturnRequest(newRequest);
    StorageService.addLog({ userId: currentUser!.id, username: currentUser!.username, action: `Raised return request ${newRequest.requestId}` });
    await fetchAllData();
  };

  const approveReturnRequest = async (id: string) => {
    const request = returnRequests.find(r => r.id === id);
    if (!request) return;
    
    // Update tractor status in background
    const tractor = tractors.find(t => t.id === request.tractorId);
    if (tractor) {
      await SqlStorageService.saveTractor({ ...tractor, status: TractorStatus.AVAILABLE });
    }
    
    StorageService.addLog({ 
      userId: currentUser?.id || 'sys', 
      username: currentUser?.username || 'sys', 
      action: `Approved return request ${request.requestId}. Tractor returned to stock.` 
    });

    const updatedRequest = { 
      ...request, 
      status: DocApprovalStatus.APPROVED, 
      approvedAt: new Date().toISOString(), 
      approvedBy: currentUser?.fullName || 'Administrator' 
    };
    await SqlStorageService.saveReturnRequest(updatedRequest);
    await fetchAllData();
  };

  const rejectReturnRequest = async (id: string) => {
    const request = returnRequests.find(r => r.id === id);
    if (!request) return;

    StorageService.addLog({ 
      userId: currentUser?.id || 'sys', 
      username: currentUser?.username || 'sys', 
      action: `Rejected return request ${request.requestId}` 
    });

    const updatedRequest = { ...request, status: DocApprovalStatus.REJECTED };
    await SqlStorageService.saveReturnRequest(updatedRequest);
    await fetchAllData();
  };

  const handlePurgeData = async () => {
    await Promise.all([
      ...tractors.map(t => fetch(`/api/tractors/${t.id}`, { method: 'DELETE' })),
      ...customers.map(c => fetch(`/api/customers/${c.id}`, { method: 'DELETE' })),
      ...invoices.map(i => fetch(`/api/invoices/${i.id}`, { method: 'DELETE' })),
      ...quotations.map(q => fetch(`/api/quotations/${q.id}`, { method: 'DELETE' })),
      ...challans.map(ch => fetch(`/api/challans/${ch.id}`, { method: 'DELETE' })),
      ...returnRequests.map(r => fetch(`/api/returns/${r.id}`, { method: 'DELETE' }))
    ]);
    await fetchAllData();
    StorageService.addLog({ 
      userId: currentUser?.id || 'admin', 
      username: currentUser?.username || 'Admin', 
      action: 'CRITICAL: All business data purged' 
    });
    showToast("System database has been purged successfully.", 'success');
  };

  if (isLoading) return <Loader />;

  if (!currentUser) return <Login onLogin={handleLogin} settings={settings} />;

  if (settings.isShopClosed && !isBypassed) {
    return (
      <ShopClosedOverlay 
        settings={settings} 
        user={currentUser} 
        onLogout={handleLogout} 
        onBypass={() => {
          setIsBypassed(true);
          setActiveTab('settings');
        }} 
      />
    );
  }

  return (
    <Layout 
      user={currentUser} 
      onLogout={handleLogout} 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      settings={settings} 
      customers={customers}
      isDarkMode={isDarkMode}
      toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
    >
      {activeTab === 'dashboard' && <Dashboard tractors={tractors} customers={customers} invoices={invoices} quotations={quotations} currentUser={currentUser} setActiveTab={setActiveTab} onAddFollowupLog={addFollowupLog} />}
      {activeTab === 'inventory' && <Inventory tractors={tractors} catalogModels={models} settings={settings} onAdd={addTractor} onUpdate={updateTractor} onDelete={deleteTractor} showToast={showToast} />}
      {activeTab === 'vehicle-master' && <VehicleMaster tractors={tractors} customers={customers} invoices={invoices} />}
      {activeTab === 'models' && <ModelManager models={models} onAdd={addModel} onUpdate={updateModel} onDelete={deleteModel} showToast={showToast} />}
      {activeTab === 'customers' && <Customers customers={customers} invoices={invoices} models={models} settings={settings} currentUser={currentUser} onAdd={addCustomer} onUpdate={updateCustomer} onAddFollowupLog={addFollowupLog} showToast={showToast} />}
      {activeTab === 'billing' && (
        <Billing 
          tractors={tractors} 
          catalogModels={models}
          customers={customers} 
          invoices={invoices} 
          quotations={quotations} 
          challans={challans} 
          settings={settings} 
          currentUser={currentUser}
          onAddInvoice={addInvoice} 
          onUpdateInvoice={updateInvoice} 
          onAddQuotation={addQuotation} 
          onUpdateQuotation={updateQuotation}
          onAddChallan={addChallan} 
          onUpdateChallan={updateChallan}
          showToast={showToast}
        />
      )}
      {activeTab === 'reports' && <Reports invoices={invoices} customers={customers} />}
      {activeTab === 'return-request' && (
        <ReturnRequest 
          requests={returnRequests} 
          invoices={invoices} 
          customers={customers}
          tractors={tractors}
          currentUser={currentUser!} 
          onAdd={addReturnRequest} 
          showToast={showToast} 
        />
      )}
      {activeTab === 'sales-return' && (
        <SalesReturn 
          requests={returnRequests} 
          invoices={invoices} 
          customers={customers}
          tractors={tractors}
          onApprove={approveReturnRequest} 
          onReject={rejectReturnRequest} 
          showToast={showToast} 
        />
      )}
      {activeTab === 'customer-ledger' && <CustomerLedger invoices={invoices} customers={customers} tractors={tractors} settings={settings} currentUser={currentUser} />}
      {activeTab === 'settings' && <Settings currentUser={currentUser} settings={settings} onSave={(s) => { 
        setSettings(s); 
        StorageService.saveSettings(s); 
        if (!s.isShopClosed) setIsBypassed(false);
      }} onPurgeData={handlePurgeData} onUpdateCurrentUser={async (u) => {
        await SqlStorageService.saveUser(u);
        setCurrentUser(u);
        await fetchAllData();
      }} />}
      {activeTab === 'users' && <UserManagement users={users} onAddUser={async (u) => { const newUser = { ...u, id: Math.random().toString(36).substr(2, 9) }; await SqlStorageService.saveUser(newUser); await fetchAllData(); }} onUpdateUser={async (u) => { await SqlStorageService.saveUser(u); await fetchAllData(); }} onDeleteUser={async (id) => { await SqlStorageService.deleteUser(id); await fetchAllData(); }} />}
      {activeTab === 'logs' && <ActivityLogs logs={logs} />}
      
      {/* Toast Notifications */}
      <div className="fixed bottom-8 right-8 z-[9999] flex flex-col gap-3 pointer-events-none">
        {toasts.map(toast => (
          <div 
            key={toast.id} 
            className={`pointer-events-auto flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border animate-in slide-in-from-right-10 duration-300 ${
              toast.type === 'success' ? 'bg-emerald-600 border-emerald-500 text-white' :
              toast.type === 'error' ? 'bg-rose-600 border-rose-500 text-white' :
              'bg-slate-900 border-slate-800 text-white'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 size={20} />}
            {toast.type === 'error' && <AlertCircle size={20} />}
            {toast.type === 'info' && <Info size={20} />}
            <p className="text-xs font-black uppercase tracking-widest">{toast.message}</p>
            <button 
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              className="ml-4 p-1 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default App;
