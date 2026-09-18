import { 
  Tractor, Customer, Invoice, User, ShowroomSettings, 
  TractorModel, Quotation, DeliveryChallan, ReturnRequest, ActivityLog
} from '../types';
import { StorageService } from './storage';
import { FirebaseStorageService } from './firebaseStorage';
import firebaseConfig from '../firebase-applet-config.json';

// Detect if Firebase is configured with active credentials
export const isFirebaseActive = firebaseConfig && 
  firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== 'AIzaSyDummyKeyForPlatformBuildVerification' &&
  firebaseConfig.projectId;

export const SqlStorageService = {
  // Save/Write methods (via Firebase Firestore if active, otherwise fallback to Express JSON server)
  saveTractor: async (tractor: Tractor) => {
    if (isFirebaseActive) {
      await FirebaseStorageService.saveTractor(tractor);
    } else {
      await fetch('/api/tractors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tractor)
      });
    }
  },
  deleteTractor: async (id: string) => {
    if (isFirebaseActive) {
      await FirebaseStorageService.deleteTractor(id);
    } else {
      await fetch(`/api/tractors/${id}`, {
        method: 'DELETE'
      });
    }
  },

  saveModel: async (model: TractorModel) => {
    if (isFirebaseActive) {
      await FirebaseStorageService.saveModel(model);
    } else {
      await fetch('/api/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(model)
      });
    }
  },
  deleteModel: async (id: string) => {
    if (isFirebaseActive) {
      await FirebaseStorageService.deleteModel(id);
    } else {
      await fetch(`/api/models/${id}`, {
        method: 'DELETE'
      });
    }
  },

  saveCustomer: async (customer: Customer) => {
    if (isFirebaseActive) {
      await FirebaseStorageService.saveCustomer(customer);
    } else {
      await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customer)
      });
    }
  },
  deleteCustomer: async (id: string) => {
    if (isFirebaseActive) {
      await FirebaseStorageService.deleteCustomer(id);
    } else {
      await fetch(`/api/customers/${id}`, {
        method: 'DELETE'
      });
    }
  },

  saveInvoice: async (invoice: Invoice) => {
    if (isFirebaseActive) {
      await FirebaseStorageService.saveInvoice(invoice);
    } else {
      await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoice)
      });
    }
  },

  saveQuotation: async (quotation: Quotation) => {
    if (isFirebaseActive) {
      await FirebaseStorageService.saveQuotation(quotation);
    } else {
      await fetch('/api/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quotation)
      });
    }
  },

  saveChallan: async (challan: DeliveryChallan) => {
    if (isFirebaseActive) {
      await FirebaseStorageService.saveChallan(challan);
    } else {
      await fetch('/api/challans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(challan)
      });
    }
  },

  saveReturnRequest: async (ret: ReturnRequest) => {
    if (isFirebaseActive) {
      await FirebaseStorageService.saveReturnRequest(ret);
    } else {
      await fetch('/api/returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ret)
      });
    }
  },

  saveUser: async (user: User) => {
    if (isFirebaseActive) {
      await FirebaseStorageService.saveUser(user);
    } else {
      await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });
    }
  },
  deleteUser: async (id: string) => {
    if (isFirebaseActive) {
      await FirebaseStorageService.deleteUser(id);
    } else {
      await fetch(`/api/users/${id}`, {
        method: 'DELETE'
      });
    }
  },

  saveSettings: async (settings: ShowroomSettings) => {
    if (isFirebaseActive) {
      await FirebaseStorageService.saveSettings(settings);
    } else {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
    }
  },

  addLog: async (log: Omit<ActivityLog, 'id' | 'timestamp'>) => {
    if (isFirebaseActive) {
      await FirebaseStorageService.addLog(log);
    } else {
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(log)
      });
    }
  },

  // One-time migration of localStorage data to Cloud SQL / Express
  migrateToSQL: async () => {
    try {
      const existingSettings = await fetch('/api/settings')
        .then(async (r) => {
          if (!r.ok) return null;
          const contentType = r.headers.get("content-type");
          if (!contentType || !contentType.includes("application/json")) return null;
          return await r.json();
        })
        .catch(() => null);
      if (existingSettings && existingSettings.name) {
        return;
      }

      const localSettings = StorageService.getSettings();
      let localUsers = StorageService.getUsers();
      if (localUsers.length === 0) {
        localUsers = [{ 
          id: '1', 
          username: 'admin', 
          role: 'ADMIN' as any, 
          fullName: 'System Administrator', 
          password: 'admin123',
          permissions: ['dashboard', 'inventory', 'customer-ledger', 'billing', 'customers', 'models', 'reports', 'logs', 'users', 'settings']
        }];
      }

      const payload = {
        settings: localSettings,
        users: localUsers,
        models: StorageService.getModels(),
        tractors: StorageService.getTractors(),
        customers: StorageService.getCustomers(),
        invoices: StorageService.getInvoices(),
        quotations: StorageService.getQuotations(),
        challans: StorageService.getChallans(),
        returns: StorageService.getReturns(),
        logs: StorageService.getLogs()
      };

      await fetch('/api/migrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.error('Migration to SQL failed:', err);
    }
  },

  // Migrate all server-side SQL / JSON data to Cloud Firestore
  migrateToFirebase: async () => {
    try {
      const [
        tractors, models, customers, invoices, quotations, challans, returns, users, settings, logs
      ] = await Promise.all([
        fetch('/api/tractors').then(r => r.json()).catch(() => []),
        fetch('/api/models').then(r => r.json()).catch(() => []),
        fetch('/api/customers').then(r => r.json()).catch(() => []),
        fetch('/api/invoices').then(r => r.json()).catch(() => []),
        fetch('/api/quotations').then(r => r.json()).catch(() => []),
        fetch('/api/challans').then(r => r.json()).catch(() => []),
        fetch('/api/returns').then(r => r.json()).catch(() => []),
        fetch('/api/users').then(r => r.json()).catch(() => []),
        fetch('/api/settings').then(r => r.json()).catch(() => null),
        fetch('/api/logs').then(r => r.json()).catch(() => []),
      ]);

      if (settings) {
        await FirebaseStorageService.migrateToFirebase({
          tractors,
          models,
          customers,
          invoices,
          quotations,
          challans,
          returns,
          users,
          settings,
          logs
        });
      }
    } catch (err) {
      console.error('Migration to Firestore failed:', err);
    }
  }
};
