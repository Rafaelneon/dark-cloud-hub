// Local IndexedDB Database - Funciona como SQLite no navegador
// Cada usuário tem seus dados isolados

const DB_NAME = 'CloudStoreDB';
const DB_VERSION = 1;

export interface DBUser {
  id: string;
  email: string;
  password: string; // Em produção, usar hash
  name: string;
  role: 'owner' | 'admin' | 'staff' | 'user';
  storageUsed: number;
  storageLimit: number;
  createdAt: string;
}

export interface DBFile {
  id: string;
  name: string;
  type: 'file' | 'folder';
  mimeType?: string;
  size: number;
  parentId: string | null;
  userId: string;
  shared: boolean;
  starred: boolean;
  createdAt: string;
  updatedAt: string;
  data?: ArrayBuffer; // Dados binários do arquivo
}

export interface DBSession {
  id: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
}

class LocalDatabase {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  async init(): Promise<void> {
    if (this.db) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Tabela de usuários
        if (!db.objectStoreNames.contains('users')) {
          const usersStore = db.createObjectStore('users', { keyPath: 'id' });
          usersStore.createIndex('email', 'email', { unique: true });
          usersStore.createIndex('role', 'role', { unique: false });
        }

        // Tabela de arquivos
        if (!db.objectStoreNames.contains('files')) {
          const filesStore = db.createObjectStore('files', { keyPath: 'id' });
          filesStore.createIndex('userId', 'userId', { unique: false });
          filesStore.createIndex('parentId', 'parentId', { unique: false });
          filesStore.createIndex('starred', 'starred', { unique: false });
          filesStore.createIndex('shared', 'shared', { unique: false });
        }

        // Tabela de sessões
        if (!db.objectStoreNames.contains('sessions')) {
          const sessionsStore = db.createObjectStore('sessions', { keyPath: 'id' });
          sessionsStore.createIndex('userId', 'userId', { unique: false });
        }

        // Tabela de configurações
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      };
    });

    await this.initPromise;
    await this.seedDefaultData();
  }

  private async seedDefaultData(): Promise<void> {
    const existingUsers = await this.getAllUsers();
    if (existingUsers.length > 0) return;

    // Criar usuários padrão
    const defaultUsers: DBUser[] = [
      {
        id: 'owner-1',
        email: 'owner@cloud.io',
        password: 'demo123',
        name: 'Carlos Owner',
        role: 'owner',
        storageUsed: 45.2 * 1024 * 1024 * 1024,
        storageLimit: 1024 * 1024 * 1024 * 1024,
        createdAt: new Date('2024-01-01').toISOString(),
      },
      {
        id: 'admin-1',
        email: 'admin@cloud.io',
        password: 'demo123',
        name: 'Ana Admin',
        role: 'admin',
        storageUsed: 28.7 * 1024 * 1024 * 1024,
        storageLimit: 500 * 1024 * 1024 * 1024,
        createdAt: new Date('2024-02-15').toISOString(),
      },
      {
        id: 'staff-1',
        email: 'staff@cloud.io',
        password: 'demo123',
        name: 'Pedro Staff',
        role: 'staff',
        storageUsed: 12.4 * 1024 * 1024 * 1024,
        storageLimit: 100 * 1024 * 1024 * 1024,
        createdAt: new Date('2024-03-20').toISOString(),
      },
    ];

    for (const user of defaultUsers) {
      await this.createUser(user);
    }

    // Criar arquivos de exemplo para o owner
    const defaultFiles: DBFile[] = [
      {
        id: 'folder-1',
        name: 'Projetos',
        type: 'folder',
        size: 0,
        parentId: null,
        userId: 'owner-1',
        shared: true,
        starred: true,
        createdAt: new Date('2024-01-15').toISOString(),
        updatedAt: new Date('2024-06-01').toISOString(),
      },
      {
        id: 'folder-2',
        name: 'Documentos',
        type: 'folder',
        size: 0,
        parentId: null,
        userId: 'owner-1',
        shared: false,
        starred: false,
        createdAt: new Date('2024-02-10').toISOString(),
        updatedAt: new Date('2024-05-20').toISOString(),
      },
      {
        id: 'file-1',
        name: 'Relatório Anual 2024.pdf',
        type: 'file',
        mimeType: 'application/pdf',
        size: 15.7 * 1024 * 1024,
        parentId: null,
        userId: 'owner-1',
        shared: true,
        starred: true,
        createdAt: new Date('2024-03-05').toISOString(),
        updatedAt: new Date('2024-03-05').toISOString(),
      },
      {
        id: 'file-2',
        name: 'Apresentação Q4.pptx',
        type: 'file',
        mimeType: 'application/vnd.ms-powerpoint',
        size: 8.2 * 1024 * 1024,
        parentId: null,
        userId: 'owner-1',
        shared: false,
        starred: false,
        createdAt: new Date('2024-04-12').toISOString(),
        updatedAt: new Date('2024-04-15').toISOString(),
      },
      {
        id: 'file-3',
        name: 'banner-hero.png',
        type: 'file',
        mimeType: 'image/png',
        size: 2.4 * 1024 * 1024,
        parentId: null,
        userId: 'owner-1',
        shared: false,
        starred: false,
        createdAt: new Date('2024-05-01').toISOString(),
        updatedAt: new Date('2024-05-01').toISOString(),
      },
    ];

    for (const file of defaultFiles) {
      await this.createFile(file);
    }
  }

  private getStore(storeName: string, mode: IDBTransactionMode = 'readonly'): IDBObjectStore {
    if (!this.db) throw new Error('Database not initialized');
    const transaction = this.db.transaction(storeName, mode);
    return transaction.objectStore(storeName);
  }

  // === USUÁRIOS ===

  async createUser(user: DBUser): Promise<DBUser> {
    await this.init();
    return new Promise((resolve, reject) => {
      const store = this.getStore('users', 'readwrite');
      const request = store.add(user);
      request.onsuccess = () => resolve(user);
      request.onerror = () => reject(request.error);
    });
  }

  async getUserByEmail(email: string): Promise<DBUser | null> {
    await this.init();
    return new Promise((resolve, reject) => {
      const store = this.getStore('users');
      const index = store.index('email');
      const request = index.get(email.toLowerCase());
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getUserById(id: string): Promise<DBUser | null> {
    await this.init();
    return new Promise((resolve, reject) => {
      const store = this.getStore('users');
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllUsers(): Promise<DBUser[]> {
    await this.init();
    return new Promise((resolve, reject) => {
      const store = this.getStore('users');
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async updateUser(user: DBUser): Promise<DBUser> {
    await this.init();
    return new Promise((resolve, reject) => {
      const store = this.getStore('users', 'readwrite');
      const request = store.put(user);
      request.onsuccess = () => resolve(user);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteUser(id: string): Promise<void> {
    await this.init();
    return new Promise((resolve, reject) => {
      const store = this.getStore('users', 'readwrite');
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // === ARQUIVOS ===

  async createFile(file: DBFile): Promise<DBFile> {
    await this.init();
    return new Promise((resolve, reject) => {
      const store = this.getStore('files', 'readwrite');
      const request = store.add(file);
      request.onsuccess = () => resolve(file);
      request.onerror = () => reject(request.error);
    });
  }

  async getFilesByUserId(userId: string): Promise<DBFile[]> {
    await this.init();
    return new Promise((resolve, reject) => {
      const store = this.getStore('files');
      const index = store.index('userId');
      const request = index.getAll(userId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getFileById(id: string): Promise<DBFile | null> {
    await this.init();
    return new Promise((resolve, reject) => {
      const store = this.getStore('files');
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async updateFile(file: DBFile): Promise<DBFile> {
    await this.init();
    return new Promise((resolve, reject) => {
      const store = this.getStore('files', 'readwrite');
      const request = store.put(file);
      request.onsuccess = () => resolve(file);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteFile(id: string): Promise<void> {
    await this.init();
    return new Promise((resolve, reject) => {
      const store = this.getStore('files', 'readwrite');
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getFilesByParentId(userId: string, parentId: string | null): Promise<DBFile[]> {
    await this.init();
    const allFiles = await this.getFilesByUserId(userId);
    return allFiles.filter(f => f.parentId === parentId);
  }

  async getStarredFiles(userId: string): Promise<DBFile[]> {
    await this.init();
    const allFiles = await this.getFilesByUserId(userId);
    return allFiles.filter(f => f.starred);
  }

  async getSharedFiles(userId: string): Promise<DBFile[]> {
    await this.init();
    const allFiles = await this.getFilesByUserId(userId);
    return allFiles.filter(f => f.shared);
  }

  // === SESSÕES ===

  async createSession(userId: string): Promise<DBSession> {
    await this.init();
    const session: DBSession = {
      id: `session-${Date.now()}`,
      userId,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 dias
    };

    return new Promise((resolve, reject) => {
      const store = this.getStore('sessions', 'readwrite');
      const request = store.add(session);
      request.onsuccess = () => {
        localStorage.setItem('currentSessionId', session.id);
        resolve(session);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getCurrentSession(): Promise<DBSession | null> {
    await this.init();
    const sessionId = localStorage.getItem('currentSessionId');
    if (!sessionId) return null;

    return new Promise((resolve, reject) => {
      const store = this.getStore('sessions');
      const request = store.get(sessionId);
      request.onsuccess = () => {
        const session = request.result;
        if (session && new Date(session.expiresAt) > new Date()) {
          resolve(session);
        } else {
          localStorage.removeItem('currentSessionId');
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.init();
    localStorage.removeItem('currentSessionId');
    return new Promise((resolve, reject) => {
      const store = this.getStore('sessions', 'readwrite');
      const request = store.delete(sessionId);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // === ESTATÍSTICAS ===

  async getUserStats(userId: string): Promise<{
    totalFiles: number;
    totalFolders: number;
    sharedFiles: number;
    totalSize: number;
  }> {
    const files = await this.getFilesByUserId(userId);
    return {
      totalFiles: files.filter(f => f.type === 'file').length,
      totalFolders: files.filter(f => f.type === 'folder').length,
      sharedFiles: files.filter(f => f.shared).length,
      totalSize: files.reduce((acc, f) => acc + f.size, 0),
    };
  }

  // === UTILIDADES ===

  async clearAllData(): Promise<void> {
    await this.init();
    const stores = ['users', 'files', 'sessions', 'settings'];
    for (const storeName of stores) {
      await new Promise<void>((resolve, reject) => {
        const store = this.getStore(storeName, 'readwrite');
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }
    localStorage.removeItem('currentSessionId');
  }

  async exportDatabase(): Promise<{
    users: DBUser[];
    files: DBFile[];
  }> {
    const users = await this.getAllUsers();
    const files: DBFile[] = [];
    for (const user of users) {
      const userFiles = await this.getFilesByUserId(user.id);
      files.push(...userFiles);
    }
    return { users, files };
  }
}

// Singleton
export const db = new LocalDatabase();
