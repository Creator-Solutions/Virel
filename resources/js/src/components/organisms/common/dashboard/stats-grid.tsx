import { FolderGit2, Activity, CheckCircle2, XCircle } from 'lucide-react';
import type { DashboardStats } from '@/src/domains/dashboard/dashboard.types';
import { StatCard } from '@/src/components/molecules/common/dashboard';

interface StatsGridProps {
  stats: DashboardStats;
  isLoading?: boolean;
}

function StatsGrid({ stats, isLoading }: StatsGridProps) {
  const statItems = [
    {
      icon: FolderGit2,
      label: 'Total Projects',
      value: stats.total_projects,
      color: 'text-blue-500',
    },
    {
      icon: Activity,
      label: 'Active Deployments',
      value: stats.active_deployments,
      color: 'text-yellow-500',
    },
    {
      icon: CheckCircle2,
      label: 'Successful',
      value: stats.successful,
      color: 'text-green-500',
    },
    {
      icon: XCircle,
      label: 'Failed',
      value: stats.failed,
      color: 'text-red-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statItems.map((item) => (
        <StatCard key={item.label} {...item} isLoading={isLoading} />
      ))}
    </div>
  );
}

export { StatsGrid };
export type { StatsGridProps };
