import { HardDrive, FileText, Folder, Share2, TrendingUp } from 'lucide-react';
import { StorageStats } from '@/types';
import { cn } from '@/lib/utils';

interface StatsCardsProps {
  stats: StorageStats;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const usagePercent = (stats.usedStorage / stats.totalStorage) * 100;

  const cards = [
    {
      title: 'Armazenamento',
      value: formatBytes(stats.usedStorage),
      subtitle: `de ${formatBytes(stats.totalStorage)}`,
      icon: HardDrive,
      gradient: 'from-primary/20 to-primary/5',
      iconBg: 'bg-primary/20',
      iconColor: 'text-primary',
      progress: usagePercent,
    },
    {
      title: 'Total de Arquivos',
      value: stats.totalFiles.toLocaleString(),
      subtitle: '+12 esta semana',
      icon: FileText,
      gradient: 'from-success/20 to-success/5',
      iconBg: 'bg-success/20',
      iconColor: 'text-success',
    },
    {
      title: 'Pastas',
      value: stats.totalFolders.toLocaleString(),
      subtitle: 'Organizados',
      icon: Folder,
      gradient: 'from-warning/20 to-warning/5',
      iconBg: 'bg-warning/20',
      iconColor: 'text-warning',
    },
    {
      title: 'Compartilhados',
      value: stats.sharedFiles.toLocaleString(),
      subtitle: 'Com outros usuários',
      icon: Share2,
      gradient: 'from-accent/20 to-accent/5',
      iconBg: 'bg-accent/20',
      iconColor: 'text-accent',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <div
          key={card.title}
          className={cn(
            'stat-card animate-fade-in',
            `bg-gradient-to-br ${card.gradient}`
          )}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="flex items-start justify-between mb-4">
            <div className={cn('p-3 rounded-xl', card.iconBg)}>
              <card.icon className={cn('w-6 h-6', card.iconColor)} />
            </div>
            <TrendingUp className="w-4 h-4 text-success" />
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-1">{card.value}</h3>
          <p className="text-sm text-muted-foreground">{card.title}</p>
          <p className="text-xs text-muted-foreground/70 mt-1">{card.subtitle}</p>
          
          {card.progress !== undefined && (
            <div className="mt-4">
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-700"
                  style={{ width: `${Math.min(card.progress, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
