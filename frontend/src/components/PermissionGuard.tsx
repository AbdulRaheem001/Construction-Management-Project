import { useAuthStore } from '../store/authStore';
import { hasPermission } from '../utils/permissions';
import { Shield } from 'lucide-react';
import type { ReactNode } from 'react';

interface PermissionGuardProps {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
  showMessage?: boolean;
}

export default function PermissionGuard({ 
  permission, 
  children, 
  fallback = null,
  showMessage = false 
}: PermissionGuardProps) {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return <>{fallback}</>;
  }

  const hasAccess = hasPermission(user.role, permission as keyof typeof import('../utils/permissions').permissions);

  if (!hasAccess) {
    if (showMessage) {
      return (
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <Shield size={16} />
          <span>Administrator access required</span>
        </div>
      );
    }
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
