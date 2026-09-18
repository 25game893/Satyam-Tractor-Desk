
import { 
  Tractor, Customer, Invoice, User, ActivityLog, 
  ShowroomSettings, UserRole, TractorModel, 
  Quotation, DeliveryChallan, CustomerStatus,
  TractorStatus, PaymentMode, DocApprovalStatus, ReturnRequest
} from '../types';
import { DEFAULT_SETTINGS, TRACTOR_MODELS, MANUFACTURERS } from '../constants';

const STORAGE_KEYS = {
  TRACTORS: 'tf_tractors',
  CUSTOMERS: 'tf_customers',
  INVOICES: 'tf_invoices',
  QUOTATIONS: 'tf_quotations',
  CHALLANS: 'tf_challans',
  USERS: 'tf_users',
  MODELS: 'tf_models',
  LOGS: 'tf_logs',
  RETURNS: 'tf_returns',
  SETTINGS: 'tf_settings',
  AUTH: 'tf_auth_user'
};

const get = <T,>(key: string, defaultValue: T): T => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
};

const set = <T,>(key: string, data: T): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Initial data seeds
if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
  const initialUsers: User[] = [
    { 
      id: '1', 
      username: 'admin', 
      role: UserRole.ADMIN, 
      fullName: 'System Administrator', 
      password: 'admin123',
      mobileNumber: '9098832111',
      permissions: ['dashboard', 'inventory', 'customer-ledger', 'billing', 'customers', 'models', 'reports', 'logs', 'users', 'settings']
    }
  ];
  set(STORAGE_KEYS.USERS, initialUsers);
}

if (!localStorage.getItem(STORAGE_KEYS.MODELS)) {
  set(STORAGE_KEYS.MODELS, []);
}

if (!localStorage.getItem(STORAGE_KEYS.TRACTORS)) {
  set(STORAGE_KEYS.TRACTORS, []);
}

if (!localStorage.getItem(STORAGE_KEYS.CUSTOMERS)) {
  set(STORAGE_KEYS.CUSTOMERS, []);
}

if (!localStorage.getItem(STORAGE_KEYS.INVOICES)) {
  set(STORAGE_KEYS.INVOICES, []);
}

if (!localStorage.getItem(STORAGE_KEYS.QUOTATIONS)) {
  set(STORAGE_KEYS.QUOTATIONS, []);
}

if (!localStorage.getItem(STORAGE_KEYS.CHALLANS)) {
  set(STORAGE_KEYS.CHALLANS, []);
}

if (!localStorage.getItem(STORAGE_KEYS.RETURNS)) {
  set(STORAGE_KEYS.RETURNS, []);
}

export const StorageService = {
  getTractors: () => get<Tractor[]>(STORAGE_KEYS.TRACTORS, []),
  saveTractors: (data: Tractor[]) => set(STORAGE_KEYS.TRACTORS, data),

  getCustomers: () => get<Customer[]>(STORAGE_KEYS.CUSTOMERS, []),
  saveCustomers: (data: Customer[]) => set(STORAGE_KEYS.CUSTOMERS, data),

  getInvoices: () => get<Invoice[]>(STORAGE_KEYS.INVOICES, []),
  saveInvoices: (data: Invoice[]) => set(STORAGE_KEYS.INVOICES, data),

  getQuotations: () => get<Quotation[]>(STORAGE_KEYS.QUOTATIONS, []),
  saveQuotations: (data: Quotation[]) => set(STORAGE_KEYS.QUOTATIONS, data),

  getChallans: () => get<DeliveryChallan[]>(STORAGE_KEYS.CHALLANS, []),
  saveChallans: (data: DeliveryChallan[]) => set(STORAGE_KEYS.CHALLANS, data),

  getUsers: () => {
    const users = get<User[]>(STORAGE_KEYS.USERS, []);
    return users.map(u => {
      if (u.role === UserRole.ADMIN && !u.mobileNumber) {
        return { ...u, mobileNumber: '9098832111' };
      }
      return u;
    });
  },
  saveUsers: (data: User[]) => set(STORAGE_KEYS.USERS, data),

  getReturns: () => get<ReturnRequest[]>(STORAGE_KEYS.RETURNS, []),
  saveReturns: (data: ReturnRequest[]) => set(STORAGE_KEYS.RETURNS, data),

  getModels: () => get<TractorModel[]>(STORAGE_KEYS.MODELS, []),
  saveModels: (data: TractorModel[]) => set(STORAGE_KEYS.MODELS, data),

  getLogs: () => get<ActivityLog[]>(STORAGE_KEYS.LOGS, []),
  addLog: (log: Omit<ActivityLog, 'id' | 'timestamp'>) => {
    const logs = get<ActivityLog[]>(STORAGE_KEYS.LOGS, []);
    const newLog: ActivityLog = {
      ...log,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString()
    };
    set(STORAGE_KEYS.LOGS, [newLog, ...logs].slice(0, 500));
  },

  getSettings: () => {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    const parsed = data ? JSON.parse(data) : {};
    return { ...DEFAULT_SETTINGS, ...parsed };
  },
  saveSettings: (data: ShowroomSettings) => set(STORAGE_KEYS.SETTINGS, data),

  getAuth: () => get<User | null>(STORAGE_KEYS.AUTH, null),
  setAuth: (user: User | null) => set(STORAGE_KEYS.AUTH, user),

  clearAllData: () => {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    window.location.reload();
  }
};
