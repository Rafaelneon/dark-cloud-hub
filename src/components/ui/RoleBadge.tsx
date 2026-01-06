import { UserRole } from '@/contexts/AuthContext';
import { Crown, Shield, Star, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RoleBadgeProps {
  role: UserRole;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const roleConfig: Record<UserRole, { label: string; icon: typeof Crown; className: string }> = {
  owner: {
    label: 'Owner',
    icon: Crown,
    className: 'role-badge-owner',
  },
  admin: {
    label: 'Admin',
    icon: Shield,
    className: 'role-badge-admin',
  },
  staff: {
    label: 'Staff',
    icon: Star,
    className: 'role-badge-staff',
  },
  user: {
    label: 'User',
    icon: User,
    className: 'role-badge-user',
  },
};

const sizeClasses = {
  sm: 'text-xs px-2 py-0.5 gap-1',
  md: 'text-sm px-2.5 py-1 gap-1.5',
  lg: 'text-base px-3 py-1.5 gap-2',
};

const iconSizes = {
  sm: 12,
  md: 14,
  lg: 16,
};

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, showLabel = true, size = 'md' }) => {
  const config = roleConfig[role];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full border',
        config.className,
        sizeClasses[size]
      )}
    >
      <Icon size={iconSizes[size]} />
      {showLabel && <span>{config.label}</span>}
    </span>
  );
};
