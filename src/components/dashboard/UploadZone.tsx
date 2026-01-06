import { useState, useCallback } from 'react';
import { Upload, X, FileUp, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { useFiles } from '@/hooks/useLocalDatabase';
import { toast } from 'sonner';

interface UploadingFile {
  id: string;
  name: string;
  size: number;
  progress: number;
  status: 'uploading' | 'complete' | 'error';
  file: File;
}

export const UploadZone: React.FC = () => {
  const { user } = useAuth();
  const { createFile } = useFiles(user?.id);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processUpload = async (file: File) => {
    if (!user) return;

    const uploadFile: UploadingFile = {
      id: Date.now().toString() + file.name,
      name: file.name,
      size: file.size,
      progress: 0,
      status: 'uploading',
      file,
    };

    setUploadingFiles((prev) => [...prev, uploadFile]);

    // Simular progresso de upload (em produção, seria o progresso real)
    const progressInterval = setInterval(() => {
      setUploadingFiles((prev) =>
        prev.map((f) => {
          if (f.id === uploadFile.id && f.progress < 90) {
            return { ...f, progress: f.progress + Math.random() * 20 };
          }
          return f;
        })
      );
    }, 200);

    try {
      // Ler arquivo como ArrayBuffer para armazenamento local
      const arrayBuffer = await file.arrayBuffer();

      // Criar entrada no banco de dados
      await createFile({
        name: file.name,
        type: 'file',
        mimeType: file.type,
        size: file.size,
        parentId: null,
        userId: user.id,
        shared: false,
        starred: false,
        data: arrayBuffer,
      });

      clearInterval(progressInterval);

      // Marcar como completo
      setUploadingFiles((prev) =>
        prev.map((f) =>
          f.id === uploadFile.id ? { ...f, progress: 100, status: 'complete' } : f
        )
      );

      toast.success(`${file.name} enviado com sucesso!`);

      // Remover da lista após 2 segundos
      setTimeout(() => {
        setUploadingFiles((prev) => prev.filter((f) => f.id !== uploadFile.id));
      }, 2000);

    } catch (error) {
      clearInterval(progressInterval);
      setUploadingFiles((prev) =>
        prev.map((f) =>
          f.id === uploadFile.id ? { ...f, status: 'error' } : f
        )
      );
      toast.error(`Erro ao enviar ${file.name}`);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    files.forEach(processUpload);
  }, [user]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(processUpload);
    // Reset input
    e.target.value = '';
  };

  const removeUploadingFile = (id: string) => {
    setUploadingFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const formatBytes = (bytes: number) => {
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'upload-zone glass-card rounded-xl p-8 text-center transition-all duration-300',
          isDragging && 'upload-zone-active scale-[1.02]'
        )}
      >
        <input
          type="file"
          multiple
          className="hidden"
          id="file-upload"
          onChange={handleFileSelect}
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <div className={cn(
            'w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-all duration-300',
            isDragging ? 'bg-primary/20 scale-110' : 'bg-secondary'
          )}>
            <Upload className={cn(
              'w-8 h-8 transition-colors',
              isDragging ? 'text-primary' : 'text-muted-foreground'
            )} />
          </div>
          <p className="text-lg font-medium text-foreground mb-2">
            {isDragging ? 'Solte os arquivos aqui' : 'Arraste arquivos ou clique para fazer upload'}
          </p>
          <p className="text-sm text-muted-foreground">
            Arquivos são armazenados localmente no navegador (IndexedDB)
          </p>
        </label>
      </div>

      {/* Uploading Files */}
      {uploadingFiles.length > 0 && (
        <div className="glass-card rounded-xl p-4 space-y-3 animate-fade-in">
          <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
            <FileUp className="w-4 h-4 text-primary" />
            Enviando {uploadingFiles.filter(f => f.status === 'uploading').length} arquivo(s)
          </h3>
          
          {uploadingFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 animate-scale-in"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                  <span className="text-xs text-muted-foreground ml-2">
                    {formatBytes(file.size)}
                  </span>
                </div>
                <Progress 
                  value={file.progress} 
                  className="h-1.5"
                />
              </div>
              
              {file.status === 'complete' ? (
                <CheckCircle className="w-5 h-5 text-success shrink-0" />
              ) : file.status === 'error' ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-6 h-6 shrink-0 text-destructive"
                  onClick={() => removeUploadingFile(file.id)}
                >
                  <X className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-6 h-6 shrink-0"
                  onClick={() => removeUploadingFile(file.id)}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
