import { useState, useEffect, useCallback } from 'react';
import { db, DBFile, DBUser } from '@/lib/database';

export const useFiles = (userId: string | undefined) => {
  const [files, setFiles] = useState<DBFile[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFiles = useCallback(async () => {
    if (!userId) {
      setFiles([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const userFiles = await db.getFilesByUserId(userId);
      setFiles(userFiles);
    } catch (error) {
      console.error('Erro ao carregar arquivos:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const createFile = async (file: Omit<DBFile, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newFile: DBFile = {
      ...file,
      id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.createFile(newFile);
    await loadFiles();
    return newFile;
  };

  const updateFile = async (file: DBFile) => {
    const updatedFile = {
      ...file,
      updatedAt: new Date().toISOString(),
    };
    await db.updateFile(updatedFile);
    await loadFiles();
    return updatedFile;
  };

  const deleteFile = async (fileId: string) => {
    await db.deleteFile(fileId);
    await loadFiles();
  };

  const toggleStar = async (file: DBFile) => {
    return updateFile({ ...file, starred: !file.starred });
  };

  const toggleShare = async (file: DBFile) => {
    return updateFile({ ...file, shared: !file.shared });
  };

  const getStarredFiles = async () => {
    if (!userId) return [];
    return db.getStarredFiles(userId);
  };

  const getSharedFiles = async () => {
    if (!userId) return [];
    return db.getSharedFiles(userId);
  };

  return {
    files,
    loading,
    createFile,
    updateFile,
    deleteFile,
    toggleStar,
    toggleShare,
    getStarredFiles,
    getSharedFiles,
    refresh: loadFiles,
  };
};

export const useUsers = () => {
  const [users, setUsers] = useState<DBUser[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const allUsers = await db.getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const createUser = async (userData: Omit<DBUser, 'id' | 'createdAt'>) => {
    const newUser: DBUser = {
      ...userData,
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };

    await db.createUser(newUser);
    await loadUsers();
    return newUser;
  };

  const updateUser = async (user: DBUser) => {
    await db.updateUser(user);
    await loadUsers();
    return user;
  };

  const deleteUser = async (userId: string) => {
    await db.deleteUser(userId);
    await loadUsers();
  };

  const changeUserRole = async (userId: string, role: DBUser['role']) => {
    const user = await db.getUserById(userId);
    if (user) {
      await updateUser({ ...user, role });
    }
  };

  return {
    users,
    loading,
    createUser,
    updateUser,
    deleteUser,
    changeUserRole,
    refresh: loadUsers,
  };
};

export const useUserStats = (userId: string | undefined) => {
  const [stats, setStats] = useState({
    totalFiles: 0,
    totalFolders: 0,
    sharedFiles: 0,
    totalSize: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const userStats = await db.getUserStats(userId);
        setStats(userStats);
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [userId]);

  return { stats, loading };
};
