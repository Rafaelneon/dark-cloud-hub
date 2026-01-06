import { useState } from 'react';
import { Search, MoreVertical, UserPlus, Shield, Crown, Star, User as UserIcon, Ban, Trash2 } from 'lucide-react';
import { RoleBadge } from '@/components/ui/RoleBadge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { useUsers } from '@/hooks/useLocalDatabase';
import { DBUser } from '@/lib/database';
import { toast } from 'sonner';

const roleHierarchy = { user: 0, staff: 1, admin: 2, owner: 3 };

export const UsersManagement: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { users, createUser, updateUser, deleteUser, changeUserRole } = useUsers();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newUserData, setNewUserData] = useState({
    email: '',
    name: '',
    password: '',
    role: 'user' as UserRole,
    storageLimit: 15,
  });

  if (!currentUser) return null;

  const currentUserLevel = roleHierarchy[currentUser.role];

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const canEditUser = (targetUser: DBUser) => {
    return currentUserLevel > roleHierarchy[targetUser.role];
  };

  const handleCreateUser = async () => {
    if (!newUserData.email || !newUserData.name || !newUserData.password) {
      toast.error('Preencha todos os campos');
      return;
    }

    try {
      await createUser({
        email: newUserData.email.toLowerCase(),
        name: newUserData.name,
        password: newUserData.password,
        role: newUserData.role,
        storageUsed: 0,
        storageLimit: newUserData.storageLimit * 1024 * 1024 * 1024,
      });

      toast.success('Usuário criado com sucesso!');
      setIsAddDialogOpen(false);
      setNewUserData({
        email: '',
        name: '',
        password: '',
        role: 'user',
        storageLimit: 15,
      });
    } catch (error) {
      toast.error('Erro ao criar usuário');
    }
  };

  const handleChangeRole = async (userId: string, newRole: UserRole) => {
    try {
      await changeUserRole(userId, newRole);
      toast.success('Função alterada com sucesso!');
    } catch (error) {
      toast.error('Erro ao alterar função');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
      try {
        await deleteUser(userId);
        toast.success('Usuário excluído com sucesso!');
      } catch (error) {
        toast.error('Erro ao excluir usuário');
      }
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'owner': return Crown;
      case 'admin': return Shield;
      case 'staff': return Star;
      default: return UserIcon;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar usuários..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-secondary border-border"
          />
        </div>

        {currentUserLevel >= 2 && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-primary hover:bg-primary/90">
                <UserPlus className="w-4 h-4" />
                Adicionar Usuário
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle className="text-foreground">Adicionar Novo Usuário</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label className="text-foreground">Email</Label>
                  <Input 
                    placeholder="email@exemplo.com" 
                    className="bg-secondary border-border"
                    value={newUserData.email}
                    onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Nome</Label>
                  <Input 
                    placeholder="Nome completo" 
                    className="bg-secondary border-border"
                    value={newUserData.name}
                    onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Senha</Label>
                  <Input 
                    type="password"
                    placeholder="Senha inicial" 
                    className="bg-secondary border-border"
                    value={newUserData.password}
                    onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Função</Label>
                  <Select 
                    value={newUserData.role}
                    onValueChange={(value: UserRole) => setNewUserData({ ...newUserData, role: value })}
                  >
                    <SelectTrigger className="bg-secondary border-border">
                      <SelectValue placeholder="Selecione uma função" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="user">Usuário</SelectItem>
                      {currentUserLevel >= 2 && <SelectItem value="staff">Staff</SelectItem>}
                      {currentUserLevel >= 3 && <SelectItem value="admin">Admin</SelectItem>}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Limite de Armazenamento (GB)</Label>
                  <Select 
                    value={newUserData.storageLimit.toString()}
                    onValueChange={(value) => setNewUserData({ ...newUserData, storageLimit: parseInt(value) })}
                  >
                    <SelectTrigger className="bg-secondary border-border">
                      <SelectValue placeholder="Selecione um limite" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="15">15 GB</SelectItem>
                      <SelectItem value="50">50 GB</SelectItem>
                      <SelectItem value="100">100 GB</SelectItem>
                      <SelectItem value="500">500 GB</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateUser}>
                    Adicionar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Users Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-border/50 bg-secondary/30 text-sm font-medium text-muted-foreground">
          <div className="col-span-4">Usuário</div>
          <div className="col-span-2">Função</div>
          <div className="col-span-3 hidden md:block">Armazenamento</div>
          <div className="col-span-2 hidden lg:block">Criado em</div>
          <div className="col-span-1"></div>
        </div>

        <div className="divide-y divide-border/30">
          {filteredUsers.map((targetUser, index) => {
            const usagePercent = (targetUser.storageUsed / targetUser.storageLimit) * 100;
            const RoleIcon = getRoleIcon(targetUser.role);

            return (
              <div
                key={targetUser.id}
                className="grid grid-cols-12 gap-4 px-4 py-4 items-center hover:bg-secondary/30 transition-colors animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="col-span-4 flex items-center gap-3">
                  <Avatar className="w-10 h-10 border-2 border-border">
                    <AvatarFallback className="bg-secondary text-foreground">
                      {targetUser.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{targetUser.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{targetUser.email}</p>
                  </div>
                </div>

                <div className="col-span-2">
                  <RoleBadge role={targetUser.role} size="sm" />
                </div>

                <div className="col-span-3 hidden md:block">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-accent"
                        style={{ width: `${Math.min(usagePercent, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatBytes(targetUser.storageUsed)}
                    </span>
                  </div>
                </div>

                <div className="col-span-2 hidden lg:block">
                  <span className="text-sm text-muted-foreground">
                    {new Intl.DateTimeFormat('pt-BR').format(new Date(targetUser.createdAt))}
                  </span>
                </div>

                <div className="col-span-1 flex justify-end">
                  {canEditUser(targetUser) && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="w-8 h-8">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-popover border-border">
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger className="gap-2">
                            <Shield className="w-4 h-4" />
                            Alterar Função
                          </DropdownMenuSubTrigger>
                          <DropdownMenuSubContent className="bg-popover border-border">
                            <DropdownMenuItem
                              className="gap-2"
                              onClick={() => handleChangeRole(targetUser.id, 'user')}
                            >
                              <UserIcon className="w-4 h-4" />
                              Usuário
                            </DropdownMenuItem>
                            {currentUserLevel >= 2 && (
                              <DropdownMenuItem
                                className="gap-2"
                                onClick={() => handleChangeRole(targetUser.id, 'staff')}
                              >
                                <Star className="w-4 h-4" />
                                Staff
                              </DropdownMenuItem>
                            )}
                            {currentUserLevel >= 3 && (
                              <DropdownMenuItem
                                className="gap-2"
                                onClick={() => handleChangeRole(targetUser.id, 'admin')}
                              >
                                <Shield className="w-4 h-4" />
                                Admin
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="gap-2 text-warning">
                          <Ban className="w-4 h-4" />
                          Suspender
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="gap-2 text-destructive"
                          onClick={() => handleDeleteUser(targetUser.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            );
          })}

          {filteredUsers.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <UserIcon className="w-16 h-16 mb-4 opacity-30" />
              <p className="text-lg font-medium">Nenhum usuário encontrado</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
