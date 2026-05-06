import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  Timestamp,
  setDoc 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { getAuth } from 'firebase/auth';

const PATIENTS_COLLECTION = 'patients';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const auth = getAuth();
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const patientService = {
  async getAllPatients() {
    try {
      const q = query(collection(db, PATIENTS_COLLECTION), orderBy('lastName', 'asc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, PATIENTS_COLLECTION);
      return [];
    }
  },

  async getPatient(id: string) {
    try {
      const docRef = doc(db, PATIENTS_COLLECTION, id);
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) return null;
      return { id: snapshot.id, ...snapshot.data() };
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `${PATIENTS_COLLECTION}/${id}`);
      return null;
    }
  },

  async createPatient(data: any) {
    try {
      return await addDoc(collection(db, PATIENTS_COLLECTION), {
        ...data,
        createdAt: Timestamp.now()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, PATIENTS_COLLECTION);
      throw error;
    }
  },

  async updatePatient(id: string, data: any) {
    try {
      const docRef = doc(db, PATIENTS_COLLECTION, id);
      return await updateDoc(docRef, data);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${PATIENTS_COLLECTION}/${id}`);
      throw error;
    }
  },

  async searchPatients(queryStr: string) {
    try {
      // In a real app we'd use Algolia/etc, for this EHR we'll fetch all and filter 
      // or do a basic prefix search. We'll do a simple fetch all for now
      // as patients collection is typically small enough for real-time EHR needs in this context.
      const snapshot = await getDocs(collection(db, PATIENTS_COLLECTION));
      const patients = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
      return patients.filter(p => 
        p.firstName?.toLowerCase().includes(queryStr.toLowerCase()) || 
        p.lastName?.toLowerCase().includes(queryStr.toLowerCase())
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, PATIENTS_COLLECTION);
      return [];
    }
  }
};

export const examService = {
  async getExamsByPatient(patientId: string) {
    const path = `patients/${patientId}/exams`;
    try {
      const q = query(
        collection(db, path), 
        orderBy('date', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  async createExam(patientId: string, data: any) {
    const path = `patients/${patientId}/exams`;
    try {
      return await addDoc(collection(db, path), {
        ...data,
        date: Timestamp.now()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
      throw error;
    }
  }
};

export const fileService = {
  async uploadFundusPhoto(patientId: string, file: File, patientName?: string) {
    const path = `patients/${patientId}/documents`;
    try {
      const storageRef = ref(storage, `patients/${patientId}/fundus/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      
      // Also record in Firestore
      await addDoc(collection(db, path), {
        type: 'fundus',
        url,
        name: file.name,
        patientName: patientName || 'Unknown',
        uploadedAt: Timestamp.now()
      });
      
      return url;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
      throw error;
    }
  }
};

export const documentService = {
  async addDocument(patientId: string, data: any) {
    const path = `patients/${patientId}/documents`;
    try {
      return await addDoc(collection(db, path), {
        ...data,
        uploadedAt: Timestamp.now()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
      throw error;
    }
  }
};

export const orderService = {
  async getOrdersByPatient(patientId: string) {
    const path = `patients/${patientId}/orders`;
    try {
      const q = query(
        collection(db, path), 
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  async createOrder(patientId: string, data: any) {
    const path = `patients/${patientId}/orders`;
    try {
      return await addDoc(collection(db, path), {
        ...data,
        createdAt: Timestamp.now(),
        status: 'pending'
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
      throw error;
    }
  }
};

export const contactOrderService = {
  async createContactOrder(patientId: string, data: any) {
    const path = `patients/${patientId}/contactOrders`;
    const globalPath = 'contactOrderQueue';
    try {
      const orderData = {
        ...data,
        patientId,
        createdAt: Timestamp.now(),
        status: 'pending', // 'pending', 'ordered', 'received', 'dispensed'
      };
      
      // Save to patient subcollection
      const orderRef = await addDoc(collection(db, path), orderData);
      
      // Also save to global queue for easy dashboard access
      await setDoc(doc(db, globalPath, orderRef.id), {
        ...orderData,
        orderId: orderRef.id
      });

      return orderRef;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
      throw error;
    }
  },

  async getContactOrdersByPatient(patientId: string) {
    const path = `patients/${patientId}/contactOrders`;
    try {
      const q = query(collection(db, path), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  async getPendingContactOrders() {
    const path = 'contactOrderQueue';
    try {
      const q = query(collection(db, path), where('status', '==', 'pending'), orderBy('createdAt', 'asc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  async getActiveContactOrders() {
    const path = 'contactOrderQueue';
    try {
      const q = query(
        collection(db, path), 
        where('status', 'in', ['ordered', 'received']), 
        orderBy('createdAt', 'asc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  async updateOrderStatus(patientId: string, orderId: string, status: string, additionalData: any = {}) {
    const path = `patients/${patientId}/contactOrders/${orderId}`;
    try {
      const updateData = { 
        status, 
        updatedAt: Timestamp.now(),
        ...additionalData 
      };
      
      // Update in patient subcollection
      await updateDoc(doc(db, `patients/${patientId}/contactOrders`, orderId), updateData);
      
      // Update or delete in global queue
      // If dispensed (picked up), remove from primary queue as requested
      if (status === 'dispensed') {
        await deleteDoc(doc(db, 'contactOrderQueue', orderId));
      } else {
        await updateDoc(doc(db, 'contactOrderQueue', orderId), updateData);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
      throw error;
    }
  }
};

export const schedulerService = {
  async getAppointments(date: string) {
    const path = 'appointments';
    try {
      const q = query(
        collection(db, path),
        where('date', '==', date)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  async createAppointment(data: any) {
    const path = 'appointments';
    try {
      return await addDoc(collection(db, path), {
        ...data,
        createdAt: Timestamp.now()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
      throw error;
    }
  },

  async deleteAppointment(id: string) {
    const path = `appointments/${id}`;
    try {
      return await deleteDoc(doc(db, 'appointments', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
      throw error;
    }
  }
};
