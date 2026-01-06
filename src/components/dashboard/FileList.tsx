import { useState } from 'react';
import { 
  File, 
  Folder, 
  MoreVertical, 
  Download, 
  Share2, 
  Star, 
  Trash2,
  Image,
  FileText,
  Film,
  Music,
  Archive
} from 'lucide-react';
import { CloudFile } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';

interface FileListProps {
  files: CloudFile[];
  onFileSelect?: (file: CloudFile) => void;
  onDelete?: (file: CloudFile) => void;
  onStar?: (file: CloudFile) => void;
  onShare?: (file: CloudFile) => void;
}

const getFileIcon = (file: CloudFile) => {
  if (file.type === 'folder') return Folder;
  
  const mimeType = file.mimeType || '';
  if (mimeType.startsWith('image/')) return Image;
  if (mimeType.startsWith('video/')) return Film;
  if (mimeType.startsWith('audio/')) return Music;
  if (mimeType.includes('pdf') || mimeType.includes('document')) return FileText;
  if (mimeType.includes('zip') || mimeType.includes('archive')) return Archive;
  return File;
};

const getFileIconColor = (file: CloudFile) => {
  if (file.type === 'folder') return 'text-warning';
  
  const mimeType = file.mimeType || '';
  if (mimeType.startsWith('image/')) return 'text-pink-400';
  if (mimeType.startsWith('video/')) return 'text-purple-400';
  if (mimeType.startsWith('audio/')) return 'text-green-400';
  if (mimeType.includes('pdf')) return 'text-red-400';
  return 'text-primary';
};

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '—';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

export const FileList: React.FC<FileListProps> = ({ 
  files, 
  onFileSelect, 
  onDelete, 
  onStar, 
  onShare 
}) => {
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());

  const toggleSelect = (fileId: string) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(fileId)) {
      newSelected.delete(fileId);
    } else {
      newSelected.add(fileId);
    }
    setSelectedFiles(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedFiles.size === files.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(files.map(f => f.id)));
    }
  };

  return (
    <div className="glass-card rounded-xl overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 px-4 py-3 border-b border-border/50 bg-secondary/30">
        <Checkbox
          checked={selectedFiles.size === files.length && files.length > 0}
          onCheckedChange={toggleSelectAll}
          className="border-muted-foreground"
        />
        <span className="flex-1 text-sm font-medium text-muted-foreground">Nome</span>
        <span className="w-24 text-sm font-medium text-muted-foreground hidden md:block">Tamanho</span>
        <span className="w-32 text-sm font-medium text-muted-foreground hidden lg:block">Modificado</span>
        <span className="w-10"></span>
      </div>

      {/* File List */}
      <div className="divide-y divide-border/30">
        {files.map((file, index) => {
          const Icon = getFileIcon(file);
          const iconColor = getFileIconColor(file);
          const isSelected = selectedFiles.has(file.id);

          return (
            <div
              key={file.id}
              className={cn(
                'file-item flex items-center gap-4 px-4 py-3 cursor-pointer animate-fade-in',
                isSelected && 'bg-primary/10'
              )}
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => onFileSelect?.(file)}
            >
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => toggleSelect(file.id)}
                onClick={(e) => e.stopPropagation()}
                className="border-muted-foreground"
              />
              
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={cn('p-2 rounded-lg bg-secondary/50', file.type === 'folder' && 'bg-warning/10')}>
                  <Icon className={cn('w-5 h-5', iconColor)} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                  <div className="flex items-center gap-2">
                    {file.starred && <Star className="w-3 h-3 text-warning fill-warning" />}
                    {file.shared && <Share2 className="w-3 h-3 text-primary" />}
                  </div>
                </div>
              </div>

              <span className="w-24 text-sm text-muted-foreground hidden md:block">
                {formatBytes(file.size)}
              </span>
              
              <span className="w-32 text-sm text-muted-foreground hidden lg:block">
                {formatDate(file.updatedAt)}
              </span>

              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-foreground">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-popover border-border">
                  <DropdownMenuItem className="gap-2" onClick={() => onStar?.(file)}>
                    <Star className={cn('w-4 h-4', file.starred && 'fill-warning text-warning')} />
                    {file.starred ? 'Remover favorito' : 'Adicionar favorito'}
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2" onClick={() => onShare?.(file)}>
                    <Share2 className="w-4 h-4" />
                    Compartilhar
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2">
                    <Download className="w-4 h-4" />
                    Download
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="gap-2 text-destructive focus:text-destructive"
                    onClick={() => onDelete?.(file)}
                  >
                    <Trash2 className="w-4 h-4" />
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        })}

        {files.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Folder className="w-16 h-16 mb-4 opacity-30" />
            <p className="text-lg font-medium">Nenhum arquivo</p>
            <p className="text-sm">Arraste arquivos aqui ou clique para fazer upload</p>
          </div>
        )}
      </div>
    </div>
  );
};
