// IndexedDB utilities for offline storage
export interface PendingIngestion {
  id: string;
  linkedinUrl: string;
  notes: string;
  timestamp: number;
  status: 'pending' | 'syncing' | 'failed';
  retryCount: number;
  lastRetry?: number;
}

export interface OfflineNote {
  id: string;
  linkedinUrl: string;
  notes: string;
  timestamp: number;
  syncStatus: 'pending' | 'synced' | 'failed';
}

class IndexedDBManager {
  private dbName = 'VibeNotesDB';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'));
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create pending ingestions store
        if (!db.objectStoreNames.contains('pendingIngestions')) {
          const pendingStore = db.createObjectStore('pendingIngestions', { keyPath: 'id' });
          pendingStore.createIndex('timestamp', 'timestamp', { unique: false });
          pendingStore.createIndex('status', 'status', { unique: false });
        }

        // Create offline notes store
        if (!db.objectStoreNames.contains('offlineNotes')) {
          const offlineStore = db.createObjectStore('offlineNotes', { keyPath: 'id' });
          offlineStore.createIndex('timestamp', 'timestamp', { unique: false });
          offlineStore.createIndex('syncStatus', 'syncStatus', { unique: false });
        }

        // Create sync queue store
        if (!db.objectStoreNames.contains('syncQueue')) {
          const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id' });
          syncStore.createIndex('priority', 'priority', { unique: false });
          syncStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  private async ensureDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.init();
    }
    if (!this.db) {
      throw new Error('Failed to initialize database');
    }
    return this.db;
  }

  // Pending Ingestions CRUD operations
  async addPendingIngestion(ingestion: Omit<PendingIngestion, 'id' | 'retryCount' | 'status'>): Promise<string> {
    const db = await this.ensureDB();
    const id = `pending-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const pendingIngestion: PendingIngestion = {
      ...ingestion,
      id,
      status: 'pending',
      retryCount: 0,
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['pendingIngestions'], 'readwrite');
      const store = transaction.objectStore('pendingIngestions');
      const request = store.add(pendingIngestion);

      request.onsuccess = () => resolve(id);
      request.onerror = () => reject(new Error('Failed to add pending ingestion'));
    });
  }

  async getPendingIngestions(): Promise<PendingIngestion[]> {
    const db = await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['pendingIngestions'], 'readonly');
      const store = transaction.objectStore('pendingIngestions');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error('Failed to get pending ingestions'));
    });
  }

  async updatePendingIngestion(id: string, updates: Partial<PendingIngestion>): Promise<void> {
    const db = await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['pendingIngestions'], 'readwrite');
      const store = transaction.objectStore('pendingIngestions');
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const existing = getRequest.result;
        if (!existing) {
          reject(new Error('Pending ingestion not found'));
          return;
        }

        const updated = { ...existing, ...updates };
        const putRequest = store.put(updated);

        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(new Error('Failed to update pending ingestion'));
      };

      getRequest.onerror = () => reject(new Error('Failed to get pending ingestion'));
    });
  }

  async deletePendingIngestion(id: string): Promise<void> {
    const db = await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['pendingIngestions'], 'readwrite');
      const store = transaction.objectStore('pendingIngestions');
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to delete pending ingestion'));
    });
  }

  // Offline Notes CRUD operations
  async addOfflineNote(note: Omit<OfflineNote, 'id' | 'syncStatus'>): Promise<string> {
    const db = await this.ensureDB();
    const id = `offline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const offlineNote: OfflineNote = {
      ...note,
      id,
      syncStatus: 'pending',
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['offlineNotes'], 'readwrite');
      const store = transaction.objectStore('offlineNotes');
      const request = store.add(offlineNote);

      request.onsuccess = () => resolve(id);
      request.onerror = () => reject(new Error('Failed to add offline note'));
    });
  }

  async getOfflineNotes(): Promise<OfflineNote[]> {
    const db = await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['offlineNotes'], 'readonly');
      const store = transaction.objectStore('offlineNotes');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error('Failed to get offline notes'));
    });
  }

  async updateOfflineNote(id: string, updates: Partial<OfflineNote>): Promise<void> {
    const db = await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['offlineNotes'], 'readwrite');
      const store = transaction.objectStore('offlineNotes');
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const existing = getRequest.result;
        if (!existing) {
          reject(new Error('Offline note not found'));
          return;
        }

        const updated = { ...existing, ...updates };
        const putRequest = store.put(updated);

        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(new Error('Failed to update offline note'));
      };

      getRequest.onerror = () => reject(new Error('Failed to get offline note'));
    });
  }

  async deleteOfflineNote(id: string): Promise<void> {
    const db = await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['offlineNotes'], 'readwrite');
      const store = transaction.objectStore('offlineNotes');
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to delete offline note'));
    });
  }

  // Utility methods
  async clearAllData(): Promise<void> {
    const db = await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['pendingIngestions', 'offlineNotes', 'syncQueue'], 'readwrite');
      
      Promise.all([
        new Promise<void>((res, rej) => {
          const req = transaction.objectStore('pendingIngestions').clear();
          req.onsuccess = () => res();
          req.onerror = () => rej();
        }),
        new Promise<void>((res, rej) => {
          const req = transaction.objectStore('offlineNotes').clear();
          req.onsuccess = () => res();
          req.onerror = () => rej();
        }),
        new Promise<void>((res, rej) => {
          const req = transaction.objectStore('syncQueue').clear();
          req.onsuccess = () => res();
          req.onerror = () => rej();
        }),
      ]).then(() => resolve()).catch(() => reject(new Error('Failed to clear data')));
    });
  }

  async getStorageUsage(): Promise<{ pendingIngestions: number; offlineNotes: number }> {
    const db = await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['pendingIngestions', 'offlineNotes'], 'readonly');
      
      Promise.all([
        new Promise<number>((res, rej) => {
          const req = transaction.objectStore('pendingIngestions').count();
          req.onsuccess = () => res(req.result);
          req.onerror = () => rej();
        }),
        new Promise<number>((res, rej) => {
          const req = transaction.objectStore('offlineNotes').count();
          req.onsuccess = () => res(req.result);
          req.onerror = () => rej();
        }),
      ]).then(([pendingIngestions, offlineNotes]) => {
        resolve({ pendingIngestions, offlineNotes });
      }).catch(() => reject(new Error('Failed to get storage usage')));
    });
  }
}

// Singleton instance
export const indexedDBManager = new IndexedDBManager();

// Online/Offline detection utilities
export class ConnectionManager {
  private static instance: ConnectionManager;
  private isOnline: boolean = true;
  private listeners: Array<(isOnline: boolean) => void> = [];

  private constructor() {
    if (typeof window !== 'undefined') {
      this.isOnline = navigator.onLine;
      window.addEventListener('online', this.handleOnline.bind(this));
      window.addEventListener('offline', this.handleOffline.bind(this));
    }
  }

  static getInstance(): ConnectionManager {
    if (!ConnectionManager.instance) {
      ConnectionManager.instance = new ConnectionManager();
    }
    return ConnectionManager.instance;
  }

  private handleOnline(): void {
    this.isOnline = true;
    this.notifyListeners();
    this.triggerSync();
  }

  private handleOffline(): void {
    this.isOnline = false;
    this.notifyListeners();
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.isOnline));
  }

  private async triggerSync(): Promise<void> {
    // Attempt to sync pending ingestions when coming back online
    try {
      const pendingIngestions = await indexedDBManager.getPendingIngestions();
      
      for (const ingestion of pendingIngestions) {
        if (ingestion.status === 'pending' || ingestion.status === 'failed') {
          await this.syncIngestion(ingestion);
        }
      }
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }

  private async syncIngestion(ingestion: PendingIngestion): Promise<void> {
    try {
      await indexedDBManager.updatePendingIngestion(ingestion.id, { 
        status: 'syncing' 
      });

      // In a real app, this would be an API call
      // For now, we'll simulate a successful sync
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Move to completed ingestions in localStorage
      const completedIngestions = JSON.parse(localStorage.getItem('completed-ingestions') || '[]');
      completedIngestions.push({
        id: `synced-${ingestion.id}`,
        linkedinUrl: ingestion.linkedinUrl,
        notes: ingestion.notes,
        timestamp: ingestion.timestamp,
      });
      localStorage.setItem('completed-ingestions', JSON.stringify(completedIngestions));

      // Remove from pending
      await indexedDBManager.deletePendingIngestion(ingestion.id);

    } catch (error) {
      console.error('Failed to sync ingestion:', error);
      await indexedDBManager.updatePendingIngestion(ingestion.id, { 
        status: 'failed',
        retryCount: ingestion.retryCount + 1,
        lastRetry: Date.now(),
      });
    }
  }

  public getConnectionStatus(): boolean {
    return this.isOnline;
  }

  public addConnectionListener(listener: (isOnline: boolean) => void): void {
    this.listeners.push(listener);
  }

  public removeConnectionListener(listener: (isOnline: boolean) => void): void {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  public async retryFailedSync(): Promise<void> {
    if (!this.isOnline) {
      throw new Error('Cannot retry sync while offline');
    }

    const pendingIngestions = await indexedDBManager.getPendingIngestions();
    const failedIngestions = pendingIngestions.filter(ing => ing.status === 'failed');

    for (const ingestion of failedIngestions) {
      await this.syncIngestion(ingestion);
    }
  }
}

// Initialize IndexedDB when module loads
if (typeof window !== 'undefined') {
  indexedDBManager.init().catch(console.error);
}