import { 
  collection, doc, getDocs, setDoc, deleteDoc, getDoc,
  query, orderBy, limit
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { 
  Tractor, Customer, Invoice, User, ShowroomSettings, 
  TractorModel, Quotation, DeliveryChallan, ReturnRequest, ActivityLog
} from '../types';

export const FirebaseStorageService = {
  getTractors: async (): Promise<Tractor[]> => {
    try {
      const q = collection(db, 'tractors');
      const snap = await getDocs(q);
      return snap.docs.map(doc => doc.data() as Tractor);
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, 'tractors');
      return [];
    }
  },
  saveTractor: async (tractor: Tractor) => {
    try {
      await setDoc(doc(db, 'tractors', tractor.id), tractor);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `tractors/${tractor.id}`);
    }
  },
  deleteTractor: async (id: string) => {
    try {
      await deleteDoc(doc(db, 'tractors', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `tractors/${id}`);
    }
  },

  getModels: async (): Promise<TractorModel[]> => {
    try {
      const q = collection(db, 'tractorModels');
      const snap = await getDocs(q);
      return snap.docs.map(doc => doc.data() as TractorModel);
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, 'tractorModels');
      return [];
    }
  },
  saveModel: async (model: TractorModel) => {
    try {
      await setDoc(doc(db, 'tractorModels', model.id), model);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `tractorModels/${model.id}`);
    }
  },
  deleteModel: async (id: string) => {
    try {
      await deleteDoc(doc(db, 'tractorModels', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `tractorModels/${id}`);
    }
  },

  getCustomers: async (): Promise<Customer[]> => {
    try {
      const q = collection(db, 'customers');
      const snap = await getDocs(q);
      return snap.docs.map(doc => doc.data() as Customer);
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, 'customers');
      return [];
    }
  },
  saveCustomer: async (customer: Customer) => {
    try {
      await setDoc(doc(db, 'customers', customer.id), customer);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `customers/${customer.id}`);
    }
  },
  deleteCustomer: async (id: string) => {
    try {
      await deleteDoc(doc(db, 'customers', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `customers/${id}`);
    }
  },

  getInvoices: async (): Promise<Invoice[]> => {
    try {
      const q = collection(db, 'invoices');
      const snap = await getDocs(q);
      return snap.docs.map(doc => doc.data() as Invoice);
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, 'invoices');
      return [];
    }
  },
  saveInvoice: async (invoice: Invoice) => {
    try {
      await setDoc(doc(db, 'invoices', invoice.id), invoice);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `invoices/${invoice.id}`);
    }
  },

  getQuotations: async (): Promise<Quotation[]> => {
    try {
      const q = collection(db, 'quotations');
      const snap = await getDocs(q);
      return snap.docs.map(doc => doc.data() as Quotation);
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, 'quotations');
      return [];
    }
  },
  saveQuotation: async (quotation: Quotation) => {
    try {
      await setDoc(doc(db, 'quotations', quotation.id), quotation);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `quotations/${quotation.id}`);
    }
  },

  getChallans: async (): Promise<DeliveryChallan[]> => {
    try {
      const q = collection(db, 'deliveryChallans');
      const snap = await getDocs(q);
      return snap.docs.map(doc => doc.data() as DeliveryChallan);
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, 'deliveryChallans');
      return [];
    }
  },
  saveChallan: async (challan: DeliveryChallan) => {
    try {
      await setDoc(doc(db, 'deliveryChallans', challan.id), challan);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `deliveryChallans/${challan.id}`);
    }
  },

  getReturns: async (): Promise<ReturnRequest[]> => {
    try {
      const q = collection(db, 'returnRequests');
      const snap = await getDocs(q);
      return snap.docs.map(doc => doc.data() as ReturnRequest);
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, 'returnRequests');
      return [];
    }
  },
  saveReturnRequest: async (ret: ReturnRequest) => {
    try {
      await setDoc(doc(db, 'returnRequests', ret.id), ret);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `returnRequests/${ret.id}`);
    }
  },

  getUsers: async (): Promise<User[]> => {
    try {
      const q = collection(db, 'users');
      const snap = await getDocs(q);
      return snap.docs.map(doc => doc.data() as User);
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, 'users');
      return [];
    }
  },
  saveUser: async (user: User) => {
    try {
      await setDoc(doc(db, 'users', user.id), user);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${user.id}`);
    }
  },
  deleteUser: async (id: string) => {
    try {
      await deleteDoc(doc(db, 'users', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${id}`);
    }
  },

  getSettings: async (): Promise<ShowroomSettings | null> => {
    try {
      const ref = doc(db, 'showroomSettings', 'showroom');
      const snap = await getDoc(ref);
      return snap.exists() ? (snap.data() as ShowroomSettings) : null;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, 'showroomSettings/showroom');
      return null;
    }
  },
  saveSettings: async (settings: ShowroomSettings) => {
    try {
      await setDoc(doc(db, 'showroomSettings', 'showroom'), settings);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'showroomSettings/showroom');
    }
  },

  getLogs: async (): Promise<ActivityLog[]> => {
    try {
      const q = query(collection(db, 'activityLogs'), orderBy('timestamp', 'desc'), limit(500));
      const snap = await getDocs(q);
      return snap.docs.map(doc => doc.data() as ActivityLog);
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, 'activityLogs');
      return [];
    }
  },
  addLog: async (log: Omit<ActivityLog, 'id' | 'timestamp'>) => {
    try {
      const id = Math.random().toString(36).substr(2, 9);
      const timestamp = new Date().toISOString();
      const logDoc: ActivityLog = { ...log, id, timestamp };
      await setDoc(doc(db, 'activityLogs', id), logDoc);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'activityLogs');
    }
  },

  migrateToFirebase: async (data: {
    tractors: Tractor[];
    models: TractorModel[];
    customers: Customer[];
    invoices: Invoice[];
    quotations: Quotation[];
    challans: DeliveryChallan[];
    returns: ReturnRequest[];
    users: User[];
    settings: ShowroomSettings;
    logs: ActivityLog[];
  }) => {
    try {
      await setDoc(doc(db, 'showroomSettings', 'showroom'), data.settings);
      for (const t of data.tractors) {
        await setDoc(doc(db, 'tractors', t.id), t);
      }
      for (const m of data.models) {
        await setDoc(doc(db, 'tractorModels', m.id), m);
      }
      for (const c of data.customers) {
        await setDoc(doc(db, 'customers', c.id), c);
      }
      for (const i of data.invoices) {
        await setDoc(doc(db, 'invoices', i.id), i);
      }
      for (const q of data.quotations) {
        await setDoc(doc(db, 'quotations', q.id), q);
      }
      for (const ch of data.challans) {
        await setDoc(doc(db, 'deliveryChallans', ch.id), ch);
      }
      for (const r of data.returns) {
        await setDoc(doc(db, 'returnRequests', r.id), r);
      }
      for (const u of data.users) {
        await setDoc(doc(db, 'users', u.id), u);
      }
      for (const l of data.logs) {
        await setDoc(doc(db, 'activityLogs', l.id), l);
      }
      console.log('Migration to Firestore completed successfully!');
    } catch (err) {
      console.error('Migration to Firestore failed:', err);
    }
  }
};
