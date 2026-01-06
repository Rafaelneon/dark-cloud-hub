export type UserRole = 'owner' | 'admin' | 'staff' | 'user';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  storageUsed: number;
  storageLimit: number;
  createdAt: Date;
}

export interface CloudFile {
  id: string;
  name: string;
  type: 'file' | 'folder';
  mimeType?: string;
  size: number;
  parentId: string | null;
  userId: string;
  shared: boolean;
  starred: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface StorageStats {
  totalStorage: number;
  usedStorage: number;
  totalFiles: number;
  totalFolders: number;
  sharedFiles: number;
}
