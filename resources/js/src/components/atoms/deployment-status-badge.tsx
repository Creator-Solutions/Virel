import { cn } from '@/lib/utils';
import type { DeploymentStatus } from '@/domains/projects/projects.types';

interface DeploymentStatusBadgeProps {
  status: DeploymentStatus;
  size?: 'sm' | 'md';
}

const statusConfig: Record<DeploymentStatus, { color: string; label: string }> = {
  pending: { color: 'bg-virel-textMuted', label: 'Pending' },
  running: { color: 'bg-blue-400', label: 'Running' },
  success: { color: 'bg-virel-successText', label: 'Success' },
  failed: { color: 'bg-virel-errorText', label: 'Failed' },
  cancelled: { color: 'bg-virel-textMuted', label: 'Cancelled' },
};

function DeploymentStatusBadge({ status, size = 'md' }: DeploymentStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <div className="flex items-center gap-2">
      <span className={cn('rounded-full', config.color, size === 'sm' ? 'h-1.5 w-1.5' : 'h-2 w-2')} />
      <span className={cn('text-virel-text', size === 'sm' ? 'text-xs' : 'text-sm')}>{config.label}</span>
    </div>
  );
}

export { DeploymentStatusBadge };
export type { DeploymentStatusBadgeProps };
