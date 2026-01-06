import { useState } from 'react';
import { Search, Plus, FolderPlus, LayoutGrid, List } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { StatsCards } from './StatsCards';
import { FileList } from './FileList';
import { UploadZone } from './UploadZone';
import { UsersManagement } from './UsersManagement';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CloudFile, StorageStats } from '@/types';
import { cn } from '@/lib/utils';

// Mock data
const mockFiles: CloudFile[] = [
  {
    id: '1',
    name: 'Projetos',
    type: 'folder',
    size: 0,
    parentId: null,
    userId: '1',
    shared: true,
    starred: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-06-01'),
  },
  {
    id: '2',
    name: 'Documentos',
    type: 'folder',
    size: 0,
    parentId: null,
    userId: '1',
    shared: false,
    starred: false,
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-05-20'),
  },
  {
    id: '3',
    name: 'Relatório Anual 2024.pdf',
    type: 'file',
    mimeType: 'application/pdf',
    size: 15.7 * 1024 * 1024,
    parentId: null,
    userId: '1',
    shared: true,
    starred: true,
    createdAt: new Date('2024-03-05'),
    updatedAt: new Date('2024-03-05'),
  },
  {
    id: '4',
    name: 'Apresentação Q4.pptx',
    type: 'file',
    mimeType: 'application/vnd.ms-powerpoint',
    size: 8.2 * 1024 * 1024,
    parentId: null,
    userId: '1',
    shared: false,
    starred: false,
    createdAt: new Date('2024-04-12'),
    updatedAt: new Date('2024-04-15'),
  },
  {
    id: '5',
    name: 'banner-hero.png',
    type: 'file',
    mimeType: 'image/png',
    size: 2.4 * 1024 * 1024,
    parentId: null,
    userId: '1',
    shared: false,
    starred: false,
    createdAt: new Date('2024-05-01'),
    updatedAt: new Date('2024-05-01'),
  },
  {
    id: '6',
    name: 'video-tutorial.mp4',
    type: 'file',
    mimeType: 'video/mp4',
    size: 156.8 * 1024 * 1024,
    parentId: null,
    userId: '1',
    shared: true,
    starred: false,
    createdAt: new Date('2024-05-18'),
    updatedAt: new Date('2024-05-18'),
  },
  {
    id: '7',
    name: 'backup-database.zip',
    type: 'file',
    mimeType: 'application/zip',
    size: 45.3 * 1024 * 1024,
    parentId: null,
    userId: '1',
    shared: false,
    starred: true,
    createdAt: new Date('2024-06-02'),
    updatedAt: new Date('2024-06-02'),
  },
];

const mockStats: StorageStats = {
  totalStorage: 100 * 1024 * 1024 * 1024,
  usedStorage: 45.2 * 1024 * 1024 * 1024,
  totalFiles: 247,
  totalFolders: 32,
  sharedFiles: 18,
};

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('files');
  const [files, setFiles] = useState<CloudFile[]>(mockFiles);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredFiles = files.filter((file) => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    switch (activeSection) {
      case 'starred':
        return matchesSearch && file.starred;
      case 'shared':
        return matchesSearch && file.shared;
      default:
        return matchesSearch;
    }
  });

  const handleStar = (file: CloudFile) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === file.id ? { ...f, starred: !f.starred } : f))
    );
  };

  const handleDelete = (file: CloudFile) => {
    setFiles((prev) => prev.filter((f) => f.id !== file.id));
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'users':
        return <UsersManagement />;
      case 'databases':
        return (
          <div className="glass-card rounded-xl p-8 text-center animate-fade-in">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/20 flex items-center justify-center">
              <span className="text-3xl">🗄️</span>
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Bancos de Dados SQLite</h3>
            <p className="text-muted-foreground mb-4">
              Cada usuário possui um banco de dados SQLite isolado para armazenamento seguro de metadados.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="p-4 rounded-lg bg-secondary/50">
                <p className="text-2xl font-bold text-primary">5</p>
                <p className="text-sm text-muted-foreground">Usuários ativos</p>
              </div>
              <div className="p-4 rounded-lg bg-secondary/50">
                <p className="text-2xl font-bold text-success">12.4 MB</p>
                <p className="text-sm text-muted-foreground">Total de DBs</p>
              </div>
              <div className="p-4 rounded-lg bg-secondary/50">
                <p className="text-2xl font-bold text-warning">100%</p>
                <p className="text-sm text-muted-foreground">Integridade</p>
              </div>
            </div>
          </div>
        );
      case 'storage':
        return (
          <div className="glass-card rounded-xl p-8 animate-fade-in">
            <h3 className="text-xl font-bold text-foreground mb-6">Visão Geral do Armazenamento</h3>
            <div className="space-y-4">
              {[
                { label: 'Carlos Owner', used: 45.2, total: 1024, color: 'from-primary to-accent' },
                { label: 'Ana Admin', used: 28.7, total: 500, color: 'from-accent to-pink-500' },
                { label: 'Pedro Staff', used: 12.4, total: 100, color: 'from-success to-emerald-500' },
                { label: 'Outros usuários', used: 14.1, total: 30, color: 'from-warning to-orange-500' },
              ].map((item) => (
                <div key={item.label} className="p-4 rounded-lg bg-secondary/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">{item.label}</span>
                    <span className="text-sm text-muted-foreground">
                      {item.used} GB / {item.total} GB
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn('h-full bg-gradient-to-r', item.color)}
                      style={{ width: `${(item.used / item.total) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
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
            <p className="text-muted-foreground">
              Área exclusiva para o Owner. Configure políticas de armazenamento, 
              backups automáticos e integrações.
            </p>
          </div>
        );
      default:
        return (
          <div className="space-y-6">
            <StatsCards stats={mockStats} />
            <UploadZone />
            <FileList
              files={filteredFiles}
              onStar={handleStar}
              onDelete={handleDelete}
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

                  <Button variant="outline" className="gap-2 border-border">
                    <FolderPlus className="w-4 h-4" />
                    <span className="hidden sm:inline">Nova Pasta</span>
                  </Button>

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
          {renderContent()}
        </div>
      </main>
    </div>
  );
};
