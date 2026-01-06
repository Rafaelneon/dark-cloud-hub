import { useState } from 'react';
import { 
  Cloud, 
  FolderOpen, 
  Star, 
  Share2, 
  Trash2, 
  Settings, 
  Users, 
  Database,
  HardDrive,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { RoleBadge } from '@/components/ui/RoleBadge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const mainNavItems = [
  { id: 'files', label: 'Meus Arquivos', icon: FolderOpen },
  { id: 'starred', label: 'Favoritos', icon: Star },
  { id: 'shared', label: 'Compartilhados', icon: Share2 },
  { id: 'trash', label: 'Lixeira', icon: Trash2 },
];

const adminNavItems = [
  { id: 'users', label: 'Usuários', icon: Users, minRole: 'staff' },
  { id: 'databases', label: 'Bancos de Dados', icon: Database, minRole: 'admin' },
  { id: 'storage', label: 'Armazenamento', icon: HardDrive, minRole: 'admin' },
  { id: 'settings', label: 'Configurações', icon: Settings, minRole: 'owner' },
];

const roleHierarchy = { user: 0, staff: 1, admin: 2, owner: 3 };

export const Sidebar: React.FC<SidebarProps> = ({ activeSection, onSectionChange }) => {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  if (!user) return null;

  const userRoleLevel = roleHierarchy[user.role];

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const usagePercent = (user.storageUsed / user.storageLimit) * 100;

  return (
    <aside
      className={cn(
        'flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        <div className={cn('flex items-center gap-3', collapsed && 'justify-center w-full')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center glow-primary">
            <Cloud className="w-6 h-6 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="font-bold text-foreground">CloudStore</h1>
              <p className="text-xs text-muted-foreground">Storage System</p>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className={cn('text-muted-foreground hover:text-foreground', collapsed && 'hidden')}
          onClick={() => setCollapsed(true)}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
      </div>

      {collapsed && (
        <Button
          variant="ghost"
          size="icon"
          className="mx-auto mt-2 text-muted-foreground hover:text-foreground"
          onClick={() => setCollapsed(false)}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {mainNavItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSectionChange(item.id)}
            className={cn(
              'sidebar-item w-full',
              activeSection === item.id && 'sidebar-item-active',
              collapsed && 'justify-center px-2'
            )}
          >
            <item.icon className="w-5 h-5 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </button>
        ))}

        {userRoleLevel >= 1 && (
          <>
            <Separator className="my-4 bg-sidebar-border" />
            <p className={cn('text-xs text-muted-foreground px-3 mb-2', collapsed && 'hidden')}>
              Administração
            </p>
            {adminNavItems
              .filter((item) => userRoleLevel >= roleHierarchy[item.minRole as keyof typeof roleHierarchy])
              .map((item) => (
                <button
                  key={item.id}
                  onClick={() => onSectionChange(item.id)}
                  className={cn(
                    'sidebar-item w-full',
                    activeSection === item.id && 'sidebar-item-active',
                    collapsed && 'justify-center px-2'
                  )}
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </button>
              ))}
          </>
        )}
      </nav>

      {/* Storage Usage */}
      {!collapsed && (
        <div className="p-4 mx-3 mb-3 rounded-xl bg-secondary/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Armazenamento</span>
            <span className="text-xs font-medium text-foreground">
              {usagePercent.toFixed(1)}%
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
              style={{ width: `${Math.min(usagePercent, 100)}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {formatBytes(user.storageUsed)} de {formatBytes(user.storageLimit)}
          </p>
        </div>
      )}

      {/* User Profile */}
      <div className="p-3 border-t border-sidebar-border">
        <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
          <Avatar className="w-10 h-10 border-2 border-primary/30">
            <AvatarFallback className="bg-secondary text-foreground">
              {user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
              <RoleBadge role={user.role} size="sm" />
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className={cn('text-muted-foreground hover:text-destructive', collapsed && 'hidden')}
            onClick={logout}
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
};
