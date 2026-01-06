import { useState, useEffect } from 'react';
import { Search, Plus, FolderPlus, LayoutGrid, List, Database } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { StatsCards } from './StatsCards';
import { FileList } from './FileList';
import { UploadZone } from './UploadZone';
import { UsersManagement } from './UsersManagement';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
export interface StorageStats {
  totalStorage: number;
  usedStorage: number;
  totalFiles: number;
  totalFolders: number;
  sharedFiles: number;
}
import { cn } from '@/lib/utils';
import { useFiles, useUserStats, useUsers } from '@/hooks/useLocalDatabase';
import { DBFile } from '@/lib/database';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('files');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewFolderDialogOpen, setIsNewFolderDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [displayFiles, setDisplayFiles] = useState<DBFile[]>([]);

  const { files, loading: filesLoading, createFile, updateFile, deleteFile, toggleStar, getStarredFiles, getSharedFiles } = useFiles(user?.id);
  const { stats } = useUserStats(user?.id);
  const { users } = useUsers();

  // Carregar arquivos baseado na seção ativa
  useEffect(() => {
    const loadSectionFiles = async () => {
      if (!user) return;

      let sectionFiles: DBFile[] = [];

      switch (activeSection) {
        case 'starred':
          sectionFiles = await getStarredFiles();
          break;
        case 'shared':
          sectionFiles = await getSharedFiles();
          break;
        default:
          sectionFiles = files;
      }

      setDisplayFiles(sectionFiles);
    };

    loadSectionFiles();
  }, [activeSection, files, user]);

  if (!user) return null;

  const sectionTitles: Record<string, string> = {
    files: 'Meus Arquivos',
    starred: 'Favoritos',
    shared: 'Compartilhados',
    trash: 'Lixeira',
    users: 'Gerenciar Usuários',
    databases: 'Bancos de Dados',
    storage: 'Armazenamento',
    settings: 'Configurações',
  };

  const filteredFiles = displayFiles.filter((file) =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast.error('Digite um nome para a pasta');
      return;
    }

    try {
      await createFile({
        name: newFolderName,
        type: 'folder',
        size: 0,
        parentId: null,
        userId: user.id,
        shared: false,
        starred: false,
      });

      toast.success('Pasta criada com sucesso!');
      setNewFolderName('');
      setIsNewFolderDialogOpen(false);
    } catch (error) {
      toast.error('Erro ao criar pasta');
    }
  };

  const handleStar = async (file: DBFile) => {
    await toggleStar(file);
    toast.success(file.starred ? 'Removido dos favoritos' : 'Adicionado aos favoritos');
  };

  const handleDelete = async (file: DBFile) => {
    if (confirm(`Tem certeza que deseja excluir "${file.name}"?`)) {
      await deleteFile(file.id);
      toast.success('Arquivo excluído com sucesso!');
    }
  };

  const handleShare = async (file: DBFile) => {
    const updatedFile = { ...file, shared: !file.shared, updatedAt: new Date().toISOString() };
    await updateFile(updatedFile);
    toast.success(file.shared ? 'Compartilhamento removido' : 'Arquivo compartilhado!');
  };

  // Calcular estatísticas reais
  const storageStats: StorageStats = {
    totalStorage: user.storageLimit,
    usedStorage: user.storageUsed,
    totalFiles: stats.totalFiles,
    totalFolders: stats.totalFolders,
    sharedFiles: stats.sharedFiles,
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'users':
        return <UsersManagement />;
      case 'databases':
        return (
          <div className="glass-card rounded-xl p-8 animate-fade-in">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center">
                <Database className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">Banco de Dados Local</h3>
                <p className="text-muted-foreground">IndexedDB - Armazenamento 100% local</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-lg bg-secondary/50">
                <p className="text-2xl font-bold text-primary">{users.length}</p>
                <p className="text-sm text-muted-foreground">Usuários cadastrados</p>
              </div>
              <div className="p-4 rounded-lg bg-secondary/50">
                <p className="text-2xl font-bold text-success">{stats.totalFiles + stats.totalFolders}</p>
                <p className="text-sm text-muted-foreground">Total de itens</p>
              </div>
              <div className="p-4 rounded-lg bg-secondary/50">
                <p className="text-2xl font-bold text-warning">100%</p>
                <p className="text-sm text-muted-foreground">Offline/Local</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium text-foreground">Tabelas do Sistema:</h4>
              {['users', 'files', 'sessions', 'settings'].map((table) => (
                <div key={table} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-success" />
                    <span className="font-mono text-sm text-foreground">{table}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">IndexedDB</span>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-sm text-foreground">
                <strong>💡 Dados 100% locais:</strong> Todos os dados são armazenados no IndexedDB do navegador. 
                Não há dependência de servidores externos. Os dados persistem entre sessões.
              </p>
            </div>
          </div>
        );
      case 'storage':
        return (
          <div className="glass-card rounded-xl p-8 animate-fade-in">
            <h3 className="text-xl font-bold text-foreground mb-6">Visão Geral do Armazenamento</h3>
            <div className="space-y-4">
              {users.map((u) => {
                const usagePercent = (u.storageUsed / u.storageLimit) * 100;
                const colors = {
                  owner: 'from-warning to-orange-500',
                  admin: 'from-accent to-pink-500',
                  staff: 'from-primary to-cyan-500',
                  user: 'from-success to-emerald-500',
                };
                return (
                  <div key={u.id} className="p-4 rounded-lg bg-secondary/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">{u.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {(u.storageUsed / (1024 * 1024 * 1024)).toFixed(1)} GB / {(u.storageLimit / (1024 * 1024 * 1024)).toFixed(0)} GB
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn('h-full bg-gradient-to-r', colors[u.role])}
                        style={{ width: `${Math.min(usagePercent, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="glass-card rounded-xl p-8 text-center animate-fade-in">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-warning/20 flex items-center justify-center">
              <span className="text-3xl">⚙️</span>
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Configurações do Sistema</h3>
            <p className="text-muted-foreground mb-6">
              Área exclusiva para o Owner. Configure políticas de armazenamento e backups.
            </p>
            
            <div className="space-y-4 text-left max-w-md mx-auto">
              <div className="p-4 rounded-lg bg-secondary/50">
                <h4 className="font-medium text-foreground mb-2">Exportar Dados</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Faça backup de todos os dados do sistema em formato JSON.
                </p>
                <Button variant="outline" className="w-full">
                  Exportar Database
                </Button>
              </div>
              
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                <h4 className="font-medium text-destructive mb-2">Limpar Dados</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Remove todos os dados do sistema. Esta ação não pode ser desfeita.
                </p>
                <Button variant="destructive" className="w-full">
                  Limpar Tudo
                </Button>
              </div>
            </div>
          </div>
        );
      case 'trash':
        return (
          <div className="glass-card rounded-xl p-8 text-center animate-fade-in">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-destructive/20 flex items-center justify-center">
              <span className="text-3xl">🗑️</span>
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Lixeira</h3>
            <p className="text-muted-foreground">
              Itens excluídos aparecem aqui. Funcionalidade em desenvolvimento.
            </p>
          </div>
        );
      default:
        return (
          <div className="space-y-6">
            <StatsCards stats={storageStats} />
            <UploadZone />
            <FileList
              files={filteredFiles}
              onStar={handleStar}
              onDelete={handleDelete}
              onShare={handleShare}
            />
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />

      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="sticky top-0 z-10 backdrop-blur-xl bg-background/80 border-b border-border px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-foreground">
              {sectionTitles[activeSection]}
            </h2>

            <div className="flex items-center gap-3">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar arquivos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64 bg-secondary border-border"
                />
              </div>

              {['files', 'starred', 'shared'].includes(activeSection) && (
                <>
                  <div className="flex items-center border border-border rounded-lg overflow-hidden">
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn('rounded-none', viewMode === 'list' && 'bg-secondary')}
                      onClick={() => setViewMode('list')}
                    >
                      <List className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn('rounded-none', viewMode === 'grid' && 'bg-secondary')}
                      onClick={() => setViewMode('grid')}
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </Button>
                  </div>

                  <Dialog open={isNewFolderDialogOpen} onOpenChange={setIsNewFolderDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="gap-2 border-border">
                        <FolderPlus className="w-4 h-4" />
                        <span className="hidden sm:inline">Nova Pasta</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-card border-border">
                      <DialogHeader>
                        <DialogTitle className="text-foreground">Criar Nova Pasta</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <Label className="text-foreground">Nome da Pasta</Label>
                          <Input
                            placeholder="Minha Pasta"
                            className="bg-secondary border-border"
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                          />
                        </div>
                        <div className="flex justify-end gap-3">
                          <Button variant="outline" onClick={() => setIsNewFolderDialogOpen(false)}>
                            Cancelar
                          </Button>
                          <Button onClick={handleCreateFolder}>
                            Criar
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button className="gap-2 bg-primary hover:bg-primary/90">
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Upload</span>
                  </Button>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          {filesLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            renderContent()
          )}
        </div>
      </main>
    </div>
  );
};
