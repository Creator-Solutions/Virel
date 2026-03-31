import { cn } from '@/lib/utils';

interface ProjectStatusBadgeProps {
  isActive: boolean;
}

function ProjectStatusBadge({ isActive }: ProjectStatusBadgeProps) {
  return (
    <div className="flex items-center gap-2">
      <span className={cn('h-2 w-2 rounded-full', isActive ? 'bg-virel-successText' : 'bg-virel-textMuted')} />
      <span className="text-sm text-virel-text">{isActive ? 'Active' : 'Inactive'}</span>
    </div>
  );
}

export { ProjectStatusBadge };
export type { ProjectStatusBadgeProps };
